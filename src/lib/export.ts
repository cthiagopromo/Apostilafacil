
'use client';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Project, Block } from './types';
import DOMPurify from 'dompurify';

function sanitizeHtml(html: string): string {
    if (typeof window !== 'undefined') {
        return DOMPurify.sanitize(html, { 
            ADD_TAGS: ["iframe"], 
            ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'title', 'style', 'class'] 
        });
    }
    return html;
}

function getYoutubeEmbedUrl(url: string, autoplay = false, controls = true): string | null {
    if (!url) return null;
    let videoId = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.substring(1);
        } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
            videoId = urlObj.searchParams.get('v');
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&controls=${controls ? 1 : 0}` : null;
    } catch (e) {
        console.error("URL do YouTube inválida:", e);
        return null;
    }
}

function getCloudflareEmbedUrl(videoId: string, autoplay = false, controls = true): string | null {
    return videoId ? `https://customer-mhnunnb897evy1sb.cloudflarestream.com/${videoId}/iframe?autoplay=${autoplay ? 1 : 0}&controls=${controls ? 1 : 0}` : null;
}


function renderBlockToHtml(block: Block): string {
    switch (block.type) {
        case 'text':
            return `<div class="prose">${sanitizeHtml(block.content.text || '')}</div>`;
        case 'image':
            const width = block.content.width ?? 100;
            return `
                <div class="block-image" style="display: flex; justify-content: center;">
                    <figure style="width: ${width}%;">
                        <img src="${block.content.url || ''}" alt="${block.content.alt || ''}" class="rounded-md shadow-md" />
                        ${block.content.caption ? `<figcaption class="text-sm text-center text-muted-foreground italic mt-2">${block.content.caption}</figcaption>` : ''}
                    </figure>
                </div>
            `;
        case 'quote':
             return `
                 <div class="relative p-6 bg-muted/50 border-l-4 border-primary rounded-r-lg">
                    <svg class="absolute -top-3 -left-4 h-10 w-10 text-primary/20" fill="currentColor" viewBox="0 0 20 20"><path d="M13 8V0H0v12h5v8h8V8h-5zM5 2h6v4H5V2zm5 14H7v-4h3v4z"></path></svg>
                    <blockquote class="text-lg italic text-foreground/80 m-0 p-0 border-none">
                        ${block.content.text}
                    </blockquote>
                 </div>
            `;
        case 'video': {
            let embedUrl = null;
            const autoplay = block.content.autoplay ?? false;
            const controls = block.content.showControls ?? true;

            if (block.content.videoType === 'youtube' && block.content.videoUrl) {
                embedUrl = getYoutubeEmbedUrl(block.content.videoUrl, autoplay, controls);
            } else if (block.content.videoType === 'cloudflare' && block.content.cloudflareVideoId) {
                embedUrl = getCloudflareEmbedUrl(block.content.cloudflareVideoId, autoplay, controls);
            }
            
            if (!embedUrl) {
                return '<p class="text-muted-foreground">Vídeo não configurado.</p>';
            }

            return `
                <div class="block-video">
                    <iframe 
                        class="w-full aspect-video rounded-md"
                        src="${embedUrl}" 
                        title="${block.content.videoTitle || 'Player de vídeo'}" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>`;
        }
        case 'button':
             return `
                <div class="flex justify-center">
                    <a href="${block.content.buttonUrl || '#'}" class="btn-primary" target="_blank" rel="noopener noreferrer">
                        ${block.content.buttonText || 'Botão'}
                    </a>
                </div>
            `;
        case 'quiz':
            const quizOptionsHtml = block.content.options?.map(opt => `
                <div class="quiz-option" data-correct="${opt.isCorrect}">
                     <div class="radio-button-wrapper">
                        <div class="radio-button"></div>
                    </div>
                    <label>${opt.text}</label>
                </div>
            `).join('') || '';

             return `
                <div class="block-quiz-card">
                    <div class="quiz-header">
                        <h3 class="quiz-question">${block.content.question || ''}</h3>
                        <p class="quiz-description">Selecione a resposta correta.</p>
                    </div>
                    <div class="quiz-options-container">${quizOptionsHtml}</div>
                    <div class="quiz-footer">
                        <div class="quiz-feedback"></div>
                        <button class="btn-outline quiz-retry-btn" style="display: none;">Tentar Novamente</button>
                    </div>
                </div>`;
        default:
            return '';
    }
}

