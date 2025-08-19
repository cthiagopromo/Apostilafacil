
export type BlockType = 
  | 'text' 
  | 'image' 
  | 'video'
  | 'button'
  | 'quiz'
  | 'quote';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export type VideoType = 'youtube' | 'cloudflare';

export interface BlockContent {
  // Common fields
  text?: string;
  // Image
  url?: string;
  alt?: string;
  caption?: string; // Legenda opcional para a imagem
  width?: number; // Largura da imagem em %
  // Video
  videoType?: VideoType;
  videoUrl?: string; // For YouTube
  cloudflareVideoId?: string; // For Cloudflare
  videoTitle?: string;
  autoplay?: boolean;
  showControls?: boolean;
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

export interface LayoutSettings {
  containerWidth: 'standard' | 'large' | 'full';
  sectionSpacing: 'compact' | 'standard' | 'comfortable';
  navigationType: 'top' | 'sidebar' | 'bottom';
}

export interface Project {
  id:string;
  title: string;
  description: string;
  theme: Theme;
  layoutSettings: LayoutSettings;
  blocks: Block[];
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface HandbookData {
  id: string;
  title: string;
  description: string;
  projects: Project[];
  updatedAt: string;
}


