// src/lib/db.ts
import { neon } from '@neondatabase/serverless';

// Esta é a configuração central para sua conexão com o banco de dados.
// As rotas da API irão importar 'db' deste arquivo.
// O driver serverless do Neon é totalmente compatível com a string de conexão
// que você obtém do painel do Neon.
// Apenas certifique-se de que sua variável de ambiente POSTGRES_URL está definida em seu arquivo .env

// Habilitar o modo de array evita que o driver transforme os resultados em objetos,
// o que pode ser um pouco mais performático.
const sql = neon(process.env.POSTGRES_URL!, { fullResults: true });

export const db = sql;
