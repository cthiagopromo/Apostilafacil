import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Project, Block, BlockContent } from './types';
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
            // Simple embed for YouTube
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
                } catch (e) {
                    // Invalid URL, will be rendered as is and likely fail
                }
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

function generateHtml(project: Project): string {
    const blocksHtml = project.blocks.map(renderBlockToHtml).join('\n');
    return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.title}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>${project.title}</h1>
    </header>
    <main>
        ${blocksHtml}
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

header {
    background-color: #2563eb;
    color: white;
    padding: 2rem 1rem;
    text-align: center;
}

header h1 {
    margin: 0;
    font-size: 2.5rem;
}

main {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.block {
    margin-bottom: 2.5rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    overflow: hidden;
}

.block-text {
    padding: 1.5rem;
}

.block-image figure {
    margin: 0;
}

.block-image img {
    width: 100%;
    height: auto;
    display: block;
}

.block-image figcaption {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
    color: #555;
    text-align: center;
    background-color: #f9fafb;
}

.block-video {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    height: 0;
}

.block-video iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.block-button {
    padding: 2rem;
    text-align: center;
}

.btn {
    display: inline-block;
    background-color: #2563eb;
    color: white;
    padding: 0.8rem 1.5rem;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    transition: background-color 0.2s ease;
}

.btn:hover {
    background-color: #1d4ed8;
}

.block-quiz {
    padding: 1.5rem;
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
    `;
}

function generateJs(): string {
    return `
document.addEventListener('DOMContentLoaded', () => {
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
});
    `;
}

export async function exportToZip(project: Project) {
    const zip = new JSZip();

    zip.file('index.html', generateHtml(project));
    zip.file('style.css', generateCss());
    zip.file('script.js', generateJs());
    
    // In a real scenario, you'd fetch images and add them to an assets folder.
    // For now, we are linking directly.
    // const assets = zip.folder('assets');

    const content = await zip.generateAsync({ type: 'blob' });
    const fileName = `${toKebabCase(project.title) || 'apostila'}.zip`;
    
    saveAs(content, fileName);
}
