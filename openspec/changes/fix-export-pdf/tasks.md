# Tarefas: Correções na Exportação HTML e PDF

## Visão Geral

**Objetivo:** Corrigir 5 problemas críticos na exportação HTML e PDF

**Estimativa:** 3-4 horas

**Prioridade:** **Crítica**

---

## Tarefas

### [1] Filtrar Fontes no HTML Exportado (30 minutos)

**Arquivo:** `src/lib/export.ts`

**O que fazer:**
- [x] Atualizar `getGoogleFontsUrl()` para filtrar fontes
- [x] Usar apenas fontes selecionadas no tema
- [x] Remover 'Rethink Sans' fixo
- [ ] Testar com diferentes combinações de fontes

**Código:**
```typescript
const getGoogleFontsUrl = (theme: Theme): string => {
  const fonts = new Set<string>();
  
  // Adicionar apenas fontes necessárias
  if (theme.fontHeading) {
    const headingFont = fontMap[theme.fontHeading];
    if (headingFont) fonts.add(headingFont.name);
  }
  
  if (theme.fontBody) {
    const bodyFont = fontMap[theme.fontBody];
    if (bodyFont) fonts.add(bodyFont.name);
  }
  
  const fontFamilies = Array.from(fonts)
    .map(font => `family=${font.replace(/\s/g, '+')}:wght@400;700`)
    .join('&');
  
  return `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;
};
```

**Teste:**
```typescript
// Testar com apenas Inter
const theme = {
  fontHeading: '"Inter", sans-serif',
  fontBody: '"Inter", sans-serif'
};
const url = getGoogleFontsUrl(theme);
// Deve gerar: family=Inter:wght@400;700
// NÃO deve incluir: Roboto Slab, Lato, Rethink Sans
```

---

### [2] Corrigir Navegação JavaScript (1 hora)

**Arquivo:** `src/lib/export.ts`

**O que fazer:**
- [x] Revisar função `getInteractiveScript()`
- [x] Corrigir seleção de elementos DOM
- [x] Adicionar verificação de null/undefined
- [ ] Testar navegação "Próximo" e "Anterior"
- [ ] Testar menu flutuante
- [ ] Testar busca de módulos

**Código:**
```javascript
// No getInteractiveScript()
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
```

**Teste:**
1. Exportar HTML com 3+ módulos
2. Abrir no navegador
3. Clicar "Próximo Módulo" → deve avançar
4. Clicar "Módulo Anterior" → deve voltar
5. Abrir menu flutuante → deve listar módulos
6. Buscar módulo → deve filtrar lista

---

### [3] Resetar Estado dos Quizzes (30 minutos)

**Arquivo:** `src/lib/export.ts`

**O que fazer:**
- [x] Criar função `resetQuizStates()`
- [x] Resetar `userAnswerId = null` em todos quizzes
- [x] Remover `checked` dos inputs radio no HTML
- [x] Integrar no `handleExportZip()`

**Código:**
```typescript
// Nova função
export const resetQuizStates = (handbookData: HandbookData): HandbookData => {
  const processed = JSON.parse(JSON.stringify(handbookData));
  
  for (const project of processed.projects) {
    for (const block of project.blocks) {
      if (block.type === 'quiz') {
        block.content.userAnswerId = null;
      }
    }
  }
  
  return processed;
};

// Em handleExportZip()
handbookData = await processHandbookImages(handbookData);
handbookData = resetQuizStates(handbookData); // ✅ Adicionar
```

**Renderização do Quiz:**
```typescript
// renderBlockToHtml() - case 'quiz'
const optionsHtml = block.content.options?.map(option => `
  <div class="quiz-option" data-correct="${option.isCorrect}">
    <input 
      type="radio" 
      name="quiz-${block.id}" 
      id="${option.id}" 
      class="radio-group-item"
      // ✅ SEM checked
    />
    <label for="${option.id}" class="quiz-option-label">
      ${option.text}
    </label>
    ${checkIconSvg}${xIconSvg}
  </div>
`).join('');
```

**Teste:**
1. Criar quiz com 4 opções
2. Marcar resposta no editor
3. Exportar HTML
4. Abrir HTML exportado
5. ✅ Nenhuma opção deve estar marcada

---

### [4] Consolidar CSS no HTML Exportado (1 hora)

**Arquivo:** `src/lib/export.ts`

**O que fazer:**
- [x] Revisar `consolidatedCss`
- [x] Adicionar todas as classes usadas no HTML
- [x] Incluir classes de layout, navegação, quiz, imagens, vídeos
- [ ] Testar visualmente HTML exportado

**Classes Obrigatórias:**
```css
/* Layout */
.module-section, .cover-section, .back-cover-section
.module-header, .module-title, .module-description
.module-content, .module-footer, .module-progress
.module-nav-btn, .btn-nav

/* Componentes */
.btn-primary, .btn-outline, .btn-ghost, .btn-icon
.card, .card-header, .card-content, .card-footer
.quiz-card, .quiz-option, .quiz-option-label
.radio-group-item, .check-icon, .x-icon, .retry-btn

