
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Project, Block } from './types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function generatePdfHtmlForProject(project: Project): string {
    const blocksHtml = project.blocks.map(block => {
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
                 return `<div class="block block-quote"><p>${block.content.text || ''}</p></div>`;
            case 'quiz':
                const optionsHtml = block.content.options?.map(option => {
                    const isCorrect = option.isCorrect ? '<span style="color: green; font-weight: bold;"> (Correta)</span>' : '';
                    return `<div>- ${option.text}${isCorrect}</div>`;
                }).join('') || '';
                return `<div class="block block-quiz"><p><strong>${block.content.question || ''}</strong></p>${optionsHtml}</div>`;
            default:
                return '';
        }
    }).join('');

    return `
        <div class="pdf-page">
            <h1>${project.title}</h1>
            ${blocksHtml}
        </div>
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

    for (const project of projects) {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '794px'; // A4 width in pixels at 96dpi
        tempDiv.style.padding = '20px';
        tempDiv.innerHTML = generatePdfHtmlForProject(project);
        document.body.appendChild(tempDiv);
        
        const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            logging: true,
            onclone: (clonedDoc) => {
                const tempDivClone = clonedDoc.querySelector('div');
                if (tempDivClone) {
                    // You might want to apply specific styles for PDF rendering here
                }
            }
        });

        document.body.removeChild(tempDiv);

        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        let heightLeft = pdfHeight;
        let position = 0;

        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= doc.internal.pageSize.getHeight();

        while (heightLeft >= 0) {
            position = heightLeft - pdfHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= doc.internal.pageSize.getHeight();
        }
    }

    doc.deletePage(1); // remove the initial blank page
    const mainTitle = projects.length > 0 ? projects[0].title : 'apostila';
    doc.save(`${mainTitle}.pdf`);
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
            // Videos are interactive and won't be included in PDF/ZIP
            return '';
        case 'button':
            // Buttons are interactive and won't be included in PDF/ZIP
            return '';
        case 'quiz':
            const optionsHtml = block.content.options?.map(option => {
                const isCorrect = option.isCorrect ? ' (Correta)' : '';
                return `<div>- ${option.text}${isCorrect}</div>`;
            }).join('') || '';
            return `<div class="block block-quiz"><p><strong>${block.content.question || ''}</strong></p>${optionsHtml}</div>`;
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

    // PDF
    document.getElementById('btn-pdf').addEventListener('click', () => window.print());

    // Font Size
    let tamanhoFonte = parseInt(localStorage.getItem('tamanhoFonte')) || 16;
    document.documentElement.style.fontSize = tamanhoFonte + 'px';

    document.getElementById('btn-fonte-mais').addEventListener('click', () => {
        tamanhoFonte = Math.min(tamanhoFonte + 2, 24);
        document.documentElement.style.fontSize = tamanhoFonte + 'px';
        localStorage.setItem('tamanhoFonte', tamanhoFonte);
    });

    document.getElementById('btn-fonte-menos').addEventListener('click', () => {
        tamanhoFonte = Math.max(tamanhoFonte - 2, 12);
        document.documentElement.style.fontSize = tamanhoFonte + 'px';
        localStorage.setItem('tamanhoFonte', tamanhoFonte);
    });

    // Contrast
    const btnContraste = document.getElementById('btn-contraste');
    if (localStorage.getItem('altoContraste') === 'true') {
        document.body.classList.add('alto-contraste');
    }
    btnContraste.addEventListener('click', () => {
        document.body.classList.toggle('alto-contraste');
        localStorage.setItem('altoContraste', document.body.classList.contains('alto-contraste'));
    });

    // Dark Mode
    const btnModoEscuro = document.getElementById('btn-modo-escuro');
    const iconeModo = btnModoEscuro.querySelector('.material-icons');
    if (localStorage.getItem('modoEscuro') === 'true') {
        document.body.classList.add('modo-escuro');
        iconeModo.textContent = 'light_mode';
    }
    btnModoEscuro.addEventListener('click', function() {
        document.body.classList.toggle('modo-escuro');
        const isModoEscuro = document.body.classList.contains('modo-escuro');
        localStorage.setItem('modoEscuro', isModoEscuro);
        iconeModo.textContent = isModoEscuro ? 'light_mode' : 'dark_mode';
    });

    // Audio
    const btnAudio = document.getElementById('btn-audio');
    const iconeAudio = btnAudio.querySelector('.material-icons');
    let audioAtivo = localStorage.getItem('audioAtivo') !== 'false';
    iconeAudio.textContent = audioAtivo ? 'volume_up' : 'volume_off';
    btnAudio.addEventListener('click', function() {
        audioAtivo = !audioAtivo;
        localStorage.setItem('audioAtivo', audioAtivo);
        iconeAudio.textContent = audioAtivo ? 'volume_up' : 'volume_off';
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
});
    `;
}

