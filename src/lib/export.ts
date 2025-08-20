
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
    const animationClass = 'class="animatable"';
    switch (block.type) {
        case 'text':
            return `<div ${animationClass}><div class="block block-text">${sanitizeHtml(block.content.text || '')}</div></div>`;
        case 'image':
             const imageUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT 
                ? `https://imagedelivery.net/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT}/${block.content.url}/public`
                : block.content.url;
            const width = block.content.width ?? 100;
            return `
                <div ${animationClass}>
                    <div class="block block-image" style="display: flex; justify-content: center;">
                        <figure style="width: ${width}%;">
                            <img src="${imageUrl || ''}" alt="${block.content.alt || ''}" style="max-width: 100%; height: auto; display: block; border-radius: 6px;" />
                            ${block.content.caption ? `<figcaption style="padding-top: 0.75rem; font-size: 0.9rem; color: #555; text-align: center;">${block.content.caption}</figcaption>` : ''}
                        </figure>
                    </div>
                </div>
            `;
        case 'quote':
             return `
                <div ${animationClass}>
                    <div class="block block-quote">
                        <p>${block.content.text || ''}</p>
                    </div>
                </div>
            `;
        case 'video':
            const { videoType, videoUrl, cloudflareVideoId, videoTitle, autoplay, showControls } = block.content;
            let embedHtml = '';

            if (videoType === 'cloudflare') {
                if (!cloudflareVideoId) return `<div class="block-video-invalid">ID do vídeo do Cloudflare não definido.</div>`;
                const src = `https://customer-mhnunnb897evy1sb.cloudflarestream.com/${cloudflareVideoId}/iframe?autoplay=${autoplay}&controls=${showControls}`;
                embedHtml = `
                    <iframe
                        src="${src}"
                        title="${videoTitle || 'Cloudflare video player'}"
                        frameborder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>`;
            } else { // Default to YouTube
                if (!videoUrl) return `<div class="block-video-invalid">URL do YouTube inválida.</div>`;
                try {
                    const urlObj = new URL(videoUrl);
                    let videoId = urlObj.searchParams.get('v');
                    if (urlObj.hostname === 'youtu.be') {
                        videoId = urlObj.pathname.substring(1);
                    }
                    if (!videoId) return `<div class="block-video-invalid">URL do YouTube inválida.</div>`;

                    const src = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&controls=${showControls ? 1 : 0}`;
                    embedHtml = `
                        <iframe
                            src="${src}"
                            title="${videoTitle || 'YouTube video player'}"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                        ></iframe>`;
                } catch (e) {
                    return `<div class="block-video-invalid">URL do vídeo inválida.</div>`;
                }
            }
             return `
                <div ${animationClass}>
                    <div class="block block-video">
                        ${embedHtml}
                    </div>
                </div>
            `;
        case 'button':
             return `
                <div ${animationClass}>
                    <div class="block block-button">
                        <a href="${block.content.buttonUrl || '#'}" class="btn-block" target="_blank" rel="noopener noreferrer">
                            ${block.content.buttonText || 'Botão'}
                        </a>
                    </div>
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
                <div ${animationClass}>
                    <div class="block block-quiz">
                        <p class="quiz-question">${block.content.question || ''}</p>
                        <div class="quiz-options-container">${optionsHtml}</div>
                        <div class="quiz-feedback"></div>
                        <button class="btn quiz-retry-btn" style="display:none;">Tentar Novamente</button>
                    </div>
                </div>`;
        default:
            return '';
    }
}


function generateZipScript(): string {
    return `
document.addEventListener('DOMContentLoaded', () => {
    let currentModuleIndex = 0;
    const modules = document.querySelectorAll('.modulo');
    const floatingNavButton = document.getElementById('floating-nav-button');
    const floatingNavMenu = document.getElementById('floating-nav-menu');
    const moduleLinks = document.querySelectorAll('.module-link');
    const pdfButton = document.getElementById('btn-pdf');
    const modal = document.getElementById('loading-modal');

    function showModule(index) {
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
    
    // --- PDF Generation ---
    pdfButton.addEventListener('click', async () => {
        modal.style.display = 'flex';

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: 'a4'
        });

        const allModules = Array.from(document.querySelectorAll('.pdf-module-page'));

        const imagePromises = [];
        allModules.forEach(moduleEl => {
            moduleEl.querySelectorAll('img').forEach(img => {
                const promise = fetch(img.src)
                    .then(response => {
                        if (!response.ok) {
                           throw new Error('Network response was not ok');
                        }
                        return response.blob();
                    })
                    .then(blob => new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            img.src = reader.result;
                            resolve();
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    }))
                    .catch(error => {
                        console.error('Error converting image to base64:', img.src, error);
                        const p = document.createElement('p');
                        p.innerText = '[Imagem não disponível]';
                        p.style.textAlign = 'center';
                        p.style.padding = '2rem';
                        p.style.color = '#888';
                        img.parentNode.replaceChild(p, img);
                    });
                imagePromises.push(promise);
            });
        });
        
        await Promise.all(imagePromises);
        
        for (let i = 0; i < allModules.length; i++) {
            const moduleEl = allModules[i];
            
            if (i > 0) {
              pdf.addPage();
            }

            try {
                const canvas = await html2canvas(moduleEl, {
                    scale: 2,
                    useCORS: false,
                    allowTaint: true,
                    logging: false,
                    width: moduleEl.scrollWidth,
                    height: moduleEl.scrollHeight,
                    windowWidth: moduleEl.scrollWidth,
                    windowHeight: moduleEl.scrollHeight,
                });
                
                const imgData = canvas.toDataURL('image/png', 0.95);
                if (!imgData || imgData === 'data:,') {
                    console.error('html2canvas returned an empty canvas. Skipping module ' + i);
                    pdf.text("Error rendering this module.", 20, 20);
                } else {
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const imgProps = pdf.getImageProperties(imgData);
                    const aspectRatio = imgProps.height / imgProps.width;
                    const imgHeight = pdfWidth * aspectRatio;
                    
                    let heightLeft = imgHeight;
                    let position = 0;

                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                    heightLeft -= pdfHeight;

                    while (heightLeft > 0) {
                      position -= pdfHeight;
                      pdf.addPage();
                      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                      heightLeft -= pdfHeight;
                    }
                }
            } catch(err) {
                 console.error("Error generating PDF part for module " + i + ":", err);
                 if (i > 0) pdf.addPage();
                 pdf.text("Error rendering content for this module.", 20, 20);
            }
        }
        
        pdf.output('dataurlnewwindow');
        modal.style.display = 'none';
    });

    // --- Accessibility Buttons ---
    const loadPreferences = () => {
        let tamanhoFonte = parseInt(localStorage.getItem('tamanhoFonte')) || 16;
        document.documentElement.style.fontSize = tamanhoFonte + 'px';
        if (localStorage.getItem('altoContraste') === 'true') {
            document.body.classList.add('alto-contraste');
        }
        const btnModoEscuro = document.getElementById('btn-modo-escuro');
        const iconeModo = btnModoEscuro.querySelector('.material-icons');
        if (localStorage.getItem('modoEscuro') === 'true') {
            document.body.classList.add('modo-escuro');
            iconeModo.textContent = 'light_mode';
        }
        let audioAtivo = localStorage.getItem('audioAtivo') !== 'false';
        document.getElementById('btn-audio').querySelector('.material-icons').textContent = audioAtivo ? 'volume_up' : 'volume_off';
    };

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

    document.getElementById('btn-contraste').addEventListener('click', () => {
        document.body.classList.toggle('alto-contraste');
        localStorage.setItem('altoContraste', document.body.classList.contains('alto-contraste'));
    });

    document.getElementById('btn-modo-escuro').addEventListener('click', function() {
        document.body.classList.toggle('modo-escuro');
        const isModoEscuro = document.body.classList.contains('modo-escuro');
        localStorage.setItem('modoEscuro', isModoEscuro);
        this.querySelector('.material-icons').textContent = isModoEscuro ? 'light_mode' : 'dark_mode';
    });

    document.getElementById('btn-audio').addEventListener('click', function() {
        let audioAtivo = localStorage.getItem('audioAtivo') !== 'false';
        audioAtivo = !audioAtivo;
        localStorage.setItem('audioAtivo', audioAtivo);
        this.querySelector('.material-icons').textContent = audioAtivo ? 'volume_up' : 'volume_off';
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

    // --- Scroll Reveal Animation ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.animatable').forEach(el => {
        observer.observe(el);
    });

    showModule(0);
    loadPreferences();
});
    `;
}

function generateModulesHtml(projects: Project[], mainTitle: string): string {
    return `
      <div id="apostila-completa">
        ${projects.map((project, index) => `
            <section id="modulo-${index}" class="modulo">
                <div class="module-content">
                    <h2 class="module-main-title animatable">${mainTitle}</h2>
                    <h1 class="module-title-header animatable">${project.title}</h1>
                    <div class="divider animatable"></div>
                    ${project.blocks.map(renderBlockToHtml).join('\n')}
                </div>
                 <div class="module-navigation animatable">
                    <button class="btn nav-anterior">Módulo Anterior</button>
                    <button class="btn nav-proximo">Próximo Módulo</button>
                </div>
            </section>
        `).join('')}
      </div>
    `;
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

function generateHtml(projects: Project[], handbookTitle: string): string {
    const modulesHtml = generateModulesHtml(projects, handbookTitle);
    const floatingNavHtml = generateFloatingNav(projects);
    const headerNavHtml = generateHeaderNavHtml();
    
    return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${handbookTitle}</title>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
</head>
<body>
    <div id="loading-modal" style="display: none;">
      <div class="modal-content">
        <div class="spinner"></div>
        <p>Gerando PDF, por favor aguarde...</p>
      </div>
    </div>
    <header class="main-header">
        <div class="header-container">
            <h1 class="main-title">${handbookTitle}</h1>
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
body.alto-contraste .main-header { background: #000; color: #FFFF00; border-bottom: 2px solid #FFFF00; }
body.alto-contraste .btn-acessibilidade { background-color: #FFFF00; color: #000; border-color: #000; }
body.alto-contraste a { color: #FFFF00; }
body.alto-contraste .btn { color: #000; }
body.alto-contraste #floating-nav-button { color: #000; }
body.alto-contraste #floating-nav-menu li a.active { color: #000; }

* { box-sizing: border-box; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

body {
    font-family: var(--font-family);
    line-height: 1.6;
    background-color: var(--background-color);
    color: var(--text-color);
    margin: 0;
    padding-top: var(--header-height);
    transition: background-color 0.3s, color 0.3s;
}

#loading-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}
.modal-content {
    background-color: white;
    color: #333;
    padding: 30px 40px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}
.modal-content p { font-size: 1.1rem; font-weight: 500; margin: 0; }
.spinner {
    border: 5px solid #f3f3f3;
    border-top: 5px solid var(--primary-color);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.main-header {
    position: fixed; top: 0; left: 0; width: 100%; height: var(--header-height);
    background: var(--primary-color); color: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 1000;
    border-bottom: 1px solid rgba(0,0,0,0.1);
}
.header-container { max-width: 1200px; height: 100%; margin: 0 auto; padding: 0 2rem; display: flex; justify-content: space-between; align-items: center; }
.main-title { margin: 0; font-size: 1.5rem; font-weight: 700; }
.header-nav { display: flex; gap: 8px; }

.btn-acessibilidade {
    display: flex; align-items: center; gap: 8px; background-color: transparent;
    color: white; border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 8px;
    padding: 8px 14px; cursor: pointer; font-size: 14px; font-weight: 500;
    transition: all 0.2s ease-in-out; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.btn-acessibilidade:hover { background-color: rgba(255, 255, 255, 0.2); transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
.btn-acessibilidade:focus-visible { outline: 2px solid white; outline-offset: 2px; }
.btn-acessibilidade .material-icons { font-size: 20px; }

main { max-width: 800px; margin: 2rem auto; padding: 0 2rem; }
.modulo { display: none; background-color: var(--card-background); border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 2rem 3rem; margin-bottom: 2rem; border: 1px solid var(--border-color); }
body.modo-escuro .modulo { box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
#apostila-completa .pdf-module-page { page-break-before: always; }
#apostila-completa .pdf-module-page:first-child { page-break-before: auto; }

h1, h2, h3, h4, h5, h6 { text-align: center; }
.module-main-title { font-size: 1rem; font-weight: 500; color: var(--primary-color); text-transform: uppercase; letter-spacing: 1px; margin: 0; text-align: center; }
.module-title-header { color: var(--text-color); font-size: 2.5rem; font-weight: 700; margin: 0.25rem 0 0 0; text-align: center; }
.divider { height: 1px; background-color: var(--border-color); margin: 1.5rem 0; }
.block { margin-bottom: 2.5rem; }
img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

.block-image { text-align: center; }
.block-image figcaption { font-size: 0.9rem; color: var(--text-color); opacity: 0.7; margin-top: 0.5rem; }

.block-quote { position: relative; padding: 1.5rem; background-color: var(--background-color); border-left: 4px solid var(--primary-color); border-radius: 4px; font-style: italic; font-size: 1.1rem; }
body.modo-escuro .block-quote { background-color: rgba(96, 165, 250, 0.1); border-left-color: var(--primary-color); }
.block-video { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.block-video iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.block-button { text-align: center; }
.btn-block {
    display: inline-block; background-color: var(--primary-color); color: white; padding: 0.8rem 2rem; border: none;
    border-radius: 8px; font-weight: bold; cursor: pointer; text-decoration: none;
    transition: all 0.2s ease-in-out; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.btn-block:hover { background-color: var(--primary-color-dark); transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.2); }

/* Quiz Styles */
.block-quiz { padding: 1.5rem; background: var(--background-color); border-radius: 8px; border: 1px solid var(--border-color); }
.quiz-question { font-weight: bold; font-size: 1.1rem; margin-top: 0; }
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
body.modo-escuro .module-navigation { border-top-color: #374151; }

.btn {
    background-color: var(--primary-color); color: white; padding: 0.8rem 1.5rem; border: none;
    border-radius: 8px; font-weight: bold; cursor: pointer; margin: 0 0.5rem;
    transition: all 0.2s ease-in-out; font-size: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.btn:hover { background-color: var(--primary-color-dark); transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
.btn.nav-anterior { background-color: transparent; border: 1px solid var(--border-color); color: var(--text-color); }
.btn.nav-anterior:hover { background-color: var(--background-color); border-color: var(--text-color); color: var(--text-color); }
body.alto-contraste .btn.nav-anterior { color: #FFFF00; border-color: #FFFF00; }

#floating-nav-button { position: fixed; bottom: 20px; right: 20px; width: 56px; height: 56px; background-color: var(--primary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2); cursor: pointer; z-index: 1001; transition: background-color 0.2s, transform 0.2s; }
#floating-nav-button:hover { background-color: var(--primary-color-dark); transform: scale(1.05); }
#floating-nav-menu { position: fixed; bottom: 85px; right: 20px; background-color: var(--card-background); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.15); z-index: 1000; opacity: 0; visibility: hidden; transform: translateY(10px); transition: opacity 0.2s, visibility 0.2s, transform 0.2s; min-width: 250px; max-height: 300px; overflow-y: auto; padding: 0.5rem; }
#floating-nav-menu.show { opacity: 1; visibility: visible; transform: translateY(0); }
#floating-nav-menu p { padding: 0.5rem 1rem; margin: 0; font-weight: bold; font-size: 0.9rem; color: var(--text-color); opacity: 0.7; }
#floating-nav-menu ul { list-style: none; padding: 0; margin: 0; }
#floating-nav-menu li a { display: block; padding: 0.75rem 1rem; color: var(--text-color); text-decoration: none; border-radius: 4px; transition: background-color 0.2s; }
#floating-nav-menu li a:hover { background-color: var(--background-color); }
body.modo-escuro #floating-nav-menu li a:hover { background-color: rgba(255,255,255,0.1); }
#floating-nav-menu li a.active { background-color: var(--primary-color); color: white; font-weight: bold; }

.animatable { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
.animatable.revealed { opacity: 1; transform: translateY(0); }

.pdf-video-placeholder {
    display: flex;
    align-items: center;
    gap: 1em;
    padding: 1rem;
    margin: 1.5rem 0;
    background-color: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    page-break-inside: avoid;
    text-align: left;
}
.pdf-video-placeholder a {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
}
.pdf-video-placeholder-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
}
.pdf-video-placeholder-text p {
    margin: 0;
    padding: 0;
}
.pdf-video-placeholder-text p.video-title {
    font-weight: bold;
    margin-bottom: 0.25em;
}

@media (max-width: 768px) {
    body { padding-top: 120px; }
    .header-container { flex-direction: column; justify-content: center; gap: 15px; padding: 1rem; }
    .main-header { height: auto; }
    .main-title { font-size: 1.2rem; }
    .header-nav { transform: scale(0.9); gap: 5px; }
    main { margin: 1rem auto; padding: 0 1rem; }
    .modulo { padding: 1.5rem; }
    .module-title-header { font-size: 1.8rem; }
}

@media print {
    @page { margin: 1.5cm; }
    body, #apostila-completa { padding-top: 0; background-color: #fff !important; color: #000 !important; }
    main { margin: 0; padding: 0; box-shadow: none; max-width: 100%; }
    .main-header, .module-navigation, #floating-nav-button, #floating-nav-menu { display: none !important; }
    .block-video { display: none; } /* Hide interactive video player */
    .pdf-video-placeholder { display: flex !important; } /* Show placeholder */
    .animatable { opacity: 1 !important; transform: translateY(0) !important; }
    .modulo { 
        display: block !important; 
        page-break-before: always; 
        box-shadow: none !important; 
        border-radius: 0 !important; 
        border: none !important; 
    }
    .modulo:first-of-type { page-break-before: auto; }
    .modulo:last-of-type { page-break-after: avoid; }
}
    `;
}

