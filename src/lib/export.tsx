
'use client';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Project } from './types';
import { renderToString } from 'react-dom/server';
import { PrintableHandbook } from '@/components/PrintableHandbook';
import { PreviewHeader } from '@/components/PreviewHeader';

function getPrintableHtml(projects: Project[], handbookTitle: string): string {
    const headerHtml = renderToString(<PreviewHeader />);
    const handbookHtml = renderToString(<PrintableHandbook projects={projects} />);

    // Customizing the headerHtml to add IDs for the script to work
    let interactiveHeaderHtml = headerHtml
        .replace(/(<h1[^>]*>).*?(<\/h1>)/, `$1${handbookTitle}$2`)
        .replace('<div class="flex items-center gap-1 bg-primary p-1 rounded-lg border border-primary-foreground/20">', '<div id="accessibility-toolbar" class="flex items-center gap-1 bg-primary p-1 rounded-lg border border-primary-foreground/20">')
        .replace('<button class="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground', '<button id="export-pdf" class="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"')
        .replace('<button class="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground', '<button id="libras-btn" class="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"', 1) // First button after export
        .replace('<button class="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground', '<button id="font-decrease" class="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"', 2)
        .replace('<button class="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground', '<button id="font-increase" class="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"', 3)
        .replace('<button class="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground', '<button id="contrast" class="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"', 4)
        .replace('<button class="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground', '<button id="acessibilidade-btn" class="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"', 5);

    return `
        <header class="no-print">${interactiveHeaderHtml}</header>
        <main id="printable-content" class="max-w-4xl mx-auto p-4 sm:p-8 md:p-12">
            <div class="bg-card rounded-xl shadow-lg p-8 sm:p-12 md:p-16">
                ${handbookHtml}
            </div>
        </main>
    `;
}

