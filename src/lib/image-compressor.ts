// ============================================================================
// COMPRESSOR DE IMAGENS
// ============================================================================
// Baseado nas melhores práticas de 2025 para otimização de imagens web
// Referência: frontendtools.tech/blog/modern-image-optimization-techniques-2025
// ============================================================================

export interface ImageCompressionOptions {
  /** Largura máxima em pixels (padrão: 1600px) */
  maxWidth?: number;
  /** Altura máxima em pixels (padrão: 1600px) */
  maxHeight?: number;
  /** Qualidade da compressão 0.0-1.0 (padrão: 0.75 para AVIF, 0.85 para WebP) */
  quality?: number;
  /** Formato preferencial (padrão: 'avif') */
  format?: 'avif' | 'webp' | 'jpeg';
  /** Tamanho máximo em bytes (opcional, faz resize automático para atingir) */
  maxSizeBytes?: number;
}

const DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 1200,        // 1200px de largura máxima
  maxHeight: 1200,       // 1200px de altura máxima
  quality: 0.80,         // 80% de qualidade (boa qualidade visual)
  format: 'avif',
  maxSizeBytes: 400 * 1024, // 400KB máximo
};

/**
 * Detecta se o navegador suporta AVIF
 */
const supportsAvif = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  
  canvas.width = 1;
  canvas.height = 1;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, 1, 1);
  
  const dataUrl = canvas.toDataURL('image/avif');
  return dataUrl.startsWith('data:image/avif');
};

/**
 * Detecta se string é base64 de imagem
 */
const isImageBase64 = (str: string): boolean => {
  return str?.startsWith('data:image/');
};

/**
 * Converte base64 para Blob
 */
const base64ToBlob = (base64: string): Blob => {
  const [header, data] = base64.split(',');
  const mimeType = header?.match(/:(.*?);/)?.[1] || 'image/png';
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  
  return new Blob([array], { type: mimeType });
};

/**
 * Converte Blob para base64
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

/**
 * Calcula novas dimensões mantendo aspect ratio
 */
const calculateNewDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  // Se já está dentro dos limites, retorna original
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }
  
  // Calcula escala mantendo aspect ratio
  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;
  const scale = Math.min(widthRatio, heightRatio);
  
  return {
    width: Math.floor(originalWidth * scale),
    height: Math.floor(originalHeight * scale),
  };
};

/**
 * **FUNÇÃO PRINCIPAL** - Comprime e redimensiona imagem base64
 * 
 * @param base64 - Imagem em base64
 * @param options - Opções de compressão
 * @returns Promise com imagem comprimida em base64
 * 
 * @example
 * ```typescript
 * const compressed = await compressImage(base64Image, {
 *   maxWidth: 1200,
 *   maxHeight: 1200,
 *   quality: 0.75,
 *   format: 'avif'
 * });
 * ```
 */
export const compressImage = async (
  base64: string,
  options: ImageCompressionOptions = {}
): Promise<string> => {
  // Se não for browser ou não for imagem base64, retorna original
  if (typeof window === 'undefined' || !isImageBase64(base64)) {
    return base64;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Detecta formato suportado (AVIF > WebP > JPEG)
  let targetFormat = opts.format;
  if (targetFormat === 'avif' && !supportsAvif()) {
    targetFormat = 'webp';
  }

  try {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // Calcula novas dimensões
        const { width, height } = calculateNewDimensions(
          img.width,
          img.height,
          opts.maxWidth!,
          opts.maxHeight!
        );

        // Cria canvas com dimensões otimizadas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Não foi possível obter contexto 2D do canvas'));
          return;
        }

        // Configura para melhor qualidade de redimensionamento
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Desenha imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Converte para Blob primeiro (mais eficiente que toDataURL)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao comprimir imagem'));
              return;
            }

            // Converte Blob para base64 e retorna
            blobToBase64(blob).then(resolve).catch(reject);
          },
          `image/${targetFormat}`,
          opts.quality
        );
      };

      img.onerror = () => {
        // Se falhar, retorna original
        resolve(base64);
      };

      img.src = base64;
    });
  } catch (error) {
    console.error('[compressImage] Erro:', error);
    return base64; // Fallback para original em caso de erro
  }
};

/**
 * Comprime imagem com restrição de tamanho máximo
 * Tenta diferentes qualidades até atingir o tamanho desejado
 */
export const compressImageToSize = async (
  base64: string,
  maxSizeBytes: number = 500 * 1024, // 500KB
  maxWidth: number = 1600,
  maxHeight: number = 1600
): Promise<string> => {
  if (typeof window === 'undefined' || !isImageBase64(base64)) {
    return base64;
  }

  let quality = 0.9;
  let result = base64;
  
  // Tenta comprimir com diferentes qualidades
  while (quality >= 0.5) {
    result = await compressImage(base64, {
      maxWidth,
      maxHeight,
      quality,
      format: 'avif',
    });

    // Verifica tamanho
    const sizeBytes = Math.ceil((result.length * 3) / 4); // Base64 → bytes
    
    if (sizeBytes <= maxSizeBytes) {
      return result;
    }

    quality -= 0.05;
  }

  // Se não atingiu o tamanho, retorna com qualidade mínima
  return result;
};

/**
 * Processa todas as imagens de uma apostila
 */
export const processHandbookImages = async (
  handbookData: HandbookData
): Promise<HandbookData> => {
  const processed = JSON.parse(JSON.stringify(handbookData)) as HandbookData;

  // Processar capa
  if (processed.theme.cover && isImageBase64(processed.theme.cover)) {
    processed.theme.cover = await compressImage(processed.theme.cover, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.80,
      format: 'avif',
    });
  }

  // Processar contracapa
  if (processed.theme.backCover && isImageBase64(processed.theme.backCover)) {
    processed.theme.backCover = await compressImage(processed.theme.backCover, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.80,
      format: 'avif',
    });
  }

  // Processar imagens dos blocos
  for (const project of processed.projects) {
    for (const block of project.blocks) {
      if (block.type === 'image' && block.content.url && isImageBase64(block.content.url)) {
        block.content.url = await compressImage(block.content.url, {
          maxWidth: 1000,
          maxHeight: 1000,
          quality: 0.80,
          format: 'avif',
        });
      }
    }
  }

  return processed;
};

/**
 * Calcula economia de tamanho após compressão
 */
export const calculateImageSavings = (original: string, compressed: string): {
  originalBytes: number;
  compressedBytes: number;
  savingsBytes: number;
  savingsPercent: number;
} => {
  const originalBytes = Math.ceil((original.length * 3) / 4);
  const compressedBytes = Math.ceil((compressed.length * 3) / 4);
  const savingsBytes = originalBytes - compressedBytes;
  const savingsPercent = (savingsBytes / originalBytes) * 100;

  return {
    originalBytes,
    compressedBytes,
    savingsBytes,
    savingsPercent,
  };
};

// Exportar utilitários
export { isImageBase64, supportsAvif, calculateNewDimensions };
