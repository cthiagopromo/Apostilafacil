export type TemplateType = 
  | 'cover' 
  | 'text_image' 
  | 'columns' 
  | 'list' 
  | 'highlight_box'
  | 'timeline'
  | 'text_media';

export interface PageContent {
  title?: string;
  subtitle?: string;
  backgroundImageUrl?: string;
  alt?: string;
  text?: string;
  imageUrl?: string;
  columns?: string[];
  items?: string[];
  videoUrl?: string;
  events?: { year: string; description: string }[];
}

export interface Page {
  id: string;
  title: string;
  template: TemplateType;
  content: PageContent;
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
  pages: Page[];
  version: string;
  createdAt: string;
  updatedAt: string;
}
