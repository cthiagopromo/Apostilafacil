# Design Técnico: Correções na Exportação HTML e PDF

## Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                    Problemas de Exportação                    │
├─────────────────────────────────────────────────────────────┤
│  1. Fontes múltiplas ──► Filtrar por seleção               │
│  2. Navegação quebrada ──► Corrigir JavaScript             │
│  3. Quiz pré-selecionado ──► Resetar estado                │
│  4. Design quebrado ──► Consolidar CSS                     │
│  5. PDF mal formatado ──► Ajustar @page CSS                │
└─────────────────────────────────────────────────────────────┘
```

## 1. Filtrar Fontes no HTML Exportado

### Problema Atual

```typescript
// src/lib/export.ts - getGoogleFontsUrl()
const fontMap: Record<string, { name: string; family: string }> = {
  '"Roboto Slab", serif': { name: 'Roboto Slab', family: '"Roboto Slab", serif' },
  '"Inter", sans-serif': { name: 'Inter', family: '"Inter", sans-serif' },
  '"Lato", sans-serif': { name: 'Lato', family: '"Lato", sans-serif' },
};

const getGoogleFontsUrl = (theme: Theme): string => {
  const headingFontName = fontMap[theme.fontHeading]?.name || 'Roboto Slab';
  const bodyFontName = fontMap[theme.fontBody]?.name || 'Inter';
  
  // ❌ Inclui Rethink Sans sempre
  const fonts = new Set([headingFontName, bodyFontName, 'Rethink Sans']);
  // ...
};
```

### Solução

```typescript
// src/lib/export.ts
const getGoogleFontsUrl = (theme: Theme): string => {
  const fonts = new Set<string>();
  
  // Adiciona apenas fontes necessárias
  if (theme.fontHeading) {
    const headingFont = fontMap[theme.fontHeading];
    if (headingFont) fonts.add(headingFont.name);
  }
  
  if (theme.fontBody) {
    const bodyFont = fontMap[theme.fontBody];
    if (bodyFont) fonts.add(bodyFont.name);
  }
  
  // Remove duplicatas e converte para URL
  const fontFamilies = Array.from(fonts)
    .map(font => `family=${font.replace(/\s/g, '+')}:wght@400;700`)
    .join('&');
  
  return `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;
};
```

### Estrutura de Dados

```typescript
interface FontConfig {
  name: string;      // Nome para Google Fonts
  family: string;    // CSS font-family
  weights: string[]; // Pesos necessários ['400', '700']
}

const fontConfigs: Record<string, FontConfig> = {
  '"Inter", sans-serif': {
    name: 'Inter',
    family: '"Inter", sans-serif',
    weights: ['400', '700']
  },
  // ... outras fontes
};
```

## 2. Corrigir Navegação JavaScript

### Problema Atual

```javascript
// getInteractiveScript() - Navegação quebrada
navButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    const direction = e.currentTarget.dataset.direction;
    // ❌ Pode estar falhando se currentTarget for null
    let newIndex = currentModuleIndex;
    if (direction === 'next') {
      newIndex = Math.min(modules.length - 1, currentModuleIndex + 1);
    }
    showModule(newIndex);
  });
});
```

### Solução

```javascript
const getInteractiveScript = (theme: Theme): string => {
  const scriptContent = () => {
    document.addEventListener('DOMContentLoaded', () => {
      // ... existing code ...
      
      // ✅ Navegação robusta
      const setupNavigation = () => {
        const navButtons = document.querySelectorAll('.module-nav-btn');
        
        navButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            const btn = e.currentTarget;
            if (!btn) return;
            
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
    });
  };
  return `(${scriptContent.toString()})()`;
};
```

### Estrutura de Navegação

```
┌─────────────────────────────────────────────────────────┐
│                 Navegação do HTML Exportado              │
├─────────────────────────────────────────────────────────┤
│  1. Botões "Anterior/Próximo" no footer                │
│  2. Menu flutuante com lista de módulos                │
│  3. Busca de módulos no menu flutuante                 │
│  4. Teclas de atalho (opcional)                        │
└─────────────────────────────────────────────────────────┘
```

## 3. Resetar Estado dos Quizzes

### Problema Atual

```typescript
// renderBlockToHtml() - Quiz
case 'quiz':
  const optionsHtml = block.content.options?.map(option => `
    <div class="quiz-option" data-correct="${option.isCorrect}">
      <input 
        type="radio" 
        name="quiz-${block.id}" 
        id="${option.id}" 
        class="radio-group-item"
        ${block.content.userAnswerId === option.id ? 'checked' : ''} ❌
      />
      // ...
    </div>
  `).join('');
```

### Solução

```typescript
// renderBlockToHtml() - Quiz com estado resetado
case 'quiz':
  const optionsHtml = block.content.options?.map(option => `
    <div class="quiz-option" data-correct="${option.isCorrect}">
      <input 
        type="radio" 
        name="quiz-${block.id}" 
        id="${option.id}" 
        class="radio-group-item"
        // ✅ Sem checked, sempre resetado
      />
      <label for="${option.id}" class="quiz-option-label">
        ${option.text}
      </label>
      ${checkIconSvg}${xIconSvg}
    </div>
  `).join('');
  
  return `
    <div class="quiz-card">
      <div class="card-header">
        <h3 class="quiz-question">${block.content.question}</h3>
        <p class="quiz-instruction">Selecione a resposta correta.</p>
      </div>
      <div class="card-content">
        <div class="quiz-options">${optionsHtml}</div>
      </div>
      <div class="card-footer">
        <button class="btn btn-outline retry-btn">Tentar Novamente</button>
      </div>
    </div>
  `;
```

### Processamento de Dados

```typescript
// processHandbookImages() - Adicionar reset de quizzes
export const resetQuizStates = (handbookData: HandbookData): HandbookData => {
  const processed = JSON.parse(JSON.stringify(handbookData));
  
  for (const project of processed.projects) {
    for (const block of project.blocks) {
      if (block.type === 'quiz') {
        // ✅ Resetar resposta do quiz
        block.content.userAnswerId = null;
      }
    }
  }
  
  return processed;
};

// handleExportZip()
handbookData = await processHandbookImages(handbookData);
handbookData = resetQuizStates(handbookData); // ✅ Adicionar
```

## 4. Consolidar CSS no HTML Exportado

### Problema Atual

```typescript
// CSS pode estar faltando classes usadas
const consolidatedCss = `
.btn-primary { ... }
// ❌ Pode faltar classes usadas no HTML
`;
```

### Solução

```typescript
// Adicionar todas as classes necessárias
const consolidatedCss = `
/* Layout */
.module-section{display:none}
.module-section:not(.cover-section):not(.back-cover-section){display:none}
.cover-section{width:100%;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center}

/* Navegação */
.module-nav-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.5rem 1rem;border-radius:.375rem}
.module-nav-btn:disabled{opacity:.5;cursor:not-allowed}
.module-progress{font-size:.875rem;color:hsl(var(--muted-foreground))}

