
export interface WriteMessage {
  language: string;
  textFormat: string;
  textSize: string;
  userMessage: string;
  withEmoji: boolean;
  writingStyle: string;
}

export type Role = 'system' | 'user' | 'assistant';