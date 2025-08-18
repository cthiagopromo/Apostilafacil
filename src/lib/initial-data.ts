import type { Project } from './types';

export const initialProjects: Project[] = [
  {
    id: `proj_${new Date().getTime()}`,
    title: 'Apostila de Biologia Celular',
    description: 'Uma introdução à fascinante jornada dentro da célula.',
    theme: {
      colorPrimary: '#2563EB',
      colorBackground: '#F9FAFB',
      colorAccent: '#60A5FA',
      fontBody: 'Inter',
    },
    pages: [
      {
        id: `page_${new Date().getTime()}`,
        title: 'Capa',
        template: 'cover',
        content: {
          title: 'Biologia Celular',
          subtitle: 'Uma Viagem ao Centro da Vida',
          backgroundImageUrl: 'https://placehold.co/1200x800.png',
          alt: 'ilustracao de celulas',
        },
      },
      {
        id: `page_${new Date().getTime() + 1}`,
        title: 'Introdução',
        template: 'text_image',
        content: {
          title: 'O que é uma Célula?',
          text: 'A célula é a menor unidade estrutural e funcional dos seres vivos. Todos os organismos, desde as bactérias mais simples até os seres humanos, são compostos por células.',
          imageUrl: 'https://placehold.co/600x400.png',
          alt: 'diagrama de uma celula eucarionte',
        },
      },
    ],
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
