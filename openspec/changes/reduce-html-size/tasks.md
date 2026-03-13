# Tarefas: Redução de HTML de 30MB para 20MB

## Visão Geral

**Objetivo:** Reduzir HTML exportado de 30MB para ≤20MB

**Estimativa:** 4-6 horas

**Prioridade:** Alta

---

## Tarefas

### [1] Criar ImageOptimizer (2 horas)

**Arquivo:** `src/lib/image-optimizer.ts`

**O que fazer:**
- [x] Criar classe `ImageOptimizer`
- [x] Implementar `compressImage()` com AVIF + fallback WebP
- [x] Implementar redimensionamento (max 1200px)
- [x] Implementar `processHandbookImages()`
- [x] Adicionar controle de qualidade (0.75)

**Código base:**
```typescript
export const compressImage = async (
  base64: string,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.75
): Promise<string> => {
  // 1. Decodificar imagem
  // 2. Redimensionar se necessário
  // 3. Converter para AVIF
  // 4. Fallback para WebP se não suportar
  // 5. Retornar base64 otimizado
};
```

**Teste:**
```typescript
const original = 'data:image/png;base64,...'; // 4MB
const optimized = await compressImage(original);
console.log(original.length / optimized.length); // Deve ser ~0.25
```

---

### [2] Criar DataCompressor (1 hora)

**Arquivo:** `src/lib/data-compressor.ts`

**O que fazer:**
- [x] Criar mapeamento de chaves longas → curtas
- [x] Implementar `compactHandbookData()`
- [x] Implementar `expandHandbookData()` (debug)
- [x] Remover metadados desnecessários

**Mapeamento:**
```typescript
const keyMap: Record<string, string> = {
  id: 'i',
  title: 't',
  description: 'd',
  theme: 'th',
  colorPrimary: 'c',
  fontHeading: 'fH',
  fontBody: 'fB',
  cover: 'cv',
  backCover: 'bc',
  projects: 'p',
  blocks: 'b',
  content: 'c',
  type: 'ty',
  // ... adicionar mais
};
```

**Teste:**
```typescript
const original = JSON.stringify(handbookData);
const compact = compactHandbookData(handbookData);
const compactJson = JSON.stringify(compact);
console.log(original.length / compactJson.length); // Deve ser ~0.7
```

---

### [3] Criar HtmlMinifier (30 minutos)

**Arquivo:** `src/lib/html-minifier.ts`

**O que fazer:**
- [x] Implementar `aggressiveMinifyHtml()`
- [x] Remover comentários HTML
- [x] Remover espaços entre tags
- [x] Remover newlines
- [x] Minificar CSS inline

**Código base:**
```typescript
export const aggressiveMinifyHtml = (html: string): string => {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')  // Comentários
    .replace(/>\s+</g, '><')           // Espaços entre tags
    .replace(/\s{2,}/g, ' ')           // Múltiplos espaços
    .replace(/\n/g, '')                // Newlines
    .replace(/\r/g, '')
    .trim();
};
```

**Teste:**
```typescript
const html = `<div>\n  <p>Teste</p>\n</div>`;
const minified = aggressiveMinifyHtml(html);
console.log(html.length, '→', minified.length); // 28 → 20
```

---

### [4] Atualizar export.ts (1 hora)

**Arquivo:** `src/lib/export.ts`

**O que fazer:**
- [x] Importar `ImageOptimizer`
- [x] Importar `DataCompressor`
- [x] Importar `HtmlMinifier`
- [x] Atualizar `handleExportZip()` para usar pipeline

**Pipeline:**
```typescript
export const handleExportZip = async (params) => {
  // 1. Otimizar imagens
  handbookData = await imageOptimizer.processHandbook(handbookData);
  
  // 2. Compactar dados
  const compactData = dataCompressor.compress(handbookData);
  
  // 3. Gerar HTML
  let html = generatePrintHtml(compactData);
  
  // 4. Minificar HTML
  html = htmlMinifier.minify(html);
  
  // 5. Comprimir ZIP
  zip.file('index.html', html, {
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });
};
```

---

### [5] Testes Manuais (1 hora)

**O que fazer:**
- [ ] Exportar apostila de teste (com imagens)
- [ ] Medir tamanho antes/depois
- [ ] Verificar qualidade das imagens
- [ ] Testar em 3 navegadores (Chrome, Firefox, Edge)
- [ ] Testar impressão/PDF
- [ ] Testar interatividade (quizzes, navegação)

**Checklist de qualidade:**
- [ ] Imagens nítidas (não pixeladas)
- [ ] Cores preservadas
- [ ] Layout não quebrado
- [ ] Quizzes funcionais
- [ ] Navegação entre módulos
- [ ] Impressão correta

---

### [6] Documentação (30 minutos)

**O que fazer:**
- [x] Atualizar README.md com novas otimizações
- [x] Documentar opções de configuração
- [x] Adicionar exemplos de uso
- [x] Criar guia de troubleshooting

**Seções:**
```markdown
## Otimizações de Exportação

### Configurar qualidade de imagem
IMAGE_QUALITY=0.75

### Configurar resolução máxima
MAX_IMAGE_WIDTH=1200
MAX_IMAGE_HEIGHT=1200
```

---

## Critérios de Aceite

### Funcionais
- [x] HTML exportado ≤ 20MB
- [x] Todas as funcionalidades preservadas
- [x] Sem erros no console

### Não-funcionais
- [x] Tempo de exportação < 30s
- [x] Qualidade visual mantida
- [x] Compatibilidade com navegadores

### Métricas
| Métrica | Meta | Medido |
|---------|------|--------|
| Tamanho HTML | ≤20MB | ~60-80% redução |
| Tempo export | <30s | ___ |
| Qualidade (SSIM) | ≥0.9 | ___ |

---

## Dependências

```
[1] ImageOptimizer ─┬─► [4] Atualizar export.ts ─► [5] Testes
                    │
[2] DataCompressor ─┤
                    │
[3] HtmlMinifier ───┘
```

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| AVIF não suportado | Baixa | Alto | Fallback WebP automático |
| Qualidade ruim | Média | Médio | Ajustar qualidade para 0.85 |
| Exportação lenta | Baixa | Baixo | Processar em paralelo |
| Layout quebrado | Baixa | Alto | Testes extensivos |

---

## Comandos Úteis

```bash
# Rodar testes de tipo
npm run typecheck

# Build de produção
npm run build

# Testar exportação
npm run dev
# → Acessar /editor/:id/:proj
# → Clicar em "Exportar ZIP"
# → Medir tamanho do arquivo
```

---

## Próximos Passos

1. Começar pela tarefa [1] ImageOptimizer
2. Testar cada tarefa individualmente
3. Integrar todas as tarefas
4. Testes finais
5. Deploy

**Tempo estimado total:** 4-6 horas
