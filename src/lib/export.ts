

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { HandbookData, Block, Project, Theme } from '@/lib/types';
import DOMPurify from 'dompurify';
import { compressImage, processHandbookImages, isImageBase64 } from './image-compressor';
import { dataCompressor } from './data-compressor';
import { htmlMinifier } from './html-minifier';

const { aggressiveMinifyHtml, removeRedundantAttributes, minifyCss, minifyJs } = htmlMinifier;
const { compactHandbookData } = dataCompressor;

const getWatermarkHtml = (theme: Theme) => {
    if (!theme.watermark?.enabled) return '';
    const text = theme.watermark.text || 'CONFIDENCIAL';
    const style = theme.watermark.style || 'sidebar';
    
    if (style === 'sidebar') {
        return `
        <div class="watermark-sidebar" aria-hidden="true">
            <div class="watermark-sidebar-text">${text} — ${text} — ${text}</div>
        </div>`;
    }
    
    if (style === 'center') {
        return `
        <div class="watermark-center" aria-hidden="true">
            <div class="watermark-center-ring"></div>
            <div class="watermark-center-text">${text}</div>
        </div>`;
    }
    
    if (style === 'ghost') {
        return `
        <div class="watermark-ghost" aria-hidden="true">${text}</div>`;
    }
    
    // Classic (Grid)
    let gridHtml = '<div class="watermark-grid" aria-hidden="true">';
    for(let i=0; i<12; i++) gridHtml += `<div class="watermark-grid-item">${text}</div>`;
    gridHtml += '</div>';
    return gridHtml;
};

const getWatermarkCssVariables = (theme: Theme) => {
    if (!theme.watermark?.enabled) return '';
    const wm = theme.watermark;
    return `
        --wm-opacity: ${wm.opacity || 0.1};
        --wm-color: ${wm.color || '#000000'};
        --wm-size: ${wm.fontSize || 60}px;
        --wm-rotate: ${wm.rotate || -45}deg;
    `;
};

// ============================================================================
// DEDUPLICAÇÃO DE IMAGENS
// ============================================================================

/**
 * Gera hash simples para conteúdo base64 (para deduplicação)
 */
