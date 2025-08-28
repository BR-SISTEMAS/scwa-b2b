/**
 * [S3][T3.004] - Audio Recorder Hook
 * Hook para gerenciar gravação de áudio no navegador
 */

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioRecorderOptions {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  maxDuration?: number; // in seconds
  audioType?: string;
}

interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  mediaRecorder: MediaRecorder | null;
  audioURL: string | null;
  audioBlob: Blob | null;
  error: string | null;
}

export function useAudioRecorder_T3004({
  onRecordingComplete,
  maxDuration = 300, // 5 minutes default
  audioType = 'audio/webm',
}: UseAudioRecorderOptions = {}) {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    recordingTime: 0,
    mediaRecorder: null,
    audioURL: null,
    audioBlob: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update recording time
  const updateRecordingTime = useCallback(() => {
    if (startTimeRef.current && !state.isPaused) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setState(prev => ({ ...prev, recordingTime: elapsed }));

      // Check max duration
      if (elapsed >= maxDuration) {
        stopRecording();
      }
    }
  }, [maxDuration, state.isPaused]);

  // Start timer
  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(updateRecordingTime, 100);
  }, [updateRecordingTime]);

  // Stop timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Reset state
      setState(prev => ({
        ...prev,
        error: null,
        audioURL: null,
        audioBlob: null,
      }));

      // Clean up previous recording
      if (state.audioURL) {
        URL.revokeObjectURL(state.audioURL);
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      streamRef.current = stream;

      // Check for supported MIME types
      const mimeType = MediaRecorder.isTypeSupported(audioType) 
        ? audioType 
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Create blob from chunks
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        const audioURL = URL.createObjectURL(audioBlob);
        
        const duration = state.recordingTime;
        
        setState(prev => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          audioBlob,
          audioURL,
          mediaRecorder: null,
        }));

        // Cleanup
        stopTimer();
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Callback
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob, duration);
        }
      };

      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event);
        setState(prev => ({
          ...prev,
          error: `Recording error: ${event.error?.message || 'Unknown error'}`,
          isRecording: false,
          isPaused: false,
        }));
        stopTimer();
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      startTimeRef.current = Date.now();
      startTimer();

      setState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        recordingTime: 0,
        mediaRecorder,
      }));

    } catch (error) {
      console.error('Failed to start recording:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start recording',
        isRecording: false,
      }));
    }
  }, [audioType, onRecordingComplete, startTimer, state.audioURL, state.recordingTime, stopTimer]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      stopTimer();
    }
  }, [state.isRecording, stopTimer]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause();
      setState(prev => ({ ...prev, isPaused: true }));
      stopTimer();
    }
  }, [state.isRecording, state.isPaused, stopTimer]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume();
      setState(prev => ({ ...prev, isPaused: false }));
      startTimer();
    }
  }, [state.isRecording, state.isPaused, startTimer]);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      // Stop without triggering onstop callback
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }

    // Cleanup
    stopTimer();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setState({
      isRecording: false,
      isPaused: false,
      recordingTime: 0,
      mediaRecorder: null,
      audioURL: null,
      audioBlob: null,
      error: null,
    });
  }, [stopTimer]);

  // Clear recording
  const clearRecording = useCallback(() => {
    if (state.audioURL) {
      URL.revokeObjectURL(state.audioURL);
    }
    setState(prev => ({
      ...prev,
      audioURL: null,
      audioBlob: null,
      recordingTime: 0,
    }));
  }, [state.audioURL]);

  // Format time
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRecording();
      if (state.audioURL) {
        URL.revokeObjectURL(state.audioURL);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    isRecording: state.isRecording,
    isPaused: state.isPaused,
    recordingTime: state.recordingTime,
    formattedTime: formatTime(state.recordingTime),
    audioURL: state.audioURL,
    audioBlob: state.audioBlob,
    error: state.error,
    
    // Actions
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    clearRecording,
    
    // Utils
    formatTime,
    maxDuration,
  };
}