/* Quiz */
.quiz-card{border-radius:.75rem;border:1px solid hsl(var(--border));background:hsl(var(--card))}
.quiz-option{display:flex;align-items:center;gap:.75rem;padding:.75rem;cursor:pointer}
.quiz-option[data-correct="true"]{background:hsl(var(--primary)/.1)}
.check-icon,.x-icon{display:none;width:1.25rem;height:1.25rem}
.quiz-option[data-correct="true"] .check-icon{display:block}

/* Imagens */
.img-wrapper{display:flex;justify-content:center}
.img-figure{display:flex;flex-direction:column;align-items:center}
.img-element{max-width:100%;height:auto;border-radius:.375rem}
.img-caption{font-size:.875rem;text-align:center;font-style:italic;margin-top:.5rem}

/* Vídeo */
.video-container{position:relative;width:100%}
.video-iframe{width:100%;aspect-ratio:16/9;border:0;border-radius:.375rem}
.video-print-placeholder{display:none;padding:1rem;background:hsl(var(--muted)/.5)}

/* Impressão */
@media print{
  .no-print{display:none!important}
  .video-container .video-iframe{display:none!important}
  .video-container .video-print-placeholder{display:flex!important}
}
`;
```

## 5. Melhorar Configurações de Impressão/PDF

### Problema Atual

```css
/* CSS de impressão pode estar cortando elementos */
@media print {
  @page {
    size: A4;
    margin: 3cm 2cm !important;
  }
  
  .module-section {
    page-break-before: always !important;
    /* ❌ Pode cortar elementos ao meio */
  }
}
```

### Solução