function generateModulesHtml(projects: Project[]): string {
    return projects.map((project) => `
        <section class="mb-16">
            <h2 class="text-3xl font-bold mb-2 border-b-2 border-primary pb-2">${project.title}</h2>
            <p class="text-muted-foreground mb-8">${project.description}</p>
            <div class="space-y-8">
                ${project.blocks.map(renderBlockToHtml).join('\n')}
            </div>
        </section>
    `).join('');
}


function generateHeaderNavHtml(handbookTitle: string): string {
    return `
      <div class="max-w-5xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-3">
            <h1 class="text-xl font-bold text-white">${handbookTitle}</h1>
        </div>
        <div id="accessibility-toolbar" class="flex items-center gap-1 bg-card p-1 rounded-lg border">
            <button id="export-pdf" title="Exportar para PDF" class="toolbar-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg></button>
            <button id="libras" title="Libras (Em desenvolvimento)" class="toolbar-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M14 10s.5-1 2-1 2 1 2 1v4s-.5 1-2 1-2-1-2-1V5s0-1 1.5-1 1.5 1 1.5 1"></path><path d="M4 10s.5-1 2-1 2 1 2 1v4s-.5 1-2 1-2-1-2-1V5s0-1 1.5-1 1.5 1 1.5 1"></path></svg></button>
            <div class="flex items-center border-l border-r mx-1 px-1">
                 <button id="font-decrease" title="Diminuir Fonte" class="toolbar-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                 <button id="font-increase" title="Aumentar Fonte" class="toolbar-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
            </div>
            <button id="contrast" title="Alto Contraste" class="toolbar-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><circle cx="12" cy="12" r="10"></circle><path d="M12 18a6 6 0 0 0 0-12v12z"></path></svg></button>
            <button id="acessibilidade" title="Acessibilidade (Em desenvolvimento)" class="toolbar-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="m11.23 13.08.05-.05a4.2 4.2 0 0 1-1.18-5.06l-1.42-1.42a6.25 6.25 0 0 0-5.43 8.95l1.42-1.42a4.2 4.2 0 0 1 5.06-1.18Zm1.9-1.9.05-.05a4.2 4.2 0 0 0 1.18 5.06l1.42 1.42a6.25 6.25 0 0 1 5.43-8.95l-1.42 1.42a4.2 4.2 0 0 0-5.06 1.18Z"></path><path d="M16 22a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"></path><path d="m15.5 15.5-3-3"></path><path d="M22 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="m3.5 15.5 7-7"></path><path d="M8 2a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"></path></svg></button>
        </div>
    </div>
    `;
}

