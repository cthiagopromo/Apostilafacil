
import type { HandbookData, Project } from './types';

const firstProjectId = `proj_${new Date().getTime()}`;

export const initialHandbookData: HandbookData = {
  id: `handbook_${new Date().getTime()}`,
  title: 'Apostila Interativa',
  description: 'Um curso completo sobre um tópico fascinante.',
  updatedAt: new Date().toISOString(),
  projects: [
    {
      id: firstProjectId,
      title: 'Módulo de Biologia Celular',
      description: 'Uma introdução à fascinante jornada dentro da célula.',
      theme: {
        colorPrimary: '#2563EB',
        colorBackground: '#F9FAFB',
        colorAccent: '#60A5FA',
        fontBody: 'Inter',
      },
      layoutSettings: {
        containerWidth: 'large',
        sectionSpacing: 'standard',
        navigationType: 'sidebar',
      },
      blocks: [
        {
          id: `block_${new Date().getTime()}`,
          type: 'text',
          content: {
            text: '<h1>O que é uma Célula?</h1><p>A célula é a menor unidade estrutural e funcional dos seres vivos. Todos os organismos, desde as bactérias mais simples até os seres humanos, são compostos por células.</p>',
          },
        },
        {
          id: `block_${new Date().getTime() + 1}`,
          type: 'image',
          content: {
            url: 'https://placehold.co/600x400.png',
            alt: 'diagrama de uma celula eucarionte',
            caption: 'Figura 1: Representação de uma célula eucariótica.',
            width: 100,
          },
        },
        {
          id: `block_${new Date().getTime() + 2}`,
          type: 'video',
          content: {
            videoType: 'cloudflare',
            cloudflareVideoId: '8d6s5f4g',
            videoTitle: 'Teste de Vídeo Cloudflare',
            autoplay: false,
            showControls: true
          }
        }
      ],
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
};
