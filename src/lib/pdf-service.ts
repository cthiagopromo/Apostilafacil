import html2pdf from 'html2pdf.js';

/**
 * Interface para as opções do html2pdf
 */
interface PDFOptions {
  margin?: number | [number, number, number, number];
  filename?: string;
  image?: { type: 'jpeg' | 'png' | 'webp'; quality: number };
  html2canvas?: {
    scale?: number;
    useCORS?: boolean;
    letterRendering?: boolean;
    [key: string]: any;
  };
  jsPDF?: {
    unit?: string;
    format?: string;
    orientation?: 'portrait' | 'landscape';
    [key: string]: any;
  };
  pagebreak?: {
    mode?: string | string[];
    before?: string | string[];
    after?: string | string[];
    avoid?: string | string[];
  };
}

/**
 * Exporta um elemento HTML para PDF mantendo a fidelidade visual
 * @param elementId ID do elemento a ser capturado
 * @param filename Nome do arquivo final
 */
export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemento com ID "${elementId}" não encontrado.`);
  }

  // Opções recomendadas para alta fidelidade em A4
  const opt: PDFOptions = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      letterRendering: true,
      logging: false,
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.module-section',
      avoid: '.card, .quiz-card, figure'
    }
  };

  try {
    // Inicia a geração
    await html2pdf().from(element).set(opt).save();
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};
