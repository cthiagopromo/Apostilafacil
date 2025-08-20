
'use client';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Project } from './types';

// This is a simplified, transpiled-like version of React components
// to be used in the exported standalone application.

const getAppScript = () => `
const e = React.createElement;

// --- UTILITY FUNCTIONS ---
const cn = (...args) => args.filter(Boolean).join(' ');

// --- COMPONENTS ---

const AccessibilityToolbar = () => {
  const handlePrint = () => {
    document.getElementById('loading-modal')?.style.setProperty('display', 'flex', 'important');
    // Using the browser's native print functionality after pagedjs has done its work.
    window.print();
    // Hide the loader after a short delay, as we can't know when the print dialog closes.
    setTimeout(() => {
        document.getElementById('loading-modal')?.style.setProperty('display', 'none', 'important');
    }, 2000);
  };

  const handleFontSize = (increase) => {
    const body = document.body;
    const currentSize = parseFloat(window.getComputedStyle(body).fontSize);
    const newSize = increase ? currentSize + 1 : currentSize - 1;
    if (newSize >= 12 && newSize <= 24) body.style.fontSize = \`\${newSize}px\`;
  };

  const toggleContrast = () => document.body.classList.toggle('high-contrast');

  return e('div', { className: 'flex items-center gap-1' },
    e('button', { onClick: handlePrint, title: 'Exportar para PDF', className: 'toolbar-btn' }, e('svg', {width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round'}, e('path', {d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'}), e('polyline', {points: '7 10 12 15 17 10'}), e('line', {x1: 12, y1: 15, x2: 12, y2: 3}))),
    e('button', { onClick: () => alert('Funcionalidade em desenvolvimento.'), title: 'Libras', className: 'toolbar-btn' }, e('svg', {width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round'}, e('path', {d: 'M18 16.5V15a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v1.5'}), e('path', {d: 'M22 13.5V15a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1.5'}), e('path', {d: 'M7 10a2 2 0 0 0-2 2v5'}), e('path', {d: 'M11 10a2 2 0 0 1 2 2v5'}), e('path', {d: 'M12 1a7 7 0 0 1 7 7c0 3-2 5-2 5H7s-2-2-2-5a7 7 0 0 1 7-7Z'}))),
    e('div', { className: 'font-zoom-controls' },
      e('button', { onClick: () => handleFontSize(false), title: 'Diminuir Fonte', className: 'toolbar-btn' }, e('svg', {width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round'}, e('circle', {cx:12, cy:12, r:10}), e('path', {d: 'M8 12h8'}))),
      e('button', { onClick: () => handleFontSize(true), title: 'Aumentar Fonte', className: 'toolbar-btn' }, e('svg', {width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round'}, e('circle', {cx:12, cy:12, r:10}), e('path', {d: 'M8 12h8'}), e('path', {d: 'M12 8v8'})))
    ),
    e('button', { onClick: toggleContrast, title: 'Alto Contraste', className: 'toolbar-btn' }, e('svg', {width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round'}, e('circle', {cx:12, cy:12, r:10}), e('path', {d: 'M12 18a6 6 0 0 0 0-12v12Z'}))),
    e('button', { onClick: () => alert('Funcionalidade em desenvolvimento.'), title: 'Acessibilidade', className: 'toolbar-btn' }, e('svg', {width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round'}, e('path', {d: 'M18.3 12.7a5 5 0 0 0-1.3-6.9'}),e('path', {d: 'M14.6 3.2a5 5 0 0 0-6.9 1.3'}),e('path', {d: 'M11.3 20.8a5 5 0 0 0 6.9-1.3'}),e('path', {d: 'M7.4 14.8a5 5 0 0 0 1.3 6.9'}),e('path', {d: 'M2 12h2'}),e('path', {d: 'm5.6 5.6 1.4 1.4'}),e('path', {d: 'M12 2v2'}),e('path', {d: 'm18.4 5.6-1.4 1.4'}),e('path', {d: 'M22 12h-2'}),e('path', {d: 'm18.4 18.4 1.4 1.4'}),e('path', {d: 'M12 22v-2'}),e('path', {d: 'm5.6 18.4-1.4 1.4'}),e('circle', {cx:12, cy:12, r:2}))))
  );
};

const PreviewHeader = ({ title }) => {
  return e('header', { className: 'py-4 px-6 bg-primary text-primary-foreground no-print' },
    e('div', { className: 'max-w-4xl mx-auto flex flex-row justify-between items-center' },
      e('h1', { className: 'text-xl font-bold' }, title),
      e(AccessibilityToolbar)
    )
  );
};

const QuizBlock = ({ block }) => {
  const [userAnswerId, setUserAnswerId] = React.useState(null);
  const isAnswered = userAnswerId !== null;

  const handleSelect = (optionId) => {
    if (!isAnswered) setUserAnswerId(optionId);
  };
  
  const handleRetry = () => setUserAnswerId(null);

  return e('div', { className: 'quiz-card bg-muted/30' },
    e('div', { className: 'quiz-card-header' },
      e('h3', { className: 'quiz-card-title' }, block.content.question),
      e('p', { className: 'quiz-card-desc' }, 'Selecione a resposta correta.')
    ),
    e('div', { className: 'quiz-card-content' },
      block.content.options.map(option => {
        const isSelected = userAnswerId === option.id;
        const showResult = isAnswered && isSelected;
        const isCorrect = option.isCorrect;
        
        const optionClasses = cn(
          'quiz-option flex items-center space-x-3 p-3 rounded-md transition-all',
          isAnswered && isCorrect && 'correct',
          showResult && !isCorrect && 'incorrect',
          isSelected && 'selected'
        );

        return e('div', { key: option.id, className: optionClasses, onClick: () => handleSelect(option.id) },
          e('div', { className: 'radio-custom' }),
          e('label', { className: 'flex-1' }, option.text),
          showResult && isCorrect && e('span', {className: 'result-icon correct-icon'}, '✓'),
          showResult && !isCorrect && e('span', {className: 'result-icon incorrect-icon'}, '✗')
        );
      })
    ),
    e('div', {className: 'quiz-card-footer'},
       isAnswered && e('button', { className: 'retry-btn', onClick: handleRetry }, 'Tentar Novamente')
    )
  );
};

const BlockRenderer = ({ block }) => {
    const createSanitizedHtml = (html) => ({ __html: html });

    switch(block.type) {
        case 'text':
            return e('div', { className: 'prose dark:prose-invert max-w-none', dangerouslySetInnerHTML: createSanitizedHtml(block.content.text) });
        case 'image':
            return e('div', { className: 'flex justify-center' },
                e('figure', { className: 'flex flex-col items-center gap-2', style: { width: \`\${block.content.width || 100}%\` } },
                    e('img', { src: block.content.url, alt: block.content.alt, className: "rounded-md shadow-md max-w-full h-auto" }),
                    block.content.caption && e('figcaption', { className: "text-sm text-center text-muted-foreground italic mt-2" }, block.content.caption)
                )
            );
        case 'quote':
             return e('div', { className: "relative" },
                e('blockquote', { className: "p-6 bg-muted/50 border-l-4 border-primary rounded-r-lg text-lg italic text-foreground/80 m-0" }, 
                    e('svg', { className: 'absolute -top-3 -left-2 h-10 w-10 text-primary/20 quote-icon', fill: 'currentColor', viewBox: '0 0 24 24' }, e('path', { d: 'M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-9.57v7.219c-4.726 0-4.983 3.33-4.983 4.544v5.198h-4zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-9.57v7.219c-4.726 0-4.983 3.33-4.983 4.544v5.198h-4z'})),
                    block.content.text
                )
             );
        case 'video':
            let src = '';
            if (block.content.videoType === 'youtube' && block.content.videoUrl) {
                try {
                    const urlObj = new URL(block.content.videoUrl);
                    let videoId = urlObj.searchParams.get('v');
                    if (urlObj.hostname === 'youtu.be') videoId = urlObj.pathname.substring(1);
                    if (videoId) src = \`https://www.youtube.com/embed/\${videoId}?autoplay=\${block.content.autoplay ? 1:0}&controls=\${block.content.showControls ? 1:0}\`;
                } catch (e) { /* invalid url */ }
            } else if (block.content.videoType === 'cloudflare' && block.content.cloudflareVideoId) {
                src = \`https://customer-mhnunnb897evy1sb.cloudflarestream.com/\${block.content.cloudflareVideoId}/iframe?autoplay=\${block.content.autoplay ? 1:0}&controls=\${block.content.showControls ? 1:0}\`;
            }
            if (!src) return e('p', {className: "text-muted-foreground"}, 'Vídeo inválido ou não configurado.');
            return e('iframe', { className: "w-full aspect-video rounded-md", src, title: block.content.videoTitle, allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true });
        case 'button':
            return e('div', { className: 'flex justify-center' },
                e('a', { href: block.content.buttonUrl, target: '_blank', rel: 'noopener noreferrer', className: 'btn btn-primary' }, block.content.buttonText || 'Botão')
            );
        case 'quiz':
            return e(QuizBlock, { block });
        default:
            return e('p', {className: "text-muted-foreground"}, \`Bloco \${block.type} não renderizado.\`);
    }
}

const PrintableHandbook = ({ projects }) => {
  return e(React.Fragment, null,
    projects.map(project => e('section', { key: project.id, className: 'module-section' },
      e('header', { className: 'text-center' },
        e('h2', { className: 'text-3xl font-bold mb-2 pb-2' }, project.title),
        e('p', { className: 'text-muted-foreground' }, project.description)
      ),
      e('div', { className: 'space-y-8' },
        project.blocks.map(block => e(BlockRenderer, { key: block.id, block }))
      )
    ))
  );
};

const App = () => {
    const handbookData = window.apostilaData;
    if (!handbookData) {
        return e('p', null, 'Erro: Dados da apostila não encontrados.');
    }

    React.useEffect(() => {
        // Run paged.js after the component mounts to format for printing
        const paged = new Paged.Previewer();
        const content = document.getElementById('printable-content');
        const css = document.getElementById('handbook-styles').innerText;
        // The preview function takes the HTML content and an array of CSS strings
        paged.preview(content.innerHTML, [css], document.body).then((flow) => {
            console.log("Paged.js preview rendered, total pages:", flow.pages.length);
        });
    }, []);
    
    return e(React.Fragment, null,
        e(PreviewHeader, { title: handbookData.title }),
        e('main', { id: 'printable-content', className: 'max-w-4xl mx-auto p-4 sm:p-8 md:p-12' },
          e('div', { className: 'bg-card rounded-xl shadow-lg p-8 sm:p-12 md:p-16' },
            e(PrintableHandbook, { projects: handbookData.projects })
          )
        )
    );
};

ReactDOM.render(e(App), document.getElementById('root'));
`;

