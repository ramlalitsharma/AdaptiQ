import { ObjectId } from 'mongodb';

export type IQCategory = 
  | 'verbal-reasoning'
  | 'mathematical-reasoning'
  | 'logical-reasoning'
  | 'spatial-reasoning'
  | 'pattern-recognition'
  | 'memory'
  | 'processing-speed';

export interface IQQuestion {
  _id?: ObjectId;
  category: IQCategory;
  difficulty: number; // 1-10
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  timeLimit: number; // seconds
  points: number;
}

export interface IQAssessment {
  _id?: ObjectId;
  userId: string;
  type: 'full' | 'quick' | 'category-specific';
  categories: IQCategory[];
  questions: IQQuestion[];
  answers: IQAnswer[];
  startedAt: Date;
  completedAt?: Date;
  score?: IQScore;
  createdAt: Date;
}

export interface IQAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // milliseconds
  answeredAt: Date;
}

export interface IQScore {
  totalScore: number;
  iqEstimate: number; // Estimated IQ score
  percentile: number;
  categoryScores: Record<IQCategory, {
    score: number;
    percentile: number;
    strength: 'weak' | 'average' | 'strong';
  }>;
  recommendations: string[];
}
