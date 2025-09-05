// src/lib/db.ts
import { db } from '@vercel/postgres';

// Esta é a configuração central para sua conexão com o banco de dados.
// As rotas da API irão importar 'db' deste arquivo.
// O pacote @vercel/postgres é totalmente compatível com strings de conexão do Neon.
// Apenas certifique-se de que sua variável de ambiente POSTGRES_URL está definida em seu arquivo .env.local

export { db };
