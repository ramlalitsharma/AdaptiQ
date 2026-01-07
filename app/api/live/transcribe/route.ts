import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler';
import OpenAI from 'openai';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(new Error('Unauthorized'), 'Unauthorized', 401);
    }

    const body = await req.json();
    const { recordingId } = body;

    if (!recordingId) {
      return createErrorResponse(new Error('Missing required fields'), 'recordingId is required', 400);
    }

    const db = await getDatabase();
    const recording = await db.collection('liveClassRecordings').findOne({ recordingId });

    if (!recording || !recording.recordingUrl) {
      return createErrorResponse(
        new Error('Recording not found'),
        'Recording not found or no URL available',
        404
      );
    }

    const res = await fetch(recording.recordingUrl);
    const blob = await res.blob();

    const transcriptResp = await openai.audio.transcriptions.create({
      file: blob as any,
      model: 'whisper-1',
      response_format: 'text',
    });

    const schema = z.array(
      z.object({
        title: z.string(),
        start: z.string(),
        end: z.string(),
      })
    );
    const llm = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      apiKey: process.env.OPENAI_API_KEY,
    }).withStructuredOutput(schema);
    const chapters = await llm.invoke(
      `From the following transcript, generate 5-10 chapters as JSON with fields: title, start, end (HH:MM:SS).
Transcript:
${String(transcriptResp)}`
    );

    await db.collection('liveClassRecordings').updateOne(
      { recordingId },
      {
        $set: {
          transcript: String(transcriptResp || ''),
          chapters,
          transcribedAt: new Date(),
        },
      }
    );

    return createSuccessResponse({
      transcript: String(transcriptResp || ''),
      chapters,
    });
  } catch (error) {
    return createErrorResponse(error, 'Failed to transcribe recording', 500);
  }
}
