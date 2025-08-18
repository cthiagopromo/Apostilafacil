export interface Block {
  id: string;
  type: 'quiz' | 'callout' | 'accordion';
  props: Record<string, any>;
}

export interface Module {
  id: string;
  title: string;
  slug: string;
  contentHTML: string;
  blocks: Block[];
}

export interface ThemeTokens {
  colorPrimary: string;
  colorBackground: string;
  colorAccent: string;
  fontBody: string;
  containerWidth: 'sm' | 'md' | 'lg';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  theme: ThemeTokens;
  modules: Module[];
  version: string;
  createdAt: string;
  updatedAt: string;
}
