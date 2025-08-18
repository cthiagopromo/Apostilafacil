

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Project, Block } from './types';
import { toKebabCase } from './utils';

function renderBlockToHtml(block: Block): string {
    switch (block.type) {
        case 'text':
            return `<div class="block block-text">${block.content.text || ''}</div>`;
        case 'image':
            const width = block.content.width ?? 100;
            return `
                <div class="block block-image" style="width: ${width}%; margin: 0 auto;">
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
        const moduleId = `modulo-${index}`;

        const blocksHtml = project.blocks.map(renderBlockToHtml).join('\n');

        modulesHtml += `
            <section id="${moduleId}" class="modulo" style="display: ${isFirst ? 'block' : 'none'};">
                <div class="module-content">
                    ${blocksHtml}
                </div>
            </section>
        `;
    });
    return modulesHtml;
}

function generateModuleMenu(projects: Project[]): string {
    return projects.map((project, index) =>
        `<a href="#" class="module-menu-item" data-module-index="${index}">${project.title}</a>`
    ).join('');
}


function generateHtml(projects: Project[]): string {
    const modulesHtml = generateModulesHtml(projects);
    const moduleMenuHtml = generateModuleMenu(projects);
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
        <div class="header-content">
            <h1 id="main-title">${mainTitle}</h1>
        </div>
    </header>
    <main>
        ${modulesHtml}
    </main>

    <div class="fab-container">
        <div id="module-menu" class="module-menu">
            <h4>Módulos</h4>
            <div id="module-menu-list">
                ${moduleMenuHtml}
            </div>
        </div>
        <button class="floating-action-button" id="fab-main">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        </button>
    </div>

    <script src="script.js"></script>
</body>
</html>
    `;
}

function generateCss(): string {
    return `
:root {
    --bg-color: #f4f5f7;
    --text-color: #333;
    --primary-color: #2563eb;
    --card-bg-color: white;
    --border-color: #e5e7eb;
    font-size: 16px; /* Base font size */
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    background-color: var(--bg-color);
    color: var(--text-color);
    margin: 0;
    padding: 0 0 100px 0; /* Add padding to the bottom to avoid overlap */
    transition: background-color 0.3s, color 0.3s;
}

/* Dark Mode */
body.dark-mode {
    --bg-color: #1a1a1a;
    --text-color: #f0f0f0;
    --primary-color: #5d93ff;
    --card-bg-color: #2a2a2a;
    --border-color: #444;
}

.main-header {
    background-color: var(--primary-color);
    color: white;
    padding: 1rem;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

#main-title {
    font-size: 1.5rem;
    margin: 0;
}

main {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.modulo {
    background-color: var(--card-bg-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
    padding: 2rem;
}

.module-content {
    padding-bottom: 1rem;
    margin-bottom: 1rem;
}

.block {
    margin-bottom: 2.5rem;
}

.block:last-child {
    margin-bottom: 0;
}

.block-image figure {
    margin: 0;
}

.block-image img {
    max-width: 100%;
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
    background-color: var(--primary-color);
    color: white;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease, opacity 0.2s ease;
}

.btn:hover {
    filter: brightness(1.1);
}

.btn[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
    filter: none;
}


.block-quiz {
    padding: 1.5rem;
    border: 1px solid var(--border-color);
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
    border: 1px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.quiz-options label:hover {
    background-color: rgba(0,0,0,0.05);
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
    background-color: #dbeafe;
    color: #1e40af;
    display: block;
}

.quiz-feedback.incorrect {
    background-color: #fee2e2;
    color: #991b1b;
    display: block;
}

/* Floating Action Button & Menu */
.fab-container {
    position: fixed;
    bottom: 25px;
    right: 25px;
    z-index: 1000;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
}

.floating-action-button {
    background-color: #1D4ED8;
    color: white;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: transform 0.2s ease-in-out, background-color 0.2s, rotate 0.2s ease-in-out;
}

.floating-action-button:hover {
    background-color: #2563EB;
    transform: scale(1.05);
}

.floating-action-button.active {
    rotate: 45deg;
}

.module-menu {
    background-color: var(--card-bg-color);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    width: 280px;
    margin-bottom: 15px;
    overflow: hidden;
    transform-origin: bottom right;
    transform: scale(0);
    opacity: 0;
    transition: transform 0.2s ease, opacity 0.2s ease;
    visibility: hidden;
}

.fab-container.active .module-menu {
    transform: scale(1);
    opacity: 1;
    visibility: visible;
}

.module-menu h4 {
    margin: 0;
    padding: 1rem;
    font-size: 1rem;
    font-weight: 600;
    border-bottom: 1px solid var(--border-color);
}

#module-menu-list {
    max-height: 300px;
    overflow-y: auto;
    padding: 0.5rem 0;
}

.module-menu-item {
    display: block;
    padding: 0.75rem 1rem;
    text-decoration: none;
    color: var(--text-color);
    font-size: 0.9rem;
    transition: background-color 0.2s;
}

.module-menu-item:hover {
    background-color: rgba(0,0,0,0.05);
}

body.dark-mode .module-menu-item:hover {
    background-color: rgba(255,255,255,0.05);
}

.module-menu-item.active {
    background-color: var(--primary-color);
    color: white;
    font-weight: 600;
}

    `;
}

function generateJs(): string {
    return `
let currentModuleIndex = 0;
let totalModules = 0;

function mostrarModulo(index) {
  document.querySelectorAll('.modulo').forEach(modulo => {
    modulo.style.display = 'none';
  });
  
  const moduloToShow = document.getElementById('modulo-' + index);
  if (moduloToShow) {
    moduloToShow.style.display = 'block';
    window.scrollTo(0, 0);
    currentModuleIndex = index;
    updateActiveMenuItem();
  }
}

function updateActiveMenuItem() {
    document.querySelectorAll('.module-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.querySelector(\`.module-menu-item[data-module-index="\${currentModuleIndex}"]\`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

function changeFontSize(direction) {
    const html = document.documentElement;
    let currentSize = parseFloat(window.getComputedStyle(html).fontSize);
    if (direction === 'increase') {
        html.style.fontSize = (currentSize + 1) + 'px';
    } else if (direction === 'decrease') {
        html.style.fontSize = (currentSize - 1) + 'px';
    }
    localStorage.setItem('fontSize', html.style.fontSize);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function setupMenu() {
    const menuList = document.getElementById('module-menu-list');
    menuList.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('module-menu-item')) {
            e.preventDefault();
            const moduleIndex = parseInt(e.target.getAttribute('data-module-index'));
            mostrarModulo(moduleIndex);
            closeFabMenu();
        }
    });
}

function closeFabMenu() {
    const fabContainer = document.querySelector('.fab-container');
    const fabMain = document.getElementById('fab-main');
    fabContainer.classList.remove('active');
    fabMain.classList.remove('active');
    const icon = fabMain.querySelector('svg');
    if (icon) {
       icon.outerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    totalModules = document.querySelectorAll('.modulo').length;

    // Restore preferences
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        document.documentElement.style.fontSize = savedFontSize;
    }

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

    const firstModule = document.querySelector('.modulo');
    if(firstModule) {
        const firstIndex = parseInt(firstModule.id.split('-')[1] || '0');
        currentModuleIndex = firstIndex;
        mostrarModulo(currentModuleIndex);
    }

    // FAB logic
    const fabMain = document.getElementById('fab-main');
    const fabContainer = document.querySelector('.fab-container');
    if (fabMain && fabContainer) {
        fabMain.addEventListener('click', (e) => {
            e.stopPropagation();
            fabContainer.classList.toggle('active');
            fabMain.classList.toggle('active');
            const icon = fabMain.querySelector('svg');
            if (fabMain.classList.contains('active')) {
                 if(icon) icon.outerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
            } else {
                 if(icon) icon.outerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';
            }
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!fabContainer.contains(e.target)) {
            closeFabMenu();
        }
    });
    
    setupMenu();
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