function getCssContent(): string {
    return `
        @tailwind base;
        @tailwind components;
        @tailwind utilities;

        @layer base {
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
        }

        body {
            background-color: hsl(var(--secondary) / 0.4);
            color: hsl(var(--foreground));
            font-family: 'Inter', sans-serif;
            transition: font-size 0.2s, background-color 0.3s, color 0.3s;
        }

        body.high-contrast {
            background-color: black;
            color: white;
        }
        body.high-contrast .bg-primary { background-color: black !important; border-bottom: 1px solid yellow; }
        body.high-contrast .text-primary-foreground { color: white !important; }
        body.high-contrast .bg-card { background-color: black !important; border: 1px solid white; }
        body.high-contrast h2, body.high-contrast h3, body.high-contrast .text-primary { color: yellow !important; }
        body.high-contrast .text-muted-foreground { color: lightgray !important; }
        body.high-contrast .quiz-card { background-color: #111; border-color: white;}
        body.high-contrast .quiz-option { border-color: #555;}

        header {
            padding: 1rem 1.5rem;
            background-color: hsl(var(--primary));
            color: hsl(var(--primary-foreground));
        }
        .max-w-4xl { max-width: 56rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .flex { display: flex; }
        .flex-row { flex-direction: row; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        h1 { font-size: 1.25rem; font-weight: 700; }

        #accessibility-toolbar { gap: 0.25rem; }
        #accessibility-toolbar button { background: transparent; border: none; cursor: pointer; padding: 0.5rem; border-radius: 0.375rem; color: hsl(var(--primary-foreground)); }
        #accessibility-toolbar button:hover { background-color: hsla(0, 0%, 98%, 0.1); }
        #accessibility-toolbar svg { height: 1.25rem; width: 1.25rem; stroke: currentColor; }

        main { padding: 2rem 1rem; }
        .bg-card { background-color: hsl(var(--card)); }
        .rounded-xl { border-radius: 0.75rem; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1); }
        .p-8 { padding: 2rem; }
        .sm\\:p-12 { padding: 3rem; }
        .md\\:p-16 { padding: 4rem; }

        section + section { margin-top: 4rem; }
        .text-center { text-align: center; }
        .mb-12 { margin-bottom: 3rem; }
        .text-3xl { font-size: 1.875rem; }
        .font-bold { font-weight: 700; }
        .mb-2 { margin-bottom: 0.5rem; }
        .pb-2 { padding-bottom: 0.5rem; }
        .text-muted-foreground { color: hsl(var(--muted-foreground)); }
        .space-y-8 > * + * { margin-top: 2rem; }

        /* Block specific styles */
        .prose { max-width: none; }
        .prose h1, .prose h2, .prose h3 { font-weight: bold; }
        .prose ul { list-style-type: disc; padding-left: 1.5rem; }
        .prose ol { list-style-type: decimal; padding-left: 1.5rem; }
        .prose blockquote { border-left: 4px solid hsl(var(--border)); padding-left: 1rem; margin-left: 0; font-style: italic; }

        figure { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        figure img { border-radius: 0.375rem; max-width: 100%; height: auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,.1); }
        figure figcaption { font-size: 0.875rem; text-align: center; color: hsl(var(--muted-foreground)); font-style: italic; margin-top: 0.5rem; }

        .relative { position: relative; }
        blockquote { margin: 0; padding: 1.5rem; background-color: hsl(var(--muted) / 0.5); border-left: 4px solid hsl(var(--primary)); border-radius: 0 0.5rem 0.5rem 0; font-style: italic; }
        .quote-icon { position: absolute; top: -0.75rem; left: -0.5rem; height: 2.5rem; width: 2.5rem; color: hsl(var(--primary) / 0.2); }

        iframe { width: 100%; aspect-ratio: 16 / 9; border-radius: 0.375rem; border: none; }

        .btn { display: inline-flex; justify-content: center; align-items: center; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 500; text-decoration: none; font-size: 1rem; background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }

        .quiz-card { background-color: hsl(var(--muted) / 0.3); border-radius: 0.75rem; border: 1px solid hsl(var(--border)); page-break-inside: avoid; }
        .quiz-card-header { padding: 1.5rem; }
        .quiz-card-title { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.25rem; }
        .quiz-card-desc { font-size: 0.875rem; color: hsl(var(--muted-foreground)); }
        .quiz-card-content { padding: 0 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .quiz-option { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 0.375rem; border: 1px solid hsl(var(--border)); cursor: pointer; transition: all 0.2s; }
        .quiz-option:hover { background-color: hsl(var(--muted) / 0.6); }
        .quiz-option input[type="radio"] { display: none; } /* Hide the actual radio button */
        .radio-indicator { width: 1rem; height: 1rem; flex-shrink: 0; border-radius: 9999px; border: 2px solid hsl(var(--primary)); }
        .quiz-option.selected .radio-indicator { background-color: hsl(var(--primary)); }
        .quiz-option.correct { background-color: hsl(var(--primary) / 0.1); border-color: hsl(var(--primary) / 0.5); }
        .quiz-option.incorrect { background-color: hsl(var(--destructive) / 0.1); border-color: hsl(var(--destructive) / 0.5); }
        .quiz-card-footer { padding: 1rem 1.5rem 1.5rem; min-height: 40px; }
        .retry-btn { display: none; background-color: transparent; border: 1px solid hsl(var(--border)); color: hsl(var(--foreground)); padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }
        .retry-btn.visible { display: inline-block; }
        .quiz-result-icon { margin-left: auto; }

        #loading-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); display: none; align-items: center; justify-content: center; z-index: 1000; }
        #loading-modal-content { background: hsl(var(--card)); padding: 2rem; border-radius: 0.5rem; text-align: center; color: hsl(var(--card-foreground)); display: flex; align-items: center; gap: 1rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 24px; height: 24px; border: 3px solid hsl(var(--secondary)); border-top: 3px solid hsl(var(--primary)); border-radius: 50%; animation: spin 1s linear infinite; }

        @media print {
            .no-print, .no-print * { display: none !important; }
            body, main { background: white !important; color: black !important; font-size: 11pt; }
            main { max-width: 100% !important; margin: 0; padding: 0; }
            .bg-card { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0; border-radius: 0; }
            section { page-break-after: always; }
            section:last-of-type { page-break-after: auto; }
            .quiz-card, figure, blockquote { page-break-inside: avoid; }
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

        const showAlert = (feature) => alert(feature + ' - Funcionalidade em desenvolvimento.');
        document.getElementById('libras-btn')?.addEventListener('click', () => showAlert('Libras'));
        document.getElementById('acessibilidade-btn')?.addEventListener('click', () => showAlert('Acessibilidade'));

        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => {
                if (typeof Paged === 'undefined') {
                    alert('Erro: Biblioteca de paginação não carregou. Tente novamente em alguns segundos.');
                    return;
                }
                if(loadingModal) loadingModal.style.display = 'flex';

                class Previewer extends Paged.Previewer {
                    afterPreview() {
                        if(loadingModal) loadingModal.style.display = 'none';
                        window.print();
                    }
                }

                const content = document.querySelector('#printable-content');
                const paged = new Previewer();
                paged.preview(content.innerHTML, ['styles.css'], document.body).catch(error => {
                    console.error("Paged.js error:", error);
                    if(loadingModal) loadingModal.style.display = 'none';
                    alert('Ocorreu um erro ao gerar o PDF.');
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
            const retryBtn = quizBlock.querySelector('.retry-btn');
            let isAnswered = false;

            const resetQuiz = () => {
                isAnswered = false;
                options.forEach(opt => {
                    opt.classList.remove('correct', 'incorrect', 'selected');
                    opt.style.cursor = 'pointer';
                    const resultIcon = opt.querySelector('.quiz-result-icon');
                    if (resultIcon) resultIcon.remove();
                });
                if(retryBtn) retryBtn.classList.remove('visible');
            };

            options.forEach(option => {
                option.addEventListener('click', () => {
                    if (isAnswered) return;
                    isAnswered = true;

                    // Clear previous selections
                    options.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');

                    const isCorrect = option.getAttribute('data-correct') === 'true';

                    options.forEach(opt => {
                        opt.style.cursor = 'default';
                        const resultIcon = document.createElement('div');
                        resultIcon.className = 'quiz-result-icon';
                        const isOptCorrect = opt.getAttribute('data-correct') === 'true';

                        if (isOptCorrect) {
                            opt.classList.add('correct');
                            resultIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:green;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
                        } else if (opt.classList.contains('selected') && !isOptCorrect) {
                            opt.classList.add('incorrect');
                            resultIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:red;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
                        }
                        opt.appendChild(resultIcon);
                    });

                    if (retryBtn) retryBtn.classList.add('visible');
                });
            });

            if(retryBtn) {
                retryBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    resetQuiz();
                });
            }
        });
    });
    `;
}

