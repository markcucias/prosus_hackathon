// src/lib/templates/index.js

/**
 * MASTER TEMPLATE MANAGER
 * Combines all three tiers and provides intelligent exercise selection
 */

import TIER1_TEMPLATES, { 
  generateExercise as generateT1, 
  evaluateExercise as evaluateT1 
} from './tier1_templates.js';

import TIER2_TEMPLATES, { 
  generateTier2Exercise as generateT2, 
  evaluateTier2Exercise as evaluateT2 
} from './tier2_templates.js';

import TIER3_TEMPLATES, { 
  generateTier3Exercise as generateT3, 
  evaluateTier3Exercise as evaluateT3 
} from './tier3_templates.js';

// ============================================================================
// ASSIGNMENT TYPE CONFIGURATIONS
// ============================================================================

export const ASSIGNMENT_TYPE_CONFIGS = {
  exam: {
    theoretical: {
      sessionsRecommended: 5,
      exercisesPerSession: 6,
      distribution: {
        tier1: 0.40,  // 40% basic recall
        tier2: 0.40,  // 40% understanding
        tier3: 0.20   // 20% application
      },
      templateWeights: {
        // Tier 1
        multiple_choice: 0.25,
        true_false_justify: 0.15,
        flashcard: 0.15,
        fill_in_blank: 0.10,
        numerical_problem: 0.05,
        // Tier 2
        short_answer_define: 0.10,
        short_answer_explain: 0.10,
        one_sentence_definition: 0.10,
        // Tier 3
        scenario_application: 0.10,
        error_identification: 0.05
      }
    },
    practical: {
      sessionsRecommended: 5,
      exercisesPerSession: 6,
      distribution: {
        tier1: 0.35,
        tier2: 0.35,
        tier3: 0.30
      },
      templateWeights: {
        // Tier 1
        numerical_problem: 0.30,
        multiple_choice: 0.15,
        fill_in_blank: 0.05,
        // Tier 2
        problem_type_recognition: 0.15,
        short_answer_explain: 0.10,
        // Tier 3
        error_identification: 0.15,
        mini_problem_set: 0.10,
        scenario_prediction: 0.05
      }
    },
    hybrid: {
      sessionsRecommended: 5,
      exercisesPerSession: 6,
      distribution: {
        tier1: 0.35,
        tier2: 0.35,
        tier3: 0.30
      },
      templateWeights: {
        // Tier 1
        multiple_choice: 0.20,
        numerical_problem: 0.15,
        true_false_justify: 0.10,
        // Tier 2
        short_answer_define: 0.10,
        short_answer_explain: 0.10,
        short_answer_compare: 0.05,
        problem_type_recognition: 0.10,
        concept_comparison: 0.05,
        // Tier 3
        scenario_application: 0.10,
        error_identification: 0.10,
        mini_problem_set: 0.05
      }
    }
  },
  
  quiz: {
    sessionsRecommended: 2,
    exercisesPerSession: 8,
    distribution: {
      tier1: 0.60,  // Heavy on quick recall
      tier2: 0.30,
      tier3: 0.10
    },
    templateWeights: {
      // Tier 1
      multiple_choice: 0.30,
      true_false_justify: 0.20,
      flashcard: 0.20,
      fill_in_blank: 0.10,
      // Tier 2
      one_sentence_definition: 0.15,
      problem_type_recognition: 0.05,
      // Tier 3
      mini_problem_set: 0.05
    }
  }
};

// ============================================================================
// SMART EXERCISE SELECTION
// ============================================================================

/**
 * Select exercise types for a study session based on:
 * - Assignment type and subtype
 * - Session index (early sessions = more basics, later = more advanced)
 * - User's weak topics
 */
export function selectExerciseTypes(assignment, sessionIndex, totalSessions, userProgress = null) {
  const config = assignment.type === 'quiz' 
    ? ASSIGNMENT_TYPE_CONFIGS.quiz
    : ASSIGNMENT_TYPE_CONFIGS.exam[assignment.examSubtype || 'hybrid'];
  
  const exerciseCount = config.exercisesPerSession;
  
  // Adjust difficulty progression based on session
  const sessionProgress = sessionIndex / totalSessions;
  
  // Early sessions: more Tier 1 (foundation)
  // Middle sessions: balanced
  // Late sessions: more Tier 3 (exam-level)
  let distribution = { ...config.distribution };
  
  if (sessionProgress < 0.3) {
    // First 30% of sessions - emphasize basics
    distribution.tier1 += 0.15;
    distribution.tier3 -= 0.15;
  } else if (sessionProgress > 0.7) {
    // Last 30% of sessions - emphasize application
    distribution.tier1 -= 0.10;
    distribution.tier3 += 0.10;
  }
  
  // Select templates based on weights
  const selectedTypes = [];
  const weights = config.templateWeights;
  
  // Create weighted array
  const weightedTemplates = [];
  for (const [template, weight] of Object.entries(weights)) {
    const count = Math.round(weight * 100);
    for (let i = 0; i < count; i++) {
      weightedTemplates.push(template);
    }
  }
  
  // Select random templates based on weights
  const usedIndices = new Set();
  while (selectedTypes.length < exerciseCount) {
    const randomIndex = Math.floor(Math.random() * weightedTemplates.length);
    if (!usedIndices.has(randomIndex)) {
      selectedTypes.push(weightedTemplates[randomIndex]);
      usedIndices.add(randomIndex);
    }
  }
  
  return selectedTypes;
}

