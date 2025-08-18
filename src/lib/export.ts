

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
        const moduleId = `modulo-${index}`;

        const blocksHtml = project.blocks.map(renderBlockToHtml).join('\n');
        
        const navButtons = `
            <div class="module-navigation">
                ${index > 0 ? `<button class="btn nav-btn" data-target="${index - 1}">Módulo Anterior</button>` : ''}
                ${index < projects.length - 1 ? `<button class="btn nav-btn" data-target="${index + 1}">Próximo Módulo</button>` : ''}
            </div>
        `;

        modulesHtml += `
            <section id="${moduleId}" class="modulo" style="display: none;">
                <div class="module-content">
                    ${blocksHtml}
                </div>
                ${navButtons}
            </section>
        `;
    });
    return modulesHtml;
}

function generateModuleMenu(projects: Project[]): string {
    return projects.map((project, index) =>
        `<li><a href="#" class="module-menu-item" data-module-index="${index}">${project.title}</a></li>`
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
    <div id="overlay" class="overlay"></div>
    <header class="main-header">
        <div class="header-content">
            <h1 id="main-title">${mainTitle}</h1>
            <div id="accessibility-toolbar" class="accessibility-toolbar">
                <button class="icon-btn" id="btn-increase-font" title="Aumentar Fonte">A+</button>
                <button class="icon-btn" id="btn-decrease-font" title="Diminuir Fonte">A-</button>
                <button class="icon-btn" id="btn-dark-mode" title="Modo Escuro">🌗</button>
                <button class="icon-btn" id="btn-speak" title="Ler em Voz Alta">🔊</button>
            </div>
        </div>
    </header>

    <aside id="side-panel" class="side-panel">
        <div class="panel-header">
            <h3>Módulos</h3>
            <button id="close-panel-btn" class="icon-btn">&times;</button>
        </div>
        <ul id="module-menu-list">
            ${moduleMenuHtml}
        </ul>
    </aside>

    <main>
        ${modulesHtml}
    </main>

    <button class="floating-action-button" id="fab-open-panel">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    </button>
    
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
    --shadow-color: rgba(0,0,0,0.1);
    font-size: 16px;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    background-color: var(--bg-color);
    color: var(--text-color);
    margin: 0;
    padding-bottom: 100px;
    transition: background-color 0.3s, color 0.3s;
}

body.dark-mode {
    --bg-color: #1a1a1a;
    --text-color: #f0f0f0;
    --primary-color: #5d93ff;
    --card-bg-color: #2a2a2a;
    --border-color: #444;
    --shadow-color: rgba(0,0,0,0.3);
}

.main-header {
    background-color: var(--card-bg-color);
    padding: 0.5rem 1rem;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 2px 4px var(--shadow-color);
}

.header-content {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

#main-title {
    font-size: 1.25rem;
    margin: 0;
    color: var(--primary-color);
}

.accessibility-toolbar {
    display: flex;
    gap: 0.5rem;
}

.icon-btn {
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: var(--text-color);
    transition: background-color 0.2s, box-shadow 0.2s;
}

.icon-btn:hover {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
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
    box-shadow: 0 4px 6px var(--shadow-color);
    margin-bottom: 2rem;
    padding: 2rem;
}

.module-content {
    padding-bottom: 1rem;
}

.block { margin-bottom: 2.5rem; }
.block:last-child { margin-bottom: 0; }
.block-image figure { margin: 0; }
.block-image img { max-width: 100%; height: auto; display: block; border-radius: 6px; }
.block-image figcaption { padding-top: 0.75rem; font-size: 0.9rem; color: #555; text-align: center; }
.block-video { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 6px; }
.block-video iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.block-button { text-align: center; }

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
    transition: background-color 0.2s, opacity 0.2s;
}

.btn:hover { filter: brightness(1.1); }
.btn[disabled] { opacity: 0.5; cursor: not-allowed; filter: none; }

.block-quiz { padding: 1.5rem; border: 1px solid var(--border-color); border-radius: 8px; }
.quiz-question { font-weight: bold; margin-bottom: 1rem; }
.quiz-options label { display: flex; align-items: center; padding: 0.75rem; margin-bottom: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; transition: background-color 0.2s; }
.quiz-options label:hover { background-color: rgba(0,0,0,0.05); }
body.dark-mode .quiz-options label:hover { background-color: rgba(255,255,255,0.05); }
.quiz-options input[type="radio"] { margin-right: 0.75rem; }
.quiz-check-btn { margin-top: 1rem; }
.quiz-feedback { margin-top: 1rem; padding: 0.75rem; border-radius: 6px; display: none; }
.quiz-feedback.correct { background-color: #dbeafe; color: #1e40af; display: block; }
.quiz-feedback.incorrect { background-color: #fee2e2; color: #991b1b; display: block; }
body.dark-mode .quiz-feedback.correct { background-color: #1e40af; color: #dbeafe;}
body.dark-mode .quiz-feedback.incorrect { background-color: #991b1b; color: #fee2e2;}


.module-navigation {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
}

.floating-action-button {
    position: fixed;
    bottom: 25px;
    right: 25px;
    z-index: 1000;
    background-color: #1D4ED8;
    color: white;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px var(--shadow-color);
    cursor: pointer;
    transition: transform 0.2s ease-in-out, background-color 0.2s;
}

.floating-action-button:hover {
    background-color: #2563EB;
    transform: scale(1.05);
}

.side-panel {
    position: fixed;
    top: 0;
    left: -320px; /* Hidden by default */
    width: 300px;
    height: 100%;
    background-color: var(--card-bg-color);
    box-shadow: 4px 0 15px rgba(0,0,0,0.1);
    z-index: 1100;
    transition: left 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
}

.side-panel.open {
    left: 0;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
}
.panel-header h3 {
    margin: 0;
    font-size: 1.2rem;
}

#close-panel-btn {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
}

#module-menu-list {
    list-style: none;
    margin: 0;
    padding: 0.5rem 0;
    overflow-y: auto;
    flex-grow: 1;
}

.module-menu-item {
    display: block;
    padding: 0.75rem 1rem;
    text-decoration: none;
    color: var(--text-color);
    font-size: 0.9rem;
    transition: background-color 0.2s;
    border-left: 4px solid transparent;
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
    border-left-color: darkblue;
}
body.dark-mode .module-menu-item.active {
    border-left-color: lightblue;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.4);
    z-index: 1050;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0.3s;
}
.overlay.show {
    opacity: 1;
    visibility: visible;
}
    `;
}

function generateJs(): string {
    return `
let currentModuleIndex = 0;
const synth = window.speechSynthesis;
let utterance = null;

function showModule(index) {
  document.querySelectorAll('.modulo').forEach(module => {
    module.style.display = 'none';
  });
  
  const moduleToShow = document.getElementById('modulo-' + index);
  if (moduleToShow) {
    moduleToShow.style.display = 'block';
    window.scrollTo(0, 0);
    currentModuleIndex = index;
    updateActiveMenuItem();
    const projectTitle = document.querySelector(\`.module-menu-item[data-module-index="\${index}"]\`).textContent;
    document.getElementById('main-title').textContent = projectTitle;
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

function speakText() {
    if (synth.speaking) {
        synth.cancel();
        return;
    }
    const module = document.getElementById('modulo-' + currentModuleIndex);
    if (module) {
        const textToSpeak = module.innerText;
        utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'pt-BR';
        synth.speak(utterance);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Restore preferences
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        document.documentElement.style.fontSize = savedFontSize;
    }

    // --- Panel Logic ---
    const sidePanel = document.getElementById('side-panel');
    const fabOpen = document.getElementById('fab-open-panel');
    const closeBtn = document.getElementById('close-panel-btn');
    const overlay = document.getElementById('overlay');
    const moduleMenuList = document.getElementById('module-menu-list');

    const openPanel = () => {
        sidePanel.classList.add('open');
        overlay.classList.add('show');
    };

    const closePanel = () => {
        sidePanel.classList.remove('open');
        overlay.classList.remove('show');
    };

    fabOpen.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);

    moduleMenuList.addEventListener('click', e => {
        if (e.target.classList.contains('module-menu-item')) {
            e.preventDefault();
            const index = parseInt(e.target.dataset.moduleIndex);
            showModule(index);
            closePanel();
        }
    });

    // --- Accessibility Buttons ---
    document.getElementById('btn-increase-font').addEventListener('click', () => changeFontSize('increase'));
    document.getElementById('btn-decrease-font').addEventListener('click', () => changeFontSize('decrease'));
    document.getElementById('btn-dark-mode').addEventListener('click', toggleDarkMode);
    document.getElementById('btn-speak').addEventListener('click', speakText);

    // --- Module Navigation ---
    document.body.addEventListener('click', e => {
        if (e.target.classList.contains('nav-btn')) {
            const targetIndex = parseInt(e.target.dataset.target);
            showModule(targetIndex);
        }
    });
    
    // --- Quiz logic ---
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

    // Initial load
    showModule(0);
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