function generateHtmlContent(projects: Project[], handbookTitle: string): string {
  const bodyContent = getPrintableHtml(projects, handbookTitle);
  return `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${handbookTitle}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
        <link id="main-styles" href="styles.css" rel="stylesheet">
        <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js" defer></script>
    </head>
    <body>
        <div id="loading-modal">
            <div id="loading-modal-content">
                <div class="spinner"></div>
                <p>Preparando documento para impressão...</p>
            </div>
        </div>
        ${bodyContent}
        <script src="script.js"></script>
    </body>
    </html>
  `;
}

const PAGEDJS_POLYFILL_URL = 'https://unpkg.com/pagedjs/dist/paged.polyfill.js';

export async function generateZip(projects: Project[], handbookTitle: string, handbookDescription: string) {
    const zip = new JSZip();
    const cleanTitle = (handbookTitle || 'apostila').toLowerCase().replace(/\\s+/g, '-');

    const htmlContent = generateHtmlContent(projects, handbookTitle);
    const cssContent = getCssContent();
    const scriptContent = getScriptContent();

    zip.file('index.html', htmlContent);
    zip.file('styles.css', cssContent);
    zip.file('script.js', scriptContent);
    zip.file('README.md', 'Para usar esta apostila offline, extraia o conteúdo deste ZIP e abra o arquivo index.html em seu navegador.');
    
    // Fetching the polyfill is not strictly necessary if we link to the CDN,
    // but it's good practice for a fully offline package.
    try {
        const pagedJsResponse = await fetch(PAGEDJS_POLYFILL_URL);
        if (!pagedJsResponse.ok) throw new Error('Network response was not ok.');
        const pagedJsBlob = await pagedJsResponse.blob();
        zip.file('paged.polyfill.js', pagedJsBlob);
    } catch (error) {
        console.error("Falha ao baixar o paged.polyfill.js. A exportação offline de PDF pode depender da conexão com a internet para buscar este arquivo.", error);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${cleanTitle}.zip`);
}

    