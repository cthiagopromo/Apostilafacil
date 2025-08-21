
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { HandbookData, Block, Project, Theme } from '@/lib/types';
import DOMPurify from 'dompurify';

const getInteractiveScript = (theme: Theme): string => {
    return `
        document.addEventListener('DOMContentLoaded', () => {
            const dataElement = document.getElementById('handbook-data');
            if (!dataElement) return;

            const theme = ${JSON.stringify(theme)};
            if (theme && theme.colorPrimary) {
                document.documentElement.style.setProperty('--primary', theme.colorPrimary);
            }

            let currentModuleIndex = 0;
            const modules = document.querySelectorAll('.module-section');
            const navButtons = document.querySelectorAll('.module-nav-btn');
            const floatingNavButtons = document.querySelectorAll('.floating-nav-btn');
            const floatingNavMenu = document.getElementById('floating-nav-menu');
            const floatingNavToggle = document.getElementById('floating-nav-toggle');

            const showModule = (index) => {
                modules.forEach((module, i) => {
                    const isVisible = i === index;
                    module.style.display = isVisible ? 'flex' : 'none';
                });
                floatingNavButtons.forEach((btn, i) => {
                    if (i === index) {
                        btn.classList.add('bg-primary', 'text-primary-foreground');
                        btn.classList.remove('hover:bg-accent');
                    } else {
                        btn.classList.remove('bg-primary', 'text-primary-foreground');
                        btn.classList.add('hover:bg-accent');
                    }
                });
                currentModuleIndex = index;
                window.scrollTo(0, 0); // Scroll to top on module change
                updateNavButtons();
            };

            const updateNavButtons = () => {
                const prevBtn = document.querySelector('[data-direction="prev"]');
                const nextBtn = document.querySelector('[data-direction="next"]');
                const progressText = document.querySelector('.module-progress-text');

                if (prevBtn) prevBtn.disabled = currentModuleIndex === 0;
                if (nextBtn) nextBtn.disabled = currentModuleIndex === modules.length - 1;
                if (progressText) progressText.textContent = 'Módulo ' + (currentModuleIndex + 1) + ' de ' + modules.length;
            };

            navButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const direction = e.currentTarget.dataset.direction;
                    let newIndex = currentModuleIndex;
                    if (direction === 'next') {
                        newIndex = Math.min(modules.length - 1, currentModuleIndex + 1);
                    } else if (direction === 'prev') {
                        newIndex = Math.max(0, currentModuleIndex - 1);
                    }
                    showModule(newIndex);
                });
            });

            floatingNavButtons.forEach((button, index) => {
                button.addEventListener('click', () => {
                    showModule(index);
                    if (floatingNavMenu) floatingNavMenu.classList.add('hidden');
                });
            });
            
            if (floatingNavToggle && floatingNavMenu) {
                floatingNavToggle.addEventListener('click', () => {
                    floatingNavMenu.classList.toggle('hidden');
                });
            }

            document.querySelectorAll('.quiz-card').forEach(card => {
                const retryBtn = card.querySelector('.retry-btn');
                const radioButtons = card.querySelectorAll('input[type="radio"]');
                const options = card.querySelectorAll('.quiz-option');
                const handleAnswer = (e) => {
                    const selectedOptionEl = e.currentTarget.closest('.quiz-option');
                    if (!selectedOptionEl) return;
                    radioButtons.forEach(rb => { rb.disabled = true; });
                    const isSelectedCorrect = selectedOptionEl.dataset.correct === 'true';
                    
                    options.forEach(opt => {
                        const checkIcon = opt.querySelector('.lucide-check-circle');
                        const xIcon = opt.querySelector('.lucide-x-circle');
                        const isCorrect = opt.dataset.correct === 'true';

                        if(isCorrect) {
                            opt.classList.add('bg-primary/10', 'border-primary/50');
                            if(checkIcon) checkIcon.style.display = 'inline-block';
                        }
                        
                        if (opt === selectedOptionEl && !isCorrect) {
                           opt.classList.add('bg-destructive/10', 'border-destructive/50');
                           if(xIcon) xIcon.style.display = 'inline-block';
                        }
                    });

                    if (retryBtn) retryBtn.style.display = 'inline-flex';
                };
                radioButtons.forEach(radio => { radio.addEventListener('change', handleAnswer); });
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => {
                        radioButtons.forEach(rb => { rb.disabled = false; rb.checked = false; });
                        options.forEach(opt => {
                           opt.classList.remove('bg-primary/10', 'border-primary/50', 'bg-destructive/10', 'border-destructive/50');
                           const checkIcon = opt.querySelector('.lucide-check-circle');
                           const xIcon = opt.querySelector('.lucide-x-circle');
                           if(checkIcon) checkIcon.style.display = 'none';
                           if(xIcon) xIcon.style.display = 'none';
                        });
                        retryBtn.style.display = 'none';
                    });
                }
            });

            const toolbar = document.querySelector('.accessibility-toolbar');
            if (toolbar) {
                const printBtn = toolbar.querySelector('[data-action="print"]');
                const zoomInBtn = toolbar.querySelector('[data-action="zoom-in"]');
                const zoomOutBtn = toolbar.querySelector('[data-action="zoom-out"]');
                const contrastBtn = toolbar.querySelector('[data-action="contrast"]');
                
                if (printBtn) {
                    printBtn.addEventListener('click', () => {
                        window.print();
                    });
                }

                if (contrastBtn) contrastBtn.addEventListener('click', () => document.body.classList.toggle('high-contrast'));
                const handleFontSize = (increase) => {
                    const body = document.body;
                    const currentSize = parseFloat(window.getComputedStyle(body).fontSize);
                    const newSize = increase ? currentSize + 1 : currentSize - 1;
                    if (newSize >= 12 && newSize <= 24) { body.style.fontSize = newSize + 'px'; }
                };
                if (zoomInBtn) zoomInBtn.addEventListener('click', () => handleFontSize(true));
                if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => handleFontSize(false));
            }
            
            showModule(0);
        });
    `;
};