/* Imagens */
.img-wrapper, .img-figure, .img-element, .img-caption
.quote-wrapper, .quote-block, .quote-icon

/* Vídeo */
.video-container, .video-iframe, .video-print-placeholder
.video-link, .video-error, .video-print-content

/* Utilitários */
.prose, .block-spacer
```

**Teste:**
1. Exportar HTML com todos tipos de blocos
2. Abrir no navegador
3. Verificar se todos elementos estão estilizados
4. Verificar responsividade

---

### [5] Melhorar CSS de Impressão/PDF (1 hora)

**Arquivo:** `src/lib/export.ts`

**O que fazer:**
- [x] Atualizar `@page` margins
- [x] Adicionar `page-break-inside: avoid` para elementos críticos
- [x] Configurar `break-after: avoid` para títulos
- [ ] Adicionar instruções de impressão no modal
- [ ] Testar em Chrome, Firefox, Edge

**Código:**
```css
@media print {
  @page {
    size: A4;
    margin: 2cm;
  }
  
  /* Evitar quebras internas */
  .quiz-card,
  .video-container,
  .img-figure,
  blockquote,
  figure {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  
  /* Títulos - evitar viúvas */
  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
    break-after: avoid;
  }
  
  /* Mostrar placeholder de vídeos */
  .video-print-placeholder {
    display: flex !important;
    page-break-inside: avoid;
  }
}
```

**Modal de Instruções:**
```typescript
// Adicionar em getInteractiveScript()
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
        <button onclick="startPrint()">Continuar</button>
      </div>
    `;
    modal.style.display = 'flex';
  }
};
```

**Teste:**
1. Abrir HTML exportado
2. Clicar em "Imprimir"
3. Ver modal de instruções
4. Seguir instruções
5. Salvar PDF
6. Verificar:
   - ✅ Páginas bem formatadas
   - ✅ Sem elementos cortados
   - ✅ Margens adequadas
   - ✅ Vídeos com placeholder
   - ✅ Quizzes visíveis

---

### [6] Testes Manuais (1 hora)

**O que testar:**

#### Navegação
- [ ] "Próximo Módulo" funciona
- [ ] "Módulo Anterior" funciona
- [ ] Menu flutuante abre/fecha
- [ ] Busca de módulos filtra corretamente
- [ ] Clique nos módulos da lista navega

#### Quizzes
- [ ] Quizzes aparecem sem respostas marcadas
- [ ] Selecionar resposta mostra check/x
- [ ] "Tentar Novamente" reseta quiz
- [ ] Múltiplos quizzes funcionam independentemente

#### Layout
- [ ] Capa aparece corretamente
- [ ] Contracapa aparece corretamente
- [ ] Imagens estão centralizadas
- [ ] Legendas de imagens visíveis
- [ ] Citações com ícone de aspas
- [ ] Vídeos com placeholder (impressão)
- [ ] Botões clicáveis

#### PDF
- [ ] Abrir modal de instruções
- [ ] Salvar PDF no Chrome
- [ ] Salvar PDF no Firefox
- [ ] Verificar páginas não cortam elementos
- [ ] Verificar margens adequadas
- [ ] Verificar quebras de página adequadas

#### Performance
- [ ] HTML abre em < 3 segundos
- [ ] Navegação é instantânea
- [ ] Scroll é suave
- [ ] Imagens carregam rapidamente

---

## Critérios de Aceite

### Funcionais
- [ ] Fontes filtradas corretamente
- [ ] Navegação 100% funcional
- [ ] Quizzes resetados
- [ ] Layout consistente
- [ ] PDF bem formatado

### Não-funcionais
- [ ] HTML < 15MB
- [ ] Carregamento < 3s
- [ ] Sem erros no console
- [ ] Compatível com Chrome, Firefox, Edge

### Qualidade
- [ ] Visual idêntico ao preview
- [ ] Impressão profissional
- [ ] Quizzes interativos
- [ ] Navegação intuitiva

---

## Dependências

```
[1] Filtrar Fontes ─┬─► [6] Testes
[2] Navegação ──────┤
[3] Quizzes ────────┤
[4] CSS ────────────┤
[5] PDF ────────────┘
```

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Navegação quebrar | Média | Alto | Testes extensivos |
| Fontes não carregar | Baixa | Alto | Fallbacks no CSS |
| PDF piorar | Média | Médio | Testes multi-browser |
| Quizzes quebrar | Baixa | Alto | Testes manuais |

---

## Comandos Úteis

```bash
# Rodar em modo de desenvolvimento
npm run dev

# Build de produção (testar antes de deploy)
npm run build

# Testar typecheck
npm run typecheck
```

---

## Checklist de Implantação

- [ ] Todas as tarefas completas
- [ ] Testes manuais aprovados
- [ ] Sem erros no console
- [ ] HTML exportado funcional
- [ ] PDF bem formatado
- [ ] Documentação atualizada

---

**Tempo estimado total:** 3-4 horas

**Próximo:** Começar pela tarefa [1] Filtrar Fontes
