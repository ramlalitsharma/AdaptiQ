export interface ExamTemplate {
  _id?: any;
  name: string;
  description?: string;
  questionBankIds: string[];
  questionIds: string[];
  durationMinutes: number;
  totalMarks: number;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export function serializeExamTemplate(template: ExamTemplate & { _id?: any }) {
  return {
    id: template._id ? String(template._id) : undefined,
    name: template.name,
    description: template.description || '',
    questionBankIds: template.questionBankIds || [],
    questionIds: template.questionIds || [],
    durationMinutes: template.durationMinutes,
    totalMarks: template.totalMarks,
    tags: template.tags || [],
    createdAt: template.createdAt instanceof Date ? template.createdAt.toISOString() : template.createdAt,
    updatedAt: template.updatedAt instanceof Date ? template.updatedAt.toISOString() : template.updatedAt,
  };
}
