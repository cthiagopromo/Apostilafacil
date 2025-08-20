
'use client';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Project } from './types';
import { renderToString } from 'react-dom/server';
import { PrintableHandbook } from '@/components/PrintableHandbook';
import { PreviewHeader } from '@/components/PreviewHeader';

function getCssContent(): string {
    return `
        /* TailwindCSS base styles */
        h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}:host,:root{--background: 240 5% 96%;--foreground: 222.2 84% 4.9%;--card: 0 0% 100%;--card-foreground: 222.2 84% 4.9%;--popover: 0 0% 100%;--popover-foreground: 0 0% 3.9%;--primary: 221 83% 53%;--primary-foreground: 0 0% 98%;--secondary: 210 40% 98%;--secondary-foreground: 222.2 47.4% 11.2%;--muted: 210 40% 96.1%;--muted-foreground: 215 20.2% 65.1%;--accent: 210 40% 96.1%;--accent-foreground: 222.2 47.4% 11.2%;--destructive: 0 84.2% 60.2%;--destructive-foreground: 0 0% 98%;--border: 214 31.8% 91.4%;--input: 214 31.8% 91.4%;--ring: 221 83% 53%;--radius: 0.75rem}*,:after,:before{border:0 solid #e5e7eb;box-sizing:border-box}
        
        /* Custom App Styles */
        body { background-color: hsl(var(--secondary) / 0.4); color: hsl(var(--foreground)); font-family: 'Inter', sans-serif; transition: font-size 0.2s, background-color 0.3s, color 0.3s; margin: 0;}
        body.high-contrast { background-color: black; color: white; }
        body.high-contrast #preview-header { background-color: black !important; border-bottom: 1px solid yellow; }
        body.high-contrast #preview-header h1 { color: yellow !important; }
        body.high-contrast #preview-header button { color: white !important; }
        body.high-contrast .printable-content-wrapper { background-color: black !important; border: 1px solid white; }
        body.high-contrast .module-header h2 { color: yellow !important; }
        body.high-contrast .text-muted-foreground { color: lightgray !important; }
        body.high-contrast .quiz-card { background-color: #111; border-color: white;}
        body.high-contrast .quiz-option { border-color: #555;}
        body.high-contrast .quote-block { border-color: yellow !important; }

        #preview-header { padding: 1rem 1.5rem; background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); display: flex; justify-content: space-between; align-items: center; }
        #preview-header h1 { font-size: 1.25rem; font-weight: 700; }
        #accessibility-toolbar { display: flex; align-items: center; gap: 0.25rem; }
        #accessibility-toolbar button { background: transparent; border: none; cursor: pointer; padding: 0.5rem; border-radius: 0.375rem; color: hsl(var(--primary-foreground)); }
        #accessibility-toolbar button:hover { background-color: hsla(0, 0%, 98%, 0.1); }
        #accessibility-toolbar svg { height: 1.25rem; width: 1.25rem; stroke: currentColor; }

        main { padding: 3rem 1rem; }
        .printable-content-wrapper { background-color: hsl(var(--card)); border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1); padding: 4rem; max-width: 56rem; margin: auto; }
        .module-section:not(:last-child) { margin-bottom: 4rem; }
        .module-header { text-align: center; margin-bottom: 3rem; }
        .module-header h2 { font-size: 1.875rem; font-weight: 700; margin-bottom: 0.5rem; }
        .module-header p { color: hsl(var(--muted-foreground)); }
        .blocks-container > * + * { margin-top: 2rem; }

        .prose { max-width: none; }
        .prose h1, .prose h2, .prose h3 { font-weight: bold; }
        .prose ul { list-style-type: disc; padding-left: 1.5rem; }
        .prose ol { list-style-type: decimal; padding-left: 1.5rem; }
        .prose blockquote { border-left: 4px solid hsl(var(--border)); padding-left: 1rem; margin-left: 0; font-style: italic; }

        figure { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        figure img { border-radius: 0.375rem; max-width: 100%; height: auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,.1); }
        figure figcaption { font-size: 0.875rem; text-align: center; color: hsl(var(--muted-foreground)); font-style: italic; margin-top: 0.5rem; }

        .quote-block { position: relative; }
        .quote-block blockquote { margin: 0; padding: 1.5rem; background-color: hsl(var(--muted) / 0.5); border-left: 4px solid hsl(var(--primary)); border-radius: 0 0.5rem 0.5rem 0; font-style: italic; }
        .quote-icon { position: absolute; top: -0.75rem; left: -0.5rem; height: 2.5rem; width: 2.5rem; color: hsl(var(--primary) / 0.2); }

        .video-block iframe { width: 100%; aspect-ratio: 16 / 9; border-radius: 0.375rem; border: none; }

        .button-block { display: flex; justify-content: center; }
        .button-block a { display: inline-flex; justify-content: center; align-items: center; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 500; text-decoration: none; font-size: 1rem; background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }

        .quiz-card { background-color: hsl(var(--muted) / 0.3); border-radius: 0.75rem; border: 1px solid hsl(var(--border)); page-break-inside: avoid; }
        .quiz-card-header { padding: 1.5rem; }
        .quiz-card-title { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.25rem; }
        .quiz-card-desc { font-size: 0.875rem; color: hsl(var(--muted-foreground)); }
        .quiz-card-content { padding: 0 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .quiz-option { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 0.375rem; border: 1px solid hsl(var(--border)); cursor: pointer; transition: all 0.2s; }
        .quiz-option:hover { background-color: hsl(var(--muted) / 0.6); }
        .quiz-option input[type="radio"] { opacity: 0; position: absolute; }
        .quiz-option.selected.correct { background-color: hsl(var(--primary) / 0.1); border-color: hsl(var(--primary) / 0.5); }
        .quiz-option.selected.incorrect { background-color: hsl(var(--destructive) / 0.1); border-color: hsl(var(--destructive) / 0.5); }
        .quiz-option .result-icon { margin-left: auto; }
        .quiz-card-footer { padding: 1rem 1.5rem 1.5rem; min-height: 40px; }
        .retry-btn { display: none; background-color: transparent; border: 1px solid hsl(var(--border)); color: hsl(var(--foreground)); padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }
        .retry-btn.visible { display: inline-block; }

        #loading-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); display: none; align-items: center; justify-content: center; z-index: 1000; }
        #loading-modal-content { background: hsl(var(--card)); padding: 2rem; border-radius: 0.5rem; text-align: center; color: hsl(var(--card-foreground)); display: flex; align-items: center; gap: 1rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 24px; height: 24px; border: 3px solid hsl(var(--secondary)); border-top: 3px solid hsl(var(--primary)); border-radius: 50%; animation: spin 1s linear infinite; }
        
        @media print {
            .no-print, .no-print * { display: none !important; }
            body, main, .printable-content-wrapper { background: white !important; color: black !important; font-size: 11pt; box-shadow: none !important; padding: 0 !important; margin: 0 !important; border: none !important; border-radius: 0 !important; }
            main { max-width: 100% !important; }
            .module-section { page-break-after: always; }
            .module-section:last-of-type { page-break-after: auto; }
            .quiz-card, figure, .quote-block { page-break-inside: avoid; }
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
                const content = document.querySelector('main');
                const paged = new Previewer();
                paged.preview(content.innerHTML, [], document.body).catch(error => {
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
                    const resultIcon = opt.querySelector('.result-icon');
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
                     if (isCorrect) {
                        option.classList.add('correct');
                    } else {
                        option.classList.add('incorrect');
                    }

                    options.forEach(opt => {
                        opt.style.cursor = 'default';
                        const resultIcon = document.createElement('div');
                        resultIcon.className = 'result-icon';
                        const isOptCorrect = opt.getAttribute('data-correct') === 'true';

                        if (isOptCorrect) {
                            if (opt.classList.contains('selected')) {
                                resultIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:green;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
                            }
                        } else if (opt.classList.contains('selected')) {
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
  const headerHtml = renderToString(<PreviewHeader />);
  const handbookHtml = renderToString(<PrintableHandbook projects={projects} />);

  const finalHeaderHtml = headerHtml.replace(
      /(<div class="flex items-center gap-1[^>]*>)/,
      '<div id="accessibility-toolbar" class="flex items-center gap-1 bg-primary p-1 rounded-lg border border-primary-foreground/20">'
  ).replace(
      /<button([^>]*?)><svg([^>]*)><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"\/><polyline points="7 10 12 15 17 10"\/><line x1="12" x2="12" y1="15" y2="3"\/><\/svg><\/button>/,
      '<button$1 id="export-pdf"><svg$2><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg></button>'
  ).replace(
      /<button([^>]*?)><svg([^>]*)><path d="M18 16.5V15a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v1.5"\/><path d="M22 13.5V15a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1.5"\/><path d="M7 10a2 2 0 0 0-2 2v5"\/><path d="M11 10a2 2 0 0 1 2 2v5"\/><path d="M12 1a7 7 0 0 1 7 7c0 3-2 5-2 5H7s-2-2-2-5a7 7 0 0 1 7-7Z"\/><\/svg><\/button>/,
      '<button$1 id="libras-btn"><svg$2><path d="M18 16.5V15a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v1.5"/><path d="M22 13.5V15a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1.5"/><path d="M7 10a2 2 0 0 0-2 2v5"/><path d="M11 10a2 2 0 0 1 2 2v5"/><path d="M12 1a7 7 0 0 1 7 7c0 3-2 5-2 5H7s-2-2-2-5a7 7 0 0 1 7-7Z"/></svg></button>'
  ).replace(
      /<button([^>]*?)><svg([^>]*)><circle cx="12" cy="12" r="10"\/><path d="M8 12h8"\/><\/svg><\/button>/,
      '<button$1 id="font-decrease"><svg$2><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg></button>'
  ).replace(
      /<button([^>]*?)><svg([^>]*)><circle cx="12" cy="12" r="10"\/><path d="M8 12h8"\/><path d="M12 8v8"\/><\/svg><\/button>/,
      '<button$1 id="font-increase"><svg$2><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg></button>'
  ).replace(
      /<button([^>]*?)><svg([^>]*)><circle cx="12" cy="12" r="10"\/><path d="M12 18a6 6 0 0 0 0-12v12Z"\/><\/svg><\/button>/,
      '<button$1 id="contrast"><svg$2><circle cx="12" cy="12" r="10"/><path d="M12 18a6 6 0 0 0 0-12v12Z"/></svg></button>'
  ).replace(
      /<button([^>]*?)><svg([^>]*)><path d="M18.3 12.7a5 5 0 0 0-1.3-6.9"\/><path d="M14.6 3.2a5 5 0 0 0-6.9 1.3"\/><path d="M11.3 20.8a5 5 0 0 0 6.9-1.3"\/><path d="M7.4 14.8a5 5 0 0 0 1.3 6.9"\/><path d="M2 12h2"\/><path d="m5.6 5.6 1.4 1.4"\/><path d="M12 2v2"\/><path d="m18.4 5.6-1.4 1.4"\/><path d="M22 12h-2"\/><path d="m18.4 18.4 1.4 1.4"\/><path d="M12 22v-2"\/><path d="m5.6 18.4-1.4 1.4"\/><circle cx="12" cy="12" r="2"\/><\/svg><\/button>/,
      '<button$1 id="acessibilidade-btn"><svg$2><path d="M18.3 12.7a5 5 0 0 0-1.3-6.9"/><path d="M14.6 3.2a5 5 0 0 0-6.9 1.3"/><path d="M11.3 20.8a5 5 0 0 0 6.9-1.3"/><path d="M7.4 14.8a5 5 0 0 0 1.3 6.9"/><path d="M2 12h2"/><path d="m5.6 5.6 1.4 1.4"/><path d="M12 2v2"/><path d="m18.4 5.6-1.4 1.4"/><path d="M22 12h-2"/><path d="m18.4 18.4 1.4 1.4"/><path d="M12 22v-2"/><path d="m5.6 18.4-1.4 1.4"/><circle cx="12" cy="12" r="2"/></svg></button>'
  ).replace(
      /(<h1[^>]*>).*?(<\/h1>)/, `$1${handbookTitle}$2`
  );

  const css = getCssContent();
  const script = getScriptContent();
  
  return `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${handbookTitle}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
        <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js" defer></script>
        <style>${css}</style>
    </head>
    <body>
        <div id="loading-modal">
            <div id="loading-modal-content">
                <div class="spinner"></div>
                <p>Preparando documento para impressão...</p>
            </div>
        </div>
        <header id="preview-header" class="no-print">${finalHeaderHtml}</header>
        <main>
            <div class="printable-content-wrapper">
                ${handbookHtml}
            </div>
        </main>
        <script>${script}</script>
    </body>
    </html>
  `;
}

export async function generateZip(projects: Project[], handbookTitle: string, handbookDescription: string) {
    const zip = new JSZip();
    const cleanTitle = (handbookTitle || 'apostila').toLowerCase().replace(/\s+/g, '-');

    const htmlContent = generateHtmlContent(projects, handbookTitle);

    zip.file('index.html', htmlContent);
    zip.file('README.md', 'Para usar esta apostila offline, extraia o conteúdo deste ZIP e abra o arquivo index.html em seu navegador.');
    
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${cleanTitle}.zip`);
}

    