# Documentação Técnica: Componentes React

Este documento detalha o funcionamento interno de componentes React complexos e importantes do projeto.

---

## Ficha Técnica de Função (Componente)

### 1. Assinatura do Componente
* **Nome**: `BlockEditor`
* **Assinatura Completa**: `const BlockEditor = ({ block, index }: BlockEditorProps) => JSX.Element`

### 2. Localização
* **Arquivo**: `/src/components/BlockEditor.tsx`

### 3. Descrição Técnica
* **Propósito**: Renderiza a interface de um único bloco de conteúdo. Ele decide se deve exibir o conteúdo final (`BlockRenderer`) ou a interface de edição (`BlockSettingsEditor`) com base no estado global `activeBlockId`. Também fornece os controles para arrastar, duplicar e excluir o bloco.

### 4. Parâmetros (Props)
* **Prop 1**:
    * **Nome**: `block`
    * **Tipo**: `Block`
    * **Descrição**: O objeto de dados completo do bloco a ser renderizado.
* **Prop 2**:
    * **Nome**: `index`
    * **Tipo**: `number`
    * **Descrição**: A posição do bloco na lista, usada para fins de ordenação.

### 5. Lógica Interna
* **Gerenciamento de Estado**: Compara o `block.id` com o `activeBlockId` do `useProjectStore` para decidir qual interface renderizar.
* **Integração com Dnd-Kit**: Utiliza o hook `useSortable` para obter os atributos e listeners necessários para habilitar a funcionalidade de arrastar e soltar (`drag-and-drop`).
* **Event Handlers**: As funções `handleAction` e `handleSave` encapsulam a lógica de interação do usuário (cliques nos botões) e disparam as ações correspondentes no `useProjectStore`.

### 6. Dependências
* **Componentes Internos**: `BlockRenderer`, `BlockSettingsEditor`, `AlertDialog`, componentes de `ui`.
* **Hooks/Bibliotecas Externas**: `useProjectStore` (Zustand) para estado global, `useSortable` (`@dnd-kit/sortable`) para ordenação.

### 7. Efeitos Colaterais
* Dispara ações no `useProjectStore` que modificam o estado global da aplicação.
* Renderiza condicionalmente diferentes componentes filhos com base no estado global.

---

## Ficha Técnica de Função (Componente)

### 1. Assinatura do Componente
* **Nome**: `BlockRenderer`
* **Assinatura Completa**: `const BlockRenderer = ({ block }: { block: Block }) => JSX.Element`

### 2. Localização
* **Arquivo**: `/src/components/BlockRenderer.tsx`

### 3. Descrição Técnica
* **Propósito**: Responsável por renderizar a visualização final e não-editável de um bloco de conteúdo, com base no seu `type`. Ele contém a lógica de `switch-case` que mapeia um tipo de bloco para sua representação HTML/JSX correspondente.

### 4. Parâmetros (Props)
* **Prop 1**:
    * **Nome**: `block`
    * **Tipo**: `Block`
    * **Descrição**: O objeto de dados do bloco cujo conteúdo deve ser renderizado.

### 5. Lógica Interna
* **Renderização Condicional**: Utiliza uma estrutura `switch-case` na propriedade `block.type` para determinar qual conjunto de elementos HTML/JSX deve ser retornado.
* **Segurança**: Para blocos do tipo `text`, utiliza `DOMPurify` para sanitizar o HTML antes de renderizá-lo com `dangerouslySetInnerHTML`, prevenindo ataques de XSS.
* **Lógica Específica de Bloco**: Contém a lógica para construir URLs de embed para vídeos (YouTube, Vimeo, etc.) e para gerenciar a interatividade de quizzes (exibição de feedback de resposta certa/errada).

### 6. Dependências
* **Hooks/Bibliotecas Externas**: `useProjectStore` para interatividade de quiz, `DOMPurify` para segurança de HTML.
* **Componentes Internos**: Componentes específicos como `YoutubeEmbed` e `QuizBlock`.
