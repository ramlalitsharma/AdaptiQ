import { ObjectId } from 'mongodb';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  tags: string[];
}

export interface Quiz {
  _id?: ObjectId;
  title: string;
  description: string;
  questions: Question[];
  createdBy: string; // Clerk user ID
  isPublic: boolean;
  category: string;
  estimatedTime: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'adaptive';
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    totalAttempts: number;
    averageScore: number;
    aiGenerated: boolean;
    adaptive: boolean;
  };
}

export interface AdaptiveQuizConfig {
  userId: string;
  baseQuizId?: string;
  topic: string;
  initialDifficulty: 'easy' | 'medium' | 'hard';
  questionsPerQuiz: number;
  adaptationRules: {
    increaseDifficultyAfter: number; // correct answers in a row
    decreaseDifficultyAfter: number; // wrong answers in a row
    masteryThreshold: number; // percentage to consider mastery
  };
}
