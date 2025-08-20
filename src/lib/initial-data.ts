
import type { HandbookData, Project } from './types';

const firstProjectId = `proj_${new Date().getTime()}`;
const secondProjectId = `proj_${new Date().getTime() + 1}`;

export const initialHandbookData: HandbookData = {
  id: `handbook_${new Date().getTime()}`,
  title: 'Apostila de Teste Completa',
  description: 'Um curso completo para testar a funcionalidade de exportação.',
  updatedAt: new Date().toISOString(),
  projects: [
    {
      id: firstProjectId,
      title: 'Módulo 1: Teste de Paginação e Conteúdo Misto',
      description: 'Este módulo testa a quebra de página inteligente e a renderização de vários blocos.',
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
            text: '<h1>Teste de Paginação com Texto Longo</h1><p>A célula é a menor unidade estrutural e funcional dos seres vivos. Todos os organismos, desde as bactérias mais simples até os seres humanos, são compostos por células. Este parágrafo é intencionalmente longo para testar a capacidade da Paged.js de lidar com quebras de página de forma elegante. A biblioteca deve ser capaz de dividir o conteúdo de texto entre duas ou mais páginas sem cortar linhas de forma inadequada. A fluidez da leitura deve ser preservada, garantindo uma experiência de usuário contínua e profissional no documento PDF final. A seguir, uma imagem e um quiz serão apresentados para verificar se a regra `page-break-inside: avoid` está funcionando e impedindo que blocos complexos sejam divididos incorretamente. Este texto continua por mais algumas linhas para garantir que a quebra de página ocorra. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh.</p>',
          },
        },
        {
          id: `block_${new Date().getTime() + 1}`,
          type: 'image',
          content: {
            url: 'https://placehold.co/800x400.png',
            alt: 'placeholder de imagem para teste de quebra de página',
            caption: 'Figura 1: Esta imagem não deve ser cortada pela quebra de página.',
            width: 100,
          },
        },
        {
          id: `block_${new Date().getTime() + 2}`,
          type: 'quiz',
          content: { 
              question: 'A Paged.js evita que este bloco seja dividido entre duas páginas?', 
              options: [
                  { id: 'opt1', text: 'Sim, a propriedade `page-break-inside: avoid` impede isso.', isCorrect: true },
                  { id: 'opt2', text: 'Não, o bloco será cortado.', isCorrect: false }
              ],
              userAnswerId: null
          },
        }
      ],
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: secondProjectId,
      title: 'Módulo 2: Teste de Vídeo e Citação',
      description: 'Verificação da renderização de blocos de vídeo e citação.',
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
          id: `block_${new Date().getTime() + 3}`,
          type: 'quote',
          content: {
            text: 'A ciência de hoje é a tecnologia de amanhã. Este bloco de citação deve ser renderizado com a formatação correta, incluindo a borda lateral e o ícone de aspas.',
          },
        },
        {
          id: `block_${new Date().getTime() + 4}`,
          type: 'video',
          content: {
            videoType: 'youtube',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            videoTitle: 'Teste de Vídeo',
            autoplay: false,
            showControls: true,
          }
        }
      ],
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]
};
