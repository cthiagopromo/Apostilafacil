
'use client';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Project, Block } from './types';
import { renderToString } from 'react-dom/server';
import BlockRenderer from '@/components/BlockRenderer';

function renderBlockToHtml(block: Block): string {
    // We can't use the real components directly for the interactive parts in a static export,
    // so we build the interactive logic in getScriptContent() and provide the base HTML structure here.
    
    if (block.type === 'quiz') {
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
    }

    // For other components, we can render them to a string.
    // This is a bit of a hack as it brings in server-side rendering logic to the client,
    // but it's the most effective way to ensure visual consistency without maintaining two render paths.
    // Note: This won't work for components that rely heavily on client-side hooks without hydration.
    // Our BlockRenderer is mostly presentational, so it works well here.
    return renderToString(<BlockRenderer block={block} />);
}


function generateModulesHtml(projects: Project[]): string {
    return projects.map((project) => `
         <section class="mb-16 last:mb-0">
              <header class='text-center mb-12'>
                <h2 class="text-3xl font-bold mb-2 pb-2">${project.title}</h2>
                <p class="text-muted-foreground">${project.description}</p>
              </header>
              <div class="space-y-8">
                ${project.blocks.map(renderBlockToHtml).join('\n')}
              </div>
        </section>
    `).join('');
}


function generateHeaderNavHtml(handbookTitle: string): string {
    return `
      <div class="max-w-4xl mx-auto flex flex-row justify-between items-center">
        <h1 class="text-2xl font-bold text-foreground">${handbookTitle}</h1>
        <div id="accessibility-toolbar" class="flex items-center gap-1 bg-card p-1 rounded-lg border">
            <button id="export-pdf" title="Exportar para PDF" class="toolbar-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </button>
            <button id="libras" title="Libras (Em desenvolvimento)" class="toolbar-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M14 10s.5-1 2-1 2 1 2 1v4s-.5 1-2 1-2-1-2-1V5s0-1 1.5-1 1.5 1 1.5 1"></path><path d="M4 10s.5-1 2-1 2 1 2 1v4s-.5 1-2 1-2-1-2-1V5s0-1 1.5-1 1.5 1 1.5 1"></path></svg>
            </button>
            <div class="flex items-center border-l border-r mx-1 px-1">
                <button id="font-decrease" title="Diminuir Fonte" class="toolbar-btn">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                </button>
                <button id="font-increase" title="Aumentar Fonte" class="toolbar-btn">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                </button>
            </div>
            <button id="contrast" title="Alto Contraste" class="toolbar-btn">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><circle cx="12" cy="12" r="10"></circle><path d="M12 18a6 6 0 0 0 0-12v12z"></path></svg>
            </button>
            <button id="acessibilidade" title="Acessibilidade (Em desenvolvimento)" class="toolbar-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="m11.23 13.08.05-.05a4.2 4.2 0 0 1-1.18-5.06l-1.42-1.42a6.25 6.25 0 0 0-5.43 8.95l1.42-1.42a4.2 4.2 0 0 1 5.06-1.18Zm1.9-1.9.05-.05a4.2 4.2 0 0 0 1.18 5.06l1.42 1.42a6.25 6.25 0 0 1 5.43-8.95l-1.42 1.42a4.2 4.2 0 0 0-5.06 1.18Z"></path><path d="M16 22a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"></path><path d="m15.5 15.5-3-3"></path><path d="M22 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="m3.5 15.5 7-7"></path><path d="M8 2a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"></path></svg>
            </button>
        </div>
    </div>
    `;
}

