export interface Tool {
  name: string;
  description: string;
  enabled: boolean;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  tools: Tool[];
  isConnected: boolean;
}

export interface ServiceConfig {
  tools: Tool[];
} 