import { getDatabase } from './mongodb';
import { AIService } from './ai-service';
import { LearningPath, serializeLearningPath } from './models/LearningPath';
import { Course } from './models/Course';
import { ObjectId } from 'mongodb';

export const LearningPathService = {
    /**
     * Generates a personalized learning path based on a user goal
     */
    async generateAIPath(goal: string, userId: string): Promise<any> {
        const db = await getDatabase();

        // 1. Fetch available courses to provide context to AI
        const courses = await db
            .collection<Course>('courses')
            .find({ isPublished: true })
            .project({ title: 1, slug: 1, _id: 1, level: 1, description: 1 })
            .toArray();

        const courseContext = courses.map(c => ({
            id: String(c._id),
            title: c.title,
            slug: c.slug,
            level: c.level,
            description: c.description?.substring(0, 100)
        }));

        // 2. Call AI to generate a curriculum
        const aiResponse = await AIService.generateLearningPathContent(goal, courseContext);

        // 3. Create the LearningPath object
        const newPath: Partial<LearningPath> = {
            title: aiResponse.title || `Path: ${goal}`,
            description: aiResponse.description || `AI-generated learning path focused on ${goal}.`,
            authorId: userId,
            difficulty: aiResponse.difficulty || 'intermediate',
            courses: aiResponse.steps.map((step: any, index: number) => ({
                courseId: step.courseId || step.slug, // Fallback if AI missed one
                order: index,
                isRequired: true,
            })),
            tags: aiResponse.tags || ['ai-generated', goal.toLowerCase()],
            isPublic: false, // Default to private for user
            enrolledCount: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // 4. Save to database
        const result = await db.collection('learningPaths').insertOne(newPath);
        const created = await db.collection('learningPaths').findOne({ _id: result.insertedId });

        return serializeLearningPath(created as any);
    },

    /**
     * Fetches learning paths for a user (authored or AI-generated)
     */
    async getUserPaths(userId: string) {
        const db = await getDatabase();
        const paths = await db
            .collection('learningPaths')
            .find({ authorId: userId })
            .sort({ createdAt: -1 })
            .toArray();

        return paths.map(serializeLearningPath);
    }
};
