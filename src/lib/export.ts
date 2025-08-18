
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Project, Block } from './types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function generatePdfHtmlForProject(project: Project): string {
    // This function can be improved to generate more styled HTML
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
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
    });

    const projectToExport = projects.length > 0 ? projects[0] : null;

    if (!projectToExport) {
        alert("Nenhum projeto para exportar para PDF.");
        return;
    }
    
    // Temporarily create an element to render for PDF generation
    const pdfRenderElement = document.createElement('div');
    pdfRenderElement.style.width = '210mm'; // A4 width
    pdfRenderElement.style.padding = '20mm';
    pdfRenderElement.innerHTML = generatePdfHtmlForProject(projectToExport);
    document.body.appendChild(pdfRenderElement);

    await html2canvas(pdfRenderElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: true,
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let position = 0;
        let heightLeft = pdfHeight;
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - pdfHeight;
          doc.addPage();
          doc.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }
    });
    
    document.body.removeChild(pdfRenderElement);
    
    const projectTitle = projectToExport.title || 'apostila';
    doc.save(`${projectTitle}.pdf`);
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


function generateZipScript(): string {
    // This script can be simplified as we are not using PDF generation inside the ZIP
    return `
document.addEventListener('DOMContentLoaded', () => {
    let currentModuleIndex = 0;
    const modules = document.querySelectorAll('.modulo');
    
    function showModule(index) {
        modules.forEach((module, i) => {
            module.style.display = i === index ? 'block' : 'none';
        });
        currentModuleIndex = index;
        updateNavButtons();
    }

    function updateNavButtons() {
        const prevButton = document.getElementById('nav-anterior');
        const nextButton = document.getElementById('nav-proximo');
        if (prevButton) prevButton.style.display = currentModuleIndex > 0 ? 'inline-block' : 'none';
        if (nextButton) nextButton.style.display = currentModuleIndex < modules.length - 1 ? 'inline-block' : 'none';
    }

    document.getElementById('nav-proximo').addEventListener('click', () => {
        if (currentModuleIndex < modules.length - 1) {
            showModule(currentModuleIndex + 1);
        }
    });

    document.getElementById('nav-anterior').addEventListener('click', () => {
        if (currentModuleIndex > 0) {
            showModule(currentModuleIndex - 1);
        }
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
                <button class="btn nav-btn" id="nav-anterior">Módulo Anterior</button>
                <button class="btn nav-btn" id="nav-proximo">Próximo Módulo</button>
            </div>
        </section>
    `).join('');
}


function generateHtml(projects: Project[]): string {
    const modulesHtml = generateModulesHtml(projects);
    const mainTitle = projects.length > 0 ? projects[0].title : 'Apostila Interativa';
    
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
        <h1>${mainTitle}</h1>
        <div class="header-nav">
             <button class="btn">PDF</button>
             <button class="btn">A+</button>
             <button class="btn">A-</button>
        </div>
    </header>
    <main>
        ${modulesHtml}
    </main>
    <script src="script.js"></script>
</body>
</html>
    `;
}

function generateCss(): string {
    // A simplified CSS for the ZIP export, focusing on content presentation.
    return `
:root {
    --primary-color: #2563EB;
    --background-color: #F4F5F7;
    --text-color: #111827;
    --card-background: #FFFFFF;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    background-color: var(--background-color);
    color: var(--text-color);
    margin: 0;
    padding-top: 80px; /* Space for fixed header */
}

.main-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
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

.header-nav {
    display: flex;
    gap: 0.5rem;
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
    background-color: #1D4ED8;
}

.header-nav .btn {
    background-color: rgba(255, 255, 255, 0.2);
}
.header-nav .btn:hover {
    background-color: rgba(255, 255, 255, 0.4);
}


.btn:disabled { background-color: #9ca3af; cursor: not-allowed; }

@media (max-width: 768px) {
    body {
        padding-top: 60px;
    }
    .main-header {
        flex-direction: column;
        padding: 0.75rem 1rem;
    }
    .main-header h1 {
        margin-bottom: 0.5rem;
        font-size: 1.2rem;
    }
    main {
        margin: 1rem;
        padding: 1.5rem;
    }
}
    `;
}


export async function exportToZip(projects: Project[]) {
    const zip = new JSZip();

    zip.file('index.html', generateHtml(projects));
    zip.file('style.css', generateCss());
    zip.file('script.js', generateZipScript());
    
    const content = await zip.generateAsync({ type: 'blob' });
    const fileName = `apostila-interativa.zip`;
    
    saveAs(content, fileName);
}
