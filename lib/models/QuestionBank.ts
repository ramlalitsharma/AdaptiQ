export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer';

export interface QuestionOption {
  id: string;
  text: string;
  correct?: boolean;
}

export interface QuestionItem {
  _id?: any;
  bankId: any;
  question: string;
  type: QuestionType;
  options?: QuestionOption[];
  answerExplanation?: string;
  tags?: string[];
  difficulty: QuestionDifficulty;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionBank {
  _id?: any;
  name: string;
  description?: string;
  subject?: string;
  examType?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export function serializeQuestionBank(bank: QuestionBank & { _id?: any }) {
  return {
    id: bank._id ? String(bank._id) : undefined,
    name: bank.name,
    description: bank.description || '',
    subject: bank.subject || '',
    examType: bank.examType || '',
    tags: bank.tags || [],
    createdAt: bank.createdAt instanceof Date ? bank.createdAt.toISOString() : bank.createdAt,
    updatedAt: bank.updatedAt instanceof Date ? bank.updatedAt.toISOString() : bank.updatedAt,
  };
}

export function serializeQuestion(question: QuestionItem & { _id?: any }) {
  return {
    id: question._id ? String(question._id) : undefined,
    bankId: question.bankId ? String(question.bankId) : undefined,
    question: question.question,
    type: question.type,
    options: question.options || [],
    answerExplanation: question.answerExplanation || '',
    tags: question.tags || [],
    difficulty: question.difficulty,
    createdAt: question.createdAt instanceof Date ? question.createdAt.toISOString() : question.createdAt,
    updatedAt: question.updatedAt instanceof Date ? question.updatedAt.toISOString() : question.updatedAt,
  };
}
