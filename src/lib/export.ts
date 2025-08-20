
'use client';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Project, Block } from './types';
import DOMPurify from 'dompurify';

function sanitizeHtml(html: string): string {
    if (typeof window !== 'undefined') {
        // Permitir iframes para vídeos do YouTube/Cloudflare no HTML, mas eles serão substituídos no PDF.
        return DOMPurify.sanitize(html, { 
            ADD_TAGS: ["iframe"], 
            ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'title'] 
        });
    }
    return html;
}

function getYoutubeEmbedUrl(url: string): string | null {
    if (!url) return null;
    let videoId = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.substring(1);
        } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
            videoId = urlObj.searchParams.get('v');
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch (e) {
        console.error("URL do YouTube inválida:", e);
        return null;
    }
}

function getCloudflareEmbedUrl(videoId: string): string | null {
    return videoId ? `https://customer-mhnunnb897evy1sb.cloudflarestream.com/${videoId}/iframe` : null;
}


function renderBlockToHtml(block: Block): string {
    switch (block.type) {
        case 'text':
            return `<div class="block block-text">${sanitizeHtml(block.content.text || '')}</div>`;
        case 'image':
            const width = block.content.width ?? 100;
            return `
                <div class="block block-image" style="display: flex; justify-content: center;">
                    <figure style="width: ${width}%;">
                        <img src="${block.content.url || ''}" alt="${block.content.alt || ''}" style="max-width: 100%; height: auto; display: block; border-radius: 8px;" />
                        ${block.content.caption ? `<figcaption>${block.content.caption}</figcaption>` : ''}
                    </figure>
                </div>
            `;
        case 'quote':
             return `
                <div class="block block-quote">
                    <p>${block.content.text || ''}</p>
                </div>
            `;
        case 'video': {
            let embedUrl = null;
            if (block.content.videoType === 'youtube') {
                embedUrl = getYoutubeEmbedUrl(block.content.videoUrl || '');
            } else if (block.content.videoType === 'cloudflare') {
                embedUrl = getCloudflareEmbedUrl(block.content.cloudflareVideoId || '');
            }

            // Fallback para PDF e HTML interativo
            const placeholder = `
                <div class="block-video-placeholder" data-pdf-only>
                    <a href="${block.content.videoUrl || '#'}" target="_blank" rel="noopener noreferrer" class="video-placeholder-link">
                        <span>▶️</span>
                        <span>Este conteúdo é interativo. Clique para assistir.</span>
                    </a>
                </div>
            `;

            if (!embedUrl) {
                return placeholder;
            }

            return `
                <div class="block block-video" data-interactive-only>
                    <iframe 
                        src="${embedUrl}?autoplay=${block.content.autoplay ? 1:0}&controls=${block.content.showControls ? 1:0}" 
                        title="${block.content.videoTitle || 'Player de vídeo'}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
                ${placeholder} 
            `;
        }
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
                    <h3 class="quiz-question">${block.content.question || ''}</h3>
                    <div class="quiz-options-container">${quizOptionsHtml}</div>
                    <div class="quiz-feedback"></div>
                    <button class="btn quiz-retry-btn" style="display: none;">Tentar Novamente</button>
                </div>`;
        default:
            return '';
    }
}


function generateModulesHtml(projects: Project[]): string {
    return projects.map((project, index) => `
          <section id="modulo-${index}" class="modulo">
              <div class="module-content">
                  <h1 class="module-title-header">${project.title}</h1>
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
        <nav id="floating-nav-menu">
            <p>Módulos</p>
            <ul>
                ${moduleList}
            </ul>
        </nav>
    `;
}

function generateHeaderNavHtml(handbookTitle: string): string {
    return `
      <div class="header-container">
          <h1 class="main-title">${handbookTitle}</h1>
          <div class="toolbar">
              <button id="btn-pdf" class="toolbar-btn" title="Exportar para PDF">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  <span>PDF</span>
              </button>
              <div class="toolbar-separator"></div>
              <button id="btn-font-increase" class="toolbar-btn" title="Aumentar fonte">A+</button>
              <button id="btn-font-decrease" class="toolbar-btn" title="Diminuir fonte">A-</button>
              <div class="toolbar-separator"></div>
              <button id="btn-contrast" class="toolbar-btn" title="Alto Contraste">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 18a6 6 0 0 0 0-12v12z"></path></svg>
                  <span>Contraste</span>
              </button>
              <button id="btn-dark-mode" class="toolbar-btn" title="Modo Escuro">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
                  <span>Escuro</span>
              </button>
              <button id="btn-audio" class="toolbar-btn" title="Leitor de Áudio (Em breve)" disabled>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                  <span>Áudio</span>
              </button>
          </div>
      </div>
    `;
}

function generateCssContent(): string {
    return `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
        
        :root {
            --primary-color: #2563EB;
            --primary-color-dark: #1D4ED8;
            --background-color: #F4F5F7;
            --text-color: #1F2937;
            --card-background: #FFFFFF;
            --header-height: 64px;
            --border-color: #E5E7EB;
            --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            --base-font-size: 16px;
        }

        .dark-mode {
            --background-color: #111827;
            --text-color: #F9FAFB;
            --card-background: #1F2937;
            --border-color: #374151;
        }

        .high-contrast-mode {
            --background-color: #000000;
            --text-color: #FFFFFF;
            --card-background: #000000;
            --primary-color: #FFFF00;
            --primary-color-dark: #DDDD00;
            --border-color: #FFFFFF;
        }
        .high-contrast-mode .main-header {
             border-bottom: 2px solid var(--border-color);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: var(--base-font-size); scroll-behavior: smooth; }
        body { font-family: var(--font-family); line-height: 1.6; background-color: var(--background-color); color: var(--text-color); margin: 0; padding-top: var(--header-height); transition: background-color 0.3s, color 0.3s; }
        
        .main-header { position: fixed; top: 0; left: 0; width: 100%; height: var(--header-height); background: var(--primary-color); color: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 1000; transition: background-color 0.3s; }
        .header-container { max-width: 1280px; height: 100%; margin: 0 auto; padding: 0 2rem; display: flex; justify-content: space-between; align-items: center; }
        .main-title { font-size: 1.25rem; font-weight: 700; }

        .toolbar { display: flex; align-items: center; gap: 0.5rem; }
        .toolbar-btn { display: flex; align-items: center; gap: 0.5rem; background: transparent; color: white; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; padding: 0.5rem 0.75rem; cursor: pointer; font-size: 0.875rem; font-weight: 500; transition: background-color 0.2s; }
        .toolbar-btn:hover:not(:disabled) { background-color: rgba(255, 255, 255, 0.1); }
        .toolbar-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .toolbar-btn svg { width: 16px; height: 16px; }
        .toolbar-separator { width: 1px; height: 24px; background-color: rgba(255, 255, 255, 0.3); margin: 0 0.5rem; }
        
        main { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
        .modulo { display: none; animation: fadeIn 0.5s ease-in-out; background-color: var(--card-background); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 2rem 3rem; margin-bottom: 2rem; border: 1px solid var(--border-color); transition: background-color 0.3s, border-color 0.3s; }
        .modulo:first-of-type { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        
        h1,h2,h3,h4,h5,h6 { text-align: center; margin-bottom: 1.5rem; }
        h1.module-title-header { font-size: 2.25rem; font-weight: 700; }
        .divider { height: 1px; background-color: var(--border-color); margin: 1.5rem 0; }
        .block { margin-bottom: 2rem; }
        .block-text p, .block-text ul, .block-text ol { margin-bottom: 1rem; }
        .block-image figure { margin: 0; }
        .block-image figcaption { font-size: 0.9rem; color: var(--text-color); opacity: 0.7; margin-top: 0.75rem; text-align: center; }
        .block-quote { position: relative; padding: 1.5rem; background-color: rgba(0,0,0,0.02); border-left: 4px solid var(--primary-color); border-radius: 4px; font-style: italic; font-size: 1.1rem; }
        .dark-mode .block-quote { background-color: rgba(255,255,255,0.05); }

        .block-video { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .block-video iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

        .video-placeholder-link, .block-video-placeholder { display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: #f0f0f0; border: 2px dashed #ccc; padding: 2rem; border-radius: 8px; min-height: 200px; text-align: center; text-decoration: none; color: #333; font-weight: 500; gap: 1rem; }
        .dark-mode .video-placeholder-link, .dark-mode .block-video-placeholder { background-color: #2d3748; color: #e2e8f0; border-color: #4a5568;}
        .video-placeholder-link span:first-child { font-size: 2.5rem; }

        .block-button { text-align: center; }
        .btn, .btn-block { display: inline-block; background-color: var(--primary-color); color: white; padding: 0.8rem 2rem; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; text-decoration: none; transition: all 0.2s ease-in-out; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .btn:hover, .btn-block:hover { background-color: var(--primary-color-dark); transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        
        .module-navigation { display: flex; justify-content: center; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); }
        .btn.nav-anterior { background-color: transparent; border: 1px solid var(--border-color); color: var(--text-color); }
        .btn.nav-anterior:hover { background-color: var(--background-color); border-color: var(--text-color); }

        #floating-nav-button { position: fixed; bottom: 20px; right: 20px; width: 56px; height: 56px; background-color: var(--primary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2); cursor: pointer; z-index: 1001; transition: all 0.2s; }
        #floating-nav-button:hover { background-color: var(--primary-color-dark); transform: scale(1.05); }
        #floating-nav-menu { position: fixed; bottom: 85px; right: 20px; background-color: var(--card-background); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.15); z-index: 1000; opacity: 0; visibility: hidden; transform: translateY(10px); transition: opacity 0.2s, visibility 0.2s, transform 0.2s; min-width: 250px; max-height: 300px; overflow-y: auto; padding: 0.5rem; }
        #floating-nav-menu.show { opacity: 1; visibility: visible; transform: translateY(0); }
        #floating-nav-menu p { padding: 0.5rem 1rem; margin: 0; font-weight: bold; font-size: 0.9rem; color: var(--text-color); opacity: 0.7; }
        #floating-nav-menu ul { list-style: none; }
        #floating-nav-menu li a { display: block; padding: 0.75rem 1rem; color: var(--text-color); text-decoration: none; border-radius: 4px; transition: background-color 0.2s; font-weight: 500; }
        #floating-nav-menu li a:hover { background-color: var(--background-color); }
        #floating-nav-menu li a.active { background-color: var(--primary-color); color: white; font-weight: bold; }
        
        #loading-modal { display: none; position: fixed; z-index: 2000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); align-items: center; justify-content: center; }
        #loading-modal .modal-content { background-color: #fff; padding: 30px 50px; border-radius: 12px; text-align: center; color: #333; box-shadow: 0 5px 20px rgba(0,0,0,0.2); }
        #loading-modal .spinner { border: 6px solid #f3f3f3; border-top: 6px solid var(--primary-color); border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        [data-pdf-only] { display: none; }
        
        @media print, (forced-colors: active) {
            html, body {
                --background-color: #FFF !important;
                --text-color: #000 !important;
                --card-background: #FFF !important;
                --border-color: #000 !important;
                --primary-color: #000 !important;
                --base-font-size: 11pt;
                 background-color: var(--background-color) !important;
                 color: var(--text-color) !important;
            }
            .main-header, .module-navigation, #floating-nav-button, #floating-nav-menu, .btn-header, .toolbar, .quiz-options-container, .quiz-feedback, .quiz-retry-btn { display: none !important; }
            main { max-width: none; margin: 0; padding: 0; }
            .modulo { display: block !important; box-shadow: none !important; border: none !important; padding: 1rem 0; page-break-before: always; }
            .modulo:first-of-type { page-break-before: auto; }
            .block-video { display: none !important; } 
            .block-video-placeholder, [data-pdf-only] { display: flex !important; }
            [data-interactive-only] { display: none !important; }
        }

        @page {
            size: A4;
            margin: 18mm;
            @top-center { content: string(doctitle); font-size: 9pt; color: #888; }
            @bottom-right { content: "Página " counter(page); font-size: 9pt; color: #888; }
        }
        .main-title { string-set: doctitle content(text); }
        .pagedjs_pages, .pagedjs_page, .pagedjs_sheet {
            background: var(--background-color) !important;
            box-shadow: none !important;
            border: none !important;
        }
    `;
}

function getScriptContent(): string {
    const pagedJsScript = `
        class MyHandler extends Paged.Handler {
            constructor(chunker, polisher, caller) {
                super(chunker, polisher, caller);
            }
        }
        Paged.registerHandlers(MyHandler);

        async function generatePdfWithPagedJs() {
            const modal = document.getElementById('loading-modal');
            const content = document.getElementById('apostila-completa');
            const pdfButton = document.getElementById('btn-pdf');
            
            if (!content || !pdfButton) {
                console.error("Elementos essenciais para PDF não encontrados.");
                return;
            }

            if (modal) modal.style.display = 'flex';
            if (pdfButton) pdfButton.disabled = true;

            try {
                let paged = new Paged.Previewer();
                let flow = await paged.preview(content.innerHTML, ["/page.css"], document.body);
                
                // Aguarda um tempo para a renderização. Idealmente, Paged.js teria um evento 'rendered'.
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                window.print();

            } catch (error) {
                console.error("Erro durante a geração do PDF com Paged.js:", error);
                alert('Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.');
            } finally {
                if (modal) modal.style.display = 'none';
                if (pdfButton) pdfButton.disabled = false;
                
                // Limpeza dos artefatos do Paged.js
                const pagedArtifacts = document.querySelectorAll('.pagedjs_pages, style[data-pagedjs-inserted-styles]');
                pagedArtifacts.forEach(el => el.remove());
            }
        }
    `;

    return `
    document.addEventListener('DOMContentLoaded', () => {
        let currentModuleIndex = 0;
        const modules = document.querySelectorAll('.modulo');
        const floatingNavButton = document.getElementById('floating-nav-button');
        const floatingNavMenu = document.getElementById('floating-nav-menu');
        const moduleLinks = document.querySelectorAll('.module-link');
        const pdfButton = document.getElementById('btn-pdf');
        
        const btnFontIncrease = document.getElementById('btn-font-increase');
        const btnFontDecrease = document.getElementById('btn-font-decrease');
        const btnContrast = document.getElementById('btn-contrast');
        const btnDarkMode = document.getElementById('btn-dark-mode');
        const body = document.body;
        const root = document.documentElement;

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
                link.classList.toggle('active', i === currentModuleIndex);
            });
        }

        modules.forEach(module => {
            const nextBtn = module.querySelector('.nav-proximo');
            const prevBtn = module.querySelector('.nav-anterior');
            if(nextBtn) nextBtn.addEventListener('click', () => showModule(currentModuleIndex + 1));
            if(prevBtn) prevBtn.addEventListener('click', () => showModule(currentModuleIndex - 1));
        });

        if(pdfButton) {
            pdfButton.addEventListener('click', generatePdfWithPagedJs);
        }
        
        if(floatingNavButton && floatingNavMenu){
            floatingNavButton.addEventListener('click', (event) => {
                event.stopPropagation();
                floatingNavMenu.classList.toggle('show');
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

        // Accessibility controls
        if(btnFontIncrease && btnFontDecrease) {
            btnFontIncrease.addEventListener('click', () => {
                let currentSize = parseFloat(getComputedStyle(root).getPropertyValue('--base-font-size'));
                root.style.setProperty('--base-font-size', (currentSize + 1) + 'px');
            });
            btnFontDecrease.addEventListener('click', () => {
                let currentSize = parseFloat(getComputedStyle(root).getPropertyValue('--base-font-size'));
                if (currentSize > 10) { // minimum font size
                    root.style.setProperty('--base-font-size', (currentSize - 1) + 'px');
                }
            });
        }
        
        if(btnContrast) {
            btnContrast.addEventListener('click', () => body.classList.toggle('high-contrast-mode'));
        }

        if(btnDarkMode) {
            btnDarkMode.addEventListener('click', () => body.classList.toggle('dark-mode'));
        }
        
        if (modules.length > 0) {
            showModule(0);
        }

        // Quiz Logic
        document.querySelectorAll('.block-quiz').forEach(quizBlock => {
            const options = quizBlock.querySelectorAll('.quiz-option');
            const feedbackEl = quizBlock.querySelector('.quiz-feedback');
            const retryBtn = quizBlock.querySelector('.quiz-retry-btn');
            let answered = false;

            options.forEach(option => {
                option.addEventListener('click', () => {
                    if (answered) return;
                    answered = true;
                    const isCorrect = option.getAttribute('data-correct') === 'true';

                    option.classList.add(isCorrect ? 'correct' : 'incorrect');
                    if(feedbackEl) {
                       feedbackEl.textContent = isCorrect ? 'Resposta correta!' : 'Resposta incorreta.';
                       feedbackEl.style.color = isCorrect ? 'green' : 'red';
                    }

                    if (retryBtn) retryBtn.style.display = 'inline-block';
                });
            });

            if(retryBtn) {
                retryBtn.addEventListener('click', () => {
                    answered = false;
                    options.forEach(opt => opt.classList.remove('correct', 'incorrect'));
                    if(feedbackEl) feedbackEl.textContent = '';
                    retryBtn.style.display = 'none';
                });
            }
        });
    });
    ${pagedJsScript}
    `;
}

function generateHtmlContent(projects: Project[], handbookTitle: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${handbookTitle}</title>
        <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
        <style>
            ${generateCssContent()}
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
            ${generateHeaderNavHtml(handbookTitle)}
        </header>
        <main id="apostila-completa">
            ${generateModulesHtml(projects)}
        </main>
        ${generateFloatingNav(projects)}
        <script>
            ${getScriptContent()}
        </script>
    </body>
    </html>
  `;
}

export async function generateZip(projects: Project[], handbookTitle: string) {
    const zip = new JSZip();
    const cleanTitle = handbookTitle.toLowerCase().replace(/\\s+/g, '-') || 'apostila';

    const htmlContent = generateHtmlContent(projects, handbookTitle);
    zip.file('index.html', htmlContent);
    zip.file('README.md', 'Para usar esta apostila offline, extraia o conteúdo deste ZIP e abra o arquivo index.html em seu navegador.');
    
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${cleanTitle}.zip`);
}
