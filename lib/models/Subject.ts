import { ObjectId } from 'mongodb';

export interface Subject {
  _id?: ObjectId;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  category: 'academic' | 'professional' | 'language' | 'test-prep' | 'iq-cognitive';
  levels: Level[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Level {
  id: string;
  name: string; // e.g., "Beginner", "Intermediate", "Advanced"
  order: number;
  description?: string;
  prerequisites?: string[]; // IDs of prerequisite levels
}

export interface Topic {
  _id?: ObjectId;
  subjectId: string;
  levelId: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  estimatedTime: number; // minutes
  questions?: QuestionReference[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionReference {
  questionId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  weight: number; // importance weight
}

export interface Curriculum {
  _id?: ObjectId;
  name: string;
  code: string; // e.g., "CCSS-MATH-GRADE-9", "AP-CALCULUS-AB"
  description: string;
  standard: 'common-core' | 'ap' | 'ib' | 'a-levels' | 'igcse' | 'cambridge' | 'custom';
  grade?: string;
  subjects: string[]; // Subject IDs
  topics: string[]; // Topic IDs mapped to curriculum
  createdAt: Date;
  updatedAt: Date;
}
