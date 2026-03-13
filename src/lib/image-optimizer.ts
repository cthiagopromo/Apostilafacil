import type { HandbookData, Block, Project, Theme } from './types';

const MAX_IMAGE_WIDTH = 1200;
const MAX_IMAGE_HEIGHT = 1200;
const IMAGE_QUALITY = 0.75;

export const compressImage = async (
  base64: string,
  maxWidth = MAX_IMAGE_WIDTH,
  maxHeight = MAX_IMAGE_HEIGHT,
  quality = IMAGE_QUALITY
): Promise<string> => {
  if (!base64 || !base64.startsWith('data:image')) {
    return base64;
  }

  try {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx!.imageSmoothingEnabled = true;
        ctx!.imageSmoothingQuality = 'high';
        ctx!.drawImage(img, 0, 0, width, height);
        
        const avifData = canvas.toDataURL('image/avif', quality);
        
        if (avifData.startsWith('data:image/svg+xml') || avifData.length > base64.length) {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.length > base64.length) {
            resolve(base64);
          } else {
            resolve(webpData);
          }
        } else {
          resolve(avifData);
        }
      };
      img.onerror = () => resolve(base64);
      img.src = base64;
    });
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    return base64;
  }
};

export const compressBlockImages = async (block: Block): Promise<Block> => {
  if (block.type === 'image' && block.content.url) {
    const compressedUrl = await compressImage(block.content.url);
    return {
      ...block,
      content: {
        ...block.content,
        url: compressedUrl
      }
    };
  }
  return block;
};

export const processHandbookImages = async (data: HandbookData): Promise<HandbookData> => {
  const processedProjects: Project[] = [];

  for (const project of data.projects) {
    const processedBlocks: Block[] = [];
    
    for (const block of project.blocks) {
      const processedBlock = await compressBlockImages(block);
      processedBlocks.push(processedBlock);
    }

    processedProjects.push({
      ...project,
      blocks: processedBlocks
    });
  }

  let processedTheme = data.theme;
  
  if (data.theme.cover) {
    processedTheme = {
      ...processedTheme,
      cover: await compressImage(data.theme.cover)
    };
  }
  
  if (data.theme.backCover) {
    processedTheme = {
      ...processedTheme,
      backCover: await compressImage(data.theme.backCover)
    };
  }

  return {
    ...data,
    theme: processedTheme,
    projects: processedProjects
  };
};

export const imageOptimizer = {
  compressImage,
  compressBlockImages,
  processHandbookImages
};

export default imageOptimizer;
