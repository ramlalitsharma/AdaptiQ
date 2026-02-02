import { LangChainService } from './langchain-service';

// Define the structure we want back from the AI
export interface GeneratedQuestion {
    question: string;
    options: string[];
    correctAnswer: number; // Index 0-3
    explanation: string;
}

export interface QuizGenerationResult {
    topic: string;
    questions: GeneratedQuestion[];
    source: 'ai' | 'mock';
}

const mockQuestions: GeneratedQuestion[] = [
    {
        question: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Mitochondria", "Ribosome", "Endoplasmic Reticulum"],
        correctAnswer: 1,
        explanation: "Mitochondria are known as the powerhouses of the cell because they generate most of the cell's supply of adenosine triphosphate (ATP)."
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1,
        explanation: "Mars is often referred to as the 'Red Planet' because the iron oxide prevalent on its surface gives it a reddish appearance."
    },
    {
        question: "What is the chemical symbol for Gold?",
        options: ["Au", "Ag", "Fe", "Cu"],
        correctAnswer: 0,
        explanation: "The symbol 'Au' comes from the Latin word for gold, 'aurum'."
    },
    {
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correctAnswer: 1,
        explanation: "William Shakespeare wrote the tragic play 'Romeo and Juliet' early in his career."
    },
    {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correctAnswer: 3,
        explanation: "The Pacific Ocean is the largest and deepest of Earth's oceanic divisions."
    }
];

export const AIService = {
    /**
     * Generates a quiz based on a topic using LangChain
     */
    generateQuiz: async (topic: string, difficulty: string = 'medium'): Promise<QuizGenerationResult> => {
        if (!process.env.OPENAI_API_KEY) {
            console.log('⚠️ No OPENAI_API_KEY found. using Mock AI Service.');
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { topic, questions: mockQuestions, source: 'mock' };
        }

        try {
            const systemPrompt = "You are a helpful educational AI that outputs strict JSON. You must return exactly 5 questions.";
            const userPrompt = `Create a ${difficulty} difficulty quiz about "${topic}". 
            Output ONLY a valid JSON object with a "questions" array. 
            Each question object must have: "question", "options" (4 strings), "correctAnswer" (0-3), and "explanation".`;

            const parsed = await LangChainService.generateStructuredJSON(systemPrompt, userPrompt, {
                provider: 'openai',
                modelName: 'gpt-4o-mini',
                temperature: 0.2
            });

            return {
                topic,
                questions: parsed.questions || [],
                source: 'ai'
            };
        } catch (error) {
            console.error('Quiz AI Error:', error);
            throw new Error("Failed to generate quiz. Power is out at the AI datacenter.");
        }
    },

    /**
     * General Chat completion for AI Tutor using LangChain
     */
    chat: async (message: string, history: Array<{ role: 'user' | 'assistant' | 'system', content: string }>): Promise<string> => {
        if (!process.env.OPENAI_API_KEY) {
            return "Offline mode enabled. Configure API keys to unlock my full brain power!";
        }

        try {
            // Simplified for now, in a real scenario we'd use LangChain's memory or message history
            const context = history.map(h => `${h.role}: ${h.content}`).join('\n');
            const prompt = `System: You are Prof. AI, an encouraging virtual tutor.\n${context}\nUser: ${message}`;

            return await LangChainService.generateCompletion(prompt, {
                provider: 'openai',
                modelName: 'gpt-4o-mini'
            });
        } catch (error) {
            console.error('Chat AI Error:', error);
            return "I apologize, but I'm having trouble connecting to my central knowledge hub right now.";
        }
    },

    /**
     * Specialized generator for Learning Paths via LangChain
     */
    generateLearningPathContent: async (goal: string, availableCourses: any[]): Promise<any> => {
        if (!process.env.OPENAI_API_KEY) {
            return {
                title: `Mastering ${goal} (Draft)`,
                description: `A mock learning journey for ${goal}.`,
                difficulty: 'intermediate',
                steps: availableCourses.slice(0, 3).map(c => ({ courseId: c.id || c._id, title: c.title })),
                tags: ['draft']
            };
        }

        try {
            const systemPrompt = "You are an expert curriculum designer. Output ONLY valid JSON.";
            const userPrompt = `
                Goal: "${goal}"
                Available Courses: ${JSON.stringify(availableCourses, null, 2)}
                Design a curated path using these courses. Priority to internal courses.
                Output JSON: { "title", "description", "difficulty", "steps": [{ "courseId", "reason" }], "tags" }
            `;

            return await LangChainService.generateStructuredJSON(systemPrompt, userPrompt, {
                provider: 'openai',
                modelName: 'gpt-4o'
            });
        } catch (error) {
            console.error('Path AI Error:', error);
            throw new Error("Failed to design path via AI.");
        }
    }
};
