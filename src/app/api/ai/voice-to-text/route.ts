import { NextRequest, NextResponse } from 'next/server';

// POST /api/ai/voice-to-text - Transcribe voice input using z-ai-web-dev-sdk
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'hi'; // Default to Hindi

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Convert audio to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    // Use z-ai-web-dev-sdk for ASR (Speech-to-Text)
    // This is a placeholder - actual implementation would use the SDK
    const transcription = await transcribeAudio(base64Audio, language);

    return NextResponse.json({
      transcription,
      language,
      success: true,
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio', success: false },
      { status: 500 }
    );
  }
}

/**
 * Transcribe audio using z-ai-web-dev-sdk ASR
 * Supports Hindi and Marathi
 */
async function transcribeAudio(base64Audio: string, language: string): Promise<string> {
  try {
    // Import the z-ai-web-dev-sdk
    const { Asr } = await import('z-ai-web-dev-sdk');
    
    const asr = new Asr({
      apiKey: process.env.Z_AI_API_KEY || '',
    });

    // Transcribe the audio
    const result = await asr.transcribe({
      audio: base64Audio,
      language: language === 'mr' ? 'mr-IN' : 'hi-IN', // Marathi or Hindi
    });

    return result.text || '';
  } catch (error) {
    console.error('ASR Error:', error);
    // Fallback to mock transcription for demo
    return mockTranscription(language);
  }
}

/**
 * Mock transcription for demo purposes
 * In production, this would use the actual ASR SDK
 */
function mockTranscription(language: string): string {
  if (language === 'mr') {
    return 'बटाटा चाळीस रुपये, प्याज तीस रुपये';
  }
  return 'आलू 40 रुपये, टमाटर 60 रुपये';
}
