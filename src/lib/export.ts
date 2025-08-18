
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

    for (const project of projects) {
        const pageElement = document.getElementById(`preview-content`);
        if (!pageElement) continue;

        // Clone the element to avoid modifying the original
        const clonedElement = pageElement.cloneNode(true) as HTMLElement;

        // Temporarily append to the body to ensure styles are applied
        document.body.appendChild(clonedElement);

        // Remove interactive elements from the clone
        clonedElement.querySelectorAll('button').forEach(btn => btn.remove());
        
        await html2canvas(clonedElement, {
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
        
        document.body.removeChild(clonedElement);
    }
    
    const projectTitle = projects[0]?.title || 'apostila';
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
        document.getElementById('nav-anterior').disabled = currentModuleIndex === 0;
        document.getElementById('nav-proximo').disabled = currentModuleIndex === modules.length - 1;
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
    </header>
    <main>
        ${modulesHtml}
    </main>
    <div class="module-navigation">
        <button class="btn nav-btn" id="nav-anterior">Módulo Anterior</button>
        <button class="btn nav-btn" id="nav-proximo">Próximo Módulo</button>
    </div>
    <script src="script.js"></script>
</body>
</html>
    `;
}

function generateCss(): string {
    // A simplified CSS for the ZIP export, focusing on content presentation.
    return `
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    background-color: #f4f5f7;
    color: #333;
    margin: 0;
    padding: 0;
}
.main-header {
    background-color: white;
    padding: 1rem 2rem;
    border-bottom: 1px solid #e5e7eb;
    text-align: center;
}
main {
    max-width: 800px;
    margin: 2rem auto;
    padding: 1rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.modulo { display: none; }
.module-title-header { color: #2563EB; }
.block { margin-bottom: 2rem; }
img { max-width: 100%; height: auto; border-radius: 6px; }
.block-image { display: flex; justify-content: center; }
.block-quote {
    position: relative;
    padding: 1.5rem 1.5rem 1.5rem 2.5rem;
    background-color: #f0f4ff;
    border-left: 4px solid #2563EB;
    border-radius: 4px;
    font-style: italic;
}
.quiz-question { font-weight: bold; margin-bottom: 0.5rem; }
.quiz-option.correct { font-weight: bold; color: #16a34a; }
.module-navigation {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: white;
    padding: 1rem;
    text-align: center;
    border-top: 1px solid #e5e7eb;
    box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
    display: flex;
    justify-content: center;
    gap: 1rem;
}
.btn {
    background-color: #2563EB;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    margin: 0 0.5rem;
}
.btn:disabled { background-color: #9ca3af; cursor: not-allowed; }

@media (max-width: 768px) {
    .main-header {
        padding: 0.5rem 1rem;
    }
    .main-header h1 {
        font-size: 1.25rem;
    }
    main {
        margin: 1rem;
        padding: 0.5rem;
    }
    .module-navigation {
        flex-direction: column;
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

    