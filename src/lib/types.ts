export type BlockType = 
  | 'text' 
  | 'image' 
  | 'video'
  | 'button'
  | 'quiz';

export interface BlockContent {
  // Common fields
  text?: string;
  // Image
  url?: string;
  alt?: string;
  // Video
  videoUrl?: string;
  // Button
  buttonText?: string;
  buttonUrl?: string;
  // Quiz
  question?: string;
  options?: { text: string; isCorrect: boolean }[];
}

export interface Block {
  id: string;
  type: BlockType;
  content: BlockContent;
}

export interface Theme {
  colorPrimary: string;
  colorBackground: string;
  colorAccent: string;
  fontBody: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  theme: Theme;
  blocks: Block[];
  version: string;
  createdAt: string;
  updatedAt: string;
}
