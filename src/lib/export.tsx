
'use client';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Project } from './types';
import { renderToString } from 'react-dom/server';
import { PrintableHandbook } from '@/components/PrintableHandbook';
import { PreviewHeader } from '@/components/PreviewHeader';

// Esta função agora gera o HTML estático que será renderizado no servidor para o Paged.js
function getPrintableHtml(projects: Project[]): string {
    return renderToString(<PrintableHandbook projects={projects} />);
}

function getCssContent(): string {
    // Todos os estilos necessários para a página e para a impressão com Paged.js
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
            background-color: hsl(var(--secondary), 0.4);
            color: hsl(var(--foreground));
            font-family: 'Inter', sans-serif;
            transition: font-size 0.2s, background-color 0.3s, color 0.3s;
            margin: 0;
            padding: 0;
            min-height: 100vh;
        }
        
        body.high-contrast { background-color: black; color: white; }
        body.high-contrast .preview-header { background-color: black !important; color: white !important; stroke: white !important; }
        body.high-contrast .bg-card { background-color: black !important; border: 1px solid white; }
        body.high-contrast h2, body.high-contrast h3 { color: yellow !important; }
        body.high-contrast .text-muted-foreground { color: lightgray !important; }

        header.preview-header {
            padding: 1rem 1.5rem;
            background-color: hsl(var(--primary)) !important;
            color: hsl(var(--primary-foreground)) !important;
        }
        
        .header-content {
            max-width: 56rem;
            margin: 0 auto;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }

        .header-content h1 {
            font-size: 1.25rem;
            font-weight: 700;
        }

        #accessibility-toolbar { display: flex; align-items: center; gap: 0.25rem; }
        .toolbar-btn { background: transparent; border: none; cursor: pointer; padding: 0.5rem; border-radius: 0.375rem; color: hsl(var(--primary-foreground)) !important; }
        .toolbar-btn:hover { background-color: hsla(0, 0%, 98%, 0.1); }
        .toolbar-btn svg { height: 1.25rem; width: 1.25rem; stroke: currentColor; }
        .toolbar-separator { border-left: 1px solid hsla(0, 0%, 98%, 0.2); border-right: 1px solid hsla(0, 0%, 98%, 0.2); margin: 0 0.25rem; padding: 0 0.25rem; display:flex; align-items:center; gap: 0.25rem; }

        main#printable-content {
            max-width: 56rem;
            margin: 0 auto;
            padding: 2rem 1rem;
        }
        
        .printable-content-wrapper {
            background-color: hsl(var(--card)) !important;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
            padding: 2rem;
        }
        @media (min-width: 640px) { .printable-content-wrapper { padding: 3rem; } }
        @media (min-width: 768px) { .printable-content-wrapper { padding: 4rem; } }

        section { margin-bottom: 4rem; }
        section:last-child { margin-bottom: 0; }
        header.text-center { text-align: center; margin-bottom: 3rem; }
        h2.text-3xl { font-size: 1.875rem; font-weight: 700; margin-bottom: 0.5rem; padding-bottom: 0.5rem; }
        p.text-muted-foreground { color: hsl(var(--muted-foreground)); }
        .space-y-8 > * + * { margin-top: 2rem; }
        
        .prose { max-width: none; }
        .prose h1, .prose h2, .prose h3 { font-weight: bold; }
        .prose ul { list-style-type: disc; padding-left: 1.5rem; }
        .prose ol { list-style-type: decimal; padding-left: 1.5rem; }
        
        .flex { display: flex; } .justify-center { justify-content: center; }
        figure { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        img { border-radius: 0.375rem; max-width: 100%; height: auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,.1); }
        figcaption { font-size: 0.875rem; text-align: center; color: hsl(var(--muted-foreground)); font-style: italic; margin-top: 0.5rem; }
        
        .relative { position: relative; }
        blockquote { margin: 0; padding: 1.5rem; background-color: hsla(var(--muted), 0.5); border-left: 4px solid hsl(var(--primary)); border-radius: 0 0.5rem 0.5rem 0; font-style: italic; }
        blockquote .quote-icon { position: absolute; top: -0.75rem; left: -0.5rem; height: 2.5rem; width: 2.5rem; color: hsla(var(--primary), 0.2); }

        iframe { width: 100%; aspect-ratio: 16 / 9; border-radius: 0.375rem; border: none; }

        .btn { display: inline-flex; justify-content: center; align-items: center; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 500; text-decoration: none; font-size: 1rem; background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }
        
        /* Quiz Styles */
        .quiz-card { background-color: hsla(var(--muted), 0.3); border-radius: 0.75rem; border: 1px solid hsl(var(--border)); page-break-inside: avoid; }
        .quiz-card-header { padding: 1.5rem; }
        .quiz-card-title { font-weight: 700; margin-bottom: 0.25rem; }
        .quiz-card-desc { font-size: 0.875rem; color: hsl(var(--muted-foreground)); }
        .quiz-card-content { padding: 0 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .quiz-option { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 0.375rem; border: 1px solid hsl(var(--border)); cursor: pointer; transition: all 0.2s; }
        .quiz-option:hover { background-color: hsla(var(--muted), 0.6); }
        .radio-group-item { width: 1rem; height: 1rem; flex-shrink: 0; border-radius: 9999px; border: 1px solid hsl(var(--primary)); }
        .quiz-option.correct { background-color: hsla(var(--primary), 0.1); border-color: hsla(var(--primary), 0.5); }
        .quiz-option.incorrect { background-color: hsla(var(--destructive), 0.1); border-color: hsla(var(--destructive), 0.5); }
        .quiz-card-footer { padding: 1rem 1.5rem 1.5rem; min-height: 40px; }
        .retry-btn { display: none; background-color: transparent; border: 1px solid hsl(var(--border)); color: hsl(var(--foreground)); padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }
        .retry-btn.visible { display: inline-block; }

        #loading-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); display: none; align-items: center; justify-content: center; z-index: 1000; }
        #loading-modal-content { background: hsl(var(--card)); padding: 2rem; border-radius: 0.5rem; text-align: center; color: hsl(var(--card-foreground)); display: flex; align-items: center; gap: 1rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 24px; height: 24px; border: 3px solid hsl(var(--secondary)); border-top: 3px solid hsl(var(--primary)); border-radius: 50%; animation: spin 1s linear infinite; }
        
        @media print {
          .no-print, .no-print * { display: none !important; }
          body, main { background: white !important; color: black !important; font-size: 11pt; }
          main { max-width: 100% !important; margin: 0; padding: 0; }
          .printable-content-wrapper { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0; border-radius: 0; }
          @page { size: A4; margin: 2cm; }
          section { page-break-after: always; }
          .quiz-card, figure, blockquote { page-break-inside: avoid; }
        }
    `;
}

function getScriptContent(): string {
    // Script de interatividade para o arquivo HTML final
    return `
    document.addEventListener('DOMContentLoaded', () => {
        const exportPdfBtn = document.getElementById('export-pdf');
        const fontIncreaseBtn = document.getElementById('font-increase');
        const fontDecreaseBtn = document.getElementById('font-decrease');
        const contrastBtn = document.getElementById('contrast');
        const loadingModal = document.getElementById('loading-modal');
        
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
                // Passamos o CSS para garantir que a impressão seja fiel
                paged.preview(content.innerHTML, [document.getElementById('main-styles').href], document.body).catch(error => {
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
                    opt.classList.remove('correct', 'incorrect');
                    opt.style.cursor = 'pointer';
                });
                if(retryBtn) retryBtn.classList.remove('visible');
            };

            options.forEach(option => {
                option.addEventListener('click', () => {
                    if (isAnswered) return;
                    isAnswered = true;
                    
                    const isCorrect = option.getAttribute('data-correct') === 'true';
                    if (isCorrect) {
                        option.classList.add('correct');
                    } else {
                        option.classList.add('incorrect');
                        // Mostra qual era a correta
                        quizBlock.querySelector('.quiz-option[data-correct="true"]').classList.add('correct');
                    }

                    options.forEach(opt => opt.style.cursor = 'default');
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
  const printableHtml = getPrintableHtml(projects);
  // O CSS e o JS serão arquivos externos referenciados no HTML.
  return `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${handbookTitle}</title>
        <link id="main-styles" href="styles.css" rel="stylesheet">
        <script src="paged.polyfill.js" defer></script>
    </head>
    <body>
        <div id="loading-modal">
            <div id="loading-modal-content">
                <div class="spinner"></div>
                <p>Preparando documento para impressão...</p>
            </div>
        </div>

        <header class="preview-header no-print">
            <div class="header-content">
                <h1>${handbookTitle}</h1>
                <div id="accessibility-toolbar">
                    <button id="export-pdf" title="Exportar para PDF" class="toolbar-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button>
                    <div class="toolbar-separator">
                        <button id="font-decrease" title="Diminuir Fonte" class="toolbar-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg></button>
                        <button id="font-increase" title="Aumentar Fonte" class="toolbar-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg></button>
                    </div>
                    <button id="contrast" title="Alto Contraste" class="toolbar-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 18a6 6 0 0 0 0-12v12z"></path></svg></button>
                </div>
            </div>
        </header>

        <main id="printable-content">
            <div class="printable-content-wrapper">
                ${printableHtml}
            </div>
        </main>

        <script src="script.js"></script>
    </body>
    </html>
  `;
}

// URL pública para o polyfill do Paged.js
const PAGEDJS_POLYFILL_URL = 'https://unpkg.com/pagedjs/dist/paged.polyfill.js';

export async function generateZip(projects: Project[], handbookTitle: string, handbookDescription: string) {
    const zip = new JSZip();
    const cleanTitle = (handbookTitle || 'apostila').toLowerCase().replace(/\\s+/g, '-');

    // 1. Gerar o conteúdo dos arquivos
    const htmlContent = generateHtmlContent(projects, handbookTitle);
    const cssContent = getCssContent();
    const scriptContent = getScriptContent();

    // 2. Adicionar arquivos ao ZIP
    zip.file('index.html', htmlContent);
    zip.file('styles.css', cssContent);
    zip.file('script.js', scriptContent);
    zip.file('README.md', 'Para usar esta apostila offline, extraia o conteúdo deste ZIP e abra o arquivo index.html em seu navegador.');
    
    // 3. Baixar e adicionar o polyfill do Paged.js
    try {
        const pagedJsResponse = await fetch(PAGEDJS_POLYFILL_URL);
        if (!pagedJsResponse.ok) throw new Error('Network response was not ok.');
        const pagedJsBlob = await pagedJsResponse.blob();
        zip.file('paged.polyfill.js', pagedJsBlob);
    } catch (error) {
        console.error("Falha ao baixar o paged.polyfill.js, a exportação de PDF pode não funcionar offline.", error);
        // Opcional: Adicionar um alerta ou fallback
    }

    // 4. Gerar e baixar o ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${cleanTitle}.zip`);
}
