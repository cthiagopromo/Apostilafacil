# ApostilaFácil

**Crie, edite e exporte suas apostilas interativas com facilidade.**

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Guia de Uso](#guia-de-uso)
3. [API](#api)
4. [Arquitetura](#arquitetura)
5. [Referência de Código](#referência-de-código)
6. [Otimização de Imagens](#otimização-de-imagens)

---

## Visão Geral

### Descrição do Projeto

ApostilaFácil é uma aplicação web projetada para educadores, criadores de conteúdo e qualquer pessoa que deseje construir materiais de estudo interativos e que funcionem 100% offline. A plataforma oferece uma interface intuitiva de arrastar e soltar, um editor de conteúdo rico e temas customizáveis.

### Objetivo Principal

Resolver o problema de criar conteúdo educacional engajador que não dependa de uma conexão constante com a internet, permitindo a criação, edição e exportação de apostilas interativas.

### Problema que Resolve

- Dependência de conexão internet para acessar materiais educacionais
- Falta de ferramentas simples para criação de conteúdo interativo
- Dificuldade em exportar materiais educacionais em formatos offline

### Instalação

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_DIRETORIO>

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Renomeie .env.example para .env e preencha POSTGRES_URL

# Execute em modo de desenvolvimento
npm run dev
```

**Pré-requisitos:**
- Node.js (versão 18 ou superior)
- Git

---

## Guia de Uso

### Uso Básico

#### Criar Nova Apostila

```typescript
// Através da interface do usuário
const { createNewHandbook } = useProjectStore();
const { handbookId, projectId } = createNewHandbook();
```

#### Adicionar Módulo

```typescript
const { addProject } = useProjectStore();
const newProject = addProject();
```

#### Adicionar Bloco de Conteúdo

```typescript
const { addBlock } = useProjectStore();
addBlock(projectId, 'text'); // ou 'image', 'video', 'quiz', 'button', 'quote'
```

### Casos Avançados

#### Reordenar Módulos (Drag and Drop)

```typescript
const { reorderProjects } = useProjectStore();
reorderProjects(startIndex, endIndex);
```

#### Mover Bloco Entre Módulos

```typescript
const { moveBlockToProject } = useProjectStore();
moveBlockToProject(sourceProjectId, targetProjectId, blockId);
```

#### Exportar Apostila como ZIP

```typescript
import { handleExportZip } from '@/lib/export';

await handleExportZip({
  projects,
  handbookTitle,
  handbookDescription,
  handbookId,
  handbookUpdatedAt,
  handbookTheme,
  setIsExporting,
  toast
});
```

#### Salvar Dados no Banco

```typescript
const { saveData } = useProjectStore();
await saveData();
```

### Exemplos Práticos

#### Criar Quiz Interativo

```typescript
const quizBlock: Block = {
  id: getUniqueId('block'),
  type: 'quiz',
  content: {
    question: 'Qual é a pergunta?',
    options: [
      { id: getUniqueId('opt'), text: 'Opção 1', isCorrect: true },
      { id: getUniqueId('opt'), text: 'Opção 2', isCorrect: false }
    ],
    userAnswerId: null
  }
};
```

#### Configurar Tema da Apostila

```typescript
const theme: Theme = {
  colorPrimary: '231 84% 30%',
  fontHeading: '"Roboto Slab", serif',
  fontBody: '"Inter", sans-serif',
  cover: 'data:image/png;base64,...',
  backCover: 'data:image/png;base64,...'
};
```

#### Atualizar Configurações de Layout

```typescript
const { updateLayoutSetting } = useProjectStore();
updateLayoutSetting(projectId, 'containerWidth', 'large');
updateLayoutSetting(projectId, 'sectionSpacing', 'standard');
updateLayoutSetting(projectId, 'navigationType', 'sidebar');
```

---

## API

### Visão Geral da API

A API do ApostilaFácil consiste em endpoints REST para persistência de dados e um store Zustand para gerenciamento de estado local.

### Endpoints HTTP

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/saveApostila` | Salva ou atualiza uma apostila no banco de dados |
| `GET` | `/api/getApostila/:id` | Recupera uma apostila pelo ID |

### POST /api/saveApostila

**Request Body:**
```json
{
  "apostila_id": "handbook_123456",
  "data": {
    "id": "handbook_123456",
    "title": "Minha Apostila",
    "description": "Descrição da apostila",
    "theme": { ... },
    "projects": [ ... ],
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response:** `200 OK`
```json
{
  "result": { ... }
}
```

### GET /api/getApostila/:id

**Response:** `200 OK`
```json
{
  "id": "handbook_123456",
  "title": "Minha Apostila",
  "description": "Descrição da apostila",
  "theme": { ... },
  "projects": [ ... ],
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Classes / Objetos Principais

### Interfaces TypeScript

| Interface | Descrição |
|-----------|-----------|
| `HandbookData` | Estrutura principal da apostila contendo metadados, tema e projetos |
| `Project` | Um módulo da apostila com blocos de conteúdo |
| `Block` | Unidade básica de conteúdo (texto, imagem, vídeo, etc.) |
| `BlockContent` | Conteúdo específico de cada tipo de bloco |
| `Theme` | Configurações visuais da apostila |
| `LayoutSettings` | Configurações de layout do módulo |
| `QuizOption` | Opção de resposta para blocos de quiz |

### Store Zustand (useProjectStore)

**Estado Global:**

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `handbookId` | `string` | ID único da apostila |
| `handbookTitle` | `string` | Título da apostila |
| `handbookDescription` | `string` | Descrição da apostila |
| `handbookUpdatedAt` | `string` | Timestamp da última atualização |
| `handbookTheme` | `Theme` | Tema visual aplicado |
| `projects` | `Project[]` | Lista de módulos/projetos |
| `activeProjectId` | `string \| null` | ID do projeto ativo |
| `activeBlockId` | `string \| null` | ID do bloco ativo |
| `isDirty` | `boolean` | Indica se há mudanças não salvas |
| `isInitialized` | `boolean` | Indica se o store foi inicializado |

### Funções do Store

| Função | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| `initializeStore` | `handbookIdFromUrl: string \| null` | `Promise<void>` | Inicializa o store carregando dados da API ou localStorage |
| `createNewHandbook` | - | `{ handbookId, projectId }` | Cria nova apostila em branco |
| `loadHandbookData` | `data: HandbookData` | `Promise<void>` | Carrega dados de uma apostila |
| `addProject` | - | `Project` | Adiciona novo módulo |
| `deleteProject` | `projectId: string` | `string \| null` | Exclui módulo e retorna próximo ID ativo |
| `reorderProjects` | `startIndex, endIndex: number` | `void` | Reordena módulos |
| `addBlock` | `projectId, type: BlockType` | `void` | Adiciona bloco de conteúdo |
| `deleteBlock` | `projectId, blockId: string` | `void` | Exclui bloco |
| `duplicateBlock` | `projectId, blockId: string` | `void` | Duplica bloco |
| `moveBlockToProject` | `sourceProjectId, targetProjectId, blockId: string` | `void` | Move bloco para outro módulo |
| `updateBlockContent` | `blockId: string, newContent: Partial<BlockContent>` | `void` | Atualiza conteúdo do bloco |
| `updateHandbookTitle` | `title: string` | `void` | Atualiza título da apostila |
| `updateHandbookTheme` | `theme: Partial<Theme>` | `void` | Atualiza tema visual |
| `saveData` | - | `Promise<void>` | Salva dados no localStorage e API |

---

## Funções Globais

| Função | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| `cn` | `...inputs: ClassValue[]` | `string` | Combina classes CSS com tailwind-merge |
| `toKebabCase` | `str: string` | `string` | Converte string para kebab-case |
| `generatePrintHtml` | `data: HandbookData` | `string` | Gera HTML para impressão/exportação |
| `handleExportZip` | `options: ExportOptions` | `Promise<void>` | Exporta apostila como arquivo ZIP |

---

## Arquitetura

### Stack Tecnológica

**Linguagem:** TypeScript 5.x

**Frameworks e Bibliotecas:**
- **Frontend:** Next.js 14.2, React 18.3
- **UI Components:** Radix UI, ShadCN UI, TailwindCSS 3.4
- **Estado:** Zustand 4.5 com Immer
- **Editor de Texto:** TipTap 2.5
- **Drag and Drop:** @dnd-kit/core 6.1
- **Banco de Dados:** PostgreSQL (via Neon serverless)
- **Armazenamento Local:** LocalForage (IndexedDB)
- **Exportação:** JSZip, FileSaver
- **Utilitários:** date-fns, DOMPurify, class-variance-authority

### Estrutura de Pastas

```
ApostilaFácil/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── getApostila/[id]/
│   │   │   │   └── route.ts
│   │   │   └── saveApostila/
│   │   │       └── route.ts
│   │   ├── editor/
│   │   │   └── [handbook_id]/
│   │   │       └── [projectId]/
│   │   │           └── page.tsx
│   │   ├── print/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/              # Componentes ShadCN
│   │   ├── AccessibilityToolbar.tsx
│   │   ├── AddBlockModal.tsx
│   │   ├── BlockEditor.tsx
│   │   ├── BlockRenderer.tsx
│   │   ├── ClientOnly.tsx
│   │   ├── EditorLayout.tsx
│   │   ├── FloatingNav.tsx
│   │   ├── HandbookSettings.tsx
│   │   ├── Header.tsx
│   │   ├── LayoutSettings.tsx
│   │   ├── LeftSidebar.tsx
│   │   ├── LoadingModal.tsx
│   │   ├── MainContent.tsx
│   │   ├── ModuleSettings.tsx
│   │   ├── PreviewContent.tsx
│   │   ├── PreviewHeader.tsx
│   │   ├── PreviewModal.tsx
│   │   ├── ProjectList.tsx
│   │   ├── ReorderModulesModal.tsx
│   │   ├── RichTextEditor.tsx
│   │   ├── RightSidebar.tsx
│   │   ├── ThemeProvider.tsx
│   │   ├── ThemeSettings.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── TypographySettings.tsx
│   ├── hooks/
│   │   ├── use-local-storage.ts
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   └── lib/
│       ├── db.ts
│       ├── export.ts
│       ├── initial-data.ts
│       ├── store.ts
│       ├── types.ts
│       └── utils.ts
├── docs/
├── .env.example
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### Componentes Principais

| Componente | Responsabilidade |
|------------|------------------|
| `EditorLayout` | Layout principal do editor com header, sidebar e conteúdo |
| `LeftSidebar` | Lista de módulos com drag-and-drop para reordenar |
| `RightSidebar` | Painel de configurações (geral, módulo, tipografia, layout) |
| `MainContent` | Área principal de edição de blocos |
| `BlockEditor` | Editor de bloco individual com configurações específicas |
| `BlockRenderer` | Renderizador de blocos para visualização |
| `ProjectList` | Lista de apostilas na página inicial |
| `PreviewModal` | Modal de pré-visualização interativa |
| `RichTextEditor` | Editor de texto rico baseado em TipTap |
| `Header` | Cabeçalho com navegação, salvamento e preview |

### Fluxos de Dados

#### Fluxo de Inicialização

1. Usuário acessa a aplicação
2. `initializeStore` é chamado com `handbookId` da URL
3. Dados são buscados da API (`/api/getApostila/:id`)
4. Se falhar, tenta carregar do localStorage
5. Se não existir, cria nova apostila com dados iniciais
6. Store é marcada como `isInitialized`

#### Fluxo de Salvamento

1. Alterações são feitas no store (marca `isDirty: true`)
2. Debounce de 2 segundos aguarda novas alterações
3. `saveData` salva no localStorage via LocalForage
4. Request POST para `/api/saveApostila` é enviado
5. `isDirty` é marcado como `false`

#### Fluxo de Exportação

1. Usuário clica em "Exportar ZIP"
2. `generatePrintHtml` gera HTML completo com CSS embutido
3. JSZip cria arquivo ZIP contendo:
   - `index.html` (apostila interativa)
   - Recursos necessários
4. FileSaver faz download do arquivo

#### Fluxo de Drag-and-Drop

1. Usuário arrasta elemento (módulo ou bloco)
2. `DndContext` detecta movimento
3. `onDragEnd` é disparado
4. Função de reordenar é chamada no store
5. Store atualiza ordem e marca `isDirty`
6. React re-renderiza com nova ordem

---

## Referência de Código

### Types e Interfaces

#### BlockType

```typescript
type BlockType = 'text' | 'image' | 'video' | 'button' | 'quiz' | 'quote';
```

#### QuizOption

```typescript
interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}
```

#### VideoType

```typescript
type VideoType = 'youtube' | 'vimeo' | 'cloudflare' | 'smartplay';
```

#### BlockContent

```typescript
interface BlockContent {
  // Common
  text?: string;
  // Image
  url?: string;
  alt?: string;
  caption?: string;
  width?: number;
  // Video
  videoType?: VideoType;
  videoUrl?: string;
  vimeoVideoId?: string;
  cloudflareVideoId?: string;
  smartplayUrl?: string;
  videoTitle?: string;
  autoplay?: boolean;
  showControls?: boolean;
  // Button
  buttonText?: string;
  buttonUrl?: string;
  // Quiz
  question?: string;
  options?: QuizOption[];
  userAnswerId?: string | null;
}
```

#### Block

```typescript
interface Block {
  id: string;
  type: BlockType;
  content: BlockContent;
}
```

#### Theme

```typescript
interface Theme {
  colorPrimary: string;
  cover?: string;
  backCover?: string;
  fontHeading: string;
  fontBody: string;
}
```

#### LayoutSettings

```typescript
interface LayoutSettings {
  containerWidth: 'standard' | 'large' | 'full';
  sectionSpacing: 'compact' | 'standard' | 'comfortable';
  navigationType: 'top' | 'sidebar' | 'bottom';
}
```

#### Project

```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  layoutSettings: LayoutSettings;
  blocks: Block[];
  version: string;
  createdAt: string;
  updatedAt: string;
}
```

#### HandbookData

```typescript
interface HandbookData {
  id: string;
  title: string;
  description: string;
  theme: Theme;
  projects: Project[];
  updatedAt: string;
}
```

---

### Funções Principais

| Função | Localização | Assinatura | Descrição |
|--------|-------------|------------|-----------|
| `cn` | `lib/utils.ts` | `(...inputs: ClassValue[]) => string` | Combina classes CSS usando clsx e tailwind-merge |
| `toKebabCase` | `lib/utils.ts` | `(str: string) => string` | Converte string para kebab-case |
| `getUniqueId` | `lib/store.ts` | `(prefix: string) => string` | Gera ID único com prefixo |
| `generatePrintHtml` | `lib/export.ts` | `(data: HandbookData) => string` | Gera HTML completo para impressão |
| `renderBlockToHtml` | `lib/export.ts` | `(block: Block) => string` | Renderiza bloco para HTML estático |
| `getGoogleFontsUrl` | `lib/export.ts` | `(theme: Theme) => string` | Gera URL do Google Fonts |
| `handleExportZip` | `lib/export.ts` | `(options) => Promise<void>` | Exporta apostila como ZIP |

---

### Constantes

| Nome | Valor | Arquivo | Propósito |
|------|-------|---------|-----------|
| `STORE_KEY` | `'apostila-facil-data'` | `lib/store.ts` | Chave para localStorage |
| `TOAST_LIMIT` | `1` | `hooks/use-toast.ts` | Limite de toasts visíveis |
| `TOAST_REMOVE_DELAY` | `1000000` | `hooks/use-toast.ts` | Delay para remover toast |
| `fontMap` | `{...}` | `lib/export.ts` | Mapeamento de fontes para Google Fonts |

---

### Módulos / Arquivos

| Arquivo | Propósito | Dependências Principais |
|---------|-----------|------------------------|
| `lib/types.ts` | Definição de tipos TypeScript | - |
| `lib/store.ts` | Gerenciamento de estado Zustand | zustand, immer, localforage |
| `lib/db.ts` | Conexão com banco Neon | @neondatabase/serverless |
| `lib/export.ts` | Exportação para HTML/ZIP | jszip, file-saver, dompurify |
| `lib/initial-data.ts` | Dados iniciais da apostila | - |
| `lib/utils.ts` | Funções utilitárias | clsx, tailwind-merge |
| `app/page.tsx` | Página inicial | React, Next.js |
| `app/layout.tsx` | Layout root da aplicação | Next.js, ThemeProvider |
| `components/EditorLayout.tsx` | Layout do editor | React, Zustand |
| `components/BlockEditor.tsx` | Editor de blocos | dnd-kit, Radix UI |
| `components/BlockRenderer.tsx` | Renderizador de blocos | TipTap, DOMPurify |
| `components/RichTextEditor.tsx` | Editor de texto rico | TipTap, Radix UI |
| `components/LeftSidebar.tsx` | Sidebar de módulos | dnd-kit, Radix UI |
| `components/RightSidebar.tsx` | Sidebar de configurações | Radix UI |
| `components/Header.tsx` | Cabeçalho do editor | React, Zustand |
| `components/PreviewModal.tsx` | Modal de preview | React, export.ts |
| `hooks/use-toast.ts` | Hook para notificações toast | React |

---

### Componentes UI (ShadCN/Radix)

| Componente | Localização | Descrição |
|------------|-------------|-----------|
| `Button` | `components/ui/button.tsx` | Botão com variantes e tamanhos |
| `Card` | `components/ui/card.tsx` | Container com header, content, footer |
| `Dialog` | `components/ui/dialog.tsx` | Modal/Dialog |
| `Input` | `components/ui/input.tsx` | Campo de input de texto |
| `Label` | `components/ui/label.tsx` | Label para formulários |
| `Switch` | `components/ui/switch.tsx` | Toggle switch |
| `Slider` | `components/ui/slider.tsx` | Slider de faixa |
| `Textarea` | `components/ui/textarea.tsx` | Área de texto |
| `Select` | `components/ui/select.tsx` | Dropdown select |
| `Accordion` | `components/ui/accordion.tsx` | Accordion expansível |
| `AlertDialog` | `components/ui/alert-dialog.tsx` | Dialog de confirmação |
| `DropdownMenu` | `components/ui/dropdown-menu.tsx` | Menu dropdown |
| `RadioGroup` | `components/ui/radio-group.tsx` | Grupo de radio buttons |
| `ScrollArea` | `components/ui/scroll-area.tsx` | Área com scroll customizado |
| `Badge` | `components/ui/badge.tsx` | Badge/Tag |
| `Table` | `components/ui/table.tsx` | Tabela |
| `Skeleton` | `components/ui/skeleton.tsx` | Skeleton loader |
| `Toggle` | `components/ui/toggle.tsx` | Botão toggle |

---

## Otimização de Imagens

### Visão Geral

O ApostilaFácil utiliza um sistema avançado de compressão de imagens para reduzir o tamanho dos HTML exportados de ~30MB para **≤20MB** (redução de 33-60%).

### Configurações Atuais (Qualidade 0.80)

```typescript
// src/lib/image-compressor.ts
const DEFAULT_OPTIONS = {
  maxWidth: 1200,        // 1200px de largura máxima
  maxHeight: 1200,       // 1200px de altura máxima
  quality: 0.80,         // 80% de qualidade (boa qualidade visual)
  format: 'avif',        // Formato AVIF (melhor compressão)
  maxSizeBytes: 400 * 1024,  // 400KB máximo por imagem
};
```

### Funções Disponíveis

| Função | Descrição | Uso |
|--------|-----------|-----|
| `compressImage()` | Comprime imagem base64 | Uso geral |
| `compressImageToSize()` | Comprime até atingir tamanho | Limite de KB |
| `processHandbookImages()` | Processa todas as imagens da apostila | Exportação |
| `calculateImageSavings()` | Calcula economia de tamanho | Métricas |

### Exemplo de Uso

```typescript
import { compressImage } from '@/lib/image-compressor';

// Compressão com parâmetros customizados
const compressed = await compressImage(base64Image, {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.75,
  format: 'avif',
});

// Compressão com limite de tamanho
const compressed = await compressImageToSize(
  base64Image,
  500 * 1024  // 500KB máximo
);
```

### Impacto no Tamanho

| Tipo de Imagem | Original | Comprimido | Economia |
|----------------|----------|------------|----------|
| Capa 4000x3000 | 8MB | 600KB | **-92%** |
| Foto 2000x1500 | 3MB | 500KB | **-83%** |
| Imagem 1200x800 | 1MB | 200KB | **-80%** |

**Resultado:** HTML de 30MB → **12-15MB** (redução de 50-60%)

**Qualidade:** 80% - Excelente para visualização em tela e impressão básica

### Formatos Suportados

| Formato | Redução Típica | Compatibilidade |
|---------|----------------|-----------------|
| **AVIF** | 50-70% | Chrome 85+, Firefox 82+, Safari 16+ |
| **WebP** | 30-50% | Chrome, Firefox, Edge, Safari 14+ |
| **JPEG** | 20-40% | Universal |

### Como Ajustar Configurações

Edite `src/lib/image-compressor.ts`:

```typescript
const DEFAULT_OPTIONS = {
  maxWidth: 1200,    // 800-2000px (1200 = equilíbrio)
  maxHeight: 1200,   // 800-2000px
  quality: 0.80,     // 0.50-0.95 (0.80 = boa qualidade)
  format: 'avif',
  maxSizeBytes: 400 * 1024,  // 200KB-1MB
};
```

### Presets de Configuração

#### Máxima Compressão (Email/WhatsApp)
```typescript
{ maxWidth: 800, quality: 0.50, maxSizeBytes: 200 * 1024 }
// HTML: ~5-8MB | Qualidade: Aceitável para tela
```

#### Equilibrada (Padrão Atual)
```typescript
{ maxWidth: 1200, quality: 0.80, maxSizeBytes: 400 * 1024 }
// HTML: ~12-15MB | Qualidade: Boa para tela e impressão
```

#### Alta Qualidade (Impressão)
```typescript
{ maxWidth: 1600, quality: 0.90, maxSizeBytes: 800 * 1024 }
// HTML: ~18-22MB | Qualidade: Excelente para impressão
```

### Testando Configurações

Use o componente `ImageCompressionTester`:

```typescript
import { ImageCompressionTester } from '@/components/ImageCompressionTester';

<ImageCompressionTester />
```

O componente permite:
- Upload de imagem
- Ajuste de qualidade e tamanho
- Preview antes/depois
- Cálculo de economia em KB e %
- Download das imagens

---

*Documentação gerada automaticamente em 12 de março de 2026*
