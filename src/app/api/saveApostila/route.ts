
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
 
export async function POST(request: Request) {
  try {
    const { apostila_id, data } = await request.json();
    const jsonData = JSON.stringify(data);

    // Usando a sintaxe de template string do Neon para consulta parametrizada
    const result = await db`
      INSERT INTO apostilas (apostila_id, data, updated_at)
      VALUES (${apostila_id}, ${jsonData}, NOW())
      ON CONFLICT (apostila_id)
      DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
    `;
    
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    // É uma boa prática não expor mensagens de erro detalhadas ao cliente.
    // Registre o erro real no servidor.
    console.error("Erro ao salvar apostila:", error);
    
    // Verifique se o erro é um objeto com uma propriedade de mensagem
    const errorMessage = (error instanceof Error) ? error.message : 'Internal Server Error';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
