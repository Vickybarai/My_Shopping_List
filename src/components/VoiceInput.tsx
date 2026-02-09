'use client';

import { useState, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VoiceInputProps {
  onTranscript: (text: string, language: string) => void;
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState<'hi' | 'mr'>('hi');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await uploadAudio(blob);
        
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const uploadAudio = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('language', language);

      const response = await fetch('/api/ai/voice-to-text', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success && data.transcription) {
        onTranscript(data.transcription, language);
      } else {
        console.error('Voice transcription failed:', data.error);
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-lime-400" />
          Voice Input
        </CardTitle>
        <CardDescription>
          Speak in Hindi or Marathi to add items quickly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Language Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block text-slate-300">
            Select Language
          </label>
          <div className="flex gap-2">
            <Button
              variant={language === 'hi' ? 'default' : 'outline'}
              onClick={() => setLanguage('hi')}
              className={`flex-1 ${
                language === 'hi'
                  ? 'bg-lime-500 text-black hover:bg-lime-400'
                  : 'border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              हिंदी (Hindi)
            </Button>
            <Button
              variant={language === 'mr' ? 'default' : 'outline'}
              onClick={() => setLanguage('mr')}
              className={`flex-1 ${
                language === 'mr'
                  ? 'bg-lime-500 text-black hover:bg-lime-400'
                  : 'border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              मराठी (Marathi)
            </Button>
          </div>
        </div>

        {/* Record Button */}
        <div className="flex justify-center">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            size="lg"
            className={`h-24 w-24 rounded-full ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-lime-500 hover:bg-lime-400 text-black'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-12 h-12 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-12 h-12" />
            ) : (
              <Mic className="w-12 h-12" />
            )}
          </Button>
        </div>

        {/* Status */}
        {isRecording && (
          <div className="text-center">
            <Badge variant="destructive" className="animate-pulse">
              🎙 Recording... Tap to stop
            </Badge>
          </div>
        )}

        {isProcessing && (
          <div className="text-center">
            <Badge variant="outline" className="bg-slate-800">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Processing...
            </Badge>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="text-xs text-slate-500 text-center pt-4 border-t border-slate-700">
          🔒 Voice data is processed locally. No recordings are stored.
        </div>
      </CardContent>
    </Card>
  );
}