function generateCssContent(): string {
    return `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
        
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
        }

        body {
            background-color: hsl(var(--secondary) / 0.4);
            color: hsl(var(--foreground));
            font-family: 'Inter', sans-serif;
            transition: font-size 0.2s, background-color 0.3s, color 0.3s;
            margin: 0;
            padding: 0;
            min-height: 100vh;
        }

        header.no-print {
            padding: 1rem 0;
        }
        
        main {
            max-width: 56rem; /* 896px */
            margin: 0 auto;
            padding: 2rem 3rem 4rem; /* p-8 sm:p-12 md:p-16 */
            background-color: hsl(var(--card));
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
        }

        .header-content {
            text-align: center;
            margin-bottom: 3rem;
        }
        
        section { margin-bottom: 4rem; }
        section:last-child { margin-bottom: 0; }
        section > header { text-align: center; margin-bottom: 3rem; }
        h2 { font-size: 1.875rem; font-weight: 700; margin-bottom: 0.5rem; padding-bottom: 0.5rem; }
        .text-muted-foreground { color: hsl(var(--muted-foreground)); }
        .space-y-8 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem; }
        
        .prose { max-width: none; }
        .dark .prose-invert { color: hsl(var(--foreground)); }

        .flex { display: flex; }
        .flex-row { flex-direction: row; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .gap-1 { gap: 0.25rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .max-w-4xl { max-width: 56rem; }
        h1.font-bold { font-weight: 700; }
        h1.text-2xl { font-size: 1.5rem; }
        

        figure { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        img.rounded-md { border-radius: 0.375rem; max-width: 100%; height: auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1); }
        figcaption { font-size: 0.875rem; text-align: center; color: hsl(var(--muted-foreground)); font-style: italic; margin-top: 0.5rem; }
        
        .relative { position: relative; }
        .bg-muted\\/50 { background-color: hsla(var(--muted) / 0.5); }
        .border-l-4 { border-left: 4px solid hsl(var(--primary)); }
        .rounded-r-lg { border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem; }
        blockquote { margin: 0; padding: 1.5rem; font-style: italic; color: hsla(var(--foreground) / 0.8); border: none; }
        .text-primary\\/20 { color: hsla(var(--primary) / 0.2); }
        .absolute { position: absolute; }
        .-top-3 { top: -0.75rem; }
        .-left-4 { left: -1rem; }

        .w-full.aspect-video { width: 100%; aspect-ratio: 16 / 9; }
        iframe.rounded-md { border-radius: 0.375rem; border: none; }

        .btn-primary { display: inline-block; background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 500; text-decoration: none; text-align: center; }
        .btn-outline { display: inline-block; background-color: transparent; border: 1px solid hsl(var(--border)); color: hsl(var(--foreground)); padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; text-decoration: none; text-align: center; }
        
        /* Toolbar */
        #accessibility-toolbar { background-color: hsl(var(--card)); border: 1px solid hsl(var(--border)); border-radius: 0.5rem; padding: 0.25rem; }
        .toolbar-btn { background: transparent; border: none; cursor: pointer; padding: 0.5rem; border-radius: 0.375rem; }
        .toolbar-btn:hover { background-color: hsl(var(--accent)); }
        .toolbar-btn svg { height: 1.25rem; width: 1.25rem; stroke: hsl(var(--foreground)); }
        .border-l { border-left: 1px solid hsl(var(--border)); }
        .border-r { border-right: 1px solid hsl(var(--border)); }
        .mx-1 { margin-left: 0.25rem; margin-right: 0.25rem; }
        .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }

        /* Quiz Styles */
        .block-quiz-card { background-color: hsl(var(--muted) / 0.3); border-radius: 0.75rem; overflow: hidden; }
        .quiz-header { padding: 1rem 1.5rem; }
        .quiz-question { font-weight: 700; color: hsl(var(--card-foreground)); }
        .quiz-description { font-size: 0.875rem; color: hsl(var(--muted-foreground)); }
        .quiz-options-container { padding: 0 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .quiz-option { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 0.375rem; border: 1px solid transparent; cursor: pointer; transition: background-color 0.2s, border-color 0.2s; }
        .quiz-option:hover { background-color: hsl(var(--muted) / 0.6); }
        .quiz-option .radio-button-wrapper { width: 1rem; height: 1rem; flex-shrink: 0; border-radius: 9999px; border: 1px solid hsl(var(--primary)); display: flex; align-items: center; justify-content: center; }
        .quiz-option .radio-button { width: 0.5rem; height: 0.5rem; border-radius: 9999px; background-color: transparent; transition: background-color 0.2s; }
        .quiz-option.selected .radio-button { background-color: hsl(var(--primary)); }
        .quiz-option.correct { background-color: hsla(var(--primary) / 0.1); border-color: hsla(var(--primary) / 0.5); }
        .quiz-option.incorrect { background-color: hsla(var(--destructive) / 0.1); border-color: hsla(var(--destructive) / 0.5); }
        .quiz-footer { padding: 0 1.5rem 1rem; }
        .quiz-feedback { margin-bottom: 0.5rem; font-weight: 500; min-height: 1.5rem; }
        .quiz-feedback.correct { color: hsl(var(--primary)); }
        .quiz-feedback.incorrect { color: hsl(var(--destructive)); }

        body.high-contrast { background-color: black; color: white; }
        body.high-contrast main, body.high-contrast header.no-print #accessibility-toolbar { background-color: black; border-color: white; }
        body.high-contrast .text-primary, body.high-contrast h1, body.high-contrast h2 { color: yellow !important; }
        body.high-contrast .text-muted-foreground { color: lightgray !important; }
        body.high-contrast .border-primary { border-color: yellow !important; }
        body.high-contrast .toolbar-btn svg { stroke: white; }

        @media print {
          .no-print, .no-print * { display: none !important; }
          body, main { background: white !important; color: black !important; font-size: 11pt; width: 100%; margin: 0; padding: 0; box-shadow: none; border: none; }
          main { max-width: 100% !important; }
          @page { size: A4; margin: 2cm; }
        }
    `;
}

function getScriptContent(): string {
    // This script is identical to the one in `AccessibilityToolbar.tsx`
    // but without the React/JSX parts.
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
                    
                    answered = true;
                    option.classList.add('selected');
                    const isCorrect = option.getAttribute('data-correct') === 'true';

                    options.forEach(opt => {
                       if (opt.getAttribute('data-correct') === 'true') {
                           opt.classList.add('correct');
                       }
                    });

                    if (!isCorrect) {
                        option.classList.add('incorrect');
                    }
                    
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
        <style>
            ${cssContent}
        </style>
    </head>
    <body>
        <header class="no-print">
            ${generateHeaderNavHtml(handbookTitle)}
        </header>
        <main id="printable-content">
            <div class="bg-card rounded-xl shadow-lg p-8 sm:p-12 md:p-16">
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

    