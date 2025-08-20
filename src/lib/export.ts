
'use client';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Project, Block } from './types';
import DOMPurify from 'dompurify';

function sanitizeHtml(html: string): string {
    if (typeof window !== 'undefined') {
        return DOMPurify.sanitize(html);
    }
    return html;
}

function renderBlockToHtml(block: Block): string {
    switch (block.type) {
        case 'text':
            return `<div class="block block-text">${sanitizeHtml(block.content.text || '')}</div>`;
        case 'image':
             const imageUrl = block.content.url;
            const width = block.content.width ?? 100;
            return `
                <div class="block block-image" style="display: flex; justify-content: center;">
                    <figure style="width: ${width}%;">
                        <img src="${imageUrl || ''}" alt="${block.content.alt || ''}" style="max-width: 100%; height: auto; display: block; border-radius: 6px;" />
                        ${block.content.caption ? `<figcaption style="padding-top: 0.75rem; font-size: 0.9rem; color: #555; text-align: center;">${block.content.caption}</figcaption>` : ''}
                    </figure>
                </div>
            `;
        case 'quote':
             return `
                <div class="block block-quote">
                    <p>${block.content.text || ''}</p>
                </div>
            `;
        case 'video':
            const videoUrl = block.content.videoType === 'cloudflare' 
                ? `https://customer-mhnunnb897evy1sb.cloudflarestream.com/${block.content.cloudflareVideoId}/watch`
                : block.content.videoUrl;
            return `
                <div class="block block-video pagedjs-video-placeholder">
                    <div class="video-placeholder-content">
                        <p>Este conteúdo é interativo.</p>
                        <a href="${videoUrl || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-small">Acessar versão online</a>
                    </div>
                </div>
            `;
        case 'button':
             return `
                <div class="block block-button">
                    <a href="${block.content.buttonUrl || '#'}" class="btn-block" target="_blank" rel="noopener noreferrer">
                        ${block.content.buttonText || 'Botão'}
                    </a>
                </div>
            `;
        case 'quiz':
            const quizOptionsHtml = block.content.options?.map(opt => `
                <div class="quiz-option" data-correct="${opt.isCorrect}">
                    <div class="radio-button"></div>
                    <label>${opt.text}</label>
                </div>
            `).join('') || '';

             return `
                <div class="block block-quiz">
                    <p class="quiz-question">${block.content.question || ''}</p>
                    <div class="quiz-options-container">${quizOptionsHtml}</div>
                    <div class="quiz-feedback" style="display: none;"></div>
                    <button class="btn quiz-retry-btn" style="display: none;">Tentar Novamente</button>
                </div>`;
        default:
            return '';
    }
}


function generateModulesHtml(projects: Project[], mainTitle: string): string {
    return projects.map((project, index) => `
          <section id="modulo-${index}" class="modulo">
              <div class="module-content">
                  <h1 class="module-title-header">${project.title}</h1>
                  <p class="module-description">${project.description}</p>
                  <div class="divider"></div>
                  ${project.blocks.map(renderBlockToHtml).join('\n')}
              </div>
               <div class="module-navigation">
                  <button class="btn nav-anterior">Módulo Anterior</button>
                  <button class="btn nav-proximo">Próximo Módulo</button>
              </div>
          </section>
      `).join('');
}


function generateFloatingNav(projects: Project[]): string {
    const moduleList = projects.map((project, index) => 
        `<li><a href="#" class="module-link" data-index="${index}">${project.title}</a></li>`
    ).join('');

    return `
        <div id="floating-nav-button" title="Navegar entre módulos">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        </div>
        <div id="floating-nav-menu">
            <p>Módulos</p>
            <ul>
                ${moduleList}
            </ul>
        </div>
    `;
}

