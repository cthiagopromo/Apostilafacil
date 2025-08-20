
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
import type { HandbookData, Block as BlockType } from '@/lib/types';
import DOMPurify from 'dompurify';


// Função para gerar o HTML de um bloco específico
const renderBlockToHtml = (block: BlockType): string => {
  // Sanitize content before rendering
  const sanitize = (html: string) => (typeof window !== 'undefined' ? DOMPurify.sanitize(html) : html);

  switch (block.type) {
    case 'text':
      return `<div class="prose dark:prose-invert max-w-none">${sanitize(block.content.text || '')}</div>`;
    case 'image':
      const width = block.content.width ?? 100;
      return `
        <figure class='flex flex-col items-center gap-2' style="width: ${width}%;">
          <img src="${block.content.url || 'https://placehold.co/600x400.png'}" alt="${block.content.alt || 'Placeholder'}" class="rounded-md shadow-md max-w-full h-auto" />
          ${block.content.caption ? `<figcaption class="text-sm text-center text-muted-foreground italic mt-2">${block.content.caption}</figcaption>` : ''}
        </figure>
      `;
    case 'quote':
       return `
        <div class="relative">
            <blockquote class="p-6 bg-muted/50 border-l-4 border-primary rounded-r-lg text-lg italic text-foreground/80 m-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute -top-3 -left-2 h-10 w-10 text-primary/20 quote-icon"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 2v6h3v4c0 2.25 1 4 3 4Z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2h-4c-1.25 0-2 .75-2 2v6h3v4c0 2.25 1 4 3 4Z"/></svg>
                ${block.content.text}
            </blockquote>
        </div>`;
    case 'video':
       const { videoType, videoUrl, cloudflareVideoId, videoTitle, autoplay, showControls } = block.content;
       let videoEmbed = '';
       if (videoType === 'cloudflare' && cloudflareVideoId) {
            const src = `https://customer-mhnunnb897evy1sb.cloudflarestream.com/${cloudflareVideoId}/iframe?autoplay=${autoplay}&controls=${showControls}`;
            videoEmbed = `<iframe class="w-full aspect-video rounded-md" src="${src}" title="${videoTitle || 'Cloudflare video'}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
       } else if (videoType === 'youtube' && videoUrl) {
           try {
                const urlObj = new URL(videoUrl);
                let videoId = urlObj.searchParams.get('v');
                if (urlObj.hostname === 'youtu.be') videoId = urlObj.pathname.substring(1);
                const src = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&controls=${showControls ? 1 : 0}`;
                videoEmbed = `<iframe class="w-full aspect-video rounded-md" src="${src}" title="${videoTitle || 'YouTube video'}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
           } catch(e) { videoEmbed = '<p class="text-destructive">URL do YouTube inválida.</p>'}
       }
       return videoEmbed;
    case 'button':
      return `
        <div class='flex justify-center'>
          <a href="${block.content.buttonUrl || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
            ${block.content.buttonText || 'Botão'}
          </a>
        </div>
      `;
    case 'quiz':
      const optionsHtml = block.content.options?.map(opt => `
        <div class="quiz-option flex items-center space-x-3 p-3 rounded-md transition-all" data-correct="${opt.isCorrect}">
            <input type="radio" name="quiz-${block.id}" value="${opt.id}" class="radio-group-item" />
            <label for="quiz-${block.id}-${opt.id}" class="flex-1 cursor-pointer">${opt.text}</label>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-check-circle text-primary" style="display: none;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-x-circle text-red-600" style="display: none;"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
        </div>
      `).join('') || '';
      return `
        <div class="quiz-card bg-muted/30 rounded-lg p-6">
            <h3 class="quiz-card-title font-bold text-lg mb-2">${block.content.question}</h3>
            <div class="quiz-options">${optionsHtml}</div>
            <div class="quiz-card-footer mt-4">
                <button class="retry-btn btn btn-outline" style="display: none;">Tentar Novamente</button>
            </div>
        </div>
      `;
    default:
      return `<p>Bloco do tipo "${block.type}" não suportado.</p>`;
  }
};


// Função para gerar o script JS que irá no ZIP
const getInteractiveScript = (): string => {
    return `
      document.addEventListener('DOMContentLoaded', () => {
        const dataElement = document.getElementById('apostila-data');
        if (!dataElement) {
            console.error('Handbook data script tag not found.');
            return;
        }
        
        const handbookData = JSON.parse(dataElement.textContent || '{}');
        const contentRoot = document.getElementById('handbook-root');

        if (!handbookData || !contentRoot) {
             console.error('Handbook data or root element not found.');
             return;
        }
        
        // Render all projects and blocks
        contentRoot.innerHTML = handbookData.projects.map(project => \`
            <section class="module-section mb-12 last:mb-0">
                <header class='text-center mb-12'>
                    <h2 class="text-3xl font-bold mb-2 pb-2">\${project.title}</h2>
                    <p class="text-muted-foreground">\${project.description}</p>
                </header>
                <div class="space-y-8">
                    \${project.blocks.map(block => \`
                        <div data-block-id="\${block.id}">
                            \${block.htmlContent}
                        </div>
                    \`).join('')}
                </div>
            </section>
        \`).join('');

        // --- Quiz Interactivity ---
        document.querySelectorAll('.quiz-card').forEach(card => {
            const retryBtn = card.querySelector('.retry-btn');
            const radioButtons = card.querySelectorAll('.radio-group-item');
            const options = card.querySelectorAll('.quiz-option');

            const handleAnswer = (e) => {
                const selectedOptionEl = e.currentTarget.closest('.quiz-option');
                if (!selectedOptionEl) return;
                
                radioButtons.forEach(rb => { rb.disabled = true; });
                
                const isSelectedCorrect = selectedOptionEl.dataset.correct === 'true';

                if (isSelectedCorrect) {
                    selectedOptionEl.classList.add('bg-primary/10', 'border-primary/50', 'border');
                    const icon = selectedOptionEl.querySelector('.lucide-check-circle');
                    if (icon) icon.style.display = 'inline-block';
                } else {
                    selectedOptionEl.classList.add('bg-red-100', 'border-red-500', 'border');
                    const icon = selectedOptionEl.querySelector('.lucide-x-circle');
                    if (icon) icon.style.display = 'inline-block';
                    
                    const correctOption = card.querySelector('.quiz-option[data-correct="true"]');
                    if(correctOption) {
                       correctOption.classList.add('bg-primary/10', 'border-primary/50', 'border');
                       const correctIcon = correctOption.querySelector('.lucide-check-circle');
                       if(correctIcon) correctIcon.style.display = 'inline-block';
                    }
                }
                if (retryBtn) retryBtn.style.display = 'inline-flex';
            };
            radioButtons.forEach(radio => { radio.addEventListener('change', handleAnswer); });
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    radioButtons.forEach(rb => { rb.disabled = false; rb.checked = false; });
                    options.forEach(opt => {
                       opt.classList.remove('bg-primary/10', 'border-primary/50', 'border', 'bg-red-100', 'border-red-500');
                       const checkIcon = opt.querySelector('.lucide-check-circle');
                       const xIcon = opt.querySelector('.lucide-x-circle');
                       if(checkIcon) checkIcon.style.display = 'none';
                       if(xIcon) xIcon.style.display = 'none';
                    });
                    retryBtn.style.display = 'none';
                });
            }
        });
      });
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
      toast({
        variant: 'destructive',
        title: 'Nenhum projeto para exportar',
        description: 'Adicione pelo menos um módulo antes de exportar.',
      });
      return;
    }
    setIsExporting(true);
    
    try {
        const zip = new JSZip();
        const cleanTitle = (handbookTitle || 'apostila').toLowerCase().replace(/\s+/g, '-');
        
        // 1. Pre-render block content to HTML
        const handbookDataWithHtml: HandbookData = JSON.parse(JSON.stringify({ 
            id: handbookId, 
            title: handbookTitle, 
            description: handbookDescription, 
            updatedAt: handbookUpdatedAt,
            projects 
        }));

        handbookDataWithHtml.projects.forEach(project => {
            project.blocks.forEach(block => {
                // @ts-ignore
                block.htmlContent = renderBlockToHtml(block);
            });
        });

        // 2. Fetch global CSS content
        const cssResponse = await fetch('/globals.css');
        const cssContent = await cssResponse.text();

        // 3. Generate interactive script
        const scriptContent = getInteractiveScript();

        // 4. Create the final HTML content
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${handbookTitle}</title>
    <style>
        ${cssContent}
        /* Add some basic button styles for the exported version */
        .btn { display: inline-flex; items-align: center; justify-content: center; padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 500; }
        .btn-primary { background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }
        .btn-outline { border: 1px solid hsl(var(--input)); background-color: transparent; }
    </style>
</head>
<body class="bg-secondary/40">
    <main id="printable-content" class="max-w-4xl mx-auto p-4 sm:p-8 md:p-12">
        <div id="handbook-root" class="bg-card rounded-xl shadow-lg p-8 sm:p-12 md:p-16">
            <!-- Content will be rendered here by the script -->
        </div>
    </main>

    <script id="apostila-data" type="application/json">
        ${JSON.stringify(handbookDataWithHtml)}
    </script>
    <script id="interactive-script">
        ${scriptContent}
    </script>
</body>
</html>`;

        zip.file('index.html', htmlContent);
        
        const blob = await zip.generateAsync({ type: 'blob' });
        saveAs(blob, `apostila-${cleanTitle}.zip`);

        toast({
            title: 'Exportação Concluída',
            description: 'Sua apostila interativa foi exportada como um arquivo ZIP.',
        });

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