/**
 * Select topics for exercises based on user progress
 */
export function selectTopicsForSession(allTopics, userProgress) {
  if (!userProgress || !userProgress.weakTopics || userProgress.weakTopics.length === 0) {
    return allTopics; // No progress data, use all topics evenly
  }
  
  // 70% weak topics, 30% strong topics (for review)
  const topicList = [];
  const weakCount = Math.ceil(allTopics.length * 0.7);
  
  // Add weak topics
  const weakTopics = userProgress.weakTopics.slice(0, weakCount);
  topicList.push(...weakTopics);
  
  // Fill remaining with strong topics or all topics if not enough weak ones
  const remainingCount = allTopics.length - topicList.length;
  if (remainingCount > 0) {
    const otherTopics = allTopics.filter(t => !topicList.includes(t));
    topicList.push(...otherTopics.slice(0, remainingCount));
  }
  
  return topicList.length > 0 ? topicList : allTopics;
}

/**
 * Calculate difficulty for an exercise based on user progress
 */
export function calculateDifficulty(userProgress, topic, sessionIndex, totalSessions) {
  // Base difficulty on session progress
  const sessionProgress = sessionIndex / totalSessions;
  let baseDifficulty = 2; // Start at medium
  
  if (sessionProgress < 0.3) {
    baseDifficulty = 2; // Early: easy-medium
  } else if (sessionProgress < 0.7) {
    baseDifficulty = 3; // Middle: medium
  } else {
    baseDifficulty = 4; // Late: medium-hard
  }
  
  // Adjust based on user's mastery of this topic
  if (userProgress && userProgress.topicMastery && userProgress.topicMastery[topic]) {
    const mastery = userProgress.topicMastery[topic];
    const correctRate = mastery.correct / mastery.total;
    
    if (correctRate < 0.4) {
      // Struggling - keep it easier
      baseDifficulty = Math.max(1, baseDifficulty - 1);
    } else if (correctRate > 0.8) {
      // Mastered - make it harder
      baseDifficulty = Math.min(5, baseDifficulty + 1);
    }
  }
  
  return baseDifficulty;
}

// ============================================================================
// UNIFIED GENERATION & EVALUATION
// ============================================================================

/**
 * Generate any exercise from any tier
 */
export async function generateExercise(templateType, topic, difficulty, assignmentType, openai) {
  // Determine which tier this template belongs to
  if (TIER1_TEMPLATES[templateType]) {
    return await generateT1(templateType, topic, difficulty, assignmentType, openai);
  } else if (TIER2_TEMPLATES[templateType]) {
    return await generateT2(templateType, topic, difficulty, assignmentType, openai);
  } else if (TIER3_TEMPLATES[templateType]) {
    return await generateT3(templateType, topic, difficulty, assignmentType, openai);
  } else {
    throw new Error(`Unknown template type: ${templateType}`);
  }
}

/**
 * Evaluate any exercise from any tier
 */
export async function evaluateExercise(exercise, userResponse, openai = null) {
  const type = exercise.type;
  
  // Determine which tier and evaluate accordingly
  if (TIER1_TEMPLATES[type]) {
    return evaluateT1(exercise, userResponse);
  } else if (TIER2_TEMPLATES[type]) {
    return await evaluateT2(exercise, userResponse, openai);
  } else if (TIER3_TEMPLATES[type]) {
    return await evaluateT3(exercise, userResponse, openai);
  } else {
    throw new Error(`Unknown exercise type: ${type}`);
  }
}

/**
 * Generate a complete study session
 */
export async function generateStudySession(assignment, sessionIndex, userProgress, openai) {
  const totalSessions = assignment.type === 'quiz' 
    ? ASSIGNMENT_TYPE_CONFIGS.quiz.sessionsRecommended
    : ASSIGNMENT_TYPE_CONFIGS.exam[assignment.examSubtype || 'hybrid'].sessionsRecommended;
  
  // Select exercise types for this session
  const exerciseTypes = selectExerciseTypes(assignment, sessionIndex, totalSessions, userProgress);
  
  // Select topics to focus on
  const focusTopics = selectTopicsForSession(assignment.topics, userProgress);
  
  // Generate exercises
  const exercises = [];
  
  for (let i = 0; i < exerciseTypes.length; i++) {
    const exerciseType = exerciseTypes[i];
    const topic = focusTopics[i % focusTopics.length]; // Rotate through topics
    const difficulty = calculateDifficulty(userProgress, topic, sessionIndex, totalSessions);
    
    try {
      const exercise = await generateExercise(
        exerciseType,
        topic,
        difficulty,
        assignment.type,
        openai
      );
      
      exercises.push({
        ...exercise,
        assignmentId: assignment._id,
        sessionIndex: sessionIndex
      });
      
    } catch (error) {
      console.error(`Failed to generate ${exerciseType}:`, error);
      // Continue with other exercises even if one fails
    }
  }
  
  return exercises;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  TIER1_TEMPLATES,
  TIER2_TEMPLATES,
  TIER3_TEMPLATES
};

export default {
  generateExercise,
  evaluateExercise,
  generateStudySession,
  selectExerciseTypes,
  selectTopicsForSession,
  calculateDifficulty,
  ASSIGNMENT_TYPE_CONFIGS
};