```css
@media print {
  /* Configuração de página */
  @page {
    size: A4;
    margin: 2cm;
    @top-center {
      content: string(heading);
    }
    @bottom-center {
      content: counter(page);
    }
  }
  
  /* Capa - página única */
  .cover-section {
    page: cover;
    margin: 0;
    padding: 0;
    page-break-after: always;
  }
  
  /* Módulos - evitar quebras internas */
  .module-section {
    page-break-before: always;
    page-break-inside: avoid;
  }
  
  /* Elementos que não devem ser quebrados */
  .quiz-card,
  .video-container,
  .img-figure,
  blockquote {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  
  /* Títulos - evitar viúvas */
  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
    break-after: avoid;
  }
  
  /* Imagens - manter com legenda */
  figure {
    page-break-inside: avoid;
  }
  
  /* Esconder elementos de navegação */
  .module-nav-btn,
  #floating-nav-container,
  .accessibility-toolbar {
    display: none !important;
  }
  
  /* Mostrar placeholder de vídeos */
  .video-print-placeholder {
    display: flex !important;
    page-break-inside: avoid;
  }
}
```

### Instruções de Uso do PDF

```typescript
// Adicionar modal de instruções antes de imprimir
const showPrintInstructions = () => {
  const modal = document.getElementById('printing-modal');
  if (modal) {
    modal.innerHTML = `
      <div class="print-instructions">
        <h2>Salvar como PDF</h2>
        <ol>
          <li>Na janela de impressão, selecione "Salvar como PDF"</li>
          <li>Em "Mais definições", marque "Gráficos de plano de fundo"</li>
          <li>Defina margens como "Nenhuma" ou "Mínimas"</li>
          <li>Clique em "Salvar"</li>
        </ol>
        <button onclick="startPrint()">Continuar para Impressão</button>
      </div>
    `;
    modal.style.display = 'flex';
  }
};
```

## Fluxo de Execução Atualizado

```
handleExportZip()
    │
    ├──► processHandbookImages()
    │    ├──► Comprimir capa (AVIF, 1200px, 0.80)
    │    ├──► Comprimir contracapa (AVIF, 1200px, 0.80)
    │    └──► Comprimir imagens dos blocos (AVIF, 1000px, 0.80)
    │
    ├──► resetQuizStates()
    │    └──► Resetar userAnswerId = null para todos quizzes
    │
    ├──► deduplicateImages()
    │    └──► Remover imagens duplicadas
    │
    ├──► generatePrintHtml()
    │    ├──► getGoogleFontsUrl() ← Filtrar fontes
    │    ├──► renderProjectsToHtml()
    │    ├──► getOptimizedCss() ← CSS consolidado
    │    └──► getInteractiveScript() ← Navegação corrigida
    │
    ├──► minifyHtml()
    │
    └──► zip.file() com DEFLATE nível 9
```

## Estrutura de Arquivos

```
src/lib/
├── export.ts              # Atualizar: filtrar fontes, resetar quizzes
├── image-compressor.ts    # Já implementado
├── types.ts               # Atualizar tipos se necessário
└── export-fixes.ts        # NOVO: Funções de correção

src/components/
├── PreviewModal.tsx       # Atualizar: instruções de PDF
└── PrintInstructions.tsx  # NOVO: Modal de instruções
```

## Métricas de Sucesso

| Métrica | Como Medir | Meta |
|---------|------------|------|
| Fontes no HTML | Contar links no `<head>` | 1-2 fonts |
| Navegação funcional | Teste manual | 100% |
| Quizzes resetados | Inspecionar HTML | checked = 0 |
| PDF bem formatado | Teste manual | 90% aprovação |
| Tamanho HTML | Medir arquivo | < 15MB |

## Compatibilidade

| Navegador | HTML Exportado | PDF (Salvar) |
|-----------|----------------|--------------|
| Chrome 120+ | ✅ | ✅ |
| Firefox 120+ | ✅ | ✅ |
| Edge 120+ | ✅ | ✅ |
| Safari 17+ | ✅ | ⚠️ Testar |

## Rollback Plan

Se problemas forem detectados:

1. **Fontes não carregam**: Reverter para todas as fontes
2. **Navegação piora**: Reverter script antigo
3. **PDF piora**: Reverter CSS de impressão
4. **Quizzes quebram**: Reverter reset de estado

---

**Próximo:** Ver `tasks.md` para implementação passo-a-passo.
