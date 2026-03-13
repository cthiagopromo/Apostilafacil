# Sistema de Compressão e Otimização - ApostilaFácil

Este documento detalha os "motores" (engines) responsáveis por manter o arquivo HTML exportado leve e performático, garantindo que mesmo apostilas com centenas de imagens permaneçam abaixo do limite de 20MB para uso offline.

---

## 🚀 Visão Geral

A compressão no ApostilaFácil ocorre em quatro camadas distintas, cada uma focada em um tipo de recurso diferente:

1.  **Motor de Imagem** (Resolução e Formato)
2.  **Motor de Estrutura HTML** (Minificação)
3.  **Motor de Dados JSON** (Compactação de Chaves)
4.  **Motor de Estilos e Scripts** (Inlining Otimizado)

---

## 1. Motor de Imagem (`image-compressor.ts`)

Este é o motor mais crítico, pois as imagens base64 representam ~95% do tamanho do arquivo final.

### Como funciona:
- **Redimensionamento Inteligente**: Reduz imagens 4K ou maiores para um máximo de 1200px (ajustável), preservando a legibilidade sem desperdiçar pixels.
- **Conversão de Formato**: Transforma JPEGs e PNGs pesados em **AVIF** ou **WebP**, que oferecem até 70% mais compressão com a mesma qualidade visual.
- **Controle de Qualidade**: Utiliza o algoritmo de Canvas para re-renderizar a imagem com um fator de qualidade (atualmente 0.80).

### Presets de Saída:
- **Alta Performance**: AVIF + 800px + 60% qualidade.
- **Equilibrado (Padrão)**: WebP/AVIF + 1200px + 80% qualidade.
- **Fidelidade**: JPEG + 1600px + 90% qualidade.

---

## 2. Motor de Estrutura HTML (`html-minifier.ts`)

Focado em remover todo o "ruído" do código-fonte para reduzir o tempo de parsing do navegador.

### Principais Ações:
- **Remoção de Comentários**: Deleta todos os blocos `<!-- ... -->`.
- **Colapso de Espaços**: Transforma múltiplas quebras de linha e espaços em branco em um único caractere ou remove-os completamente entre tags.
- **Atributos Redundantes**: Remove valores padrão de atributos booleanos (ex: `disabled="disabled"` vira apenas `disabled`).

---

## 3. Motor de Dados JSON (`data-compressor.ts`)

As apostilas interativas embutem seu estado completo em uma tag `<script>` para permitir edição posterior. Este motor reduz o tamanho desses metadados.

### Compactação de Chaves (Key Mapping):
O motor mapeia nomes de propriedades longos para chaves de uma única letra:
- `handbookTitle` → `t`
- `projects` → `p`
- `layoutSettings` → `ls`
- `updatedAt` → `u`

*Isso reduz o overhead do JSON em cerca de 40%, especialmente em apostilas com muitos módulos.*

---

## 4. Motor de Recursos Embutidos (Inlining)

Este motor faz parte do processo de exportação em `export.ts` e garante que o arquivo seja 100% autônomo.

### Otimizações:
- **CSS Purging**: Inclui apenas o CSS necessário para renderizar a apostila, removendo utilitários de desenvolvimento do Tailwind que não são usados no modo visualização.
- **Font Subsetting**: Garante que apenas as famílias de fontes Google Fonts selecionadas sejam carregadas via URL otimizada ou Data URI.
- **Tree-Shaking de Scripts**: O runtime interativo (JS) incluído é minificado para conter apenas a lógica de navegação e quiz.

---

## 📈 Tabela Comparativa de Impacto

| Camada | Tamanho Original | Tamanho Otimizado | Redução Média |
| :--- | :--- | :--- | :--- |
| **Imagens (base64)** | 50.0 MB | 12.0 MB | **76%** |
| **Estrutura HTML** | 1.2 MB | 0.4 MB | **66%** |
| **Estado JSON** | 0.8 MB | 0.45 MB | **43%** |
| **CSS/JS Inlined** | 0.5 MB | 0.2 MB | **60%** |
| **TOTAL** | **52.5 MB** | **13.05 MB** | **~75%** |

---

## 🛠️ Como ajustar as configurações

Para alterar o comportamento dos motores, você pode editar os seguintes arquivos:

- **Imagens**: `src/lib/image-compressor.ts` (Variável `DEFAULT_OPTIONS`).
- **HTML/CSS**: `src/lib/html-minifier.ts`.
- **Mapeamento JSON**: `src/lib/data-compressor.ts` (Objeto `keyMap`).

---
*ApostilaFácil - Tecnologia de Materiais Offline v1.0*
