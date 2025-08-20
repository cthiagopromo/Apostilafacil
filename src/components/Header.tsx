
'use client';

import { useState } from 'react';
import useProjectStore from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Save, Loader, ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { PreviewModal } from './PreviewModal';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { HandbookData, Block, Project } from '@/lib/types';
import DOMPurify from 'dompurify';


// Função para gerar o script JS que irá no ZIP
const getInteractiveScript = (): string => {
    // This script contains all the client-side interactivity logic.
    // It will be embedded directly into the exported HTML.
    return `
        document.addEventListener('DOMContentLoaded', () => {
            const dataElement = document.getElementById('handbook-data');
            if (!dataElement) {
                console.error('Handbook data script tag not found.');
                return;
            }
            const handbookData = JSON.parse(dataElement.textContent || '{}');

            // --- Quiz Interactivity ---
            document.querySelectorAll('.quiz-card').forEach(card => {
                const retryBtn = card.querySelector('.retry-btn');
                const radioButtons = card.querySelectorAll('input[type="radio"]');
                const options = card.querySelectorAll('.quiz-option');

                const handleAnswer = (e) => {
                    const selectedOptionEl = e.currentTarget.closest('.quiz-option');
                    if (!selectedOptionEl) return;
                    
                    radioButtons.forEach(rb => {
                       rb.disabled = true;
                    });
                    
                    const isSelectedCorrect = selectedOptionEl.dataset.correct === 'true';

                    if (isSelectedCorrect) {
                        selectedOptionEl.classList.add('bg-primary-light', 'border-primary');
                        const icon = selectedOptionEl.querySelector('.lucide-check-circle');
                        if (icon) icon.style.display = 'inline-block';
                    } else {
                        selectedOptionEl.classList.add('bg-destructive-light', 'border-destructive');
                        const icon = selectedOptionEl.querySelector('.lucide-x-circle');
                        if (icon) icon.style.display = 'inline-block';
                        
                        const correctOption = card.querySelector('.quiz-option[data-correct="true"]');
                        if(correctOption) {
                           correctOption.classList.add('bg-primary-light', 'border-primary');
                           const correctIcon = correctOption.querySelector('.lucide-check-circle');
                           if(correctIcon) correctIcon.style.display = 'inline-block';
                        }
                    }

                    if (retryBtn) retryBtn.style.display = 'inline-flex';
                };

                radioButtons.forEach(radio => {
                    radio.addEventListener('change', handleAnswer);
                });

                if (retryBtn) {
                    retryBtn.addEventListener('click', () => {
                        radioButtons.forEach(rb => {
                            rb.disabled = false;
                            rb.checked = false;
                        });
                        options.forEach(opt => {
                           opt.classList.remove('bg-primary-light', 'border-primary', 'bg-destructive-light', 'border-destructive');
                           const checkIcon = opt.querySelector('.lucide-check-circle');
                           const xIcon = opt.querySelector('.lucide-x-circle');
                           if(checkIcon) checkIcon.style.display = 'none';
                           if(xIcon) xIcon.style.display = 'none';
                        });
                        retryBtn.style.display = 'none';
                    });
                }
            });

            // --- Accessibility Toolbar ---
            const toolbar = document.querySelector('.accessibility-toolbar');
            if (toolbar) {
                const printBtn = toolbar.querySelector('[data-action="print"]');
                const zoomInBtn = toolbar.querySelector('[data-action="zoom-in"]');
                const zoomOutBtn = toolbar.querySelector('[data-action="zoom-out"]');
                const contrastBtn = toolbar.querySelector('[data-action="contrast"]');
                
                if (printBtn) printBtn.addEventListener('click', () => window.print());
                if (contrastBtn) contrastBtn.addEventListener('click', () => document.body.classList.toggle('high-contrast'));
                
                const handleFontSize = (increase) => {
                    const body = document.body;
                    const currentSize = parseFloat(window.getComputedStyle(body).fontSize);
                    const newSize = increase ? currentSize + 1 : currentSize - 1;
                    if (newSize >= 12 && newSize <= 24) { 
                      body.style.fontSize = \`\${newSize}px\`;
                    }
                };

                if (zoomInBtn) zoomInBtn.addEventListener('click', () => handleFontSize(true));
                if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => handleFontSize(false));
            }
        });
    `;
};


