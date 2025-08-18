
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Project, Block } from './types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function generatePdfHtmlForProject(project: Project): string {
    const blocksHtml = project.blocks.map(block => {
        switch (block.type) {
            case 'text':
                return `<div class="block block-text" style="margin-bottom: 20px; page-break-inside: avoid;">${block.content.text || ''}</div>`;
            case 'image':
                return `
                    <div class="block block-image-pdf" style="margin-bottom: 20px; padding: 10px; border: 1px solid #eee; border-radius: 4px; page-break-inside: avoid;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">Imagem</p>
                        <div style="display: flex; justify-content: center; padding: 10px 0;">
                           <img src="${block.content.url || ''}" alt="${block.content.alt || ''}" style="max-width: 90%; height: auto; display: block; border-radius: 6px;" />
                        </div>
                        ${block.content.caption ? `<p style="margin: 5px 0 0 0; text-align: center; font-style: italic; color: #555;"><strong>Legenda:</strong> ${block.content.caption}</p>` : ''}
                        <p style="margin: 5px 0 0 0; font-size: 0.8rem; color: #777;"><strong>Fonte (URL):</strong> <a href="${block.content.url || '#'}">${block.content.url || 'N/A'}</a></p>
                        <p style="margin: 5px 0 0 0; font-size: 0.8rem; color: #777;"><strong>Texto Alternativo:</strong> ${block.content.alt || 'N/A'}</p>
                    </div>
                `;
            case 'video':
                if (!block.content.videoUrl) return '';
                return `
                    <div class="block block-video-pdf" style="margin-bottom: 20px; padding: 10px; border: 1px solid #eee; border-radius: 4px; page-break-inside: avoid;">
                        <p style="margin:0;"><strong>Vídeo:</strong> <a href="${block.content.videoUrl}" target="_blank" rel="noopener noreferrer">Assistir ao vídeo em ${block.content.videoUrl}</a></p>
                    </div>
                `;
            case 'button':
                 if (!block.content.buttonText || !block.content.buttonUrl) return '';
                 return `
                    <div class="block block-button-pdf" style="margin-bottom: 20px; padding: 10px; border: 1px solid #eee; border-radius: 4px; page-break-inside: avoid;">
                        <p style="margin:0;"><strong>Botão:</strong> "${block.content.buttonText}" <br/> <strong>Link:</strong> <a href="${block.content.buttonUrl}" target="_blank" rel="noopener noreferrer">${block.content.buttonUrl}</a></p>
                    </div>
                 `;
            case 'quote':
                 return `<blockquote class="block block-quote" style="margin-bottom: 20px; border-left: 4px solid #ccc; padding-left: 15px; font-style: italic; page-break-inside: avoid;"><p>${block.content.text || ''}</p></blockquote>`;
            case 'quiz':
                const optionsHtml = block.content.options?.map(option => {
                    const isCorrect = option.isCorrect ? '<span style="color: green; font-weight: bold;"> (Correta ✔)</span>' : '';
                    return `<li style="list-style-type: none; margin-bottom: 5px;">- ${option.text}${isCorrect}</li>`;
                }).join('') || '';
                return `
                  <div class="block block-quiz-pdf" style="margin-bottom: 20px; padding: 10px; border: 1px solid #eee; border-radius: 4px; page-break-inside: avoid;">
                    <p style="margin:0 0 10px 0;"><strong>Quiz: ${block.content.question || ''}</strong></p>
                    <ul style="margin:0; padding-left: 10px;">${optionsHtml}</ul>
                  </div>`;
            default:
                return '';
        }
    }).join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <style>
              body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.6; }
              .pdf-content { padding: 20px; }
              h1 { color: #000; font-size: 28px; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px;}
              p { margin-bottom: 10px; color: #333; }
              a { color: #007bff; text-decoration: none; }
              a:hover { text-decoration: underline; }
              .prose { max-width: none; }
              .prose h1, .prose h2, .prose h3 { margin-top: 1.5em; margin-bottom: 0.5em; }
          </style>
      </head>
      <body>
          <div class="pdf-content prose">
              <h1>${project.title}</h1>
              <p style="font-size: 14px; margin-bottom: 20px; color: #555;">${project.description}</p>
              ${blocksHtml}
          </div>
      </body>
      </html>
    `;
}


export async function exportToPdf(projects: Project[]) {
    if (!projects || projects.length === 0) {
        alert("Nenhum projeto para exportar para PDF.");
        return;
    }

    const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
    });

    const project = projects[0]; 
    const htmlContent = generatePdfHtmlForProject(project);

    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '600px'; 
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);
    
    const contentElement = tempDiv.querySelector('.pdf-content');
    if (!contentElement) {
        document.body.removeChild(tempDiv);
        alert("Erro ao encontrar conteúdo para gerar o PDF.");
        return;
    }
    
    try {
        await doc.html(contentElement as HTMLElement, {
            callback: function (doc) {
                const mainTitle = project.title || 'apostila';
                doc.save(`${mainTitle}.pdf`);
            },
            x: 15,
            y: 15,
            width: 565, // A4 width in points (595) minus margins
            windowWidth: 600,
            autoPaging: 'text'
        });
    } catch(e) {
        console.error("Erro ao gerar PDF", e);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.")
    } finally {
        document.body.removeChild(tempDiv);
    }
}


function renderBlockToHtml(block: Block): string {
    switch (block.type) {
        case 'text':
            return `<div class="block block-text">${block.content.text || ''}</div>`;
        case 'image':
            const width = block.content.width ?? 100;
            return `
                <div class="block block-image" style="display: flex; justify-content: center;">
                    <figure style="width: ${width}%;">
                        <img src="${block.content.url || ''}" alt="${block.content.alt || ''}" style="max-width: 100%; height: auto; display: block; border-radius: 6px;" />
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
             if (!block.content.videoUrl) return '';
                try {
                    const urlObj = new URL(block.content.videoUrl);
                    let videoId = urlObj.searchParams.get('v');
                    if (urlObj.hostname === 'youtu.be') {
                        videoId = urlObj.pathname.substring(1);
                    }
                    if (!videoId) return `<div class="block-video-invalid">URL do YouTube inválida.</div>`;

                    return `
                        <div class="block block-video">
                            <iframe
                                src="https://www.youtube.com/embed/${videoId}"
                                title="YouTube video player"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                            ></iframe>
                        </div>
                    `;
                } catch (e) {
                    return `<div class="block-video-invalid">URL do vídeo inválida.</div>`;
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
            const optionsHtml = block.content.options?.map(option => `
                <div class="quiz-option" data-correct="${option.isCorrect}">
                    <div class="radio-button"></div>
                    <span>${option.text}</span>
                </div>
            `).join('') || '';
            return `
                <div class="block block-quiz">
                    <p class="quiz-question">${block.content.question || ''}</p>
                    <div class="quiz-options-container">${optionsHtml}</div>
                    <div class="quiz-feedback"></div>
                    <button class="btn quiz-retry-btn" style="display:none;">Tentar Novamente</button>
                </div>`;
        default:
            return '';
    }
}


function generateZipScript(projects: Project[]): string {
    return `
document.addEventListener('DOMContentLoaded', () => {
    let currentModuleIndex = 0;
    const modules = document.querySelectorAll('.modulo');
    const floatingNavButton = document.getElementById('floating-nav-button');
    const floatingNavMenu = document.getElementById('floating-nav-menu');
    const moduleLinks = document.querySelectorAll('.module-link');

    function showModule(index) {
        modules.forEach((module, i) => {
            module.style.display = i === index ? 'block' : 'none';
        });
        currentModuleIndex = index;
        updateNavButtons();
        updateActiveModuleLink();
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
    
    // --- Quiz Logic ---
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
                    
                    // Highlight the correct answer
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
    
    // --- Accessibility Buttons ---
    const loadPreferences = () => {
        // Font Size
        let tamanhoFonte = parseInt(localStorage.getItem('tamanhoFonte')) || 16;
        document.documentElement.style.fontSize = tamanhoFonte + 'px';

        // Contrast
        if (localStorage.getItem('altoContraste') === 'true') {
            document.body.classList.add('alto-contraste');
        }

        // Dark Mode
        const btnModoEscuro = document.getElementById('btn-modo-escuro');
        const iconeModo = btnModoEscuro.querySelector('.material-icons');
        if (localStorage.getItem('modoEscuro') === 'true') {
            document.body.classList.add('modo-escuro');
            iconeModo.textContent = 'light_mode';
        }

        // Audio
        const btnAudio = document.getElementById('btn-audio');
        const iconeAudio = btnAudio.querySelector('.material-icons');
        let audioAtivo = localStorage.getItem('audioAtivo') !== 'false';
        iconeAudio.textContent = audioAtivo ? 'volume_up' : 'volume_off';

    };


    // PDF
    document.getElementById('btn-pdf').addEventListener('click', () => window.print());

    // Font Size
    document.getElementById('btn-fonte-mais').addEventListener('click', () => {
        let tamanhoFonte = parseInt(window.getComputedStyle(document.documentElement).fontSize);
        tamanhoFonte = Math.min(tamanhoFonte + 2, 24);
        document.documentElement.style.fontSize = tamanhoFonte + 'px';
        localStorage.setItem('tamanhoFonte', tamanhoFonte);
    });

    document.getElementById('btn-fonte-menos').addEventListener('click', () => {
        let tamanhoFonte = parseInt(window.getComputedStyle(document.documentElement).fontSize);
        tamanhoFonte = Math.max(tamanhoFonte - 2, 12);
        document.documentElement.style.fontSize = tamanhoFonte + 'px';
        localStorage.setItem('tamanhoFonte', tamanhoFonte);
    });

    // Contrast
    document.getElementById('btn-contraste').addEventListener('click', () => {
        document.body.classList.toggle('alto-contraste');
        localStorage.setItem('altoContraste', document.body.classList.contains('alto-contraste'));
    });

    // Dark Mode
    document.getElementById('btn-modo-escuro').addEventListener('click', function() {
        document.body.classList.toggle('modo-escuro');
        const isModoEscuro = document.body.classList.contains('modo-escuro');
        localStorage.setItem('modoEscuro', isModoEscuro);
        this.querySelector('.material-icons').textContent = isModoEscuro ? 'light_mode' : 'dark_mode';
    });

    // Audio
    document.getElementById('btn-audio').addEventListener('click', function() {
        let audioAtivo = localStorage.getItem('audioAtivo') !== 'false';
        audioAtivo = !audioAtivo;
        localStorage.setItem('audioAtivo', audioAtivo);
        this.querySelector('.material-icons').textContent = audioAtivo ? 'volume_up' : 'volume_off';
        // You would need to add logic here to actually mute/unmute audio elements if you add any.
    });


    // --- Floating Nav ---
    floatingNavButton.addEventListener('click', (event) => {
        event.stopPropagation();
        floatingNavMenu.classList.toggle('show');
    });

    document.addEventListener('click', (event) => {
        if (!floatingNavMenu.contains(event.target) && !floatingNavButton.contains(event.target)) {
            floatingNavMenu.classList.remove('show');
        }
    });

    moduleLinks.forEach((link, i) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showModule(i);
            floatingNavMenu.classList.remove('show');
        });
    });

    showModule(0);
    loadPreferences();
});
    `;
}

function generateModulesHtml(projects: Project[], mainTitle: string): string {
    return projects.map((project, index) => `
        <section id="modulo-${index}" class="modulo">
            <div class="module-content">
                <h2 class="module-main-title">${mainTitle}</h2>
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
             <button class="btn-acessibilidade" id="btn-pdf" title="Exportar como PDF">
                <i class="material-icons">picture_as_pdf</i>
                <span>PDF</span>
            </button>
            <button class="btn-acessibilidade" id="btn-fonte-mais" title="Aumentar fonte">
                <i class="material-icons">text_increase</i>
                <span>A+</span>
            </button>
            <button class="btn-acessibilidade" id="btn-fonte-menos" title="Diminuir fonte">
                <i class="material-icons">text_decrease</i>
                <span>A-</span>
            </button>
            <button class="btn-acessibilidade" id="btn-contraste" title="Alto contraste">
                <i class="material-icons">contrast</i>
                <span>Contraste</span>
            </button>
            <button class="btn-acessibilidade" id="btn-modo-escuro" title="Modo escuro/claro">
                <i class="material-icons">dark_mode</i>
                <span>Escuro</span>
            </button>
            <button class="btn-acessibilidade" id="btn-audio" title="Ativar/desativar áudio">
                <i class="material-icons">volume_up</i>
                <span>Áudio</span>
            </button>
        </div>
    `;
}

function generateHtml(projects: Project[]): string {
    const mainTitle = "Apostila Interativa";
    const modulesHtml = generateModulesHtml(projects, mainTitle);
    const floatingNavHtml = generateFloatingNav(projects);
    const headerNavHtml = generateHeaderNavHtml();
    
    return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${mainTitle}</title>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="main-header">
        <div class="header-container">
            <h1 class="main-title">${mainTitle}</h1>
            ${headerNavHtml}
        </div>
    </header>
    <main>
        ${modulesHtml}
    </main>
    ${floatingNavHtml}
    <script src="script.js"></script>
</body>
</html>
    `;
}

function generateCss(): string {
    return `
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

/* Dark Mode Styles */
body.modo-escuro {
    --background-color: #111827;
    --text-color: #E5E7EB;
    --card-background: #1F2937;
    --primary-color: #60A5FA;
    --primary-color-dark: #3B82F6;
    --border-color: #374151;
}

/* High Contrast Styles */
body.alto-contraste {
    --background-color: #000;
    --text-color: #FFFF00;
    --card-background: #000;
    --primary-color: #FFFF00;
    --primary-color-dark: #FFFF00;
    --border-color: #FFFF00;
}
body.alto-contraste .main-header {
    background: #000;
    color: #FFFF00;
    border-bottom: 2px solid #FFFF00;
}
body.alto-contraste .btn-acessibilidade {
    background-color: #FFFF00;
    color: #000;
    border-color: #000;
}
body.alto-contraste a { color: #FFFF00; }
body.alto-contraste .btn { color: #000; }
body.alto-contraste #floating-nav-button { color: #000; }
body.alto-contraste #floating-nav-menu li a.active { color: #000; }


* {
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

body {
    font-family: var(--font-family);
    line-height: 1.6;
    background-color: var(--background-color);
    color: var(--text-color);
    margin: 0;
    padding-top: var(--header-height);
    transition: background-color 0.3s, color 0.3s;
}

.main-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: var(--header-height);
    background: var(--primary-color);
    color: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 1000;
    border-bottom: 1px solid rgba(0,0,0,0.1);
}

.header-container {
    max-width: 1200px;
    height: 100%;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.main-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
}

.header-nav {
    display: flex;
    gap: 8px;
}

.btn-acessibilidade {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: transparent;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    padding: 8px 14px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease-in-out;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.btn-acessibilidade:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.btn-acessibilidade:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
}

.btn-acessibilidade .material-icons {
    font-size: 20px;
}

main {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
}
.modulo { 
    display: none; 
    background-color: var(--card-background);
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    padding: 2rem 3rem;
    border: 1px solid var(--border-color);
}
body.modo-escuro .modulo {
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.module-main-title {
    font-size: 1rem;
    font-weight: 500;
    color: var(--primary-color);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0;
}
.module-title-header { 
    color: var(--text-color); 
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0.25rem 0 0 0;
}
.divider {
    height: 1px;
    background-color: var(--border-color);
    margin: 1.5rem 0;
}

.block { margin-bottom: 2.5rem; }

img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

.block-image { text-align: center; }
.block-image figcaption {
    font-size: 0.9rem;
    color: var(--text-color);
    opacity: 0.7;
    margin-top: 0.5rem;
}

.block-quote {
    position: relative;
    padding: 1.5rem;
    background-color: var(--background-color);
    border-left: 4px solid var(--primary-color);
    border-radius: 4px;
    font-style: italic;
    font-size: 1.1rem;
}
body.modo-escuro .block-quote {
    background-color: rgba(96, 165, 250, 0.1);
    border-left-color: var(--primary-color);
}
.block-video {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    height: 0;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.block-video iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
.block-button {
    text-align: center;
}
.btn-block {
    display: inline-block;
    background-color: var(--primary-color);
    color: white;
    padding: 0.8rem 2rem;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s ease-in-out;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.btn-block:hover {
    background-color: var(--primary-color-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

/* Quiz Styles */
.block-quiz {
    padding: 1.5rem;
    background: var(--background-color);
    border-radius: 8px;
    border: 1px solid var(--border-color);
}
.quiz-question {
    font-weight: bold;
    font-size: 1.1rem;
    margin-top: 0;
}
.quiz-option {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    margin: 0.5rem 0;
    background: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}
.quiz-option:not(.answered):hover {
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: white;
}
.quiz-option .radio-button {
    width: 18px;
    height: 18px;
    border: 2px solid var(--border-color);
    border-radius: 50%;
    margin-right: 12px;
    flex-shrink: 0;
    transition: all 0.2s ease-in-out;
}
.quiz-option:hover .radio-button {
    border-color: white;
}
.quiz-option.correct .radio-button, .quiz-option.incorrect .radio-button {
    border-width: 6px;
}
.quiz-option.answered {
    cursor: default;
    opacity: 0.8;
}
.quiz-option.correct {
    border-color: #16A34A;
    background: #F0FDF4;
    opacity: 1;
}
.quiz-option.correct .radio-button { border-color: #16A34A; }
.quiz-option.incorrect {
    border-color: #DC2626;
    background: #FEF2F2;
    opacity: 1;
}
.quiz-option.incorrect .radio-button { border-color: #DC2626; }
.quiz-feedback {
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: 6px;
    font-weight: bold;
    display: none;
}
.quiz-feedback.correct { color: #15803D; background: #DCFCE7; }
.quiz-feedback.incorrect { color: #B91C1C; background: #FEE2E2; }
.quiz-retry-btn { margin-top: 1rem; }

.module-navigation {
    text-align: center;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color);
}
body.modo-escuro .module-navigation {
    border-top-color: #374151;
}

.btn {
    background-color: var(--primary-color);
    color: white;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    margin: 0 0.5rem;
    transition: all 0.2s ease-in-out;
    font-size: 1rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.btn:hover {
    background-color: var(--primary-color-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
.btn.nav-anterior {
    background-color: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-color);
}
.btn.nav-anterior:hover {
    background-color: var(--background-color);
    border-color: var(--text-color);
    color: var(--text-color);
}
body.alto-contraste .btn.nav-anterior {
    color: #FFFF00;
    border-color: #FFFF00;
}


#floating-nav-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    background-color: var(--primary-color);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    cursor: pointer;
    z-index: 1001;
    transition: background-color 0.2s, transform 0.2s;
}
#floating-nav-button:hover {
    background-color: var(--primary-color-dark);
    transform: scale(1.05);
}

#floating-nav-menu {
    position: fixed;
    bottom: 85px;
    right: 20px;
    background-color: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);
    transition: opacity 0.2s, visibility 0.2s, transform 0.2s;
    min-width: 250px;
    max-height: 300px;
    overflow-y: auto;
    padding: 0.5rem;
}

#floating-nav-menu.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

#floating-nav-menu p {
    padding: 0.5rem 1rem;
    margin: 0;
    font-weight: bold;
    font-size: 0.9rem;
    color: var(--text-color);
    opacity: 0.7;
}

#floating-nav-menu ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

#floating-nav-menu li a {
    display: block;
    padding: 0.75rem 1rem;
    color: var(--text-color);
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.2s;
}

#floating-nav-menu li a:hover {
    background-color: var(--background-color);
}
body.modo-escuro #floating-nav-menu li a:hover {
     background-color: rgba(255,255,255,0.1);
}

#floating-nav-menu li a.active {
    background-color: var(--primary-color);
    color: white;
    font-weight: bold;
}


@media (max-width: 768px) {
    body {
        padding-top: 120px; /* Adjust for taller header */
    }
    .header-container {
        flex-direction: column;
        justify-content: center;
        gap: 15px;
        padding: 1rem;
    }
    .main-header {
        height: auto;
    }
    .main-title {
        font-size: 1.2rem;
    }
    .header-nav {
        transform: scale(0.9);
        gap: 5px;
    }
    main {
        margin: 1rem auto;
        padding: 1rem;
    }
    .modulo {
        padding: 1.5rem;
    }
    .module-title-header {
        font-size: 1.8rem;
    }
}
@media print {
    body {
        padding-top: 0;
        background-color: #fff;
        color: #000;
    }
    .main-header, .module-navigation, #floating-nav-button, #floating-nav-menu {
        display: none !important;
    }
    main {
        margin: 0;
        padding: 0;
        box-shadow: none;
        max-width: 100%;
    }
    .modulo {
        display: block !important; /* Show all modules for printing */
        page-break-after: always;
        box-shadow: none;
        border-radius: 0;
    }
    .block-quote {
        background-color: #f0f4ff;
    }
}
    `;
}


export async function exportToZip(projects: Project[]) {
    const zip = new JSZip();

    zip.file('index.html', generateHtml(projects));
    zip.file('style.css', generateCss());
    zip.file('script.js', generateZipScript(projects));
    
    const content = await zip.generateAsync({ type: 'blob' });
    const fileName = `apostila-interativa.zip`;
    
    saveAs(content, fileName);
}