function getUrlFromBlock(block: Block): string {
    const { videoType, videoUrl, cloudflareVideoId } = block.content;
    if (videoType === 'cloudflare' && cloudflareVideoId) {
        return `https://customer-mhnunnb897evy1sb.cloudflarestream.com/${cloudflareVideoId}/watch`;
    }
    if (videoType === 'youtube' && videoUrl) {
        return videoUrl;
    }
    return '#';
}

function generatePdfHtmlForProject(projects: Project[], mainTitle: string): string {
    const renderBlockForPdf = (block: Block): string => {
        switch (block.type) {
            case 'video':
                const videoTitle = block.content.videoTitle || 'Vídeo';
                const videoUrl = getUrlFromBlock(block);
                return `
                    <div class="pdf-video-placeholder">
                         <div class="pdf-video-placeholder-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
                        </div>
                        <div class="pdf-video-placeholder-text">
                            <p class="video-title">${videoTitle}</p>
                            <p>Assista ao vídeo em: <a href="${videoUrl}" target="_blank">${videoUrl}</a></p>
                        </div>
                    </div>`;
            case 'quiz':
                 return `<div class="block-quiz-pdf" style="padding: 1rem; background-color: #f3f4f6; border-radius: 8px; text-align: center;"><strong>Quiz:</strong> ${block.content.question} (Interativo na versão web)</div>`;
            default:
                return renderBlockToHtml(block).replace(/class="animatable"/g, '');
        }
    };

    return `
        ${projects.map(project => `
            <div class="pdf-module-page" style="background-color: white; color: black; page-break-inside: avoid;">
                <h2 class="module-main-title" style="text-align: center;">${mainTitle}</h2>
                <h1 class="module-title-header" style="text-align: center;">${project.title}</h1>
                <div class="divider"></div>
                ${project.blocks.map(renderBlockForPdf).join('\n')}
            </div>
        `).join('')}
    `;
}


export async function exportToZip(projects: Project[], handbookTitle: string) {
    const zip = new JSZip();

    const pdfHtmlContent = generatePdfHtmlForProject(projects, handbookTitle);

    const mainHtmlContent = generateHtml(projects, handbookTitle)
      .replace(
        '</body>',
        `<div id="pdf-source" style="position: absolute; left: -9999px; top: 0; width: 800px;">${pdfHtmlContent}</div></body>`
      );


    zip.file('index.html', mainHtmlContent);
    zip.file('style.css', generateCss());
    zip.file('script.js', generateZipScript());
    
    const content = await zip.generateAsync({ type: 'blob' });
    const fileName = `apostila-interativa.zip`;
    
    saveAs(content, fileName);
}