function generateHeaderNavHtml(): string {
    return `
        <div class="header-nav">
             <button class="btn-header" id="btn-acessibilidade" title="Acessibilidade">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <span>Acessibilidade</span>
            </button>
            <button class="btn-header" id="btn-pdf" title="Exportar como PDF">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10 15.5c.2.8.9 1.5 2.1 1.5 1.1 0 1.9-.6 1.9-1.5v-1c0-.9-.5-1.5-1.5-1.5-1.1 0-1.6.6-1.7 1.2"></path><path d="M15 12.5h1.5v6H15"></path><path d="M8.5 12.5h1V18h-1z"></path></svg>
                <span>PDF</span>
            </button>
        </div>
    `;
}

function generateCss(): string {
    const interactiveStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
        :root {
            --primary-color: #2563EB;
            --primary-color-dark: #1D4ED8;
            --background-color: #F4F5F7;
            --text-color: #111827;
            --card-background: #FFFFFF;
            --header-height: 70px;
            --border-color: #E5E7EB;
            --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        html { font-size: 16px; scroll-behavior: smooth; }
        body { font-family: var(--font-family); line-height: 1.6; background-color: var(--background-color); color: var(--text-color); margin: 0; padding-top: var(--header-height); transition: background-color 0.3s, color 0.3s; }
        .main-header { position: fixed; top: 0; left: 0; width: 100%; height: var(--header-height); background: var(--primary-color); color: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 1000; border-bottom: 1px solid rgba(0,0,0,0.1); }
        .header-container { max-width: 1200px; height: 100%; margin: 0 auto; padding: 0 2rem; display: flex; justify-content: space-between; align-items: center; }
        .main-title { margin: 0; font-size: 1.5rem; font-weight: 700; }
        .header-nav { display: flex; gap: 8px; }
        .btn-header { display: flex; align-items: center; gap: 8px; background-color: transparent; color: white; border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 8px; padding: 8px 14px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s ease-in-out; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .btn-header:hover { background-color: rgba(255, 255, 255, 0.2); transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
        .btn-header:focus-visible { outline: 2px solid white; outline-offset: 2px; }
        .btn-header svg { width: 18px; height: 18px; }
        main { max-width: 800px; margin: 2rem auto; padding: 0 2rem; }
        .modulo { display: none; animation: fadeIn 0.5s ease-in-out; background-color: var(--card-background); border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 2rem 3rem; margin-bottom: 2rem; border: 1px solid var(--border-color); }
        .modulo:first-of-type { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        h1, h2, h3, h4, h5, h6 { text-align: center; }
        .module-main-title { font-size: 1rem; font-weight: 500; color: var(--primary-color); text-transform: uppercase; letter-spacing: 1px; margin: 0; }
        .module-title-header { color: var(--text-color); font-size: 2.5rem; font-weight: 700; margin: 0.25rem 0 0 0; }
        .module-description { font-size: 1.1rem; text-align: center; color: var(--text-color); opacity: 0.7; margin-top: 0.5rem; }
        .divider { height: 1px; background-color: var(--border-color); margin: 1.5rem 0; }
        .block { margin-bottom: 2.5rem; }
        img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .block-image { text-align: center; }
        .block-image figcaption { font-size: 0.9rem; color: var(--text-color); opacity: 0.7; margin-top: 0.5rem; }
        .block-quote { position: relative; padding: 1.5rem; background-color: var(--background-color); border-left: 4px solid var(--primary-color); border-radius: 4px; font-style: italic; font-size: 1.1rem; }
        
        .pagedjs-video-placeholder { display: flex; justify-content: center; align-items: center; background-color: #f0f0f0; border: 2px dashed #ccc; padding: 2rem; border-radius: 8px; min-height: 200px; }
        .video-placeholder-content { text-align: center; }
        .video-placeholder-content p { font-weight: 500; color: #333; margin: 0 0 1rem 0; }

        .block-button { text-align: center; }
        .btn-block { display: inline-block; background-color: var(--primary-color); color: white; padding: 0.8rem 2rem; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; text-decoration: none; transition: all 0.2s ease-in-out; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .btn-block:hover { background-color: var(--primary-color-dark); transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .block-quiz { padding: 1.5rem; background: var(--background-color); border-radius: 8px; border: 1px solid var(--border-color); }
        .quiz-question { font-weight: bold; font-size: 1.1rem; margin-top: 0; text-align: left; }
        .quiz-option { display: flex; align-items: center; padding: 0.75rem; margin: 0.5rem 0; background: var(--card-background); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; transition: all 0.2s ease-in-out; }
        .quiz-option:not(.answered):hover { border-color: var(--primary-color); background: var(--primary-color); color: white; }
        .quiz-option .radio-button { width: 18px; height: 18px; border: 2px solid var(--border-color); border-radius: 50%; margin-right: 12px; flex-shrink: 0; transition: all 0.2s ease-in-out; }
        .quiz-option:hover .radio-button { border-color: white; }
        .quiz-option.correct .radio-button, .quiz-option.incorrect .radio-button { border-width: 6px; }
        .quiz-option.answered { cursor: default; opacity: 0.8; }
        .quiz-option.correct { border-color: #16A34A; background: #F0FDF4; opacity: 1; }
        .quiz-option.correct .radio-button { border-color: #16A34A; }
        .quiz-option.incorrect { border-color: #DC2626; background: #FEF2F2; opacity: 1; }
        .quiz-option.incorrect .radio-button { border-color: #DC2626; }
        .quiz-feedback { margin-top: 1rem; padding: 0.75rem; border-radius: 6px; font-weight: bold; display: none; }
        .quiz-feedback.correct { color: #15803D; background: #DCFCE7; }
        .quiz-feedback.incorrect { color: #B91C1C; background: #FEE2E2; }
        .quiz-retry-btn { margin-top: 1rem; }
        .module-navigation { text-align: center; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border-color); }
        .btn { background-color: var(--primary-color); color: white; padding: 0.8rem 1.5rem; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin: 0 0.5rem; transition: all 0.2s ease-in-out; font-size: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .btn:hover { background-color: var(--primary-color-dark); transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .btn.btn-small { padding: 0.5rem 1rem; font-size: 0.9rem; }
        .btn.nav-anterior { background-color: transparent; border: 1px solid var(--border-color); color: var(--text-color); }
        .btn.nav-anterior:hover { background-color: var(--background-color); border-color: var(--text-color); color: var(--text-color); }
        #floating-nav-button { position: fixed; bottom: 20px; right: 20px; width: 56px; height: 56px; background-color: var(--primary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2); cursor: pointer; z-index: 1001; transition: background-color 0.2s, transform 0.2s; }
        #floating-nav-button:hover { background-color: var(--primary-color-dark); transform: scale(1.05); }
        #floating-nav-menu { position: fixed; bottom: 85px; right: 20px; background-color: var(--card-background); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.15); z-index: 1000; opacity: 0; visibility: hidden; transform: translateY(10px); transition: opacity 0.2s, visibility 0.2s, transform 0.2s; min-width: 250px; max-height: 300px; overflow-y: auto; padding: 0.5rem; }
        #floating-nav-menu.show { opacity: 1; visibility: visible; transform: translateY(0); }
        #floating-nav-menu p { padding: 0.5rem 1rem; margin: 0; font-weight: bold; font-size: 0.9rem; color: var(--text-color); opacity: 0.7; }
        #floating-nav-menu ul { list-style: none; padding: 0; margin: 0; }
        #floating-nav-menu li a { display: block; padding: 0.75rem 1rem; color: var(--text-color); text-decoration: none; border-radius: 4px; transition: background-color 0.2s; }
        #floating-nav-menu li a:hover { background-color: var(--background-color); }
        #floating-nav-menu li a.active { background-color: var(--primary-color); color: white; font-weight: bold; }
        
        #loading-modal { display: none; position: fixed; z-index: 2000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.6); align-items: center; justify-content: center; }
        #loading-modal .modal-content { background-color: #fff; padding: 30px 50px; border-radius: 12px; text-align: center; color: #333; box-shadow: 0 5px 20px rgba(0,0,0,0.2); }
        #loading-modal .modal-content p { font-size: 1.1rem; margin-top: 1rem; }
        #loading-modal .spinner { border: 6px solid #f3f3f3; border-top: 6px solid #2563EB; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* Paged.js Print Styles */
        @media print {
            body { padding-top: 0 !important; background-color: #fff !important; color: #000 !important; }
            .main-header, .module-navigation, #floating-nav-button, #floating-nav-menu, .btn-header { display: none !important; }
            main { max-width: none; margin: 0; padding: 0; }
            .modulo { 
                display: block !important; 
                box-shadow: none !important; 
                border: none !important;
                padding: 1rem;
                page-break-before: always;
            }
            .modulo:first-of-type {
                page-break-before: auto;
            }
            .pagedjs_page_content {
                padding-bottom: 2cm;
            }
            @page {
                @bottom-center {
                    content: "Página " counter(page);
                    font-size: 10px;
                    color: #888;
                }
            }
        }
        .pagedjs_pages { display: none; }
    `;
    
    return interactiveStyles;
}

const getPagedJsScript = () => `
async function generatePdfWithPagedJs() {
    const modal = document.getElementById('loading-modal');
    const content = document.getElementById('apostila-completa');
    const pdfButton = document.getElementById('btn-pdf');
    
    if (!content) {
        console.error("Elemento 'apostila-completa' não encontrado.");
        return;
    }

    if (modal) modal.style.display = 'flex';
    if (pdfButton) pdfButton.disabled = true;

    try {
        class MyHandler extends Paged.Handler {}
        Paged.registerHandlers(MyHandler);

        let paged = new Paged.Previewer();
        let flow = await paged.preview(content.innerHTML, [], document.body);
        
        await new Promise(resolve => setTimeout(resolve, 1000));

        const pdfBlob = await flow.toBlob();
        if(pdfBlob) {
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');
        } else {
            throw new Error("A geração do blob de PDF falhou.");
        }

    } catch (error) {
        console.error("Erro durante a geração do PDF com Paged.js:", error);
        alert('Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.');
    } finally {
        if (modal) modal.style.display = 'none';
        if (pdfButton) pdfButton.disabled = false;
        
        const pagedPages = document.querySelectorAll('.pagedjs_pages');
        pagedPages.forEach(p => p.remove());
        const pagedStyles = document.head.querySelectorAll('style[data-pagedjs-inserted-styles]');
        pagedStyles.forEach(s => s.remove());
    }
}
`;

export function generateZip(projects: Project[], handbookTitle: string) {
    const zip = new JSZip();
    
    const scriptContent = `
document.addEventListener('DOMContentLoaded', () => {
    let currentModuleIndex = 0;
    const modules = document.querySelectorAll('.modulo');
    const floatingNavButton = document.getElementById('floating-nav-button');
    const floatingNavMenu = document.getElementById('floating-nav-menu');
    const moduleLinks = document.querySelectorAll('.module-link');
    const pdfButton = document.getElementById('btn-pdf');
    
    function showModule(index) {
        if(index < 0 || index >= modules.length) return;
        modules.forEach((module, i) => {
            module.style.display = i === index ? 'block' : 'none';
        });
        currentModuleIndex = index;
        updateNavButtons();
        updateActiveModuleLink();
        window.scrollTo(0, 0);
    }

    function updateNavButtons() {
        document.querySelectorAll('.nav-anterior').forEach(btn => {
            btn.style.display = currentModuleIndex > 0 ? 'inline-block' : 'none';
        });
        document.querySelectorAll('.nav-proximo').forEach(btn => {
            btn.style.display = currentModuleIndex < modules.length - 1 ? 'inline-block' : 'none';
        });
    }

    function updateActiveModuleLink() {
        moduleLinks.forEach((link, i) => {
            if (i === currentModuleIndex) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    document.querySelectorAll('.block-quiz').forEach(quizContainer => {
        const options = quizContainer.querySelectorAll('.quiz-option');
        const feedbackEl = quizContainer.querySelector('.quiz-feedback');
        const retryBtn = quizContainer.querySelector('.quiz-retry-btn');
        let answered = false;

        options.forEach(option => {
            option.addEventListener('click', () => {
                if (answered) return;
                answered = true;
                
                const isCorrect = option.getAttribute('data-correct') === 'true';
                options.forEach(opt => opt.classList.add('answered'));

                if (isCorrect) {
                    option.classList.add('correct');
                    feedbackEl.textContent = 'Resposta Correta!';
                    feedbackEl.className = 'quiz-feedback correct';
                } else {
                    option.classList.add('incorrect');
                    feedbackEl.textContent = 'Resposta Incorreta.';
                    feedbackEl.className = 'quiz-feedback incorrect';
                    
                    const correctOption = quizContainer.querySelector('[data-correct="true"]');
                    if(correctOption) correctOption.classList.add('correct');
                }
                
                feedbackEl.style.display = 'block';
                if(retryBtn) retryBtn.style.display = 'inline-block';
            });
        });

        if(retryBtn) {
            retryBtn.addEventListener('click', () => {
                answered = false;
                options.forEach(opt => {
                    opt.classList.remove('answered', 'correct', 'incorrect');
                });
                feedbackEl.style.display = 'none';
                retryBtn.style.display = 'none';
            });
        }
    });

    document.querySelectorAll('.nav-proximo').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentModuleIndex < modules.length - 1) {
                showModule(currentModuleIndex + 1);
            }
        });
    });

    document.querySelectorAll('.nav-anterior').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentModuleIndex > 0) {
                showModule(currentModuleIndex - 1);
            }
        });
    });
    
    if (pdfButton) {
        pdfButton.addEventListener('click', () => {
            generatePdfWithPagedJs().catch(console.error);
        });
    }

    if(floatingNavButton){
        floatingNavButton.addEventListener('click', (event) => {
            event.stopPropagation();
            if (floatingNavMenu) floatingNavMenu.classList.toggle('show');
        });
    }

    document.addEventListener('click', (event) => {
        if (floatingNavMenu && !floatingNavMenu.contains(event.target) && floatingNavButton && !floatingNavButton.contains(event.target)) {
            floatingNavMenu.classList.remove('show');
        }
    });

    moduleLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);
            showModule(index);
            if(floatingNavMenu) floatingNavMenu.classList.remove('show');
        });
    });

    showModule(0);
});

${getPagedJsScript()}
    `;

    const mainHtmlContent = `
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${handbookTitle}</title>
            <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
            <style>
                ${generateCss()}
            </style>
        </head>
        <body>
            <div id="loading-modal">
                <div class="modal-content">
                    <div class="spinner"></div>
                    <p>Gerando PDF...</p>
                </div>
            </div>
            <header class="main-header">
                <div class="header-container">
                    <h1 class="main-title">${handbookTitle}</h1>
                    ${generateHeaderNavHtml()}
                </div>
            </header>
            <main>
                <div id="apostila-completa">
                    ${generateModulesHtml(projects, handbookTitle)}
                </div>
            </main>
            ${generateFloatingNav(projects)}
            <script>${scriptContent}</script>
        </body>
        </html>
    `;

    zip.file('index.html', mainHtmlContent);
    
    zip.generateAsync({ type: 'blob' }).then(blob => {
        saveAs(blob, `${handbookTitle.toLowerCase().replace(/\\s/g, '-')}.zip`);
    });
}

    