const renderBlockToHtml = (block: Block): string => {
    // Sanitize text content
    const sanitizedText = (text: string | undefined) => {
        if (typeof window !== 'undefined' && DOMPurify) {
            return DOMPurify.sanitize(text || '');
        }
        return text || '';
    };

    switch (block.type) {
        case 'text':
            return `<div class="prose dark:prose-invert max-w-none">${sanitizedText(block.content.text)}</div>`;
        
        case 'image':
            const width = block.content.width || 100;
            return `
                <div class="flex justify-center">
                    <figure class="flex flex-col items-center gap-2" style="width: ${width}%">
                        <img src="${block.content.url || 'https://placehold.co/600x400.png'}" alt="${block.content.alt || ''}" class="rounded-md shadow-md max-w-full h-auto" />
                        ${block.content.caption ? `<figcaption class="text-sm text-center text-muted-foreground italic mt-2">${block.content.caption}</figcaption>` : ''}
                    </figure>
                </div>`;
        
        case 'quote':
             return `
                <div class="relative">
                    <blockquote class="p-6 bg-muted/50 border-l-4 border-primary rounded-r-lg text-lg italic text-foreground/80 m-0">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute -top-3 -left-2 h-10 w-10 text-primary/20"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2S6 3.75 6 5v6H4c-1 1 0 5 3 5z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2s-2 1.25-2 3v6h-2c-1 1 0 5 3 5z"></path></svg>
                        ${sanitizedText(block.content.text)}
                    </blockquote>
                 </div>`;

        case 'video':
             const { videoType, videoUrl, cloudflareVideoId, videoTitle, autoplay, showControls } = block.content;
            let videoEmbedUrl = '';
            if (videoType === 'youtube' && videoUrl) {
                try {
                    const urlObj = new URL(videoUrl);
                    let videoId = urlObj.searchParams.get('v');
                    if (urlObj.hostname === 'youtu.be') {
                        videoId = urlObj.pathname.substring(1);
                    }
                    if (videoId) {
                       videoEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&controls=${showControls ? 1 : 0}`;
                    }
                } catch(e) { /* Invalid URL */ }
            } else if (videoType === 'cloudflare' && cloudflareVideoId) {
                videoEmbedUrl = `https://customer-mhnunnb897evy1sb.cloudflarestream.com/${cloudflareVideoId}/iframe?autoplay=${autoplay}&controls=${showControls}`;
            }

            if (!videoEmbedUrl) return `<p class="text-destructive">Vídeo inválido ou não configurado.</p>`;
            return `<iframe class="w-full aspect-video rounded-md" src="${videoEmbedUrl}" title="${videoTitle || 'Vídeo'}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>`;
        
        case 'button':
            return `
                <div class="flex justify-center">
                    <a href="${block.content.buttonUrl || '#'}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8">
                        ${block.content.buttonText || 'Botão'}
                    </a>
                </div>`;
        
        case 'quiz':
            const optionsHtml = block.content.options?.map(option => `
                <div class="quiz-option flex items-center space-x-3 p-3 rounded-md transition-all border" data-correct="${option.isCorrect}">
                    <input type="radio" name="quiz-${block.id}" id="${option.id}" class="radio-group-item" />
                    <label for="${option.id}" class="flex-1 cursor-pointer">${option.text}</label>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-check-circle text-primary" style="display:none;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-x-circle text-red-600" style="display:none;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                </div>`).join('') || '';

            return `
                <div class="quiz-card rounded-lg border bg-card text-card-foreground shadow-sm bg-muted/30">
                    <div class="p-6">
                        <h3 class="text-xl font-semibold">${block.content.question || ''}</h3>
                        <p class="text-sm text-muted-foreground">Selecione a resposta correta.</p>
                    </div>
                    <div class="p-6 pt-0">
                        <div class="grid gap-2">${optionsHtml}</div>
                    </div>
                    <div class="p-6 pt-0">
                        <button class="retry-btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2" style="display:none;">Tentar Novamente</button>
                    </div>
                </div>`;
        default:
            return `<!-- Bloco do tipo ${block.type} não suportado para exportação -->`;
    }
};

const renderProjectsToHtml = (projects: Project[]): string => {
    return projects.map(project => `
        <section class="module-section mb-12 last:mb-0">
            <header class="text-center mb-12">
                <h2 class="text-3xl font-bold mb-2 pb-2">${project.title}</h2>
                <p class="text-muted-foreground">${project.description}</p>
            </header>
            <div class="space-y-8">
                ${project.blocks.map(block => `<div data-block-id="${block.id}">${renderBlockToHtml(block)}</div>`).join('')}
            </div>
        </section>
    `).join('');
};

const getGlobalCss = () => {
    return `
      :root {
        --background: 240 5% 96%;
        --foreground: 222.2 84% 4.9%;
        --card: 0 0% 100%;
        --card-foreground: 222.2 84% 4.9%;
        --popover: 0 0% 100%;
        --popover-foreground: 0 0% 3.9%;
        --primary: 221 83% 53%;
        --primary-foreground: 0 0% 98%;
        --secondary: 210 40% 98%;
        --secondary-foreground: 222.2 47.4% 11.2%;
        --muted: 210 40% 96.1%;
        --muted-foreground: 215 20.2% 65.1%;
        --accent: 210 40% 96.1%;
        --accent-foreground: 222.2 47.4% 11.2%;
        --destructive: 0 84.2% 60.2%;
        --destructive-foreground: 0 0% 98%;
        --border: 214 31.8% 91.4%;
        --input: 214 31.8% 91.4%;
        --ring: 221 83% 53%;
        --radius: 0.75rem;
      }
      .dark {
        --background: 222.2 84% 4.9%;
        --foreground: 210 40% 98%;
        --card: 222.2 84% 4.9%;
        --card-foreground: 210 40% 98%;
        --popover: 222.2 84% 4.9%;
        --popover-foreground: 210 40% 98%;
        --primary: 217 91% 65%;
        --primary-foreground: 222.2 47.4% 11.2%;
        --secondary: 217.2 32.6% 17.5%;
        --secondary-foreground: 210 40% 98%;
        --muted: 217.2 32.6% 17.5%;
        --muted-foreground: 215 20.2% 65.1%;
        --accent: 217.2 32.6% 17.5%;
        --accent-foreground: 210 40% 98%;
        --destructive: 0 62.8% 30.6%;
        --destructive-foreground: 210 40% 98%;
        --border: 217.2 32.6% 17.5%;
        --input: 217.2 32.6% 17.5%;
        --ring: 217.2 32.6% 17.5%;
      }
      body.high-contrast {
        background-color: black !important;
        color: white !important;
      }
      body.high-contrast .bg-card, body.high-contrast .quiz-card {
        background-color: black !important;
        border: 1px solid white;
        color: white;
      }
      body.high-contrast .text-primary { color: yellow; }
      body.high-contrast .text-muted-foreground { color: lightgray; }
      body.high-contrast .border-primary { border-color: yellow; }
      .bg-primary-light { background-color: hsla(var(--primary), 0.1); }
      .border-primary { border-color: hsl(var(--primary)); }
      .bg-destructive-light { background-color: hsla(var(--destructive), 0.1); }
      .border-destructive { border-color: hsl(var(--destructive)); }
      .prose { color: hsl(var(--foreground)); }
      .prose h1, .prose h2, .prose h3 { color: hsl(var(--primary)); }
    `;
};


export default function Header() {
  const { handbookTitle, handbookDescription, handbookId, handbookUpdatedAt, projects, saveData, isDirty } = useProjectStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const { toast } = useToast();

  const handleExportZip = async () => {
    if (!projects || projects.length === 0) {
        toast({ variant: 'destructive', title: 'Nenhum projeto para exportar' });
        return;
    }
    setIsExporting(true);
    
    try {
        const zip = new JSZip();
        const cleanTitle = (handbookTitle || 'apostila').toLowerCase().replace(/\s+/g, '-');

        const handbookData: HandbookData = {
            id: handbookId,
            title: handbookTitle,
            description: handbookDescription,
            updatedAt: handbookUpdatedAt,
            projects
        };
        
        const contentHtml = renderProjectsToHtml(projects);
        
        const finalHtml = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${handbookTitle}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    ${getGlobalCss()}
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                    body { font-family: 'Inter', sans-serif; }
                </style>
                 <script>
                    tailwind.config = {
                      theme: {
                        extend: {
                          colors: {
                             border: 'hsl(var(--border))',
                             input: 'hsl(var(--input))',
                             ring: 'hsl(var(--ring))',
                             background: 'hsl(var(--background))',
                             foreground: 'hsl(var(--foreground))',
                             primary: {
                               DEFAULT: 'hsl(var(--primary))',
                               foreground: 'hsl(var(--primary-foreground))',
                             },
                             secondary: {
                               DEFAULT: 'hsl(var(--secondary))',
                               foreground: 'hsl(var(--secondary-foreground))',
                             },
                             destructive: {
                               DEFAULT: 'hsl(var(--destructive))',
                               foreground: 'hsl(var(--destructive-foreground))',
                             },
                             muted: {
                               DEFAULT: 'hsl(var(--muted))',
                               foreground: 'hsl(var(--muted-foreground))',
                             },
                             accent: {
                               DEFAULT: 'hsl(var(--accent))',
                               foreground: 'hsl(var(--accent-foreground))',
                             },
                             popover: {
                               DEFAULT: 'hsl(var(--popover))',
                               foreground: 'hsl(var(--popover-foreground))',
                             },
                             card: {
                               DEFAULT: 'hsl(var(--card))',
                               foreground: 'hsl(var(--card-foreground))',
                             },
                          }
                        }
                      }
                    }
                  </script>
                <script id="handbook-data" type="application/json">${JSON.stringify(handbookData)}</script>
            </head>
            <body class="bg-background text-foreground font-sans antialiased">
                <div id="handbook-root-container">
                     <main id="printable-content" class="max-w-4xl mx-auto p-4 sm:p-8 md:p-12">
                        <div id="handbook-root" class="bg-card rounded-xl shadow-lg p-8 sm:p-12 md:p-16">
                            ${contentHtml}
                        </div>
                    </main>
                </div>
                <script>${getInteractiveScript()}</script>
            </body>
            </html>`;

        zip.file('index.html', finalHtml);
        
        const blob = await zip.generateAsync({ type: 'blob' });
        saveAs(blob, `apostila-${cleanTitle}.zip`);

        toast({ title: 'Exportação Concluída' });
    } catch (error) {
        console.error('Falha ao exportar o projeto', error);
        toast({
            variant: 'destructive',
            title: 'Erro na Exportação',
            description: `Não foi possível exportar o projeto. Detalhes: ${error instanceof Error ? error.message : 'Erro desconhecido.'}`,
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

  const handlePreview = () => {
     if (!projects || projects.length === 0) {
      toast({
          variant: "destructive",
          title: "Nenhum projeto para visualizar",
          description: "Adicione pelo menos um módulo antes de visualizar.",
      });
      return;
    }
    setIsPreviewModalOpen(true);
  }

  return (
    <>
      <PreviewModal 
        isOpen={isPreviewModalOpen} 
        onOpenChange={setIsPreviewModalOpen}
      />
      <header className="flex items-center justify-between p-3 h-16 bg-card border-b">
        <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Início
              </Link>
            </Button>
            <div className="w-px h-8 bg-border"></div>
              <div className='flex items-center gap-3'>
                <h1 className="text-lg font-semibold truncate max-w-xs md:max-w-md">
                  {handbookTitle}
                </h1>
                {isSaving ? (
                  <Badge variant="outline">Salvando...</Badge>
                ) : isDirty ? (
                  <Badge variant="destructive">Não Salvo</Badge>
                ) : (
                  <Badge variant="secondary">Salvo</Badge>
                )}
              </div>
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
          <Button onClick={handlePreview} variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Visualizar
          </Button>
          <Button onClick={handleExportZip} disabled={isExporting}>
              {isExporting ? (
                  <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Exportando...
                  </>
              ) : (
                  <>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar ZIP
                  </>
              )}
          </Button>
        </div>
      </header>
    </>
  );
}

    