
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
                    const isCorrect = option.isCorrect ? ' (Correta)' : '';
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
                const isCorrect = option.isCorrect;
                return `<div class="quiz-option ${isCorrect ? 'correct' : ''}">${isCorrect ? '✔' : '☐'} ${option.text}</div>`;
            }).join('') || '';

            return `
                <div class="block block-quiz">
                    <p class="quiz-question">${block.content.question || ''}</p>
                    <div class="quiz-options">${optionsHtml}</div>
                </div>
            `;
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


function generateHtml(projects: Project[]): string {
    const modulesHtml = generateModulesHtml(projects);
    const mainTitle = "Apostila Interativa";
    const floatingNavHtml = generateFloatingNav(projects);
    
    return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${mainTitle}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="main-header">
        <h1>${projects.length > 0 ? projects[0].title : mainTitle}</h1>
        <div class="header-nav">
             <!-- Accessibility buttons here -->
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
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    background-color: var(--background-color);
    color: var(--text-color);
    margin: 0;
    padding-top: var(--header-height);
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

.main-header h1 {
    margin: 0;
    font-size: 1.5rem;
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

.quiz-question { font-weight: bold; margin-bottom: 0.5rem; }
.quiz-option.correct { font-weight: bold; color: #16a34a; }

.module-navigation {
    text-align: center;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid #e5e7eb;
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

#floating-nav-menu {
    position: fixed;
    top: calc(var(--header-height) + 85px);
    right: 20px;
    background-color: white;
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
    background-color: #f0f0f0;
}

#floating-nav-menu li a.active {
    background-color: var(--primary-color);
    color: white;
    font-weight: bold;
}


@media (max-width: 768px) {
    body {
        padding-top: 60px;
    }
    .main-header {
        height: 60px;
        padding: 0.75rem 1rem;
    }
    .main-header h1 {
        font-size: 1.2rem;
    }
    main {
        margin: 1rem;
        padding: 1.5rem;
    }
    #floating-nav-button {
      top: 80px;
    }
    #floating-nav-menu {
      top: 145px;
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
