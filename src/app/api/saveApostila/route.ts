
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
 
export async function POST(request: Request) {
  try {
    const { apostila_id, data } = await request.json();
    const jsonData = JSON.stringify(data);

    // Etapa de Setup Automático: Garante que a tabela exista antes de salvar.
    // É seguro executar isso todas as vezes, pois "IF NOT EXISTS" previne a recriação.
    await db`
      CREATE TABLE IF NOT EXISTS apostilas (
        apostila_id VARCHAR(255) PRIMARY KEY,
        data JSONB,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Lógica de Salvamento: Insere ou atualiza a apostila.
    const result = await db`
      INSERT INTO apostilas (apostila_id, data, updated_at)
      VALUES (${apostila_id}, ${jsonData}, NOW())
      ON CONFLICT (apostila_id)
      DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
    `;
    
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error("Erro ao salvar apostila:", error);
    
    const errorMessage = (error instanceof Error) ? error.message : 'Internal Server Error';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
