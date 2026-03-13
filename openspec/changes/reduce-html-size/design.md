# Design Técnico: Redução de HTML de 30MB para 20MB

## Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                    HTML Exportado (30MB)                     │
├─────────────────────────────────────────────────────────────┤
│  Imagens base64 (24MB) ──► AVIF + Resize ──► 9.6MB         │
│  JSON Dados (2MB) ──────► Compact + Chaves ──► 0.7MB       │
│  CSS/JS/HTML (4MB) ─────► Minificação ──────► 3MB          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    HTML Otimizado (13.3MB)
```

## Arquitetura da Solução

### 1. Pipeline de Processamento de Imagens

```typescript
interface ImagePipeline {
  input: string;        // base64 original
  steps: ProcessStep[]; // cadeia de processamento
  output: string;       // base64 otimizado
}

type ProcessStep = 
  | { type: 'decode' }           // Decodifica base64
  | { type: 'resize'; max: number }  // Redimensiona
  | { type: 'convert'; format: 'avif' | 'webp'; quality: number }
  | { type: 'encode' };          // Codifica para base64
```

**Fluxo:**
```
Imagem Original (4MB)
    │
    ▼
┌─────────────────┐
│ 1. Detectar     │
│    dimensões    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Redimensionar│  ◄── Se > 1200px
│    (max 1200px) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. Converter    │  ◄── AVIF (qualidade 0.75)
│    para AVIF    │      Fallback WebP
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. Codificar    │
│    base64       │
└────────┬────────┘
         │
         ▼
Imagem Otimizada (0.6MB)
```

### 2. Estrutura de Dados Compacta

```typescript
// Antes (verbose)
interface HandbookData {
  id: string;
  title: string;
  description: string;
  theme: { colorPrimary: string; ... };
  projects: Array<{ id: string; title: string; ... }>;
}

