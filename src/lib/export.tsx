
'use client';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Project } from './types';
import { renderToString } from 'react-dom/server';
import { PrintableHandbook } from '@/components/PrintableHandbook';

function getCssContent(): string {
    return `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
        
        :root {
            --background: 240 5% 96%;
            --foreground: 222.2 84% 4.9%;
            --card: 0 0% 100%;
            --card-foreground: 222.2 84% 4.9%;
            --primary: 221 83% 53%;
            --primary-foreground: 0 0% 98%;
            --secondary: 210 40% 98%;
            --muted: 210 40% 96.1%;
            --muted-foreground: 215 20.2% 65.1%;
            --destructive: 0 84.2% 60.2%;
            --border: 214 31.8% 91.4%;
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

        header.preview-header {
            padding: 1rem 1.5rem;
            background-color: hsl(var(--primary));
            color: hsl(var(--primary-foreground));
        }
        
        main#printable-content {
            max-width: 56rem;
            margin: 0 auto;
            padding: 2rem 1rem;
        }
        
        .bg-card {
            background-color: hsl(var(--card));
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
            padding: 2rem;
        }
        @media (min-width: 640px) { .bg-card { padding: 3rem; } }
        @media (min-width: 768px) { .bg-card { padding: 4rem; } }

        section { margin-bottom: 4rem; page-break-after: always; }
        section:last-child { margin-bottom: 0; page-break-after: auto; }
        header.text-center { text-align: center; margin-bottom: 3rem; page-break-after: avoid; }
        h2.text-3xl { font-size: 1.875rem; font-weight: 700; margin-bottom: 0.5rem; padding-bottom: 0.5rem; }
        p.text-muted-foreground { color: hsl(var(--muted-foreground)); }
        .space-y-8 > * + * { margin-top: 2rem; }
        
        .prose { max-width: none; }
        .prose h1, .prose h2, .prose h3 { font-weight: bold; }
        .prose ul { list-style-type: disc; padding-left: 1.5rem; }
        .prose ol { list-style-type: decimal; padding-left: 1.5rem; }
        
        .flex { display: flex; }
        .flex-row { flex-direction: row; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        
        figure { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        img { border-radius: 0.375rem; max-width: 100%; height: auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,.1); }
        figcaption { font-size: 0.875rem; text-align: center; color: hsl(var(--muted-foreground)); font-style: italic; margin-top: 0.5rem; }
        
        blockquote { margin: 0; padding: 1.5rem; background-color: hsl(var(--muted) / 0.5); border-left: 4px solid hsl(var(--primary)); border-radius: 0 0.5rem 0.5rem 0; font-style: italic; }
        
        iframe { width: 100%; aspect-ratio: 16 / 9; border-radius: 0.375rem; border: none; }

        .btn { display: inline-flex; justify-content: center; align-items: center; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 500; text-decoration: none; font-size: 1rem; }
        .btn-primary { background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }

        .toolbar-btn { background: transparent; border: none; cursor: pointer; padding: 0.5rem; border-radius: 0.375rem; color: hsl(var(--primary-foreground)); }
        .toolbar-btn:hover { background-color: hsla(var(--primary-foreground), 0.1); }
        .toolbar-btn svg { height: 1.25rem; width: 1.25rem; stroke: currentColor; }

        /* Quiz Styles */
        .quiz-card { background-color: hsl(var(--muted) / 0.3); border-radius: 0.75rem; border: 1px solid hsl(var(--border)); page-break-inside: avoid; }
        .quiz-card-header { padding: 1.5rem; }
        .quiz-card-title { font-weight: 700; margin-bottom: 0.25rem; }
        .quiz-card-desc { font-size: 0.875rem; color: hsl(var(--muted-foreground)); }
        .quiz-card-content { padding: 0 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .quiz-option { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 0.375rem; border: 1px solid hsl(var(--border)); cursor: pointer; transition: all 0.2s; }
        .quiz-option:hover { background-color: hsl(var(--muted) / 0.6); }
        .radio-group-item { width: 1rem; height: 1rem; flex-shrink: 0; border-radius: 9999px; border: 1px solid hsl(var(--primary)); display: flex; align-items: center; justify-content: center; }
        .radio-group-indicator { width: 0.5rem; height: 0.5rem; border-radius: 9999px; background-color: transparent; transition: background-color 0.2s; }
        .quiz-option.selected .radio-group-indicator { background-color: hsl(var(--primary)); }
        .quiz-option.correct { background-color: hsla(var(--primary), 0.1); border-color: hsla(var(--primary), 0.5); }
        .quiz-option.incorrect { background-color: hsla(var(--destructive), 0.1); border-color: hsla(var(--destructive), 0.5); }
        .quiz-card-footer { padding: 0 1.5rem 1rem; }
        .quiz-feedback { margin-bottom: 0.5rem; font-weight: 500; min-height: 1.5rem; }
        .quiz-feedback.correct { color: hsl(var(--primary)); }
        .quiz-feedback.incorrect { color: hsl(var(--destructive)); }
        .retry-btn { background-color: transparent; border: 1px solid hsl(var(--border)); color: hsl(var(--foreground)); padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }

        body.high-contrast { background-color: black; color: white; }
        body.high-contrast .preview-header, body.high-contrast .toolbar-btn { background-color: black; color: white; stroke: white; }
        body.high-contrast .bg-card, body.high-contrast .quiz-card { background-color: black; border: 1px solid white; }
        body.high-contrast h2, body.high-contrast h3 { color: yellow; }
        
        #loading-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); display: none; align-items: center; justify-content: center; z-index: 1000; }
        #loading-modal-content { background: hsl(var(--card)); padding: 2rem; border-radius: 0.5rem; text-align: center; color: hsl(var(--card-foreground)); }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 40px; height: 40px; border: 4px solid hsl(var(--secondary)); border-top: 4px solid hsl(var(--primary)); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
        
        @media print {
          .no-print, .no-print * { display: none !important; }
          body, main { background: white !important; color: black !important; font-size: 11pt; }
          main { max-width: 100% !important; margin: 0; padding: 0; }
          .bg-card { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0; border-radius: 0; }
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
        const loadingModal = document.getElementById('loading-modal');
        
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', async () => {
                if (typeof Paged === 'undefined') {
                    alert('Erro: Biblioteca de paginação não carregou.');
                    return;
                }
                if(loadingModal) loadingModal.style.display = 'flex';
                
                class Previewer extends Paged.Previewer {
                    afterPreview() {
                        if(loadingModal) loadingModal.style.display = 'none';
                        window.print();
                        setTimeout(() => location.reload(), 1000);
                    }
                }
                
                const content = document.querySelector('#printable-content');
                let paged = new Previewer();
                paged.preview(content.innerHTML, [], document.body).catch(error => {
                    console.error("Paged.js error:", error);
                    if(loadingModal) loadingModal.style.display = 'none';
                });
            });
        }

        if (fontIncreaseBtn && fontDecreaseBtn) {
             const body = document.body;
             const handleFontSize = (increase) => {
                const currentSize = parseFloat(window.getComputedStyle(body).fontSize);
                const newSize = increase ? currentSize + 1 : currentSize - 1;
                if (newSize >= 12 && newSize <= 24) { body.style.fontSize = \`\${newSize}px\`; }
             };
             fontIncreaseBtn.addEventListener('click', () => handleFontSize(true));
             fontDecreaseBtn.addEventListener('click', () => handleFontSize(false));
        }

        if (contrastBtn) {
            contrastBtn.addEventListener('click', () => document.body.classList.toggle('high-contrast'));
        }

        document.querySelectorAll('.quiz-card').forEach(quizBlock => {
            const options = quizBlock.querySelectorAll('.quiz-option');
            const feedbackEl = quizBlock.querySelector('.quiz-feedback');
            const retryBtn = quizBlock.querySelector('.retry-btn');
            let answered = false;

            options.forEach(option => {
                option.addEventListener('click', () => {
                    if (answered) return;
                    answered = true;
                    option.classList.add('selected');
                    const isCorrect = option.getAttribute('data-correct') === 'true';

                    options.forEach(opt => {
                       opt.style.cursor = 'default';
                       if (opt.getAttribute('data-correct') === 'true') {
                           opt.classList.add('correct');
                       }
                    });

                    if (!isCorrect) option.classList.add('incorrect');
                    
                    if(feedbackEl) {
                       feedbackEl.textContent = isCorrect ? 'Resposta correta!' : 'Resposta incorreta.';
                       feedbackEl.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');
                    }
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

function generateHtmlContent(projects: Project[], handbookTitle: string): string {
  const handbookHtml = renderToString(<PrintableHandbook projects={projects} />);
  const cssContent = getCssContent();
  const scriptContent = getScriptContent();

  return `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${handbookTitle}</title>
        <style>${cssContent}</style>
        <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js" defer></script>
    </head>
    <body>
        <div id="loading-modal">
            <div id="loading-modal-content">
                <div class="spinner"></div><p>Preparando documento...</p>
            </div>
        </div>

        <header class="preview-header no-print">
            <div class="max-w-4xl mx-auto flex flex-row justify-between items-center">
                <h1 class="text-xl font-bold">${handbookTitle}</h1>
                <div id="accessibility-toolbar" class="flex items-center gap-1">
                    <button id="export-pdf" title="Exportar para PDF" class="toolbar-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button>
                    <div class="flex items-center border-l border-r border-primary-foreground/20 mx-1 px-1">
                        <button id="font-decrease" title="Diminuir Fonte" class="toolbar-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg></button>
                        <button id="font-increase" title="Aumentar Fonte" class="toolbar-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg></button>
                    </div>
                    <button id="contrast" title="Alto Contraste" class="toolbar-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><circle cx="12" cy="12" r="10"></circle><path d="M12 18a6 6 0 0 0 0-12v12z"></path></svg></button>
                </div>
            </div>
        </header>

        <main id="printable-content">
            <div class="bg-card rounded-xl shadow-lg">
                ${handbookHtml}
            </div>
        </main>

        <script>${scriptContent}</script>
    </body>
    </html>
  `;
}

export async function generateZip(projects: Project[], handbookTitle: string, handbookDescription: string) {
    const zip = new JSZip();
    const cleanTitle = (handbookTitle || 'apostila').toLowerCase().replace(/\\s+/g, '-');

    const htmlContent = generateHtmlContent(projects, handbookTitle);
    zip.file('index.html', htmlContent);
    zip.file('README.md', 'Para usar esta apostila offline, extraia o conteúdo deste ZIP e abra o arquivo index.html em seu navegador.');
    
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${cleanTitle}.zip`);
}
