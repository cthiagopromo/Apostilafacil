# Documentação Técnica: Gerenciador de Estado (Zustand Store)

Este documento detalha as funções-chave (ações) do nosso store Zustand, localizado em `/src/lib/store.ts`. Este store é a fonte única de verdade para o estado da aplicação no lado do cliente.

---

## Ficha Técnica de Função

### 1. Assinatura da Função
* **Nome**: `initializeStore`
* **Assinatura Completa**: `initializeStore: (handbookIdFromUrl: string | null) => Promise<void>`

### 2. Localização
* **Arquivo**: `/src/lib/store.ts`

### 3. Descrição Técnica
* **Propósito**: Carrega os dados da apostila para o estado da aplicação. Segue uma estratégia de fallback: primeiro tenta buscar da API via `fetch`, se falhar ou não encontrar, tenta carregar do armazenamento local (`localforage`), e se também não encontrar, carrega os dados iniciais (`initialHandbookData`).

### 4. Parâmetros
* **Parâmetro 1**:
    * **Nome**: `handbookIdFromUrl`
    * **Tipo**: `string | null`
    * **Descrição**: O ID da apostila obtido da URL. Usado para buscar os dados corretos da API ou validar os dados locais.

### 5. Retorno
* **Tipo de Retorno**: `Promise<void>`
* **Descrição do Retorno**: A função não retorna um valor, mas atualiza o estado do store de forma assíncrona.

### 6. Dependências
* **Módulos/Bibliotecas Externas**: `localforage`, `immer`, `zustand`.
* **Dados Internos**: `initialHandbookData`.

### 7. Efeitos Colaterais
* **Modifica o estado global**: Preenche `projects`, `handbookTitle`, etc., com os dados carregados.
* **Define `isInitialized` como `true`**: Sinaliza para a UI que os dados estão prontos para serem renderizados.
* **Realiza chamadas de rede**: Pode fazer uma requisição `fetch` para a API.

---

## Ficha Técnica de Função

### 1. Assinatura da Função
* **Nome**: `saveData`
* **Assinatura Completa**: `saveData: () => Promise<void>`

### 2. Localização
* **Arquivo**: `/src/lib/store.ts`

### 3. Descrição Técnica
* **Propósito**: Persiste o estado atual da apostila. Salva os dados tanto no armazenamento local (`localforage`) para resiliência offline quanto no banco de dados através de uma chamada `POST` para a API (`/api/saveApostila`).

### 4. Parâmetros
* Nenhum. A função lê o estado diretamente do store.

### 5. Retorno
* **Tipo de Retorno**: `Promise<void>`
* **Descrição do Retorno**: Não retorna valor. Redefine o estado `isDirty` para `false` em caso de sucesso.

### 6. Dependências
* **Módulos/Bibliotecas Externas**: `localforage`.

### 7. Efeitos Colaterais
* **Modifica o estado global**: Atualiza `handbookUpdatedAt` e `isDirty`.
* **Escreve no armazenamento local**: Salva o estado completo em `localforage`.
* **Realiza chamadas de rede**: Envia o estado completo para a API de salvamento.

---

## Ficha Técnica de Função

### 1. Assinatura da Função
* **Nome**: `addBlock`
* **Assinatura Completa**: `addBlock: (projectId: string, type: BlockType) => void`

### 2. Localização
* **Arquivo**: `/src/lib/store.ts`

### 3. Descrição Técnica
* **Propósito**: Adiciona um novo bloco de conteúdo a um módulo (`project`) específico. Cria um objeto de bloco com um ID único e conteúdo padrão com base no `type` fornecido.

### 4. Parâmetros
* **Parâmetro 1**:
    * **Nome**: `projectId`
    * **Tipo**: `string`
    * **Descrição**: O ID do módulo ao qual o novo bloco será adicionado.
* **Parâmetro 2**:
    * **Nome**: `type`
    * **Tipo**: `BlockType` (string enum)
    * **Descrição**: O tipo do novo bloco (ex: 'text', 'image').

### 5. Retorno
* **Tipo de Retorno**: `void`

### 6. Dependências
* **Funções Internas**: `getUniqueId`.

### 7. Efeitos Colaterais
* **Modifica o estado global**: Adiciona o novo bloco ao array `blocks` do projeto correspondente.
* **Atualiza `activeBlockId`**: Define o ID do novo bloco como ativo, o que geralmente aciona a UI para abrir o modo de edição.
* **Define `isDirty` como `true`**: Sinaliza que há alterações não salvas.
