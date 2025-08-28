/**
 * [S3][T3.004] - Audio Recorder Component
 * Componente para gravação de áudio com visualização e playback
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  Square, 
  Trash2, 
  Send,
  AlertCircle,
  Volume2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useAudioRecorder_T3004 } from '@/hooks/useAudioRecorder_T3.004';
import { toast } from 'sonner';
import WaveSurfer from 'wavesurfer.js';

interface AudioRecorderProps {
  conversationId: string;
  onSendAudio?: (audioBlob: Blob, duration: number) => void;
  maxDuration?: number;
  showWaveform?: boolean;
}

export function AudioRecorder_T3004({
  conversationId,
  onSendAudio,
  maxDuration = 300,
  showWaveform = true,
}: AudioRecorderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  
  const {
    isRecording,
    isPaused,
    recordingTime,
    formattedTime,
    audioURL,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    clearRecording,
  } = useAudioRecorder_T3004({
    maxDuration,
    onRecordingComplete: (blob, duration) => {
      console.log('Recording complete:', { size: blob.size, duration });
    },
  });

  // Initialize WaveSurfer for playback visualization
  useEffect(() => {
    if (showWaveform && waveformRef.current && audioURL && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgb(var(--primary) / 0.5)',
        progressColor: 'rgb(var(--primary))',
        cursorColor: 'rgb(var(--primary))',
        barWidth: 2,
        barRadius: 3,
        responsive: true,
        height: 60,
        normalize: true,
        backend: 'WebAudio',
      });

      wavesurferRef.current.load(audioURL);

      wavesurferRef.current.on('finish', () => {
        setIsPlaying(false);
      });

      wavesurferRef.current.on('play', () => {
        setIsPlaying(true);
      });

      wavesurferRef.current.on('pause', () => {
        setIsPlaying(false);
      });
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [audioURL, showWaveform]);

  // Handle audio upload
  const handleSendAudio = async () => {
    if (!audioBlob) return;

    setIsUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('conversationId', conversationId);
      formData.append('duration', recordingTime.toString());

      // Upload to server
      const response = await fetch('/api/attachments/audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Call callback
      if (onSendAudio) {
        onSendAudio(audioBlob, recordingTime);
      }

      // Clear recording after successful upload
      clearRecording();
      toast.success('Audio message sent successfully');
      
    } catch (error) {
      console.error('Failed to send audio:', error);
      toast.error('Failed to send audio message');
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle play/pause
  const togglePlayback = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  // Delete recording
  const handleDelete = () => {
    clearRecording();
    setIsPlaying(false);
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }
  };

  // Progress percentage
  const progressPercentage = (recordingTime / maxDuration) * 100;

  return (
    <div className="w-full space-y-4">
      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Recording controls */}
      {!audioURL ? (
        <div className="space-y-4">
          {/* Recording status */}
          {isRecording && (
            <Card className="p-4">
              <div className="space-y-3">
                {/* Time and progress */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Mic className="w-5 h-5 text-red-500" />
                      {!isPaused && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {isPaused ? 'Paused' : 'Recording'}
                    </span>
                  </div>
                  <span className="text-sm font-mono">{formattedTime}</span>
                </div>

                {/* Progress bar */}
                <Progress value={progressPercentage} className="h-1" />

                {/* Waveform visualization (placeholder) */}
                {showWaveform && (
                  <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                    <div className="flex space-x-1 items-end h-12">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 bg-primary rounded transition-all duration-100 ${
                            !isPaused ? 'animate-pulse' : ''
                          }`}
                          style={{
                            height: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.05}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Control buttons */}
                <div className="flex justify-center space-x-2">
                  {isPaused ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={resumeRecording}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={pauseRecording}
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={stopRecording}
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelRecording}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Start recording button */}
          {!isRecording && (
            <Button
              onClick={startRecording}
              className="w-full"
              size="lg"
            >
              <Mic className="w-5 h-5 mr-2" />
              Start Recording
            </Button>
          )}
        </div>
      ) : (
        /* Playback controls */
        <Card className="p-4">
          <div className="space-y-3">
            {/* Audio info */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Audio Message</span>
              </div>
              <span className="text-sm font-mono">{formattedTime}</span>
            </div>

            {/* Waveform */}
            {showWaveform && (
              <div ref={waveformRef} className="w-full" />
            )}

            {/* Native audio player (fallback) */}
            {!showWaveform && audioURL && (
              <audio
                src={audioURL}
                controls
                className="w-full"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
            )}

            {/* Control buttons */}
            <div className="flex justify-between">
              <div className="flex space-x-2">
                {showWaveform && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
              
              <Button
                size="sm"
                onClick={handleSendAudio}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      {!isRecording && !audioURL && (
        <div className="text-xs text-gray-500 text-center">
          Click the button to record an audio message (max {maxDuration / 60} minutes)
        </div>
      )}
    </div>
  );
}
