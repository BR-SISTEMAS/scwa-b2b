/**
 * [S3][T3.005] - Interface para transcrições de conversas
 * Define a estrutura de transcrições geradas a partir das mensagens
 */

export interface TranscriptMessage {
  id: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    type: 'client' | 'agent' | 'system';
  };
  content: string;
  type: string;
  metadata?: any;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size?: number;
  }>;
}

export interface TranscriptParticipant {
  id: string;
  name: string;
  email?: string;
  type: 'client' | 'agent';
  joinedAt: string;
  leftAt?: string;
  messages: number;
}

export interface TranscriptMetrics {
  totalMessages: number;
  duration: number; // in seconds
  averageResponseTime: number; // in seconds
  firstResponseTime: number; // in seconds
  resolutionTime?: number; // in seconds
  messagesByType: Record<string, number>;
  messagesBySender: Record<string, number>;
}

export interface ConversationTranscript {
  conversationId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  status: 'open' | 'closed' | 'archived';
  
  // Participants
  participants: TranscriptParticipant[];
  
  // Messages
  messages: TranscriptMessage[];
  
  // Metrics
  metrics: TranscriptMetrics;
  
  // Metadata
  metadata: {
    version: string;
    format: 'json' | 'html' | 'pdf';
    generatedAt: string;
    generatedBy: string;
    exportId?: string;
  };
  
  // Summary (optional, for AI-generated summaries)
  summary?: {
    topic: string;
    resolution: string;
    keyPoints: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    tags: string[];
  };
  
  // Queue Information
  queueInfo?: {
    initialPosition: number;
    waitTime: number; // in seconds
    assignedAt?: string;
    assignedTo?: string;
  };
  
  // Evaluation (if available)
  evaluation?: {
    rating: number;
    comment?: string;
    evaluatedAt: string;
    evaluatedBy: string;
  };
}

export interface TranscriptGenerationOptions {
  includeSystemMessages?: boolean;
  includeDeletedMessages?: boolean;
  includeAttachments?: boolean;
  includeMetrics?: boolean;
  includeSummary?: boolean;
  format?: 'json' | 'html' | 'pdf';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface TranscriptExport {
  id: string;
  conversationIds: string[];
  format: 'json' | 'csv' | 'pdf' | 'html';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedBy: string;
  requestedAt: string;
  completedAt?: string;
  downloadUrl?: string;
  expiresAt?: string;
  error?: string;
  options: TranscriptGenerationOptions;
}