const generateImageHash = (base64: string): string => {
  if (typeof window === 'undefined' || !base64) return '';
  let hash = 0;
  for (let i = 0; i < base64.length; i++) {
    const char = base64.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `img_${Math.abs(hash).toString(36)}`;
};

/**
 * Deduplica imagens em uma apostila, substituindo duplicatas por referências
 */
export const deduplicateImages = (handbookData: HandbookData): { data: HandbookData; savings: number } => {
  const imageMap = new Map<string, string>();
  let savings = 0;

  const processImage = (url: string): string => {
    if (!url || !isImageBase64(url)) return url;
    
    const hash = generateImageHash(url);
    const existing = imageMap.get(hash);
    
    if (existing) {
      savings += url.length - existing.length;
      return existing;
    }
    
    imageMap.set(hash, url);
    return url;
  };

  const processed = JSON.parse(JSON.stringify(handbookData)) as HandbookData;

  // Processar capa
  if (processed.theme.cover) {
    processed.theme.cover = processImage(processed.theme.cover);
  }

  // Processar contracapa
  if (processed.theme.backCover) {
    processed.theme.backCover = processImage(processed.theme.backCover);
  }

  // Processar imagens dos blocos
  for (const project of processed.projects) {
    for (const block of project.blocks) {
      if (block.type === 'image' && block.content.url) {
        block.content.url = processImage(block.content.url);
      }
    }
  }

  return { data: processed, savings };
};

// ============================================================================
// RESET DE ESTADO DOS QUIZZES
// ============================================================================

/**
 * Garante que todos os quizzes sejam exportados sem respostas pré-selecionadas
 */
export const resetQuizStates = (handbookData: HandbookData): HandbookData => {
  const processed = JSON.parse(JSON.stringify(handbookData)) as HandbookData;

  for (const project of processed.projects) {
    for (const block of project.blocks) {
      if (block.type === 'quiz') {
        block.content.userAnswerId = null;
      }
    }
  }

  return processed;
};

const consolidatedCss = `.watermark-sidebar{position:fixed;top:0;left:0;bottom:0;width:40px;border-right:1px solid rgba(0,0,0,0.1);background:rgba(0,0,0,0.02);z-index:9999;display:flex;align-items:center;justify-content:center;pointer-events:none;user-select:none}.watermark-sidebar-text{transform:rotate(-90deg);white-space:nowrap;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.5em;color:var(--wm-color);opacity:var(--wm-opacity);font-family:system-ui, sans-serif}.watermark-center{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;display:flex;justify-content:center;align-items:center;overflow:hidden}.watermark-center-ring{position:absolute;width:300px;height:300px;border:1px solid var(--wm-color);opacity:calc(var(--wm-opacity)*0.3);border-radius:50%}.watermark-center-text{opacity:var(--wm-opacity);color:var(--wm-color);font-size:var(--wm-size);transform:rotate(var(--wm-rotate));white-space:nowrap;font-weight:900;font-family:serif;font-style:italic}.watermark-ghost{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;display:flex;justify-content:center;align-items:center;overflow:hidden;opacity:var(--wm-opacity);font-size:calc(var(--wm-size)*6);font-weight:900;font-family:system-ui, sans-serif;transform:rotate(var(--wm-rotate));white-space:nowrap;letter-spacing:-0.05em;-webkit-text-stroke:2px var(--wm-color);color:transparent}.watermark-grid{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;display:grid;grid-template-columns:repeat(4,1fr);gap:40px;padding:40px;overflow:hidden}.watermark-grid-item{opacity:var(--wm-opacity);color:var(--wm-color);font-size:var(--wm-size);transform:rotate(var(--wm-rotate));white-space:nowrap;font-weight:700}.notes-panel{position:fixed;top:0;right:-400px;width:400px;height:100vh;background:hsl(var(--card));border-left:1px solid hsl(var(--border));z-index:1000;transition:right .3s ease;display:flex;flex-direction:column;box-shadow:-4px 0 10px rgba(0,0,0,.1)}.notes-panel.open{right:0}.notes-header{padding:1rem;border-bottom:1px solid hsl(var(--border));display:flex;justify-content:space-between;align-items:center;background:hsl(var(--primary));color:hsl(var(--primary-foreground))}.notes-content{flex:1;padding:1rem;display:flex;flex-direction:column;gap:1rem}.notes-textarea{flex:1;width:100%;padding:.75rem;border-radius:.5rem;border:1px solid hsl(var(--border));background:hsl(var(--background));resize:none;font-family:inherit;font-size:.875rem;color:hsl(var(--foreground))}.notes-toggle{position:fixed;bottom:1.25rem;right:5.5rem;z-index:999;width:3.5rem;height:3.5rem;border-radius:50%;background:hsl(var(--primary));color:hsl(var(--primary-foreground));display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 6px rgba(0,0,0,.1);transition:transform .2s;border:none}.notes-toggle:hover{transform:scale(1.05)}.notes-toggle.has-notes::after{content:'';position:absolute;top:0;right:0;width:12px;height:12px;background:#3b82f6;border-radius:50%;border:2px solid #fff}.notes-footer{padding:1rem;border-top:1px solid hsl(var(--border));display:flex;gap:.5rem}.btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;font-size:.875rem;font-weight:500;border-radius:.375rem;border:1px solid hsl(var(--border));background:hsl(var(--primary));color:hsl(var(--primary-foreground));transition:background-color .15s ease}.btn-primary:hover{background:hsl(var(--primary)/.9)}.btn-outline{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;font-size:.875rem;font-weight:500;border-radius:.375rem;border:1px solid hsl(var(--border));background:hsl(var(--background));color:hsl(var(--foreground));transition:background-color .15s ease}.btn-outline:hover{background:hsl(var(--accent))}.btn-ghost{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;font-size:.875rem;font-weight:500;border-radius:.375rem;border:1px solid transparent;background:transparent;color:hsl(var(--foreground));transition:background-color .15s ease}.btn-ghost:hover{background:hsl(var(--accent))}.btn-icon{height:2.5rem;width:2.5rem;padding:0;display:inline-flex;align-items:center;justify-content:center;border-radius:.375rem;border:1px solid hsl(var(--border));background:hsl(var(--background));color:hsl(var(--foreground));transition:background-color .15s ease}.btn-icon:hover{background:hsl(var(--accent))}.btn-icon-sm{height:2.25rem;width:2.25rem;padding:0;display:inline-flex;align-items:center;justify-content:center;border-radius:.375rem;border:1px solid hsl(var(--border));background:hsl(var(--background));color:hsl(var(--foreground));transition:background-color .15s ease}.btn-icon-sm:hover{background:hsl(var(--accent))}.btn-large{height:2.75rem;padding:0 2rem;font-size:.875rem}.btn-large svg{width:1.25rem;height:1.25rem;margin-right:.5rem}.btn-nav{height:2.5rem;padding:0 1rem}.card{border-radius:.75rem;border:1px solid hsl(var(--border));background:hsl(var(--card));color:hsl(var(--card-foreground));box-shadow:0 1px 3px rgba(0,0,0,.1)}.card-header{padding:1rem;border-bottom:1px solid hsl(var(--border))}.card-content{padding:1rem}.card-footer{padding:1rem;border-top:1px solid hsl(var(--border))}.input{display:flex;width:100%;height:2.5rem;border-radius:.375rem;border:1px solid hsl(var(--border));background:hsl(var(--background));padding:0 .75rem;font-size:.875rem}.input:focus{outline:2px solid hsl(var(--ring));outline-offset:2px}.label{display:block;font-size:.875rem;font-weight:500;margin-bottom:.5rem}.quiz-card{border-radius:.75rem;border:1px solid hsl(var(--border));background:hsl(var(--muted)/.3);color:hsl(var(--card-foreground));box-shadow:0 1px 3px rgba(0,0,0,.1)}.quiz-question{font-size:1.25rem;font-weight:600;margin-bottom:.5rem}.quiz-instruction{font-size:.875rem;color:hsl(var(--muted-foreground))}.quiz-options{display:grid;gap:.5rem;margin-top:1rem}.quiz-option{display:flex;align-items:center;gap:.75rem;padding:.75rem;border-radius:.375rem;border:1px solid hsl(var(--border));transition:all .15s ease;cursor:pointer}.quiz-option:hover{background:hsl(var(--accent))}.quiz-option-label{flex:1;cursor:pointer}.quiz-option .check-icon,.quiz-option .x-icon{display:none;width:12px;height:12px;flex-shrink:0}.radio-group-item{height:1rem;width:1rem;border-radius:50%;border:2px solid hsl(var(--border));cursor:pointer;flex-shrink:0}.retry-btn{margin-top:.5rem}.prose{max-width:none;overflow-wrap:break-word;word-wrap:break-word;word-break:break-word;hyphens:auto}.prose a{word-break:break-all}.prose :where(p):not(:where([class~="not-prose"])){margin-top:1.25em;margin-bottom:1.25em}.prose :where(h1):not(:where([class~="not-prose"])){font-size:2.25em;margin-top:0;margin-bottom:.8888889em;line-height:1.1111111}.prose :where(h2):not(:where([class~="not-prose"])){font-size:1.5em;margin-top:2em;margin-bottom:1em;line-height:1.3333333}.prose :where(h3):not(:where([class~="not-prose"])){font-size:1.25em;margin-top:1.6em;margin-bottom:.6em;line-height:1.6}.prose :where(img):not(:where([class~="not-prose"])){margin-top:2em;margin-bottom:2em;max-width:100%;height:auto}.prose :where(figure):not(:where([class~="not-prose"])){margin-top:2em;margin-bottom:2em}.prose :where(blockquote):not(:where([class~="not-prose"])){margin-top:1.6em;margin-bottom:1.6em;padding-left:1em;border-left-width:.25rem;border-left-color:hsl(var(--primary));font-style:italic}.img-wrapper{display:flex;justify-content:center}.img-figure{display:flex;flex-direction:column;align-items:center;gap:.25rem}.img-element{border-radius:.375rem;box-shadow:0 1px 3px rgba(0,0,0,.1);max-width:100%;height:auto}.img-caption{font-size:.875rem;text-align:center;font-style:italic;margin-top:.5rem;color:hsl(var(--muted-foreground))}.quote-wrapper{position:relative}.quote-block{padding:1rem;background:hsl(var(--muted)/.5);border-left:4px solid hsl(var(--primary));border-top-right-radius:.5rem;border-bottom-right-radius:.5rem;font-size:1.125rem;font-style:italic;color:hsl(var(--foreground)/.8);margin:0}.quote-block .quote-icon{position:absolute;top:-.75rem;left:-.5rem;width:2.5rem;height:2.5rem;color:hsl(var(--primary)/.2)}.video-container{position:relative}.video-iframe{width:100%;aspect-ratio:16/9;border:0;border-radius:.375rem}.video-print-placeholder{display:none;padding:1rem;background:hsl(var(--muted)/.5);border:2px dashed hsl(var(--border));border-radius:.5rem;align-items:center;gap:1rem}.video-print-placeholder .video-print-content{flex:1}.video-print-title{font-weight:600;margin-bottom:.25rem}.video-print-subtitle{font-size:.875rem;color:hsl(var(--muted-foreground))}.video-link{font-size:.875rem;margin-top:.5rem}.video-link a{color:hsl(var(--primary));text-decoration:underline}.video-error{color:hsl(var(--destructive))}.btn-wrapper{display:flex;justify-content:center}.module-section{display:none}.module-section:not(.cover-section):not(.back-cover-section){display:none}.cover-section{width:100%;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden}.cover-image{width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;z-index:1}.cover-overlay{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.4);z-index:2}.cover-content{position:relative;z-index:3;color:#fff;padding:2rem}.back-cover-section{display:none}.block-spacer{height:2rem}#handbook-root{margin-top:0;display:block}.main-content{padding:1rem}@media(min-width:640px){.main-content{padding:2rem}}@media(min-width:768px){.main-content{padding:3rem}}.print-content{padding:2rem}@media(min-width:640px){.print-content{padding:3rem}}@media(min-width:768px){.print-content{padding:4rem}}#handbook-root{padding:2rem}@media(min-width:640px){#handbook-root{padding:3rem}}@media(min-width:768px){#handbook-root{padding:4rem}}.module-header{text-align:center;margin-bottom:3rem}.module-title{font-size:2rem;font-weight:700;margin-bottom:.5rem;padding-bottom:.5rem;border-bottom:2px solid hsl(var(--border))}.module-description{font-size:1rem;color:hsl(var(--muted-foreground))}.module-content{display:grid;gap:1.5rem}.module-footer{margin-top:2rem;padding-top:1.5rem;border-top:1px solid hsl(var(--border));display:flex;justify-content:space-between;align-items:center}.module-progress{font-size:.875rem;color:hsl(var(--muted-foreground))}.module-nav-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;font-size:.875rem;font-weight:500;border-radius:.375rem;border:1px solid hsl(var(--border));background:hsl(var(--background));color:hsl(var(--foreground));transition:background-color .15s ease,opacity .15s ease;padding:.5rem 1rem;height:2.5rem;cursor:pointer}.module-nav-btn:hover:not(:disabled){background:hsl(var(--accent))}.module-nav-btn:disabled{opacity:.4;cursor:not-allowed;pointer-events:none}.module-nav-btn svg{width:1rem;height:1rem}.floating-nav-btn{width:100%;text-align:left;padding:.5rem;font-size:.875rem;border-radius:.375rem;background:transparent;border:none;transition:background-color .15s ease;cursor:pointer}.floating-nav-btn:hover{background:hsl(var(--primary)/.1)}.floating-nav-btn.active-module{background:hsl(var(--primary));color:hsl(var(--primary-foreground))}.accessibility-toolbar{display:flex;gap:.5rem}body,.prose{font-family:'Inter',system-ui,sans-serif}h1,h2,h3,h4,h5,h6,.prose h1,.prose h2,.prose h3{font-family:'Inter',system-ui,sans-serif}@media print{@page{size:A4;margin:2cm}@page cover{margin:0!important}*,*::before,*::after{box-sizing:border-box!important}.no-print,.no-print *,header,.accessibility-toolbar,#floating-nav-container,footer.no-print,.module-nav-btn,.notes-toggle,.notes-panel{display:none!important;visibility:hidden!important;height:0!important;width:0!important;overflow:hidden!important}html,body{background:#fff!important;color:#000!important;font-size:11pt!important;width:100%!important;height:auto!important;margin:0!important;padding:0!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}#printable-content,main.main-content{width:100%!important;margin:0!important;padding:0!important;display:block!important}#printing-modal{display:none!important}.main-content,.print-content{padding:0!important}#handbook-root,div#handbook-root{box-shadow:none!important;border:none!important;border-radius:0!important;background:#fff!important;margin:0!important;padding:0!important;width:100%!important;max-width:none!important}.cover-section,section.cover-section{page:cover;width:210mm!important;height:297mm!important;margin:0!important;padding:0!important;page-break-after:always!important;position:relative!important;left:0!important;top:0!important}.cover-section .cover-image,.cover-section img{width:100%!important;height:100%!important;object-fit:cover!important}.cover-section .cover-content,.cover-section button{display:none!important}.module-section,section.module-section{display:block!important;page-break-before:always!important;width:100%!important;padding-top:0!important}.module-section:first-of-type{page-break-before:auto!important}.cover-section+.module-section,section.cover-section+section.module-section{page-break-before:auto!important}.module-section:last-of-type{page-break-after:auto!important}.back-cover-section,section.back-cover-section{page:cover;width:210mm!important;height:297mm!important;margin:0!important;padding:0!important;page-break-before:always!important}.back-cover-section img,.back-cover-image{width:100%!important;height:100%!important;object-fit:cover!important}.video-player-export{display:none!important}.video-print-placeholder-export{display:block!important}.video-container .video-iframe{display:none!important}.video-container .video-print-placeholder{display:flex!important;break-inside:avoid;page-break-inside:avoid!important}h1,h2,h3,h4,h5,h6{page-break-after:avoid!important;break-after:avoid!important}.quiz-card,.video-container,.img-figure,blockquote,figure{page-break-inside:avoid!important;break-inside:avoid!important}a{color:#000!important;text-decoration:none!important}.watermark{display:flex!important;visibility:visible!important;z-index:99999!important}}`;


const getInteractiveScript = (theme: Theme): string => {
    // This script is stringified and injected into the exported HTML.
    // It must be self-contained and not rely on any external modules.
    const scriptContent = () => {
        document.addEventListener('DOMContentLoaded', () => {
            const dataElement = document.getElementById('handbook-data');
            if (!dataElement) return;

            const handbookData = JSON.parse(dataElement.textContent || '{}');
            const theme = handbookData.theme || {};
            const handbookId = handbookData.id || 'export';
            const STORAGE_KEY = `notes_${handbookId}`;

            if (theme && theme.colorPrimary) {
                document.documentElement.style.setProperty('--primary', theme.colorPrimary);
            }

            let currentModuleIndex = 0;
            const modules = document.querySelectorAll('.module-section:not(.cover-section):not(.back-cover-section)');
            const floatingNavButtons = document.querySelectorAll('.floating-nav-btn');
            const floatingNavMenu = document.getElementById('floating-nav-menu');
            const floatingNavToggle = document.getElementById('floating-nav-toggle');
            const coverSection = document.querySelector('.cover-section');
            const handbookRoot = document.getElementById('handbook-root');
            const startButton = document.getElementById('start-handbook-btn');
            const moduleSearchInput = document.getElementById('module-search-input');
            const moduleListScrollArea = document.getElementById('module-list-scroll-area');

            // Notes Elements
            const notesToggleBtn = document.getElementById('notes-toggle-btn');
            const notesPanel = document.getElementById('notes-panel');
            const closeNotesBtn = document.getElementById('close-notes-btn');
            const notesTextarea = document.getElementById('notes-textarea') as HTMLTextAreaElement;
            const notesModuleTitle = document.getElementById('notes-module-title');
            const exportNotesBtn = document.getElementById('export-notes-btn');
            const clearNotesBtn = document.getElementById('clear-notes-btn');

            let notesData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

            const saveNotes = () => {
                const currentModuleId = (modules[currentModuleIndex] as HTMLElement)?.dataset.moduleId;
                if (currentModuleId) {
                    const content = notesTextarea.value.trim();
                    if (content) {
                        notesData[currentModuleId] = content;
                    } else {
                        delete notesData[currentModuleId];
                    }
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(notesData));
                    updateNotesBadge();
                }
            };

            const updateNotesBadge = () => {
                if (notesToggleBtn) {
                    const hasAnyNotes = Object.keys(notesData).length > 0;
                    notesToggleBtn.classList.toggle('has-notes', hasAnyNotes);
                }
            };

            const loadNotesForCurrentModule = () => {
                const currentModuleId = (modules[currentModuleIndex] as HTMLElement)?.dataset.moduleId;
                const currentTitle = handbookData.projects[currentModuleIndex]?.title || '';
                if (notesModuleTitle) notesModuleTitle.textContent = currentTitle;
                if (currentModuleId) {
                    notesTextarea.value = notesData[currentModuleId] || '';
                }
            };

            updateNotesBadge();

            if (notesToggleBtn) {
                notesToggleBtn.addEventListener('click', () => {
                    notesPanel?.classList.add('open');
                    loadNotesForCurrentModule();
                });
            }

            if (closeNotesBtn) {
                closeNotesBtn.addEventListener('click', () => {
                    notesPanel?.classList.remove('open');
                });
            }

            if (notesTextarea) {
                notesTextarea.addEventListener('input', saveNotes);
            }

            if (exportNotesBtn) {
                exportNotesBtn.addEventListener('click', () => {
                    let text = `ANOTAÇÕES: ${handbookData.title}\n`;
                    text += '='.repeat(text.length) + '\n\n';
                    
                    handbookData.projects.forEach((proj: Project) => {
                        const note = notesData[proj.id];
                        if (note) {
                            text += `MÓDULO: ${proj.title}\n`;
                            text += '-'.repeat(proj.title.length + 8) + '\n';
                            text += note + '\n\n';
                        }
                    });

                    if (Object.keys(notesData).length === 0) {
                        alert('Você ainda não tem anotações para exportar.');
                        return;
                    }

                    const blob = new Blob([text], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `anotacoes_${handbookData.title.toLowerCase().replace(/\\s/g, '_')}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                });
            }

            if (clearNotesBtn) {
                clearNotesBtn.addEventListener('click', () => {
                    if (confirm('Deseja excluir TODAS as suas anotações? Esta ação não pode ser desfeita.')) {
                        notesData = {};
                        localStorage.removeItem(STORAGE_KEY);
                        notesTextarea.value = '';
                        updateNotesBadge();
                    }
                });
            }

            if (moduleListScrollArea) {
                moduleListScrollArea.style.maxHeight = '200px';
                moduleListScrollArea.style.overflowY = 'auto';
            }

            if (moduleSearchInput) {
                moduleSearchInput.addEventListener('input', (e) => {
                    const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
                    floatingNavButtons.forEach(btn => {
                        const moduleTitle = (btn.textContent || '').toLowerCase();
                        const parentDiv = btn.parentElement;
                        if (parentDiv) {
                            parentDiv.style.display = moduleTitle.includes(searchTerm) ? 'block' : 'none';
                        }
                    });
                });
            }

            const showModule = (index: number) => {
                if (coverSection) {
                    (coverSection as HTMLElement).style.display = 'none';
                }
                if (handbookRoot) {
                    (handbookRoot as HTMLElement).style.display = 'block';
                }
                modules.forEach((module, i) => {
                    const isVisible = i === index;
                    (module as HTMLElement).style.display = isVisible ? 'block' : 'none';
                });
                floatingNavButtons.forEach((btn, i) => {
                    if (i === index) {
                        btn.classList.add('bg-primary', 'text-primary-foreground');
                        btn.classList.remove('hover:bg-primary/10');
                    } else {
                        btn.classList.remove('bg-primary', 'text-primary-foreground');
                        btn.classList.add('hover:bg-primary/10');
                    }
                });
                currentModuleIndex = index;
                window.scrollTo(0, 0);
                updateNavButtons();
                loadNotesForCurrentModule();
            };

            const updateNavButtons = () => {
                const currentModule = modules[currentModuleIndex] as HTMLElement | undefined;
                if (currentModule) {
                    const prevBtn = currentModule.querySelector('[data-direction="prev"]') as HTMLButtonElement | null;
                    const nextBtn = currentModule.querySelector('[data-direction="next"]') as HTMLButtonElement | null;
                    const progressText = currentModule.querySelector('.module-progress-text');
                    if (prevBtn) prevBtn.disabled = currentModuleIndex === 0;
                    if (nextBtn) nextBtn.disabled = currentModuleIndex === modules.length - 1;
                    if (progressText) progressText.textContent = 'Módulo ' + (currentModuleIndex + 1) + ' de ' + modules.length;
                }
            };

            if (startButton) {
                startButton.addEventListener('click', () => {
                    showModule(0);
                });
            }

            const setupNavigation = () => {
                document.querySelectorAll('.module-nav-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        const btn = e.currentTarget as HTMLElement;
                        const direction = btn.getAttribute('data-direction');
                        if (direction === 'next' && currentModuleIndex < modules.length - 1) {
                            showModule(currentModuleIndex + 1);
                        } else if (direction === 'prev' && currentModuleIndex > 0) {
                            showModule(currentModuleIndex - 1);
                        }
                    });
                });
            };

            setupNavigation();

            floatingNavButtons.forEach((button, index) => {
                button.addEventListener('click', () => {
                    showModule(index);
                    if (floatingNavMenu) floatingNavMenu.classList.add('hidden');
                });
            });

            if (floatingNavToggle && floatingNavMenu) {
                floatingNavToggle.addEventListener('click', () => {
                    floatingNavMenu.classList.toggle('hidden');
                });
            }

            // Obter mapa de respostas corretas a partir do JSON (não do HTML)
            const quizAnswerMap = new Map<string, string>();
            const projects = handbookData.projects || [];
            for (const project of projects) {
                for (const block of (project.blocks || [])) {
                    if (block.type === 'quiz' && block.content && block.content.options) {
                        for (const opt of block.content.options) {
                            if (opt.isCorrect) {
                                quizAnswerMap.set(block.id, opt.id);
                            }
                        }
                    }
                }
            }

            document.querySelectorAll('.quiz-card').forEach(card => {
                const quizId = (card as HTMLElement).dataset.quizId || '';
                const correctOptionId = quizAnswerMap.get(quizId) || '';
                const retryBtn = card.querySelector('.retry-btn') as HTMLButtonElement | null;
                const radioButtons = card.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
                const options = card.querySelectorAll('.quiz-option');

                const handleAnswer = (e: Event) => {
                    const selectedInput = e.currentTarget as HTMLInputElement;
                    const selectedOptionEl = selectedInput.closest('.quiz-option') as HTMLElement | null;
                    if (!selectedOptionEl) return;
                    radioButtons.forEach(rb => { rb.disabled = true; });

                    const selectedId = selectedOptionEl.dataset.optionId || '';
                    const isSelectedCorrect = selectedId === correctOptionId;

                    options.forEach(opt => {
                        const el = opt as HTMLElement;
                        const optId = el.dataset.optionId || '';
                        const checkIcon = el.querySelector('.check-icon') as HTMLElement | null;
                        const xIcon = el.querySelector('.x-icon') as HTMLElement | null;

                        if (optId === correctOptionId) {
                            el.style.background = 'hsl(var(--primary)/.1)';
                            el.style.borderColor = 'hsl(var(--primary)/.5)';
                            if (checkIcon) checkIcon.style.display = 'inline-block';
                        }

                        if (el === selectedOptionEl && !isSelectedCorrect) {
                            el.style.background = 'hsl(var(--destructive)/.1)';
                            el.style.borderColor = 'hsl(var(--destructive)/.5)';
                            if (xIcon) xIcon.style.display = 'inline-block';
                        }
                    });

                    if (retryBtn) retryBtn.style.display = 'inline-flex';
                };

                radioButtons.forEach(radio => { radio.addEventListener('change', handleAnswer); });

                if (retryBtn) {
                    retryBtn.addEventListener('click', () => {
                        radioButtons.forEach(rb => { rb.disabled = false; rb.checked = false; });
                        options.forEach(opt => {
                            const el = opt as HTMLElement;
                            el.style.background = '';
                            el.style.borderColor = '';
                            const checkIcon = el.querySelector('.check-icon') as HTMLElement | null;
                            const xIcon = el.querySelector('.x-icon') as HTMLElement | null;
                            if (checkIcon) checkIcon.style.display = 'none';
                            if (xIcon) xIcon.style.display = 'none';
                        });
                        retryBtn.style.display = 'none';
                    });
                }
            });

            const toolbar = document.querySelector('.accessibility-toolbar');
            if (toolbar) {
                const printBtn = toolbar.querySelector('[data-action="print"]');
                const zoomInBtn = toolbar.querySelector('[data-action="zoom-in"]');
                const zoomOutBtn = toolbar.querySelector('[data-action="zoom-out"]');
                const contrastBtn = toolbar.querySelector('[data-action="contrast"]');

                if (printBtn) {
                    printBtn.addEventListener('click', () => {
                        const modal = document.getElementById('printing-modal');
                        if (modal) modal.style.display = 'flex';
                        document.querySelectorAll('.module-section').forEach(module => {
                            (module as HTMLElement).style.display = 'block';
                        });
                        setTimeout(() => {
                            window.print();
                            if (modal) modal.style.display = 'none';
                            showModule(currentModuleIndex);
                        }, 1000);
                    });
                }

                if (contrastBtn) contrastBtn.addEventListener('click', () => document.body.classList.toggle('high-contrast'));
                const handleFontSize = (increase: boolean) => {
                    const html = document.documentElement;
                    const currentSize = parseFloat(window.getComputedStyle(html).fontSize);
                    const newSize = increase ? currentSize + 1 : currentSize - 1;
                    if (newSize >= 12 && newSize <= 24) { html.style.fontSize = newSize + 'px'; }
                };
                if (zoomInBtn) zoomInBtn.addEventListener('click', () => handleFontSize(true));
                if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => handleFontSize(false));
            }

            window.addEventListener('afterprint', () => {
                const modal = document.getElementById('printing-modal');
                if (modal) modal.style.display = 'none';
                showModule(currentModuleIndex);
            });

            if (coverSection && handbookRoot) {
                (coverSection as HTMLElement).style.display = 'flex';
                (handbookRoot as HTMLElement).style.display = 'none';
            } else {
                showModule(0);
            }
        });
    };
    return `(${scriptContent.toString()})()`;
};

const fontMap: Record<string, { name: string; family: string }> = {
    '"Roboto Slab", serif': { name: 'Roboto Slab', family: '"Roboto Slab", serif' },
    '"Inter", sans-serif': { name: 'Inter', family: '"Inter", sans-serif' },
    '"Lato", sans-serif': { name: 'Lato', family: '"Lato", sans-serif' },
};

const getGoogleFontsUrl = (_theme: Theme): string => {
    // Fixado em Inter para máxima compatibilidade e consistência no HTML exportado
    return `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap`;
};

// Ícones SVG otimizados (reutilizáveis)
const quoteIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="quote-icon"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2S6 3.75 6 5v6H4c-1 1 0 5 3 5z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2s-2 1.25-2 3v6h-2c-1 1 0 5 3 5z"></path></svg>';
const checkIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="check-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
const xIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="x-icon"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
const prevArrowSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
const nextArrowSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
const videoPlaceholderSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>';

const renderBlockToHtml = (block: Block): string => {
    switch (block.type) {
        case 'text':
            return `<div class="prose">${DOMPurify.sanitize(block.content.text || '')}</div>`;
        case 'image':
            const { url, alt, caption, width } = block.content;
            const imgWidth = width || 100;
            return `<div class="img-wrapper"><figure class="img-figure" style="width:${imgWidth}%"><img src="${url || 'https://placehold.co/600x400.png'}" alt="${alt || ''}" class="img-element" loading="lazy" decoding="async"/>${caption ? `<figcaption class="img-caption">${caption}</figcaption>` : ''}</figure></div>`;
        case 'quote':
            return `<div class="quote-wrapper"><blockquote class="quote-block">${quoteIconSvg}${block.content.text || ''}</blockquote></div>`;
        case 'video':
            const { videoType, videoUrl, vimeoVideoId, cloudflareVideoId, smartplayUrl, videoTitle, autoplay, showControls } = block.content;
            let videoEmbedUrl = '';
            let videoLink = '#';
            let finalVideoLinkHtml = '';

            if (videoType === 'youtube' && videoUrl) {
                try {
                    const urlObj = new URL(videoUrl);
                    let videoId = urlObj.searchParams.get('v');
                    if (urlObj.hostname === 'youtu.be') videoId = urlObj.pathname.substring(1);
                    if (videoId) {
                        videoEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&controls=${showControls ? 1 : 0}&rel=0`;
                        videoLink = videoUrl;
                    }
                } catch (e) { }
            } else if (videoType === 'vimeo' && vimeoVideoId) {
                videoEmbedUrl = `https://player.vimeo.com/video/${vimeoVideoId}?autoplay=${autoplay ? 1 : 0}&controls=${showControls ? 1 : 0}`;
                videoLink = `https://vimeo.com/${vimeoVideoId}`;
            } else if (videoType === 'cloudflare' && cloudflareVideoId) {
                videoEmbedUrl = `https://customer-mhnunnb8-97evy1sb.cloudflarestream.com/${cloudflareVideoId}/iframe?autoplay=${autoplay}&controls=${showControls}`;
                videoLink = '#';
            } else if (videoType === 'smartplay' && smartplayUrl) {
                videoEmbedUrl = smartplayUrl;
                videoLink = smartplayUrl;
            }

            if (videoLink !== '#') {
                let displayUrl = videoLink;
                if (videoType === 'smartplay' && displayUrl.length > 50) {
                    displayUrl = displayUrl.substring(0, 50) + '...';
                }
                finalVideoLinkHtml = `<div class="video-link">Link: <a href="${videoLink}" target="_blank" rel="noopener noreferrer">${displayUrl}</a></div>`;
            }

            return `<div class="video-container">${!videoEmbedUrl ? `<p class="video-error">Vídeo inválido ou não configurado.</p>` : `<iframe class="video-iframe" src="${videoEmbedUrl}" title="${videoTitle || 'Vídeo'}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen></iframe>`}<div class="video-print-placeholder">${videoPlaceholderSvg}<div class="video-print-content"><div class="video-print-title">Este conteúdo é um vídeo interativo.</div><div class="video-print-subtitle">${videoTitle || 'Vídeo'}</div>${finalVideoLinkHtml}</div></div></div>`;
        case 'button':
            return `<div class="btn-wrapper"><a href="${block.content.buttonUrl || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">${block.content.buttonText || 'Botão'}</a></div>`;
        case 'quiz': {
            // Não expor data-correct no HTML para não revelar respostas visualmente via CSS
            // Os dados corretos ficam só no JSON embutido, acessado pelo JS
            const optionsHtml = block.content.options?.map(option => `
                <div class="quiz-option" data-option-id="${option.id}">
                    <input type="radio" name="quiz-${block.id}" id="opt-${option.id}" class="radio-group-item"/>
                    <label for="opt-${option.id}" class="quiz-option-label">${option.text}</label>
                    ${checkIconSvg}${xIconSvg}
                </div>`).join('') || '';
            return `<div class="quiz-card" data-quiz-id="${block.id}"><div class="card-header"><h3 class="quiz-question">${block.content.question || ''}</h3><p class="quiz-instruction">Selecione a resposta correta.</p></div><div class="card-content"><div class="quiz-options">${optionsHtml}</div></div><div class="card-footer"><button class="btn btn-outline retry-btn" style="display:none">Tentar Novamente</button></div></div>`;
        }
        default:
            return `<!-- Bloco ${block.type} não suportado -->`;
    }
};

const renderProjectsToHtml = (projects: Project[]): string => {
    return projects.map((project, index) => {
        const blocksHtml = project.blocks.map((block) => `<div data-block-id="${block.id}"><div class="block-spacer"></div>${renderBlockToHtml(block)}</div>`).join('');
        
        return `<section class="module-section" data-module-id="${project.id}"><header class="module-header"><h2 class="module-title">${project.title}</h2><p class="module-description">${project.description}</p></header><div class="module-content">${blocksHtml}</div><footer class="module-footer"><button data-direction="prev" class="btn btn-outline btn-nav module-nav-btn">${prevArrowSvg}Módulo Anterior</button><span class="module-progress">Módulo ${index + 1} de ${projects.length}</span><button data-direction="next" class="btn btn-primary btn-nav module-nav-btn">Próximo Módulo${nextArrowSvg}</button></footer></section>`;
    }).join('');
};

// ============================================================================
// CSS OTIMIZADO
// ============================================================================

const getOptimizedCss = (theme: Theme): string => {
  const wm = theme.watermark;
  const wmStyles = wm?.enabled ? `
    :root {
      --wm-opacity: ${wm.opacity};
      --wm-color: ${wm.color};
      --wm-size: ${wm.fontSize}px;
      --wm-rotate: ${wm.rotate}deg;
    }
  ` : '';

    return `${wmStyles}:root{--background:240 5% 96%;--foreground:222.2 84% 4.9%;--card:0 0% 100%;--card-foreground:222.2 84% 4.9%;--popover:0 0% 100%;--popover-foreground:0 0% 3.9%;--primary:${theme.colorPrimary};--primary-foreground:0 0% 98%;--secondary:210 40% 98%;--secondary-foreground:222.2 47.4% 11.2%;--muted:210 40% 96.1%;--muted-foreground:215 20.2% 65.1%;--accent:210 40% 96.1%;--accent-foreground:222.2 47.4% 11.2%;--destructive:0 84.2% 60.2%;--destructive-foreground:0 0% 98%;--border:214 31.8% 91.4%;--input:214 31.8% 91.4%;--ring:${theme.colorPrimary};--radius:.75rem;--font-heading:'Inter',system-ui,sans-serif;--font-body:'Inter',system-ui,sans-serif}.dark{--background:222.2 84% 4.9%;--foreground:210 40% 98%;--card:222.2 84% 4.9%;--card-foreground:210 40% 98%;--popover:222.2 84% 4.9%;--popover-foreground:210 40% 98%;--primary:217 91% 65%;--primary-foreground:222.2 47.4% 11.2%;--secondary:217.2 32.6% 17.5%;--secondary-foreground:210 40% 98%;--muted:217.2 32.6% 17.5%;--muted-foreground:215 20.2% 65.1%;--accent:217.2 32.6% 17.5%;--accent-foreground:210 40% 98%;--destructive:0 62.8% 30.6%;--destructive-foreground:210 40% 98%;--border:217.2 32.6% 17.5%;--input:217.2 32.6% 17.5%;--ring:217.2 32.6% 17.5%}body.high-contrast{background-color:#000!important;color:#fff!important}body.high-contrast *{color:#fff!important}body.high-contrast .bg-card,body.high-contrast .bg-muted\\/30,body.high-contrast .bg-primary{background-color:#000!important;border:1px solid #fff}body.high-contrast .text-primary{color:#ff0!important}body.high-contrast .border-primary,body.high-contrast .quiz-option.bg-primary\\/10{border-color:#ff0!important}body.high-contrast a,body.high-contrast .text-primary,body.high-contrast .check-icon{color:#ff0!important}body.high-contrast .radio-group-item{border-color:#fff!important}body.high-contrast .check-icon{fill:#ff0!important}body,.prose{font-family:var(--font-body)}h1,h2,h3,h4,h5,h6,.prose h1,.prose h2,.prose h3{font-family:var(--font-heading)}.module-section:not(.cover-section){display:none}.video-player-export{display:block}.video-print-placeholder-export{display:none}#handbook-root{margin-top:0;display:block}.cover-section{width:100%;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden}.cover-image{width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;z-index:1}.cover-overlay{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.4);z-index:2}.cover-content{position:relative;z-index:3;color:#fff;padding:2rem}.back-cover-section{display:none}.main-content{padding:1rem}@media(min-width:640px){.main-content{padding:2rem}}@media(min-width:768px){.main-content{padding:3rem}}.print-content{padding:2rem}@media(min-width:640px){.print-content{padding:3rem}}@media(min-width:768px){.print-content{padding:4rem}}#handbook-root{padding:2rem}@media(min-width:640px){#handbook-root{padding:3rem}}@media(min-width:768px){#handbook-root{padding:4rem}}@media print{@page{size:A4;margin:2cm}@page cover{margin:0!important}*,*::before,*::after{box-sizing:border-box!important}.no-print,.no-print *,header,.accessibility-toolbar,#floating-nav-container,footer.no-print,button.no-print,.module-nav-btn, .notes-toggle, .notes-panel{display:none!important;visibility:hidden!important;height:0!important;width:0!important;overflow:hidden!important}html,body{background:#fff!important;color:#000!important;font-size:11pt!important;width:100%!important;height:auto!important;margin:0!important;padding:0!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}#printable-content,main.main-content{width:100%!important;margin:0!important;padding:0!important;display:block!important}#printing-modal{display:none!important}.main-content,.print-content{padding:0!important}#handbook-root,div#handbook-root{box-shadow:none!important;border:none!important;border-radius:0!important;background:#fff!important;margin:0!important;padding:0!important;width:100%!important;max-width:none!important}.cover-section,section.cover-section{page:cover;width:210mm!important;height:297mm!important;margin:0!important;padding:0!important;page-break-after:always!important;position:relative!important;left:0!important;top:0!important}.cover-section .cover-image,.cover-section img{width:100%!important;height:100%!important;object-fit:cover!important}.cover-section .cover-content,.cover-section button{display:none!important}.module-section,section.module-section{display:block!important;page-break-before:always!important;width:100%!important;padding-top:0!important}.module-section:first-of-type{page-break-before:auto!important}.cover-section+.module-section,section.cover-section+section.module-section{page-break-before:auto!important}.module-section:last-of-type{page-break-after:auto!important}.back-cover-section,section.back-cover-section{page:cover;width:210mm!important;height:297mm!important;margin:0!important;padding:0!important;page-break-before:always!important}.back-cover-section img,.back-cover-image{width:100%!important;height:100%!important;object-fit:cover!important}.video-player-export{display:none!important}.video-print-placeholder-export{display:block!important}.video-container .video-iframe{display:none!important}.video-container .video-print-placeholder{display:flex!important;break-inside:avoid;page-break-inside:avoid!important}h1,h2,h3,h4,h5,h6{page-break-after:avoid!important;break-after:avoid!important}.quiz-card,.video-container,.img-figure,blockquote,figure{page-break-inside:avoid!important;break-inside:avoid!important}a{color:#000!important;text-decoration:none!important}}${consolidatedCss}`;
};


// ============================================================================
// NAVEGAÇÃO FLUTUANTE
// ============================================================================

const getFloatingNavHtml = (projects: Project[]) => `
    <div id="floating-nav-container" class="fixed bottom-5 right-5 z-50 no-print">
        <div id="floating-nav-menu" class="hidden absolute bottom-16 right-0 bg-card border rounded-lg shadow-lg p-2 w-64">
             <p class="font-semibold text-sm px-2 py-1">Módulos</p>
             <div class="px-1 pb-1">
                <input id="module-search-input" type="text" placeholder="Pesquisar módulo..." class="w-full text-sm p-1.5 border rounded-md bg-transparent"/>
             </div>
             <div id="module-list-scroll-area" class="space-y-1">
                ${projects.map((p, i) => `
                    <div class="module-item-container">
                        <button class="floating-nav-btn w-full text-left p-2 text-sm hover:bg-primary/10 rounded-md">${i + 1}. ${p.title}</button>
                    </div>
                `).join('')}
            </div>
        </div>
        <button id="floating-nav-toggle" class="bg-primary text-primary-foreground rounded-full h-14 w-14 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
    </div>
`;

export const generatePrintHtml = (data: HandbookData): string => {
    const { theme, title } = data;

    const globalCss = getOptimizedCss(theme);
    const interactiveScript = minifyJs(getInteractiveScript(theme));

    const coverHtml = theme.cover ? `
        <section class="cover-section module-section">
            <img src="${theme.cover}" alt="Capa da Apostila" class="cover-image"/>
            <div class="cover-content">
                <button id="start-handbook-btn" class="no-print inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 mr-2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    Iniciar Apostila
                </button>
            </div>
        </section>
    ` : '';

    const backCoverHtml = theme.backCover ? `
        <section class="back-cover-section module-section">
            <img src="${theme.backCover}" alt="Contracapa da Apostila" class="back-cover-image"/>
        </section>
    ` : '';

    const interactiveContentHtml = renderProjectsToHtml(data.projects);
    const floatingNavHtml = getFloatingNavHtml(data.projects);

    return removeRedundantAttributes(aggressiveMinifyHtml(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="${getGoogleFontsUrl(theme)}" rel="stylesheet">
            <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
            <style>
                :root {
                    ${getWatermarkCssVariables(theme)}
                }
                ${globalCss}
            </style>
            <script>
                tailwind.config = {
                  theme: { 
                    extend: { 
                      fontFamily: {
                        heading: ['Inter', 'system-ui', 'sans-serif'],
                        body: ['Inter', 'system-ui', 'sans-serif'],
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                      },
                      colors: { 
                          border: 'hsl(var(--border))', 
                          input: 'hsl(var(--input))', 
                          ring: 'hsl(var(--ring))', 
                          background: 'hsl(var(--background))', 
                          foreground: 'hsl(var(--foreground))', 
                          primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' }, 
                          secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' }, 
                          destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' }, 
                          muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' }, 
                          accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' }, 
                          popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' }, 
                          card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' } 
                      },
                      borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)',
                      },
                       typography: ({ theme }) => ({
                        DEFAULT: {
                          css: {
                            '--tw-prose-body': 'hsl(var(--foreground))',
                            '--tw-prose-headings': 'hsl(var(--foreground))',
                            '--tw-prose-lead': 'hsl(var(--foreground))',
                            '--tw-prose-links': 'hsl(var(--primary))',
                            '--tw-prose-bold': 'hsl(var(--foreground))',
                            '--tw-prose-counters': 'hsl(var(--muted-foreground))',
                            '--tw-prose-bullets': 'hsl(var(--muted-foreground))',
                            '--tw-prose-hr': 'hsl(var(--border))',
                            '--tw-prose-quotes': 'hsl(var(--foreground))',
                            '--tw-prose-quote-borders': 'hsl(var(--primary))',
                            '--tw-prose-captions': 'hsl(var(--muted-foreground))',
                            '--tw-prose-code': 'hsl(var(--foreground))',
                            '--tw-prose-pre-code': 'hsl(var(--foreground))',
                            '--tw-prose-pre-bg': 'hsl(var(--muted))',
                            '--tw-prose-invert-body': 'hsl(var(--background))',
                            '--tw-prose-invert-headings': 'hsl(var(--primary))',
                            '--tw-prose-invert-lead': 'hsl(var(--background))',
                            '--tw-prose-invert-links': 'hsl(var(--primary))',
                            '--tw-prose-invert-bold': 'hsl(var(--background))',
                            '--tw-prose-invert-counters': 'hsl(var(--muted-foreground))',
                            '--tw-prose-invert-bullets': 'hsl(var(--muted-foreground))',
                            '--tw-prose-invert-hr': 'hsl(var(--border))',
                            '--tw-prose-invert-quotes': 'hsl(var(--background))',
                            '--tw-prose-invert-quote-borders': 'hsl(var(--border))',
                            '--tw-prose-invert-captions': 'hsl(var(--muted-foreground))',
                            '--tw-prose-invert-code': 'hsl(var(--background))',
                            '--tw-prose-invert-pre-code': 'hsl(var(--background))',
                            '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
                            '--tw-prose-invert-th-borders': 'hsl(var(--border))',
                            '--tw-prose-invert-td-borders': 'hsl(var(--border))',
                          },
                        },
                      }),
                    } 
                  }
                }
            </script>
            <script id="handbook-data" type="application/json">${JSON.stringify(data)}</script>
        </head>
        <body class="bg-secondary/40 text-foreground font-sans antialiased">
             <div id="printing-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.4); justify-content:center; align-items:center; z-index:9999;">
                <div style="background:white; padding:20px; border-radius:12px; font-family:sans-serif; text-align:center;">
                    <div class="loader" style="margin:auto; width:24px; height:24px; border:3px solid #ccc; border-top-color:#000; border-radius:50%; animation: spin 1s linear infinite;"></div>
                    <p style="margin-top:10px;">Preparando impressão...</p>
                </div>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
             </div>
    
             <div id="handbook-root" class="max-w-4xl mx-auto bg-card shadow-xl min-h-screen">
                ${coverHtml}
                ${interactiveContentHtml}
                ${backCoverHtml}
             </div>
    
             ${getWatermarkHtml(theme)}

             <button id="notes-toggle-btn" class="notes-toggle no-print" title="Minhas Anotações">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/><path d="M9 18h6"/><path d="M9 14h6"/></svg>
             </button>

             <div id="notes-panel" class="notes-panel no-print">
                <div class="notes-header">
                    <h3 class="font-bold">Anotações</h3>
                    <button id="close-notes-btn" class="btn-ghost p-1 text-white hover:bg-white/20 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <div class="notes-content">
                    <p id="notes-module-title" class="text-sm font-semibold opacity-80"></p>
                    <textarea id="notes-textarea" class="notes-textarea" placeholder="Escreva o que você aprendeu neste módulo..."></textarea>
                </div>
                <div class="notes-footer">
                    <button id="export-notes-btn" class="btn-primary w-full py-2">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                         Exportar (.txt)
                    </button>
                    <button id="clear-notes-btn" class="btn-outline p-2 text-destructive hover:bg-destructive/10" title="Limpar tudo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                </div>
             </div>
    
             ${floatingNavHtml}
             <div class="accessibility-toolbar fixed top-5 right-5 z-50 flex gap-2 no-print">
                 <button class="bg-primary text-primary-foreground p-2 rounded-full shadow-lg" data-action="print" title="Imprimir">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2-2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                 </button>
                 <button class="bg-primary text-primary-foreground p-2 rounded-full shadow-lg" data-action="contrast" title="Alto Contraste">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 18a6 6 0 0 0 0-12v12z"></path></svg>
                 </button>
                 <button class="bg-primary text-primary-foreground p-2 rounded-full shadow-lg" data-action="zoom-in" title="Aumentar Fonte">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                 </button>
                 <button class="bg-primary text-primary-foreground p-2 rounded-full shadow-lg" data-action="zoom-out" title="Diminuir Fonte">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                 </button>
             </div>
    
             <script>${interactiveScript}</script>
         </body>
         </html>
    `));
};

interface ExportParams {
    projects: Project[];
    handbookTitle: string;
    handbookDescription: string;
    handbookId: string;
    handbookUpdatedAt: string;
    handbookTheme: Theme;
    setIsExporting: (isExporting: boolean) => void;
    toast: (options: { variant?: 'default' | 'destructive', title: string, description?: string }) => void;
}

export const handleExportZip = async ({
    projects, handbookTitle, handbookDescription, handbookId, handbookUpdatedAt, handbookTheme, setIsExporting, toast
}: ExportParams) => {
    if (!projects || projects.length === 0) {
        toast({ variant: 'destructive', title: 'Nenhum módulo para exportar.' });
        return;
    }
    setIsExporting(true);

    try {
        const zip = new JSZip();
        const cleanTitle = (handbookTitle || 'apostila').toLowerCase().replace(/\s+/g, '-');
        
        // Criar dados da apostila
        let handbookData: HandbookData = { id: handbookId, title: handbookTitle, description: handbookDescription, updatedAt: handbookUpdatedAt, theme: handbookTheme, projects };
        
        // Otimizar imagens (redimensionar e comprimir)
        handbookData = await processHandbookImages(handbookData);

        // Deduplicar imagens
        const deduplicated = deduplicateImages(handbookData);
        handbookData = deduplicated.data;

        if (deduplicated.savings > 0) {
            toast({ 
                title: 'Otimização concluída',
                description: `Economia de ${(deduplicated.savings / 1024).toFixed(2)} KB na deduplicação`
            });
        }

        // Resetar estados dos quizzes (exportar sem respostas pré-selecionadas)
        handbookData = resetQuizStates(handbookData);

        const coverHtml = handbookData.theme.cover ? `
            <section class="cover-section module-section">
                <img src="${handbookData.theme.cover}" alt="Capa da Apostila" class="cover-image"/>
                <div class="cover-content">
                    <button id="start-handbook-btn" class="btn btn-primary btn-large">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon-large"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        Iniciar Apostila
                    </button>
                </div>
            </section>
        ` : '';

        const backCoverHtml = handbookData.theme.backCover ? `
            <section class="back-cover-section module-section">
                <img src="${handbookData.theme.backCover}" alt="Contracapa da Apostila" class="back-cover-image"/>
            </section>
        ` : '';

        const interactiveContentHtml = renderProjectsToHtml(handbookData.projects);
        const floatingNavHtml = getFloatingNavHtml(handbookData.projects);

        const interactiveScript = minifyJs(getInteractiveScript(handbookData.theme));

        const finalHtml = removeRedundantAttributes(aggressiveMinifyHtml(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${handbookTitle}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="${getGoogleFontsUrl(handbookTheme)}" rel="stylesheet">
                <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
                <style>${getOptimizedCss(handbookTheme)}</style>
                <script>
                    tailwind.config = {
                      theme: { 
                        extend: { 
                          fontFamily: {
                            heading: ['Inter', 'system-ui', 'sans-serif'],
                            body: ['Inter', 'system-ui', 'sans-serif'],
                            sans: ['Inter', 'system-ui', 'sans-serif'],
                          },
                          colors: { 
                              border: 'hsl(var(--border))', 
                              input: 'hsl(var(--input))', 
                              ring: 'hsl(var(--ring))', 
                              background: 'hsl(var(--background))', 
                              foreground: 'hsl(var(--foreground))', 
                              primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' }, 
                              secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' }, 
                              destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' }, 
                              muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' }, 
                              accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' }, 
                              popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' }, 
                              card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' } 
                          },
                          borderRadius: {
                            lg: 'var(--radius)',
                            md: 'calc(var(--radius) - 2px)',
                            sm: 'calc(var(--radius) - 4px)',
                          },
                           typography: ({ theme }) => ({
                            DEFAULT: {
                              css: {
                                '--tw-prose-body': 'hsl(var(--foreground))',
                                '--tw-prose-headings': 'hsl(var(--foreground))',
                                '--tw-prose-lead': 'hsl(var(--foreground))',
                                '--tw-prose-links': 'hsl(var(--primary))',
                                '--tw-prose-bold': 'hsl(var(--foreground))',
                                '--tw-prose-counters': 'hsl(var(--muted-foreground))',
                                '--tw-prose-bullets': 'hsl(var(--muted-foreground))',
                                '--tw-prose-hr': 'hsl(var(--border))',
                                '--tw-prose-quotes': 'hsl(var(--foreground))',
                                '--tw-prose-quote-borders': 'hsl(var(--primary))',
                                '--tw-prose-captions': 'hsl(var(--muted-foreground))',
                                '--tw-prose-code': 'hsl(var(--foreground))',
                                '--tw-prose-pre-code': 'hsl(var(--foreground))',
                                '--tw-prose-pre-bg': 'hsl(var(--muted))',
                                '--tw-prose-invert-body': 'hsl(var(--background))',
                                '--tw-prose-invert-headings': 'hsl(var(--primary))',
                                '--tw-prose-invert-lead': 'hsl(var(--background))',
                                '--tw-prose-invert-links': 'hsl(var(--primary))',
                                '--tw-prose-invert-bold': 'hsl(var(--background))',
                                '--tw-prose-invert-counters': 'hsl(var(--muted-foreground))',
                                '--tw-prose-invert-bullets': 'hsl(var(--muted-foreground))',
                                '--tw-prose-invert-hr': 'hsl(var(--border))',
                                '--tw-prose-invert-quotes': 'hsl(var(--background))',
                                '--tw-prose-invert-quote-borders': 'hsl(var(--border))',
                                '--tw-prose-invert-captions': 'hsl(var(--muted-foreground))',
                                '--tw-prose-invert-code': 'hsl(var(--background))',
                                '--tw-prose-invert-pre-code': 'hsl(var(--background))',
                                '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
                                '--tw-prose-invert-th-borders': 'hsl(var(--border))',
                                '--tw-prose-invert-td-borders': 'hsl(var(--border))',
                              },
                            },
                          }),
                        } 
                      }
                    }
                </script>
                <script id="handbook-data" type="application/json">${JSON.stringify(handbookData)}</script>
            </head>
            <body class="bg-secondary/40 text-foreground font-sans antialiased">
                 <div id="printing-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.4); justify-content:center; align-items:center; z-index:9999;">
                    <div style="background:white; padding:20px; border-radius:12px; font-family:sans-serif; text-align:center;">
                        <div class="loader" style="margin:auto; width:24px; height:24px; border:3px solid #ccc; border-top-color:#000; border-radius:50%; animation: spin 1s linear infinite;"></div>
                        <p style="margin-top:10px;">Preparando PDF...</p>
                    </div>
                </div>
                <style> @keyframes spin { to { transform: rotate(360deg); } } </style>
                <header class="py-4 px-6 bg-primary text-primary-foreground no-print">
                    <div class="max-w-4xl mx-auto flex flex-row justify-between items-center">
                        <h1 class="text-xl font-bold">${handbookTitle}</h1>
                        <div class="flex items-center gap-1 bg-primary p-1 rounded-lg border border-primary-foreground/20 accessibility-toolbar">
                            <button data-action="print" class="p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-md" title="Imprimir/Salvar PDF"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"></path><rect x="6" y="14" width="12" height="8" rx="1"></rect></svg></button>
                            <div class="flex items-center border-l border-r border-primary-foreground/20 mx-1 px-1">
                                <button data-action="zoom-out" class="p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-md" title="Diminuir Fonte"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg></button>
                                <button data-action="zoom-in" class="p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-md" title="Aumentar Fonte"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg></button>
                            </div>
                            <button data-action="contrast" class="p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-md" title="Alto Contraste"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 18a6 6 0 0 0 0-12v12z"></path></svg></button>
                        </div>
                    </div>
                </header>
                 <main id="printable-content" class="max-w-4xl mx-auto main-content">
                    ${coverHtml}
                    <div id="handbook-root" class="bg-card rounded-xl shadow-lg print-content">
                        ${interactiveContentHtml}
                    </div>
                    ${backCoverHtml}
                </main>
                ${floatingNavHtml}
                <script>${interactiveScript}</script>
                ${getWatermarkHtml(handbookTheme)}
                <style>
                    :root {
                        ${getWatermarkCssVariables(handbookTheme)}
                    }
                </style>
            </body>
            </html>`));

        zip.file('index.html', finalHtml, { compression: 'DEFLATE', compressionOptions: { level: 9 } });
        const blob = await zip.generateAsync({ 
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 9 }
        });
        saveAs(blob, `apostila-${cleanTitle}.zip`);

        toast({ title: 'Exportação Concluída' });
    } catch (error) {
        console.error('Falha ao exportar o projeto', error);
    } finally {
        setIsExporting(false);
    }
};