// Depois (compacto)
interface CompactHandbook {
  i: string;  // id
  t: string;  // title
  d: string;  // description
  th: Theme;  // theme
  p: Proj[];  // projects
}
```

**Mapeamento de Chaves:**

| Original | Compacta | Economia |
|----------|----------|----------|
| `id` | `i` | 2 chars |
| `title` | `t` | 4 chars |
| `description` | `d` | 10 chars |
| `theme` | `th` | 3 chars |
| `projects` | `p` | 6 chars |
| `blocks` | `b` | 4 chars |
| `content` | `c` | 5 chars |
| `type` | `ty` | 2 chars |

**Economia total:** ~36 chars × N ocorrências = ~500KB-1MB

### 3. Minificação HTML Agressiva

```typescript
const aggressiveMinify = (html: string): string => {
  return html
    // Remove comentários HTML
    .replace(/<!--[\s\S]*?-->/g, '')
    
    // Remove espaços entre tags
    .replace(/>\s+</g, '><')
    
    // Colapsa múltiplos espaços
    .replace(/\s{2,}/g, ' ')
    
    // Remove espaços em atributos
    .replace(/"\s+"/g, '""')
    .replace(/=\s+"/g, '="')
    
    // Remove espaços em CSS inline
    .replace(/:\s+/g, ':')
    .replace(/;\s+/g, ';')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    
    // Remove newlines
    .replace(/\n/g, '')
    .replace(/\r/g, '')
    
    .trim();
};
```

### 4. CSS Classes de Uma Letra

```typescript
// CSS Mapeado
const letterClassMap: Record<string, string> = {
  // Layout
  'flex': 'a',
  'inline-flex': 'b',
  'items-center': 'c',
  'justify-center': 'd',
  'gap-2': 'e',
  
  // Typography
  'text-sm': 'f',
  'font-medium': 'g',
  'font-semibold': 'h',
  
  // Spacing
  'p-4': 'i',
  'm-4': 'j',
  'mx-auto': 'k',
  
  // Colors
  'bg-primary': 'l',
  'text-primary': 'm',
  
  // Borders
  'rounded': 'n',
  'rounded-lg': 'o',
  'border': 'p',
  
  // Effects
  'shadow': 'q',
  'transition': 'r',
  'hover': 's',
  
  // Display
  'hidden': 't',
  'block': 'u',
  'relative': 'v',
  'absolute': 'w',
  
  // Sizing
  'w-full': 'x',
  'h-full': 'y',
  'max-w-full': 'z',
};
```

## Implementação por Camadas

### Camada 1: Processamento de Imagens

**Arquivo:** `src/lib/image-optimizer.ts`

```typescript
export interface ImageOptimizerOptions {
  maxWidth: number;      // 1200px
  maxHeight: number;     // 1200px
  quality: number;       // 0.75
  format: 'avif' | 'webp';
}

export class ImageOptimizer {
  private options: ImageOptimizerOptions;
  
  constructor(options?: Partial<ImageOptimizerOptions>);
  
  /**
   * Otimiza imagem base64
   */
  compress(base64: string): Promise<string>;
  
  /**
   * Processa todas as imagens de uma apostila
   */
  processHandbook(handbook: HandbookData): Promise<HandbookData>;
}
```

### Camada 2: Compactação de Dados

**Arquivo:** `src/lib/data-compressor.ts`

```typescript
export interface DataCompressorOptions {
  useShortKeys: boolean;    // true
  removeMetadata: boolean;  // true
}

export class DataCompressor {
  /**
   * Compacta dados da apostila
   */
  compress(handbook: HandbookData): CompactHandbook;
  
  /**
   * Descompacta dados (para leitura)
   */
  decompress(compact: CompactHandbook): HandbookData;
}
```

### Camada 3: Minificação HTML

**Arquivo:** `src/lib/html-minifier.ts`

```typescript
export interface HtmlMinifierOptions {
  removeComments: boolean;
  removeWhitespace: boolean;
  minifyCss: boolean;
  minifyJs: boolean;
}

export class HtmlMinifier {
  /**
   * Minifica HTML agressivamente
   */
  minify(html: string): string;
}
```

### Camada 4: Orquestração

**Arquivo:** `src/lib/export-optimizer.ts`

```typescript
export interface ExportOptimizerOptions {
  imageOptimizer: ImageOptimizer;
  dataCompressor: DataCompressor;
  htmlMinifier: HtmlMinifier;
  targetSize: number;  // 20MB em bytes
}

export class ExportOptimizer {
  /**
   * Otimiza exportação para atingir target
   */
  optimize(handbook: HandbookData): Promise<OptimizedExport>;
  
  /**
   * Calcula tamanho estimado
   */
  estimateSize(handbook: HandbookData): number;
}
```

## Fluxo de Execução

```
┌─────────────────────────────────────────────────────────────┐
│                    handleExportZip()                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Carregar dados da apostila                              │
│     handbookData = { projects, theme, ... }                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Otimizar imagens                                        │
│     imageOptimizer.processHandbook(handbookData)            │
│     - Redimensionar capa/contracapa                         │
│     - Converter para AVIF                                   │
│     - Processar imagens dos blocos                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Compactar dados JSON                                    │
│     dataCompressor.compress(handbookData)                   │
│     - Usar chaves curtas                                    │
│     - Remover metadados                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Gerar HTML                                              │
│     generatePrintHtml(compactData)                          │
│     - Usar classes CSS de 1 letra                           │
│     - Ícones SVG reutilizáveis                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Minificar HTML                                          │
│     htmlMinifier.minify(html)                               │
│     - Remover comentários                                   │
│     - Remover espaços                                       │
│     - Colapsar newlines                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Comprimir ZIP (DEFLATE nível 9)                         │
│     zip.file('index.html', minifiedHtml, {                  │
│       compression: 'DEFLATE',                               │
│       compressionOptions: { level: 9 }                      │
│     })                                                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  7. Salvar arquivo                                          │
│     saveAs(blob, 'apostila.zip')                            │
└─────────────────────────────────────────────────────────────┘
```

## Estrutura de Arquivos

```
src/lib/
├── export.ts              # Exportação principal (existente)
├── export-optimizer.ts    # NOVO: Orquestração
├── image-optimizer.ts     # NOVO: Processamento de imagens
├── data-compressor.ts     # NOVO: Compactação de dados
├── html-minifier.ts       # NOVO: Minificação HTML
└── types.ts               # Tipos (atualizar)
```

## Métricas de Sucesso

| Métrica | Antes | Depois | Meta |
|---------|-------|--------|------|
| Tamanho HTML | 30MB | 13.3MB | ≤20MB |
| Tempo download (1Mbps) | 240s | 106s | ≤160s |
| Imagens (total) | 24MB | 9.6MB | - |
| Qualidade (SSIM) | 1.0 | 0.95 | ≥0.9 |

## Compatibilidade

| Navegador | AVIF | WebP Fallback |
|-----------|------|---------------|
| Chrome 85+ | ✅ | - |
| Firefox 82+ | ✅ | - |
| Safari 16+ | ✅ | - |
| Edge 85+ | ✅ | - |
| Navegadores antigos | ❌ | ✅ WebP |

## Rollback Plan

Se problemas forem detectados:

1. **Qualidade de imagem ruim**: Aumentar qualidade de 0.75 para 0.85
2. **AVIF não suportado**: Forçar WebP como padrão
3. **Layout quebrado**: Desativar classes de 1 letra
4. **Funcionalidade quebrada**: Reverter JSON compacto

---

## Implementação Realizada

### Arquivos Criados
- ✅ `src/lib/image-optimizer.ts` - Compressão AVIF/WebP
- ✅ `src/lib/data-compressor.ts` - JSON com chaves curtas
- ✅ `src/lib/html-minifier.ts` - Minificação agressiva

### Integração no export.ts
```typescript
import { imageOptimizer } from './image-optimizer';
import { dataCompressor } from './data-compressor';
import { htmlMinifier } from './html-minifier';

// Pipeline
handbookData = await processImages(handbookData);  // Otimizar imagens
const finalHtml = aggressiveMinifyHtml(html);       // Minificar HTML
```

### Configurações Atuais
- **MAX_IMAGE_WIDTH**: 1200px
- **MAX_IMAGE_HEIGHT**: 1200px  
- **IMAGE_QUALITY**: 0.75
- **ZIP_COMPRESSION**: DEFLATE level 9
