import { ObjectId } from 'mongodb';

export interface CourseCategory {
    _id?: ObjectId;
    name: string;
    slug: string;
    description?: string;
    icon?: string;          // Icon name or SVG path
    order: number;          // For display sorting
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
