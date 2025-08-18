import type { Project } from './types';

export const initialProject: Project = {
  id: `proj_${new Date().getTime()}`,
  title: 'Apostila de Biologia Celular',
  description: 'Uma introdução à fascinante jornada dentro da célula.',
  theme: {
    colorPrimary: '#2563EB',
    colorBackground: '#F9FAFB',
    colorAccent: '#60A5FA',
    fontBody: 'Inter',
    containerWidth: 'md',
  },
  modules: [
    {
      id: `mod_${new Date().getTime()}`,
      title: 'Introdução à Célula',
      slug: 'introducao-a-celula',
      contentHTML: `<h1>Bem-vindo à Biologia Celular!</h1><p>Neste módulo, vamos explorar os fundamentos da célula, a unidade básica da vida. Prepare-se para uma viagem incrível ao mundo microscópico.</p><p>Abordaremos a teoria celular, os tipos de células (procariontes e eucariontes) e as principais organelas.</p>`,
      blocks: [],
    },
    {
      id: `mod_${new Date().getTime() + 1}`,
      title: 'A Membrana Plasmática',
      slug: 'a-membrana-plasmatica',
      contentHTML: `<h2>A Guardiã da Célula</h2><p>A membrana plasmática é uma estrutura vital que envolve a célula, controlando o que entra e sai. É composta por uma bicamada lipídica com proteínas incrustadas.</p>`,
      blocks: [],
    },
  ],
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
