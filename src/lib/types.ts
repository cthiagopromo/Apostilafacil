export type BlockType = 
  | 'text' 
  | 'image' 
  | 'video'
  | 'button'
  | 'quiz';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface BlockContent {
  // Common fields
  text?: string;
  // Image
  url?: string;
  alt?: string;
  caption?: string; // Legenda opcional para a imagem
  // Video
  videoUrl?: string;
  // Button
  buttonText?: string;
  buttonUrl?: string;
  // Quiz
  question?: string;
  options?: QuizOption[];
  userAnswerId?: string | null;
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
  id:string;
  title: string;
  description: string;
  theme: Theme;
  blocks: Block[];
  version: string;
  createdAt: string;
  updatedAt: string;
}
