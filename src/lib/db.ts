// src/lib/db.ts
import { neon } from '@neondatabase/serverless';

// Validação da variável de ambiente
const postgresUrl = process.env.POSTGRES_URL;
if (!postgresUrl) {
  throw new Error('POSTGRES_URL não está definida nas variáveis de ambiente. Verifique seu arquivo .env');
}

// Esta é a configuração central para sua conexão com o banco de dados.
// As rotas da API irão importar 'db' deste arquivo.
// O driver serverless do Neon é totalmente compatível com a string de conexão
// que você obtém do painel do Neon.
// Apenas certifique-se de que sua variável de ambiente POSTGRES_URL está definida em seu arquivo .env

// Habilitar o modo de array evita que o driver transforme os resultados em objetos,
// o que pode ser um pouco mais performático.
const sql = neon(postgresUrl, { fullResults: true });

export const db = sql;