function generateModulesHtml(projects: Project[]): string {
    return projects.map((project, index) => `
        <section id="modulo-${index}" class="modulo">
            <div class="module-content">
                <h1 class="module-title-header">${project.title}</h1>
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
        <div id="floating-nav-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        </div>
        <div id="floating-nav-menu">
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
    const modulesHtml = generateModulesHtml(projects);
    const mainTitle = "Apostila Interativa";
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
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="main-header">
        <h1>${projects.length > 0 ? projects[0].title : mainTitle}</h1>
        ${headerNavHtml}
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
}

/* Dark Mode Styles */
body.modo-escuro {
    --background-color: #121212;
    --text-color: #E0E0E0;
    --card-background: #1e1e1e;
    --primary-color: #60A5FA;
    --primary-color-dark: #3B82F6;
}

/* High Contrast Styles */
body.alto-contraste {
    --background-color: #000;
    --text-color: #FFFF00;
    --card-background: #000;
    --primary-color: #FFFF00;
    --primary-color-dark: #FFFF00;
}
body.alto-contraste .main-header {
    background-color: #000;
    color: #FFFF00;
    border-bottom: 2px solid #FFFF00;
}
body.alto-contraste .btn-acessibilidade {
    background-color: #FFFF00;
    color: #000;
}
body.alto-contraste a { color: #FFFF00; }


body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    height: var(--header-height);
    background-color: rgba(37, 99, 235, 0.9);
    color: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 1000;
    backdrop-filter: blur(5px);
}
body.modo-escuro .main-header {
     background-color: rgba(29, 78, 216, 0.9);
}


.main-header h1 {
    margin: 0;
    font-size: 1.5rem;
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
    border: 1px solid white;
    border-radius: 6px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.3s, color 0.3s;
}

.btn-acessibilidade:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

.btn-acessibilidade .material-icons {
    font-size: 20px;
}


main {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background-color: var(--card-background);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.modulo { display: none; }
.module-title-header { color: var(--primary-color); }
.block { margin-bottom: 2.5rem; }

img { max-width: 100%; height: auto; border-radius: 6px; }

.block-image { text-align: center; }

.block-quote {
    position: relative;
    padding: 1.5rem 1.5rem 1.5rem 2.5rem;
    background-color: #f0f4ff;
    border-left: 4px solid var(--primary-color);
    border-radius: 4px;
    font-style: italic;
}
body.modo-escuro .block-quote {
    background-color: rgba(96, 165, 250, 0.1);
    border-left-color: var(--primary-color);
}

.quiz-question { font-weight: bold; margin-bottom: 0.5rem; }
.quiz-option.correct { font-weight: bold; color: #16a34a; }

.module-navigation {
    text-align: center;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid #e5e7eb;
}
body.modo-escuro .module-navigation {
    border-top-color: #374151;
}

.btn {
    background-color: var(--primary-color);
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    margin: 0 0.5rem;
    transition: background-color 0.2s;
}
body.alto-contraste .btn { color: #000; }


.btn:hover {
    background-color: var(--primary-color-dark);
}

#floating-nav-button {
    position: fixed;
    top: calc(var(--header-height) + 20px);
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
body.alto-contraste #floating-nav-button { color: #000; }

#floating-nav-menu {
    position: fixed;
    top: calc(var(--header-height) + 85px);
    right: 20px;
    background-color: var(--card-background);
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: opacity 0.2s, visibility 0.2s, transform 0.2s;
    min-width: 250px;
    max-height: 300px;
    overflow-y: auto;
}
body.modo-escuro #floating-nav-menu { border-color: #374151; }

#floating-nav-menu.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

#floating-nav-menu ul {
    list-style: none;
    padding: 0.5rem;
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
    background-color: rgba(0,0,0,0.05);
}
body.modo-escuro #floating-nav-menu li a:hover {
     background-color: rgba(255,255,255,0.1);
}

#floating-nav-menu li a.active {
    background-color: var(--primary-color);
    color: white;
    font-weight: bold;
}
body.alto-contraste #floating-nav-menu li a.active { color: #000; }


@media (max-width: 768px) {
    body {
        padding-top: 60px;
    }
    .main-header {
        height: auto;
        padding: 0.75rem 1rem;
        flex-direction: column;
        gap: 10px;
    }
    .main-header h1 {
        font-size: 1.2rem;
    }
    .header-nav {
        flex-wrap: wrap;
        justify-content: center;
    }
    .btn-acessibilidade span {
        display: none; /* Hide text on mobile for cleaner look */
    }
    main {
        margin: 1rem;
        padding: 1.5rem;
    }
    #floating-nav-button {
      top: 150px;
    }
    #floating-nav-menu {
      top: 215px;
      right: 10px;
      left: 10px;
      width: auto;
    }
}
@media print {
    body {
        padding-top: 0;
        background-color: #fff;
        color: #000;
    }
    .main-header, .module-navigation, #floating-nav-button, #floating-nav-menu, .btn-acessibilidade {
        display: none !important;
    }
    main {
        margin: 0;
        padding: 0;
        box-shadow: none;
    }
    .modulo {
        display: block !important; /* Show all modules for printing */
        page-break-after: always;
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
