import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Project, Block } from './types';
import { toKebabCase } from './utils';

function renderBlockToHtml(block: Block): string {
    switch (block.type) {
        case 'text':
            return `<div class="block block-text">${block.content.text || ''}</div>`;
        case 'image':
            return `
                <div class="block block-image">
                    <figure>
                        <img src="${block.content.url || ''}" alt="${block.content.alt || ''}" />
                        ${block.content.caption ? `<figcaption>${block.content.caption}</figcaption>` : ''}
                    </figure>
                </div>
            `;
        case 'video':
            let videoUrl = block.content.videoUrl || '';
            if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                 try {
                    const urlObj = new URL(videoUrl);
                    let videoId = urlObj.searchParams.get('v');
                    if (urlObj.hostname === 'youtu.be') {
                        videoId = urlObj.pathname.substring(1);
                    }
                    if(videoId) {
                       videoUrl = `https://www.youtube.com/embed/${videoId}`;
                    }
                } catch (e) { /* Invalid URL */ }
            }
            return `
                <div class="block block-video">
                    <iframe src="${videoUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            `;
        case 'button':
            return `
                <div class="block block-button">
                    <a href="${block.content.buttonUrl || '#'}" class="btn" target="_blank" rel="noopener noreferrer">
                        ${block.content.buttonText || 'Button'}
                    </a>
                </div>
            `;
        case 'quiz':
            const optionsHtml = block.content.options?.map(option => `
                <label>
                    <input type="radio" name="quiz-${block.id}" value="${option.id}">
                    <span>${option.text}</span>
                </label>
            `).join('') || '';
            const correctOptionId = block.content.options?.find(o => o.isCorrect)?.id;

            return `
                <div class="block block-quiz" data-correct-answer="${correctOptionId}">
                    <p class="quiz-question">${block.content.question || ''}</p>
                    <div class="quiz-options">${optionsHtml}</div>
                    <button class="btn quiz-check-btn">Verificar</button>
                    <p class="quiz-feedback"></p>
                </div>
            `;
        default:
            return '';
    }
}

function generateModulesHtml(projects: Project[]): string {
    let modulesHtml = '';
    projects.forEach((project, index) => {
        const isFirst = index === 0;
        const isLast = index === projects.length - 1;
        const moduleId = `modulo-${index}`;
        const prevModuleId = `modulo-${index - 1}`;
        const nextModuleId = `modulo-${index + 1}`;

        const blocksHtml = project.blocks.map(renderBlockToHtml).join('\n');

        modulesHtml += `
            <section id="${moduleId}" class="modulo" style="display: ${isFirst ? 'block' : 'none'};">
                <header class="module-header">
                    <h2>${project.title}</h2>
                </header>
                <div class="module-content">
                    ${blocksHtml}
                </div>
                <div class="navegacao-modulo">
                    ${!isFirst ? `<button class="btn btn-nav" onclick="mostrarModulo('${prevModuleId}')">← Tópico Anterior</button>` : '<div></div>'}
                    ${!isLast ? `<button class="btn btn-nav" onclick="mostrarModulo('${nextModuleId}')">Próximo Tópico →</button>` : ''}
                </div>
            </section>
        `;
    });
    return modulesHtml;
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
    <main>
        ${modulesHtml}
    </main>
    <script src="script.js"></script>
</body>
</html>
    `;
}

function generateCss(): string {
    return `
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    background-color: #f4f5f7;
    color: #333;
    margin: 0;
    padding: 0;
}

main {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.modulo {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
    padding: 2rem;
}

.module-header {
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 1rem;
    margin-bottom: 2rem;
}

.module-header h2 {
    font-size: 2rem;
    color: #2563eb;
    margin: 0;
}

.block {
    margin-bottom: 2.5rem;
}

.block:last-child {
    margin-bottom: 0;
}

.block-text {
    /* Styles are applied via prose classes if any */
}

.block-image figure {
    margin: 0;
}

.block-image img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 6px;
}

.block-image figcaption {
    padding-top: 0.75rem;
    font-size: 0.9rem;
    color: #555;
    text-align: center;
}

.block-video {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    height: 0;
    overflow: hidden;
    border-radius: 6px;
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

.btn {
    display: inline-block;
    background-color: #2563eb;
    color: white;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.btn:hover {
    background-color: #1d4ed8;
}

.block-quiz {
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.quiz-question {
    font-weight: bold;
    margin-bottom: 1rem;
}

.quiz-options label {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.quiz-options label:hover {
    background-color: #f0f2f5;
}

.quiz-options input[type="radio"] {
    margin-right: 0.75rem;
}

.quiz-check-btn {
    margin-top: 1rem;
}

.quiz-feedback {
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: 6px;
    display: none;
}

.quiz-feedback.correct {
    background-color: #dcfce7;
    color: #166534;
    display: block;
}

.quiz-feedback.incorrect {
    background-color: #fee2e2;
    color: #991b1b;
    display: block;
}

.navegacao-modulo {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn-nav:only-child {
  margin-left: auto;
}
    `;
}

function generateJs(): string {
    return `
function mostrarModulo(idModulo) {
  // Esconde todos os módulos
  document.querySelectorAll('.modulo').forEach(modulo => {
    modulo.style.display = 'none';
  });
  
  // Mostra o módulo selecionado
  const moduloToShow = document.getElementById(idModulo);
  if (moduloToShow) {
    moduloToShow.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
    // Quiz logic
    const quizBlocks = document.querySelectorAll('.block-quiz');
    quizBlocks.forEach(quiz => {
        const checkButton = quiz.querySelector('.quiz-check-btn');
        const feedbackEl = quiz.querySelector('.quiz-feedback');
        const correctAnswer = quiz.getAttribute('data-correct-answer');

        if (checkButton) {
            checkButton.addEventListener('click', () => {
                const selectedOption = quiz.querySelector('input[type="radio"]:checked');
                
                if (!selectedOption) {
                    feedbackEl.textContent = 'Por favor, selecione uma resposta.';
                    feedbackEl.className = 'quiz-feedback incorrect';
                    return;
                }

                if (selectedOption.value === correctAnswer) {
                    feedbackEl.textContent = 'Correto!';
                    feedbackEl.className = 'quiz-feedback correct';
                } else {
                    feedbackEl.textContent = 'Incorreto. Tente novamente.';
                    feedbackEl.className = 'quiz-feedback incorrect';
                }
            });
        }
    });

    // Show first module by default if it exists
    const firstModule = document.querySelector('.modulo');
    if(firstModule) {
        firstModule.style.display = 'block';
    }
});
    `;
}

export async function exportToZip(projects: Project[]) {
    const zip = new JSZip();

    zip.file('index.html', generateHtml(projects));
    zip.file('style.css', generateCss());
    zip.file('script.js', generateJs());
    
    const content = await zip.generateAsync({ type: 'blob' });
    const fileName = `apostila-interativa.zip`;
    
    saveAs(content, fileName);
}
