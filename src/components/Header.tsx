
'use client';

import { useState } from 'react';
import useProjectStore from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Save, Loader, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/lib/types';
import { generateZip } from '@/lib/export';

// This function was moved from export.ts to be client-side only
async function generatePdfForClient(projects: Project[], handbookTitle: string) {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;

  const modal = document.getElementById('loading-modal');
  if (modal) modal.style.display = 'flex';

  try {
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    // Helper function to generate CSS for the PDF content.
    // This should be defined within the scope where it's used.
    const generateCss = (isForPdf: boolean): string => {
        const pdfOnlyStyles = `
            body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #111827; margin: 0; background: #fff; }
            #render-me { padding: 15mm; }
            .module-main-title { font-size: 1rem; font-weight: 500; color: #2563EB; text-transform: uppercase; letter-spacing: 1px; margin: 0; text-align: center; }
            .module-title-header { color: #111827; font-size: 2.5rem; font-weight: 700; margin: 0.25rem 0 0 0; text-align: center; }
            .divider { height: 1px; background-color: #E5E7EB; margin: 1.5rem 0; }
            .block { margin-bottom: 2rem; }
            img { max-width: 100%; height: auto; border-radius: 8px; }
            .block-text { text-align: left; }
            .block-image { text-align: center; }
            .block-image figcaption { font-size: 0.9rem; color: #555; margin-top: 0.5rem; text-align: center; }
            .block-quote { position: relative; padding: 1.5rem; background-color: #F4F5F7; border-left: 4px solid #2563EB; border-radius: 4px; font-style: italic; font-size: 1.1rem; }
            .block-button { text-align: center; }
            .btn-block { display: inline-block; background-color: #2563EB; color: white; padding: 0.8rem 2rem; border-radius: 8px; font-weight: bold; text-decoration: none; }
            
            .pdf-video-placeholder { display: flex; align-items: center; gap: 1em; padding: 1rem; margin: 1.5rem 0; background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; }
            .pdf-video-placeholder a { color: #2563EB; text-decoration: none; font-weight: 500; }
            .pdf-video-placeholder-icon { flex-shrink: 0; width: 24px; height: 24px; }
            .pdf-video-placeholder-icon svg { fill: #374151; }
            .pdf-video-placeholder-text p { margin: 0; padding: 0; color: #111827;}
            .pdf-video-placeholder-text p.video-title { font-weight: bold; margin-bottom: 0.25em; }

            .pdf-quiz-placeholder { padding: 1rem; background: #f3f4f6; border-radius: 6px; text-align: center; margin-top: 1rem; border: 1px solid #d1d5db; }
            .block-quiz .quiz-question { font-weight: bold; font-size: 1.1rem; margin-top: 0; text-align: left; }
        `;
        return pdfOnlyStyles;
    };
    
    const css = generateCss(true);

    const imageUrls = projects
      .flatMap((p) => p.blocks)
      .filter((b) => b.type === 'image' && b.content.url)
      .map((b) => b.content.url!);

    const uniqueImageUrls = [...new Set(imageUrls)];

    const imageToBase64 = async (url: string): Promise<string> => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.error(`Failed to fetch and convert image to base64: ${url}`, e);
        return 'error';
      }
    };

    const base64Promises = uniqueImageUrls.map(imageToBase64);
    const base64Results = await Promise.all(base64Promises);

    const allImagesBase64: Record<string, string> = {};
    uniqueImageUrls.forEach((url, index) => {
      if (base64Results[index] !== 'error') {
        allImagesBase64[url] = base64Results[index];
      }
    });

    for (const project of projects) {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '210mm'; 
        iframe.style.height = '297mm';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow?.document;
        if (!iframeDoc) {
            console.error('Could not access iframe document.');
            iframe.remove();
            continue;
        }

        const projectHtml = project.blocks.map(block => {
            if (block.type === 'image' && block.content.url && allImagesBase64[block.content.url]) {
              return `
                  <div class="block block-image" style="display: flex; justify-content: center;">
                      <figure style="width: ${block.content.width ?? 100}%;">
                          <img src="${allImagesBase64[block.content.url]}" alt="${block.content.alt || ''}" style="max-width: 100%; height: auto; display: block; border-radius: 6px;" />
                          ${block.content.caption ? `<figcaption style="padding-top: 0.75rem; font-size: 0.9rem; color: #555; text-align: center;">${block.content.caption}</figcaption>`: ''}
                      </figure>
                  </div>`;
            } else if (block.type === 'video') {
                const { videoType, videoUrl, cloudflareVideoId, videoTitle } = block.content;
                let videoLink = '#';
                if (videoType === 'cloudflare' && cloudflareVideoId) {
                    videoLink = `https://customer-mhnunnb897evy1sb.cloudflarestream.com/${cloudflareVideoId}/watch`;
                } else if (videoType === 'youtube' && videoUrl) {
                    videoLink = videoUrl;
                }
                return `
                    <div class="block block-video">
                         <div class="pdf-video-placeholder">
                            <div class="pdf-video-placeholder-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                            </div>
                            <div class="pdf-video-placeholder-text">
                                <p class="video-title">${videoTitle || 'Vídeo'}</p>
                                <p>Assista ao vídeo em: <a href="${videoLink}" target="_blank">${videoLink}</a></p>
                            </div>
                        </div>
                    </div>`;
            }
            // Basic renderer for other types
             switch (block.type) {
                case 'text':
                    return `<div class="block block-text">${block.content.text || ''}</div>`;
                case 'quote':
                     return `<div class="block block-quote"><p>${block.content.text || ''}</p></div>`;
                case 'button':
                     return `<div class="block block-button"><a href="${block.content.buttonUrl || '#'}" class="btn-block" target="_blank">${block.content.buttonText || 'Botão'}</a></div>`;
                case 'quiz':
                     return `<div class="block block-quiz"><p class="quiz-question">${block.content.question || ''}</p><div class="pdf-quiz-placeholder">Quiz interativo disponível na versão online.</div></div>`;
                default:
                    return '';
            }
        }).join('\n');
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>${css}</style>
            </head>
            <body>
                <div id="render-me">
                    <h2 class="module-main-title">${handbookTitle}</h2>
                    <h1 class="module-title-header">${project.title}</h1>
                    <div class="divider"></div>
                    ${projectHtml}
                </div>
            </body>
            </html>`;
        
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();

        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for render

        const elementToRender = iframeDoc.getElementById('render-me');

        if (elementToRender) {
            const canvas = await html2canvas(elementToRender, {
                scale: 2,
                useCORS: true,
                logging: false,
            });
            if (canvas.height > 0) {
              const imgData = canvas.toDataURL('image/png');
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
              if (projects.indexOf(project) > 0) pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            }
        }
        
        document.body.removeChild(iframe);
    }
    
    pdf.output('dataurlnewwindow');

  } catch (error) {
    console.error("Error during PDF generation process:", error);
  } finally {
    if (modal) modal.style.display = 'none';
  }
}

export default function Header() {
  const { handbookTitle, activeProject, saveData, isDirty } = useProjectStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    const { projects, handbookTitle } = useProjectStore.getState();

    if (!projects || projects.length === 0) {
        toast({
            variant: "destructive",
            title: "Nenhum projeto para exportar",
            description: "Adicione pelo menos um módulo antes de exportar.",
        });
        return;
    };

    setIsExporting(true);
    try {
      await generatePdfForClient(projects, handbookTitle);
      toast({
        title: "Exportação Concluída",
        description: "Seu projeto foi exportado como um arquivo PDF.",
      });
    } catch (error) {
      console.error("Failed to export project", error);
      toast({
        variant: "destructive",
        title: "Erro na Exportação",
        description: "Não foi possível exportar o projeto. Tente novamente.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = () => {
    if (!isDirty) return;

    setIsSaving(true);
    setTimeout(() => {
        saveData();
        setIsSaving(false);
        toast({
            title: "Projeto salvo com sucesso!",
        });
    }, 500);
  }

  return (
    <header className="flex items-center justify-between p-3 h-16 bg-card border-b">
      <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Início
            </Link>
          </Button>
          <div className="w-px h-8 bg-border"></div>
          {activeProject && (
            <div className='flex items-center gap-3'>
              <h1 className="text-lg font-semibold">
                {handbookTitle}
              </h1>
              {isSaving ? (
                <Badge variant="outline">Salvando...</Badge>
              ) : isDirty ? (
                 <Badge variant="destructive">Alterações não salvas</Badge>
              ) : (
                <Badge variant="outline">Salvo</Badge>
              )}
            </div>
          )}
      </div>

      <div className="flex-1 flex justify-center items-center gap-2">
         {/* Espaço central para futuros botões de edição de módulo */}
      </div>
      
      <div className="flex items-center gap-2">
        <Button onClick={handleSave} disabled={isSaving || !isDirty}>
          {isSaving ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
                <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Exportando...
                </>
            ) : (
                <>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar PDF
                </>
            )}
        </Button>
      </div>
    </header>
  );
}