const renderBlockToHtml = (block: Block): string => {
    const sanitizedText = (text: string | undefined) => text ? DOMPurify.sanitize(text) : '';
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
                    if (urlObj.hostname === 'youtu.be') videoId = urlObj.pathname.substring(1);
                    if (videoId) videoEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&controls=${showControls ? 1 : 0}`;
                } catch(e) {}
            } else if (videoType === 'cloudflare' && cloudflareVideoId) {
                videoEmbedUrl = `https://customer-mhnunnb897evy1sb.cloudflarestream.com/${cloudflareVideoId}/iframe?autoplay=${autoplay}&controls=${showControls}`;
            }

            const videoLink = (videoType === 'youtube' && videoUrl) ? videoUrl : '';
            
            return `
                <div class="video-container-export">
                    <div class="video-player-export">
                        ${!videoEmbedUrl ? `<p class="text-destructive">Vídeo inválido ou não configurado.</p>` : `<iframe class="w-full aspect-video rounded-md" src="${videoEmbedUrl}" title="${videoTitle || 'Vídeo'}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>`}
                    </div>
                    <div class="video-print-placeholder-export">
                        <div class="p-4 bg-muted/50 rounded-lg border border-dashed flex items-center gap-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-muted-foreground flex-shrink-0"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
                            <div>
                                <div class="font-semibold">Este conteúdo é um vídeo interativo.</div>
                                <div class="text-sm text-muted-foreground">${videoTitle || 'Vídeo'}</div>
                                ${videoLink ? `<div class="text-sm">Link: <a href="${videoLink}" target="_blank" rel="noopener noreferrer" class="text-primary underline">${videoLink}</a></div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>`;
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
                    <div class="p-6 pt-0"><div class="grid gap-2">${optionsHtml}</div></div>
                    <div class="p-6 pt-0"><button class="retry-btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2" style="display:none;">Tentar Novamente</button></div>
                </div>`;
        default:
            return `<!-- Bloco do tipo ${block.type} não suportado para exportação -->`;
    }
};

const renderProjectsToHtml = (projects: Project[]): string => {
    return projects.map((project, index) => `
        <section class="module-section" data-module-id="${project.id}">
            <div class="module-content-wrapper">
                <header class="text-center mb-12">
                    <h2 class="text-3xl font-bold mb-2 pb-2">${project.title}</h2>
                    <p class="text-muted-foreground">${project.description}</p>
                </header>
                <div class="space-y-8 flex-grow">
                    ${project.blocks.map(block => `<div data-block-id="${block.id}">${renderBlockToHtml(block)}</div>`).join('')}
                </div>
            </div>
            <footer class="mt-16 flex justify-between items-center no-print">
                <button data-direction="prev" class="module-nav-btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Módulo Anterior
                </button>
                <span class="module-progress-text text-sm text-muted-foreground">Módulo ${index + 1} de ${projects.length}</span>
                <button data-direction="next" class="module-nav-btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    Próximo Módulo
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
            </footer>
        </section>
    `).join('');
};

const getGlobalCss = (theme: Theme) => `
      :root { --background: 240 5% 96%; --foreground: 222.2 84% 4.9%; --card: 0 0% 100%; --card-foreground: 222.2 84% 4.9%; --popover: 0 0% 100%; --popover-foreground: 0 0% 3.9%; --primary: ${theme.colorPrimary}; --primary-foreground: 0 0% 98%; --secondary: 210 40% 98%; --secondary-foreground: 222.2 47.4% 11.2%; --muted: 210 40% 96.1%; --muted-foreground: 215 20.2% 65.1%; --accent: 210 40% 96.1%; --accent-foreground: 222.2 47.4% 11.2%; --destructive: 0 84.2% 60.2%; --destructive-foreground: 0 0% 98%; --border: 214 31.8% 91.4%; --input: 214 31.8% 91.4%; --ring: ${theme.colorPrimary}; --radius: 0.75rem; }
      .dark { --background: 222.2 84% 4.9%; --foreground: 210 40% 98%; --card: 222.2 84% 4.9%; --card-foreground: 210 40% 98%; --popover: 222.2 84% 4.9%; --popover-foreground: 210 40% 98%; --primary: 217 91% 65%; --primary-foreground: 222.2 47.4% 11.2%; --secondary: 217.2 32.6% 17.5%; --secondary-foreground: 210 40% 98%; --muted: 217.2 32.6% 17.5%; --muted-foreground: 215 20.2% 65.1%; --accent: 217.2 32.6% 17.5%; --accent-foreground: 210 40% 98%; --destructive: 0 62.8% 30.6%; --destructive-foreground: 210 40% 98%; --border: 217.2 32.6% 17.5%; --input: 217.2 32.6% 17.5%; --ring: 217.2 32.6% 17.5%; }
      body.high-contrast { background-color: black !important; color: white !important; }
      body.high-contrast .bg-card, body.high-contrast .quiz-card, body.high-contrast .bg-primary { background-color: black !important; border: 1px solid white; color: white; }
      body.high-contrast .text-primary-foreground { color: white; }
      body.high-contrast .text-primary { color: yellow; }
      body.high-contrast .text-muted-foreground { color: lightgray; }
      body.high-contrast .border-primary { border-color: yellow; }
      
      main.main-content {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          width: 100%;
          padding: 3rem;
      }

      .module-section {
          display: none;
          flex-direction: column;
          width: 100%;
      }
      
      #handbook-root {
         width: 100%;
         max-width: 56rem;
      }

      .video-print-placeholder-export { display: none; }

      @media print {
          @page { 
            size: A4; 
            margin: 0; 
          }
          html, body {
            width: 100%;
            height: auto;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print, .no-print * { display: none !important; }
          main.main-content {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #handbook-root {
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .module-section {
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            width: 210mm;
            min-height: 297mm; /* A4 height */
            height: 100vh; /* Fallback */
            padding: 2cm;
            box-sizing: border-box;
            page-break-after: always;
            overflow: hidden;
          }
           .module-content-wrapper {
             width: 100%;
             max-width: 100%;
           }
          .module-section:last-of-type { 
            page-break-after: auto; 
          }
          .video-player-export { display: none !important; }
          .video-print-placeholder-export { display: block !important; }
          
          h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
          figure, .quiz-card, blockquote, .prose { page-break-inside: avoid; }
      }
`;

const getFloatingNavHtml = (projects: Project[]) => `
    <div id="floating-nav-container" class="fixed bottom-5 right-5 z-50 no-print">
        <div id="floating-nav-menu" class="hidden absolute bottom-16 right-0 bg-card border rounded-lg shadow-lg p-2 space-y-1 w-64">
             <p class="font-semibold text-sm px-2 py-1">Módulos</p>
            ${projects.map((p, i) => `<button class="floating-nav-btn w-full text-left p-2 text-sm hover:bg-accent rounded-md">${i+1}. ${p.title}</button>`).join('')}
        </div>
        <button id="floating-nav-toggle" class="bg-primary text-primary-foreground rounded-full h-14 w-14 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
    </div>
`;

interface ExportParams {
    projects: Project[];
    handbookTitle: string;
    handbookDescription: string;
    handbookId: string;
    handbookUpdatedAt: string;
    handbookTheme: Theme;
    setIsExporting: (isExporting: boolean) => void;
    toast: (options: { variant?: 'default' | 'destructive', title: string, description?: string }) => void;
}

export const handleExportZip = async ({
    projects, handbookTitle, handbookDescription, handbookId, handbookUpdatedAt, handbookTheme, setIsExporting, toast
}: ExportParams) => {
    if (!projects || projects.length === 0) {
        toast({ variant: 'destructive', title: 'Nenhum módulo para exportar.' });
        return;
    }
    setIsExporting(true);
    
    try {
        const zip = new JSZip();
        const cleanTitle = (handbookTitle || 'apostila').toLowerCase().replace(/\s+/g, '-');
        const handbookData: HandbookData = { id: handbookId, title: handbookTitle, description: handbookDescription, updatedAt: handbookUpdatedAt, theme: handbookTheme, projects };
        
        const sanitizedProjects = handbookData.projects.map(p => ({
            ...p,
            blocks: p.blocks.map(b => {
                if (b.type === 'text' && b.content.text) {
                    return { ...b, content: { ...b.content, text: DOMPurify.sanitize(b.content.text) } };
                }
                return b;
            })
        }));
        
        const interactiveContentHtml = renderProjectsToHtml(sanitizedProjects);
        const floatingNavHtml = getFloatingNavHtml(sanitizedProjects);
        
        const finalHtml = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${handbookTitle}</title>
                <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
                <style>${getGlobalCss(handbookTheme)}</style>
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
                              primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' }, 
                              secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' }, 
                              destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' }, 
                              muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' }, 
                              accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' }, 
                              popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' }, 
                              card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' } 
                          },
                          borderRadius: {
                            lg: 'var(--radius)',
                            md: 'calc(var(--radius) - 2px)',
                            sm: 'calc(var(--radius) - 4px)',
                          },
                           typography: ({ theme }) => ({
                            DEFAULT: {
                              css: {
                                '--tw-prose-body': 'hsl(var(--foreground))',
                                '--tw-prose-headings': 'hsl(var(--foreground))',
                                '--tw-prose-lead': 'hsl(var(--foreground))',
                                '--tw-prose-links': 'hsl(var(--primary))',
                                '--tw-prose-bold': 'hsl(var(--foreground))',
                                '--tw-prose-counters': 'hsl(var(--muted-foreground))',
                                '--tw-prose-bullets': 'hsl(var(--muted-foreground))',
                                '--tw-prose-hr': 'hsl(var(--border))',
                                '--tw-prose-quotes': 'hsl(var(--foreground))',
                                '--tw-prose-quote-borders': 'hsl(var(--primary))',
                                '--tw-prose-captions': 'hsl(var(--muted-foreground))',
                                '--tw-prose-code': 'hsl(var(--foreground))',
                                '--tw-prose-pre-code': 'hsl(var(--foreground))',
                                '--tw-prose-pre-bg': 'hsl(var(--muted))',
                                '--tw-prose-th-borders': 'hsl(var(--border))',
                                '--tw-prose-td-borders': 'hsl(var(--border))',
                                '--tw-prose-invert-body': 'hsl(var(--foreground))',
                                '--tw-prose-invert-headings': 'hsl(var(--foreground))',
                                '--tw-prose-invert-lead': 'hsl(var(--background))',
                                '--tw-prose-invert-links': 'hsl(var(--primary))',
                                '--tw-prose-invert-bold': 'hsl(var(--background))',
                                '--tw-prose-invert-counters': 'hsl(var(--muted-foreground))',
                                '--tw-prose-invert-bullets': 'hsl(var(--muted-foreground))',
                                '--tw-prose-invert-hr': 'hsl(var(--border))',
                                '--tw-prose-invert-quotes': 'hsl(var(--background))',
                                '--tw-prose-invert-quote-borders': 'hsl(var(--border))',
                                '--tw-prose-invert-captions': 'hsl(var(--muted-foreground))',
                                '--tw-prose-invert-code': 'hsl(var(--background))',
                                '--tw-prose-invert-pre-code': 'hsl(var(--background))',
                                '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
                                '--tw-prose-invert-th-borders': 'hsl(var(--border))',
                                '--tw-prose-invert-td-borders': 'hsl(var(--border))',
                              },
                            },
                          }),
                        } 
                      }
                    }
                </script>
                <script id="handbook-data" type="application/json">${JSON.stringify(handbookData)}</script>
            </head>
            <body class="bg-secondary/40 text-foreground font-sans antialiased">
                <header class="py-4 px-6 bg-primary text-primary-foreground no-print">
                    <div class="max-w-4xl mx-auto flex flex-row justify-between items-center">
                        <h1 class="text-xl font-bold">${handbookTitle}</h1>
                        <div class="flex items-center gap-1 bg-primary p-1 rounded-lg border border-primary-foreground/20 accessibility-toolbar">
                            <button data-action="print" class="p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-md" title="Imprimir/Salvar PDF"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"></path><rect x="6" y="14" width="12" height="8" rx="1"></rect></svg></button>
                            <div class="flex items-center border-l border-r border-primary-foreground/20 mx-1 px-1">
                                <button data-action="zoom-out" class="p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-md" title="Diminuir Fonte"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg></button>
                                <button data-action="zoom-in" class="p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-md" title="Aumentar Fonte"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg></button>
                            </div>
                            <button data-action="contrast" class="p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-md" title="Alto Contraste"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 18a6 6 0 0 0 0-12v12z"></path></svg></button>
                        </div>
                    </div>
                </header>
                 <main class="main-content">
                    <div id="handbook-root" class="bg-card rounded-xl shadow-lg p-8 sm:p-12 md:p-16">
                        ${interactiveContentHtml}
                    </div>
                </main>
                ${floatingNavHtml}
                <script>${getInteractiveScript(handbookTheme)}</script>
            </body>
            </html>`;

        zip.file('index.html', finalHtml);
        const blob = await zip.generateAsync({ type: 'blob' });
        saveAs(blob, `apostila-${cleanTitle}.zip`);

        toast({ title: 'Exportação Concluída' });
    } catch (error) {
        console.error('Falha ao exportar o projeto', error);
        toast({ variant: 'destructive', title: 'Erro na Exportação', description: `Não foi possível exportar o projeto. Detalhes: ${error instanceof Error ? error.message : 'Erro desconhecido.'}` });
    } finally {
        setIsExporting(false);
    }
};

    