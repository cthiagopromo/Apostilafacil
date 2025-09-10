# Documentação Técnica: API Backend

Este documento detalha as funções dos endpoints da API localizados em `/src/app/api/`.

---

## Ficha Técnica de Função

### 1. Assinatura da Função
* **Nome**: `GET` (Handler)
* **Assinatura Completa**: `export async function GET(request: Request, { params }: { params: { apostila_id: string } })`

### 2. Localização
* **Arquivo**: `/src/app/api/getApostila/[apostila_id]/route.ts`

### 3. Descrição Técnica
* **Propósito**: Busca os dados de uma apostila específica no banco de dados com base no `apostila_id` fornecido na URL. Garante que a tabela `apostilas` exista antes de tentar a busca.

### 4. Parâmetros
* **Parâmetro 1**:
    * **Nome**: `request`
    * **Tipo**: `Request`
    * **Descrição**: O objeto de requisição HTTP padrão.
* **Parâmetro 2**:
    * **Nome**: `params`
    * **Tipo**: `Object`
    * **Descrição**: Um objeto contendo os parâmetros dinâmicos da rota. Espera-se que contenha a propriedade `apostila_id`.

### 5. Retorno
* **Tipo de Retorno**: `Promise<NextResponse>`
* **Descrição do Retorno (Sucesso)**: Retorna um `NextResponse` com status `200` e o objeto de dados (`data`) da apostila em formato JSON.
* **Descrição do Retorno (Erro)**: Retorna um `NextResponse` com status `404` se a apostila não for encontrada, ou `500` para erros internos do servidor.

### 6. Dependências
* **Módulos/Bibliotecas Externas**: `next/server` para `NextResponse`, `@neondatabase/serverless` para o objeto `db`.

### 7. Efeitos Colaterais
* **Acesso ao Banco de Dados**: Realiza uma consulta `SELECT` e potencialmente uma `CREATE TABLE IF NOT EXISTS` na tabela `apostilas`.

---

## Ficha Técnica de Função

### 1. Assinatura da Função
* **Nome**: `POST` (Handler)
* **Assinatura Completa**: `export async function POST(request: Request)`

### 2. Localização
* **Arquivo**: `/src/app/api/saveApostila/route.ts`

### 3. Descrição Técnica
* **Propósito**: Salva (insere ou atualiza) os dados de uma apostila no banco de dados. Utiliza uma cláusula `ON CONFLICT` para realizar um "upsert".

### 4. Parâmetros
* **Parâmetro 1**:
    * **Nome**: `request`
    * **Tipo**: `Request`
    * **Descrição**: O objeto de requisição HTTP, cujo corpo (`body`) deve conter um JSON com as propriedades `apostila_id` e `data`.

### 5. Retorno
* **Tipo de Retorno**: `Promise<NextResponse>`
* **Descrição do Retorno (Sucesso)**: Retorna um `NextResponse` com status `200` e o resultado da operação do banco de dados.
* **Descrição do Retorno (Erro)**: Retorna um `NextResponse` com status `500` se ocorrer um erro durante a operação no banco de dados.

### 6. Dependências
* **Módulos/Bibliotecas Externas**: `next/server` para `NextResponse`, `@neondatabase/serverless` para o objeto `db`.

### 7. Efeitos Colaterais
* **Acesso ao Banco de Dados**: Realiza uma operação de `INSERT ... ON CONFLICT DO UPDATE` na tabela `apostilas`, modificando os dados. Também pode criar a tabela se ela não existir.