function generateCssContent(): string {
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

        body {
            background-color: hsl(var(--secondary));
            font-family: Inter, sans-serif;
            transition: font-size 0.2s, background-color 0.3s, color 0.3s;
        }
        
        .bg-card { background-color: hsl(var(--card)); }
        .text-primary { color: hsl(var(--primary)); }
        .text-muted-foreground { color: hsl(var(--muted-foreground)); }
        .border-primary { border-color: hsl(var(--primary)); }

        .font-bold { font-weight: 700; }
        .text-xl { font-size: 1.25rem; }
        .text-3xl { font-size: 1.875rem; }
        .text-5xl { font-size: 3rem; }
        .text-center { text-align: center; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mb-12 { margin-bottom: 3rem; }
        .mb-16 { margin-bottom: 4rem; }
        .mt-2 { margin-top: 0.5rem; }
        .pb-2 { padding-bottom: 0.5rem; }
        .p-4 { padding: 1rem; }
        .p-8 { padding: 2rem; }
        .p-12 { padding: 3rem; }
        .p-16 { padding: 4rem; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-2xl { border-radius: 1rem; }
        .rounded-md { border-radius: 0.375rem; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1); }
        .shadow-md { box-shadow: 0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1); }

        .mx-auto { margin-left: auto; margin-right: auto; }
        .max-w-4xl { max-width: 56rem; }
        .max-w-5xl { max-width: 64rem; }
        .inline-block { display: inline-block; }
        .space-y-8 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem; }

        .bg-primary\\/10 { background-color: rgba(37, 99, 235, 0.1); }
        .bg-muted\\/50 { background-color: hsla(var(--muted) / 0.5); }
        .text-primary\\/20 { color: hsla(var(--primary) / 0.2); }
        .text-foreground\\/80 { color: hsla(var(--foreground) / 0.8); }

        .border-b-2 { border-bottom-width: 2px; }
        .border-l-4 { border-left-width: 4px; }
        .sticky { position: sticky; }
        .top-0 { top: 0; }
        .z-10 { z-index: 10; }

        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .gap-3 { gap: 0.75rem; }
        .gap-1 { gap: 0.25rem; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .-top-3 { top: -0.75rem; }
        .-left-4 { left: -1rem; }
        .h-10 { height: 2.5rem; }
        .w-10 { width: 2.5rem; }

        .prose { max-width: none; }
        .prose h1, .prose h2, .prose h3 { font-weight: bold; }

        .toolbar-btn { background: transparent; border: none; cursor: pointer; padding: 0.5rem; border-radius: 0.375rem; color: hsl(var(--primary-foreground)); }
        .toolbar-btn:hover { background-color: rgba(255,255,255,0.1); }
        .toolbar-btn svg { height: 1.25rem; width: 1.25rem; }

        .header { background-color: hsl(var(--primary)); }
        
        .btn-primary { display: inline-block; background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 500; text-decoration: none; text-align: center; }
        .btn-outline { display: inline-block; background-color: transparent; border: 1px solid hsl(var(--border)); color: hsl(var(--foreground)); padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; text-decoration: none; text-align: center; }
        
        /* Quiz Styles */
        .block-quiz-card { background-color: hsl(var(--muted) / 0.3); border-radius: 0.75rem; overflow: hidden; }
        .quiz-header { padding: 1rem 1.5rem; }
        .quiz-question { font-weight: 700; color: hsl(var(--card-foreground)); }
        .quiz-description { font-size: 0.875rem; color: hsl(var(--muted-foreground)); }
        .quiz-options-container { padding: 0 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .quiz-option { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 0.375rem; border: 1px solid transparent; cursor: pointer; transition: background-color 0.2s; }
        .quiz-option:hover { background-color: hsl(var(--muted) / 0.6); }
        .quiz-option .radio-button-wrapper { width: 1rem; height: 1rem; border-radius: 9999px; border: 1px solid hsl(var(--primary)); display: flex; align-items: center; justify-content: center; }
        .quiz-option .radio-button { width: 0.5rem; height: 0.5rem; border-radius: 9999px; background-color: transparent; transition: background-color 0.2s; }
        .quiz-option.selected .radio-button { background-color: hsl(var(--primary)); }
        .quiz-option.correct { background-color: hsla(var(--primary) / 0.1); border-color: hsla(var(--primary) / 0.5); }
        .quiz-option.incorrect { background-color: hsla(var(--destructive) / 0.1); border-color: hsla(var(--destructive) / 0.5); }
        .quiz-footer { padding: 1rem 1.5rem; }
        .quiz-feedback { margin-bottom: 0.5rem; font-weight: 500; min-height: 1.5rem; }
        .quiz-feedback.correct { color: hsl(var(--primary)); }
        .quiz-feedback.incorrect { color: hsl(var(--destructive)); }

        body.high-contrast { background-color: black; color: white; }
        body.high-contrast .bg-card { background-color: black; border: 1px solid white; }
        body.high-contrast .text-primary { color: yellow; }
        body.high-contrast .text-muted-foreground { color: lightgray; }
        body.high-contrast .border-primary { border-color: yellow; }
        body.high-contrast .header { background-color: black; border-bottom: 1px solid white; }
        body.high-contrast .toolbar-btn { color: white; }
        body.high-contrast .toolbar-btn svg { stroke: white; }

        @media print {
          .no-print, .no-print * { display: none !important; }
          body, .printable-content { background: white !important; color: black !important; font-size: 11pt; width: 100%; margin: 0; padding: 0; box-shadow: none; }
          main { max-width: 100% !important; padding: 0 !important; }
          .bg-card { box-shadow: none !important; border: none !important; padding: 0 !important; page-break-after: always; }
          @page { size: A4; margin: 2cm; }
        }
    `;
}

function getScriptContent(): string {
    return `
    document.addEventListener('DOMContentLoaded', () => {
        const exportPdfBtn = document.getElementById('export-pdf');
        const fontIncreaseBtn = document.getElementById('font-increase');
        const fontDecreaseBtn = document.getElementById('font-decrease');
        const contrastBtn = document.getElementById('contrast');
        const librasBtn = document.getElementById('libras');
        const acessibilidadeBtn = document.getElementById('acessibilidade');
        
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => window.print());
        }

        if (fontIncreaseBtn && fontDecreaseBtn) {
             const body = document.body;
             const handleFontSize = (increase) => {
                const currentSize = parseFloat(window.getComputedStyle(body).fontSize);
                const newSize = increase ? currentSize + 1 : currentSize - 1;
                if (newSize >= 12 && newSize <= 24) {
                  body.style.fontSize = \`\${newSize}px\`;
                }
             };
             fontIncreaseBtn.addEventListener('click', () => handleFontSize(true));
             fontDecreaseBtn.addEventListener('click', () => handleFontSize(false));
        }

        if (contrastBtn) {
            contrastBtn.addEventListener('click', () => {
                document.body.classList.toggle('high-contrast');
            });
        }
        
        const showAlert = (feature) => alert(feature + ' - Funcionalidade em desenvolvimento.');
        if (librasBtn) {
            librasBtn.addEventListener('click', () => showAlert('Libras'));
        }
        if (acessibilidadeBtn) {
            acessibilidadeBtn.addEventListener('click', () => showAlert('Acessibilidade'));
        }

        document.querySelectorAll('.block-quiz-card').forEach(quizBlock => {
            const options = quizBlock.querySelectorAll('.quiz-option');
            const feedbackEl = quizBlock.querySelector('.quiz-feedback');
            const retryBtn = quizBlock.querySelector('.quiz-retry-btn');
            let answered = false;

            options.forEach(option => {
                option.addEventListener('click', () => {
                    if (answered) return;
                    
                    options.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');

                    answered = true;
                    const isCorrect = option.getAttribute('data-correct') === 'true';

                    option.classList.add(isCorrect ? 'correct' : 'incorrect');
                    
                    if(feedbackEl) {
                       feedbackEl.textContent = isCorrect ? 'Resposta correta!' : 'Resposta incorreta.';
                       feedbackEl.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');
                    }

                    options.forEach(opt => opt.style.cursor = 'default');

                    if (retryBtn) retryBtn.style.display = 'inline-block';
                });
            });

            if(retryBtn) {
                retryBtn.addEventListener('click', () => {
                    answered = false;
                    options.forEach(opt => {
                        opt.classList.remove('correct', 'incorrect', 'selected');
                        opt.style.cursor = 'pointer';
                    });
                    if(feedbackEl) {
                        feedbackEl.textContent = '';
                        feedbackEl.className = 'quiz-feedback';
                    }
                    retryBtn.style.display = 'none';
                });
            }
        });
    });
    `;
}

export function generateHtmlContent(projects: Project[], handbookTitle: string, handbookDescription: string): string {
  const cssContent = generateCssContent();
  const scriptContent = getScriptContent();
  return `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${handbookTitle}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
            ${cssContent}
        </style>
    </head>
    <body class="printable-content">
        <header class="header p-4 shadow-sm sticky top-0 z-10 no-print">
            ${generateHeaderNavHtml(handbookTitle)}
        </header>
        <main class="max-w-4xl mx-auto p-4 sm:p-8 md:p-12">
            <div class="bg-card rounded-xl shadow-lg p-8 sm:p-12 md:p-16">
              <header class="text-center mb-12">
                <div class="inline-block p-4 bg-primary/10 rounded-2xl mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-10 w-10 text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                </div>
                <h1 class="text-5xl font-bold text-primary">${handbookTitle}</h1>
                <p class="text-xl text-muted-foreground mt-2">${handbookDescription}</p>
              </header>
              ${generateModulesHtml(projects)}
            </div>
        </main>
        <script>
            ${scriptContent}
        </script>
    </body>
    </html>
  `;
}

export async function generateZip(projects: Project[], handbookTitle: string, handbookDescription: string) {
    const zip = new JSZip();
    const cleanTitle = (handbookTitle || 'apostila').toLowerCase().replace(/\\s+/g, '-');

    const htmlContent = generateHtmlContent(projects, handbookTitle, handbookDescription);
    zip.file('index.html', htmlContent);
    zip.file('README.md', 'Para usar esta apostila offline, extraia o conteúdo deste ZIP e abra o arquivo index.html em seu navegador.');
    
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${cleanTitle}.zip`);
}
