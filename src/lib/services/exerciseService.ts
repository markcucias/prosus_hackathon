import { supabase } from '@/integrations/supabase/client';
import { getOpenAIClient } from '../openai';
import { generateExercise, evaluateExercise } from '../templates';
import type { Exercise, EvaluationResult } from '../templates/types';

export const exerciseService = {
  /**
   * Generate a batch of exercises for a study session
   */
  async generateForSession(
    assignmentId: string,
    sessionId: string,
    topics: string[],
    exerciseTypes: string[],
    difficulty: number
  ) {
    console.log('generateForSession called with:', { assignmentId, sessionId, topics, exerciseTypes, difficulty });
    
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: assignment } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (!assignment) throw new Error('Assignment not found');
    console.log('Assignment found:', assignment.title);

    const openai = getOpenAIClient();
    const exercises = [];

    // Generate exercises
    console.log(`Generating ${exerciseTypes.length} exercises...`);
    for (let i = 0; i < exerciseTypes.length; i++) {
      const exerciseType = exerciseTypes[i];
      const topic = topics[i % topics.length]; // Rotate through topics

      console.log(`[${i+1}/${exerciseTypes.length}] Generating ${exerciseType} for ${topic}...`);
      
      try {
        const generated = await generateExercise(
          exerciseType,
          topic,
          difficulty,
          assignment.type,
          openai
        );

        console.log(`Generated ${exerciseType}:`, generated);

        // Store in database
        const { data: exercise, error } = await supabase
          .from('exercises')
          .insert([{
            session_id: sessionId,
            user_id: user.user.id,
            assignment_id: assignmentId,
            type: exerciseType,
            topic: topic,
            difficulty: difficulty,
            payload: generated
          }])
          .select()
          .single();

        if (error) {
          console.error(`Failed to save exercise:`, error);
          continue;
        }

        console.log(`Exercise saved to database:`, exercise.id);
        exercises.push(exercise);
      } catch (error) {
        console.error(`Failed to generate ${exerciseType}:`, error);
        // Continue with other exercises even if one fails
      }
    }

    console.log(`Total exercises generated: ${exercises.length}`);
    return exercises;
  },

  /**
   * Get exercises for a study session
   */
  async getBySession(sessionId: string) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Submit and evaluate an exercise answer
   */
  async submitAnswer(exerciseId: string, userResponse: any) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Get the exercise
    const { data: exercise, error: fetchError } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();

    if (fetchError) throw fetchError;
    if (!exercise) throw new Error('Exercise not found');

    // Evaluate the answer
    const openai = getOpenAIClient();
    const evaluation: EvaluationResult = await evaluateExercise(
      { ...exercise.payload, type: exercise.type },
      userResponse,
      openai
    );

    // Update the exercise with user answer and evaluation
    const { data: updated, error: updateError } = await supabase
      .from('exercises')
      .update({
        user_answer: userResponse,
        is_correct: evaluation.isCorrect,
        feedback: evaluation.feedback
      })
      .eq('id', exerciseId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update user progress
    await this.updateProgress(exercise.user_id, exercise.assignment_id, exercise, evaluation);

    return {
      exercise: updated,
      evaluation
    };
  },

  /**
   * Update user progress after completing an exercise
   */
  async updateProgress(
    userId: string,
    assignmentId: string,
    exercise: any,
    evaluation: EvaluationResult
  ) {
    // Get current progress
    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('assignment_id', assignmentId)
      .single();

    const topicMastery = progress?.topic_mastery || {};
    const topic = exercise.topic;

    // Initialize topic if not exists
    if (!topicMastery[topic]) {
      topicMastery[topic] = {
        correct: 0,
        total: 0,
        averageDifficulty: 0,
        lastPracticed: new Date().toISOString()
      };
    }

    // Update topic statistics
    const topicData = topicMastery[topic];
    topicData.total += 1;
    if (evaluation.isCorrect) topicData.correct += 1;
    topicData.averageDifficulty = 
      (topicData.averageDifficulty * (topicData.total - 1) + exercise.difficulty) / topicData.total;
    topicData.lastPracticed = new Date().toISOString();

    // Calculate weak and strong topics
    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    Object.entries(topicMastery).forEach(([topicName, data]: [string, any]) => {
      const masteryPercentage = (data.correct / data.total) * 100;
      if (masteryPercentage < 60 && data.total >= 3) {
        weakTopics.push(topicName);
      } else if (masteryPercentage >= 80 && data.total >= 5) {
        strongTopics.push(topicName);
      }
    });

    // Calculate overall readiness
    const allTopics = Object.keys(topicMastery);
    const totalMastery = allTopics.reduce((sum, t) => {
      const data = topicMastery[t];
      return sum + (data.correct / data.total);
    }, 0);
    const overallReadiness = Math.round((totalMastery / allTopics.length) * 100);

    // Upsert progress
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        assignment_id: assignmentId,
        topic_mastery: topicMastery,
        overall_readiness: overallReadiness,
        weak_topics: weakTopics,
        strong_topics: strongTopics,
        updated_at: new Date().toISOString()
      });

    if (error) console.error('Failed to update progress:', error);
  },

  /**
   * Get user progress for an assignment
   */
  async getProgress(assignmentId: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('assignment_id', assignmentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  }
};

