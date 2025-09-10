# ApostilaFácil

**Crie, edite e exporte suas apostilas interativas com facilidade.**

ApostilaFácil é uma aplicação web projetada para educadores, criadores de conteúdo e qualquer pessoa que deseje construir materiais de estudo interativos e que funcionem 100% offline. A plataforma oferece uma interface intuitiva de arrastar e soltar, um editor de conteúdo rico e temas customizáveis, resolvendo o problema de criar conteúdo educacional engajador que não dependa de uma conexão constante com a internet.

---

## ✨ Features Principais

-   **Organização de Módulos**: Interface de arrastar e soltar para organizar módulos e sequenciar o conteúdo de forma lógica e intuitiva.
-   **Conteúdo Rico e Interativo**: Adicione textos formatados, imagens, vídeos, citações, botões com links e até mesmo quizzes interativos para engajar os leitores.
-   **Exportação Offline**: Exporte a apostila completa como um arquivo `.zip` auto-contido, que inclui um `index.html` e todos os recursos necessários para funcionar perfeitamente em qualquer navegador sem acesso à internet.
-   **Customização Visual**: Altere a cor principal e a imagem de capa da apostila para alinhar o material à sua identidade visual.
-   **Pré-visualização em Tempo Real**: Visualize como a apostila final se parecerá para o usuário final a qualquer momento, incluindo a interatividade e o design responsivo.

---

## 🛠️ Arsenal de Tecnologias (Tech Stack)

-   **Interface (Frontend)**: Next.js, React, TypeScript, TailwindCSS, ShadCN UI
-   **Lógica (Backend)**: Next.js (API Routes), Vercel Postgres
-   **Banco de Dados**: PostgreSQL (via Vercel Postgres)
-   **Ambiente de Desenvolvimento**: Node.js v18+

---

## 🚀 Guia de Instalação e Uso

### Pré-requisitos

Para rodar este projeto localmente, você precisará ter o seguinte software instalado:
-   Node.js (versão 18 ou superior)
-   Git

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd <NOME_DO_DIRETORIO>
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    -   Renomeie o arquivo `.env.example` para `.env`.
    -   Preencha a variável `POSTGRES_URL` com a string de conexão do seu banco de dados.

4.  **Rode o projeto em modo de desenvolvimento:**
    ```bash
    npm run dev
    ```

Após executar o último comando, o projeto estará disponível em `http://localhost:3000` (ou outra porta, se a 3000 estiver em uso).
