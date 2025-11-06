import { ObjectId } from 'mongodb';

export type ExamType = 
  | 'sat' 
  | 'act' 
  | 'gre' 
  | 'gmat' 
  | 'ielts' 
  | 'toefl' 
  | 'mcat' 
  | 'lsat' 
  | 'nclex'
  | 'bar-exam'
  | 'custom';

export interface Exam {
  _id?: ObjectId;
  type: ExamType;
  name: string;
  description: string;
  duration: number; // minutes
  sections: ExamSection[];
  scoringScale: {
    min: number;
    max: number;
    passingScore?: number;
  };
  preparationLevels: string[]; // Beginner, Intermediate, Advanced
  subjects: string[]; // Related subjects
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExamSection {
  id: string;
  name: string;
  description: string;
  timeLimit: number; // minutes
  questionCount: number;
  subjects: string[];
  questionTypes: ('multiple-choice' | 'essay' | 'fill-blank' | 'matching')[];
  weight: number; // percentage of total score
}

export interface ExamPreparation {
  _id?: ObjectId;
  userId: string;
  examType: ExamType;
  targetScore: number;
  currentScore?: number;
  startDate: Date;
  examDate?: Date;
  preparationLevel: 'beginner' | 'intermediate' | 'advanced';
  studyPlan: StudyPlanItem[];
  progress: {
    sectionsCompleted: number;
    totalSections: number;
    averageScore: number;
    weakAreas: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyPlanItem {
  id: string;
  sectionId: string;
  topic: string;
  scheduledDate: Date;
  completedDate?: Date;
  resources: string[];
  practiceQuestions: number;
  completed: boolean;
}
