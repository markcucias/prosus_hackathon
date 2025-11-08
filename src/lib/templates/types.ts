// TypeScript types for the exercise template system

export interface Assignment {
  _id?: string;
  userId: string;
  title: string;
  type: 'exam' | 'essay' | 'presentation' | 'quiz';
  examSubtype?: 'theoretical' | 'practical' | 'hybrid';
  dueDate: Date;
  topics: string[];
  difficulty?: string;
  materials?: Array<{
    type: 'slide' | 'past_exam' | 'notes';
    url: string;
    content: string;
  }>;
  calendarEventId?: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  createdAt?: Date;
}

export interface StudySession {
  _id?: string;
  userId: string;
  assignmentId: string;
  scheduledTime: Date;
  duration: number; // minutes
  topics: string[];
  status: 'scheduled' | 'active' | 'completed' | 'missed';
  calendarEventId?: string;
  exercises: string[]; // Exercise IDs
  sessionIndex?: number;
  focus?: 'concepts' | 'practice';
  createdAt?: Date;
}

export interface Exercise {
  _id?: string;
  sessionId?: string;
  userId: string;
  assignmentId: string;
  type: string;
  topic: string;
  question: string;
  difficulty: number; // 1-5
  generatedAt?: Date;
  userAnswer?: any;
  isCorrect?: boolean;
  feedback?: string;
  score?: number;
  timeSpent?: number; // seconds
  createdAt?: Date;
  // Type-specific fields
  [key: string]: any;
}

export interface UserProgress {
  _id?: string;
  userId: string;
  assignmentId: string;
  topicMastery: {
    [topic: string]: {
      correct: number;
      total: number;
      averageDifficulty: number;
      lastPracticed: Date;
    };
  };
  overallReadiness: number; // 0-100
  weakTopics: string[];
  strongTopics: string[];
  updatedAt?: Date;
}

export interface UserPreferences {
  preferredTimes: ('morning' | 'afternoon' | 'evening')[];
  sessionDuration: number; // minutes
  reminderAdvance: number; // minutes
}

export interface EvaluationResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
  correctAnswer?: any;
  [key: string]: any;
}

export interface GenerateExerciseParams {
  templateType: string;
  topic: string;
  difficulty: number;
  assignmentType: string;
  openai: any; // OpenAI client
}

export interface EvaluateExerciseParams {
  exercise: Exercise;
  userResponse: any;
  openai?: any; // OpenAI client (optional for some types)
}

export type AssignmentTypeConfig = {
  sessionsRecommended: number;
  exercisesPerSession: number;
  distribution: {
    tier1: number;
    tier2: number;
    tier3: number;
  };
  templateWeights: {
    [templateName: string]: number;
  };
};