const getCssContent = () => `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
:root {
    --background: 240 5% 96%; --foreground: 222.2 84% 4.9%; --card: 0 0% 100%; --card-foreground: 222.2 84% 4.9%; --popover: 0 0% 100%; --popover-foreground: 0 0% 3.9%; --primary: 221 83% 53%; --primary-foreground: 0 0% 98%; --secondary: 210 40% 98%; --secondary-foreground: 222.2 47.4% 11.2%; --muted: 210 40% 96.1%; --muted-foreground: 215 20.2% 65.1%; --accent: 210 40% 96.1%; --accent-foreground: 222.2 47.4% 11.2%; --destructive: 0 84.2% 60.2%; --destructive-foreground: 0 0% 98%; --border: 214 31.8% 91.4%; --input: 214 31.8% 91.4%; --ring: 221 83% 53%; --radius: 0.75rem;
}
*,:after,:before{border:0 solid hsl(var(--border));box-sizing:border-box}
html { font-family: 'Inter', sans-serif; }
body { background-color: hsl(var(--secondary) / 0.4); color: hsl(var(--foreground)); transition: font-size 0.2s, background-color 0.3s, color 0.3s; margin: 0;}
body.high-contrast { background-color: black; color: white; }
body.high-contrast .bg-primary { background-color: black !important; border-bottom: 1px solid yellow; }
body.high-contrast .text-primary-foreground { color: yellow !important; }
body.high-contrast .bg-card { background-color: black !important; border: 1px solid white; }
body.high-contrast .text-muted-foreground { color: lightgray !important; }
body.high-contrast .quiz-card { background-color: #111; border-color: white;}
body.high-contrast .border-primary { border-color: yellow !important; }
body.high-contrast .toolbar-btn { color: yellow !important; }

.no-print { }
.bg-primary { background-color: hsl(var(--primary)); }
.text-primary-foreground { color: hsl(var(--primary-foreground)); }
header { padding: 1rem 1.5rem; }
header h1 { font-size: 1.25rem; font-weight: 700; }
.max-w-4xl { max-width: 56rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.flex { display: flex; }
.flex-row { flex-direction: row; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.gap-1 { gap: 0.25rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.toolbar-btn { background: transparent; border: none; cursor: pointer; padding: 0.5rem; border-radius: 0.375rem; color: hsl(var(--primary-foreground)); }
.toolbar-btn:hover { background-color: hsla(0, 0%, 98%, 0.1); }
.font-zoom-controls { display: flex; align-items: center; border-left: 1px solid hsla(0,0%,98%,.2); border-right: 1px solid hsla(0,0%,98%,.2); margin: 0 0.25rem; padding: 0 0.25rem;}
main { padding: 2rem; }
.bg-card { background-color: hsl(var(--card)); }
.rounded-xl { border-radius: 0.75rem; }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1); }
.p-8 { padding: 2rem; }
.sm\\:p-12 { padding: 3rem; }
.md\\:p-16 { padding: 4rem; }
.module-section { page-break-after: always; }
.module-section:last-of-type { page-break-after: auto; }
.text-center { text-align: center; }
.mb-12 { margin-bottom: 3rem; }
.mb-2 { margin-bottom: 0.5rem; }
.pb-2 { padding-bottom: 0.5rem; }
.text-3xl { font-size: 1.875rem; }
.font-bold { font-weight: 700; }
.text-muted-foreground { color: hsl(var(--muted-foreground)); }
.space-y-8 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem; }
.prose { max-width: none; }
.prose h1, .prose h2, .prose h3 { font-weight: bold; }
.prose ul { list-style-type: disc; padding-left: 1.5rem; }
.prose ol { list-style-type: decimal; padding-left: 1.5rem; }
.prose blockquote { border-left: 4px solid hsl(var(--border)); padding-left: 1rem; margin-left: 0; font-style: italic; }
.justify-center { justify-content: center; }
figure { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; page-break-inside: avoid; }
figure img { border-radius: 0.375rem; max-width: 100%; height: auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,.1); }
figcaption { font-size: 0.875rem; text-align: center; color: hsl(var(--muted-foreground)); font-style: italic; margin-top: 0.5rem; }
.relative { position: relative; }
blockquote { margin: 0; padding: 1.5rem; background-color: hsl(var(--muted) / 0.5); border-left: 4px solid hsl(var(--primary)); border-radius: 0 0.5rem 0.5rem 0; font-style: italic; }
.absolute { position: absolute; }
.-top-3 { top: -0.75rem; }
.-left-2 { left: -0.5rem; }
.h-10 { height: 2.5rem; }
.w-10 { width: 2.5rem; }
.text-primary\\/20 { color: hsl(var(--primary) / 0.2); }
.w-full { width: 100%; }
.aspect-video { aspect-ratio: 16/9; }
.rounded-md { border-radius: 0.375rem; }
.btn { display: inline-flex; justify-content: center; align-items: center; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 500; text-decoration: none; font-size: 1rem; }
.btn-primary { background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }
.quiz-card { border-radius: 0.75rem; border: 1px solid hsl(var(--border)); page-break-inside: avoid; }
.bg-muted\\/30 { background-color: hsl(var(--muted) / 0.3); }
.quiz-card-header, .quiz-card-content, .quiz-card-footer { padding: 1.5rem; }
.quiz-card-content { padding-top: 0; }
.quiz-card-title { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.25rem; }
.quiz-card-desc { font-size: 0.875rem; color: hsl(var(--muted-foreground)); }
.space-x-3 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.75rem; }
.p-3 { padding: 0.75rem; }
.transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.quiz-option { cursor: pointer; display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 0.375rem; border: 1px solid hsl(var(--border)); }
.quiz-option:hover { background-color: hsl(var(--muted) / 0.6); }
.radio-custom { height: 1em; width: 1em; border: 1px solid hsl(var(--primary)); border-radius: 50%; display: inline-block; position: relative; }
.quiz-option.selected .radio-custom::after { content: ''; position: absolute; top: 50%; left: 50%; width: 0.6em; height: 0.6em; border-radius: 50%; background: hsl(var(--primary)); transform: translate(-50%, -50%); }
.quiz-option.correct { background-color: hsl(var(--primary) / 0.1); border-color: hsl(var(--primary) / 0.5); }
.quiz-option.incorrect { background-color: hsl(var(--destructive) / 0.1); border-color: hsl(var(--destructive) / 0.5); }
.result-icon { margin-left: auto; font-weight: bold; }
.correct-icon { color: green; }
.incorrect-icon { color: red; }
.retry-btn { background-color: transparent; border: 1px solid hsl(var(--border)); color: hsl(var(--foreground)); padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }
.quiz-card-footer { min-height: 40px; display: flex; align-items: center; justify-content: center; }
#loading-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); display: none; align-items: center; justify-content: center; z-index: 1000; }
#loading-modal-content { background: hsl(var(--card)); padding: 2rem; border-radius: 0.5rem; text-align: center; color: hsl(var(--card-foreground)); display: flex; align-items: center; gap: 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { width: 24px; height: 24px; border: 3px solid hsl(var(--secondary)); border-top: 3px solid hsl(var(--primary)); border-radius: 50%; animation: spin 1s linear infinite; }
.pagedjs_page { background: white; }
@media print { .no-print { display: none !important; } body, main, #printable-content, .bg-card { background: white !important; color: black !important; font-size: 11pt; box-shadow: none !important; padding: 0 !important; margin: 0 !important; border: none !important; border-radius: 0 !important; max-width: 100% !important; } main { padding-top: 0 !important; } .pagedjs_page_content { padding: 0 !important; } }
`;

const getIndexHtml = (handbookTitle: string, dataScript: string) => `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${handbookTitle}</title>
    <style id="handbook-styles">${getCssContent()}</style>
    <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
</head>
<body>
    <div id="loading-modal">
        <div id="loading-modal-content">
            <div class="spinner"></div>
            <p>Preparando documento para impressão...</p>
        </div>
    </div>
    <div id="root"></div>
    <script>${dataScript}</script>
    <script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
    <script>${getAppScript()}</script>
</body>
</html>`;

export async function generateZip(projects: Project[], handbookTitle: string, handbookDescription: string) {
    const zip = new JSZip();
    const cleanTitle = (handbookTitle || 'apostila').toLowerCase().replace(/\s+/g, '-');
    const handbookData = { title: handbookTitle, description: handbookDescription, projects };

    const dataScript = `window.apostilaData = ${JSON.stringify(handbookData, null, 2)};`;
    
    zip.file('index.html', getIndexHtml(handbookTitle, dataScript));
    zip.file('README.md', 'Para usar esta apostila offline, extraia o conteúdo deste ZIP, certifique-se de que todos os arquivos estão na mesma pasta e abra o arquivo index.html em seu navegador.');
    
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${cleanTitle}.zip`);
}
