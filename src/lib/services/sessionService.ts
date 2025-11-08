import { supabase } from '@/integrations/supabase/client';
import { selectExerciseTypes, calculateDifficulty } from '../templates';
import { exerciseService } from './exerciseService';

export const sessionService = {
  /**
   * Generate a study plan for an assignment
   */
  async generateStudyPlan(assignmentId: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: assignment } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (!assignment) throw new Error('Assignment not found');

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();

    const dueDate = new Date(assignment.due_at);
    const today = new Date();
    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Determine number of sessions based on assignment type
    const sessionsNeeded = Math.min(
      daysUntilDue - 1,
      assignment.type === 'exam' ? 5 : assignment.type === 'essay' ? 4 : 3
    );

    if (sessionsNeeded <= 0) {
      throw new Error('Assignment is due too soon to create a study plan');
    }

    const sessions = [];
    const sessionDuration = profile?.session_duration || 60;

    // Create study sessions
    for (let i = 0; i < sessionsNeeded; i++) {
      const dayOffset = Math.floor((daysUntilDue - 1) * (i / sessionsNeeded));
      const sessionDate = new Date(today);
      sessionDate.setDate(sessionDate.getDate() + dayOffset);
      
      // Set time based on user preference (default to evening 18:00)
      const preferredTimes = profile?.preferred_times || ['evening'];
      const timeSlot = preferredTimes[0];
      const hour = timeSlot === 'morning' ? 9 : timeSlot === 'afternoon' ? 14 : 18;
      sessionDate.setHours(hour, 0, 0, 0);

      const progress = i / sessionsNeeded;
      const focus = progress < 0.5 ? 'concepts' : 'practice';

      const { data: session, error } = await supabase
        .from('study_sessions')
        .insert([{
          user_id: user.user.id,
          assignment_id: assignmentId,
          scheduled_at: sessionDate.toISOString(),
          duration_min: sessionDuration,
          topics: assignment.topics,
          focus: focus,
          status: 'scheduled'
        }])
        .select()
        .single();

      if (error) {
        console.error('Failed to create session:', error);
        continue;
      }

      sessions.push(session);
    }

    return sessions;
  },

  /**
   * Generate exercises for a specific study session
   */
  async generateExercisesForSession(sessionId: string) {
    const { data: session } = await supabase
      .from('study_sessions')
      .select('*, assignments(*)')
      .eq('id', sessionId)
      .single();

    if (!session) throw new Error('Session not found');

    // Get user progress to adapt difficulty
    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', session.user_id)
      .eq('assignment_id', session.assignment_id)
      .single();

    // Get all sessions for this assignment to determine session index
    const { data: allSessions } = await supabase
      .from('study_sessions')
      .select('id, scheduled_at')
      .eq('assignment_id', session.assignment_id)
      .order('scheduled_at', { ascending: true });

    const sessionIndex = allSessions?.findIndex(s => s.id === sessionId) || 0;
    const totalSessions = allSessions?.length || 1;

    // Select exercise types based on assignment configuration
    const exerciseTypes = selectExerciseTypes(
      session.assignments,
      sessionIndex,
      totalSessions,
      progress
    );

    // Determine topics to focus on (weak topics get priority)
    let focusTopics = session.topics;
    if (progress?.weak_topics && progress.weak_topics.length > 0) {
      focusTopics = [...progress.weak_topics, ...session.topics].slice(0, session.topics.length);
    }

    // Calculate difficulty based on progress
    const difficulty = calculateDifficulty(
      progress,
      focusTopics[0],
      sessionIndex,
      totalSessions
    );

    // Generate exercises
    return await exerciseService.generateForSession(
      session.assignment_id,
      sessionId,
      focusTopics,
      exerciseTypes,
      difficulty
    );
  },

  /**
   * Get all sessions for an assignment
   */
  async getByAssignment(assignmentId: string) {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*, exercises(count)')
      .eq('assignment_id', assignmentId)
      .order('scheduled_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get upcoming sessions for current user
   */
  async getUpcoming() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const now = new Date();
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*, assignments(title, type)')
      .eq('user_id', user.user.id)
      .gte('scheduled_at', now.toISOString())
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true })
      .limit(5);

    if (error) throw error;
    return data;
  },

  /**
   * Start a study session
   */
  async start(sessionId: string) {
    // Update session status
    const { data: session, error } = await supabase
      .from('study_sessions')
      .update({ status: 'active' })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;

    // Check if exercises exist, if not generate them
    const { data: exercises } = await supabase
      .from('exercises')
      .select('id')
      .eq('session_id', sessionId);

    if (!exercises || exercises.length === 0) {
      await this.generateExercisesForSession(sessionId);
    }

    return session;
  },

  /**
   * Complete a study session
   */
  async complete(sessionId: string) {
    const { data, error } = await supabase
      .from('study_sessions')
      .update({ status: 'completed' })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

