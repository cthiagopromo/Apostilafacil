import type { HandbookData, Block, Project, Theme } from './types';

interface CompactProject {
  i: string;
  t: string;
  d: string;
  ls: {
    containerWidth: 'standard' | 'large' | 'full';
    sectionSpacing: 'compact' | 'standard' | 'comfortable';
    navigationType: 'top' | 'sidebar' | 'bottom';
  };
  b: Array<{
    i: string;
    ty: string;
    c: Record<string, unknown>;
  }>;
  v: string;
  cA: string;
  uA: string;
}

interface CompactTheme {
  c: string;
  fH: string;
  fB: string;
  cv?: string;
  bc?: string;
}

interface CompactHandbookData {
  i: string;
  t: string;
  d: string;
  u: string;
  th: CompactTheme;
  p: CompactProject[];
}

const keyMap: Record<string, string> = {
  id: 'i',
  title: 't',
  description: 'd',
  theme: 'th',
  colorPrimary: 'c',
  fontHeading: 'fH',
  fontBody: 'fB',
  cover: 'cv',
  backCover: 'bc',
  projects: 'p',
  blocks: 'b',
  content: 'c',
  type: 'ty',
  version: 'v',
  createdAt: 'cA',
  updatedAt: 'uA',
  layoutSettings: 'ls',
  containerWidth: 'cw',
  sectionSpacing: 'ss',
  navigationType: 'nt'
};

const reverseKeyMap: Record<string, string> = Object.fromEntries(
  Object.entries(keyMap).map(([k, v]) => [v, k])
);

export const compactHandbookData = (data: HandbookData): CompactHandbookData => {
  return {
    i: data.id,
    t: data.title,
    d: data.description,
    u: data.updatedAt,
    th: {
      c: data.theme.colorPrimary,
      fH: data.theme.fontHeading,
      fB: data.theme.fontBody,
      cv: data.theme.cover,
      bc: data.theme.backCover
    },
    p: data.projects.map((proj) => ({
      i: proj.id,
      t: proj.title,
      d: proj.description,
      ls: proj.layoutSettings,
      b: proj.blocks.map((block) => ({
        i: block.id,
        ty: block.type,
        c: block.content as Record<string, unknown>
      })),
      v: proj.version,
      cA: proj.createdAt,
      uA: proj.updatedAt
    }))
  };
};

export const expandHandbookData = (compact: CompactHandbookData): HandbookData => {
  return {
    id: compact.i,
    title: compact.t,
    description: compact.d,
    updatedAt: compact.u,
    theme: {
      colorPrimary: compact.th.c,
      fontHeading: compact.th.fH,
      fontBody: compact.th.fB,
      cover: compact.th.cv,
      backCover: compact.th.bc
    },
    projects: compact.p.map((proj) => ({
      id: proj.i,
      title: proj.t,
      description: proj.d,
      layoutSettings: proj.ls,
      blocks: proj.b.map((block) => ({
        id: block.i,
        type: block.ty as Block['type'],
        content: block.c as Block['content']
      })),
      version: proj.v,
      createdAt: proj.cA,
      updatedAt: proj.uA
    }))
  };
};

export const compactJson = (data: HandbookData): string => {
  return JSON.stringify(compactHandbookData(data));
};

export const dataCompressor = {
  compactHandbookData,
  expandHandbookData,
  compactJson
};

export default dataCompressor;
