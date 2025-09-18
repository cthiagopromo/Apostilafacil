
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
 
export async function POST(request: Request) {
  try {
    const { apostila_id, data } = await request.json();

    // Etapa de Setup Automático: Garante que a tabela exista antes de salvar.
    // É seguro executar isso todas as vezes, pois "IF NOT EXISTS" previne a recriação.
    await db`
      CREATE TABLE IF NOT EXISTS apostilas (
        apostila_id VARCHAR(255) PRIMARY KEY,
        data JSONB,
        font_heading TEXT,
        font_body TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Extrai as configurações de fonte do objeto de dados
    const fontHeading = data?.theme?.fontHeading || null;
    const fontBody = data?.theme?.fontBody || null;

    // Lógica de Salvamento: Insere ou atualiza a apostila, incluindo os novos campos de fonte.
    const result = await db`
      INSERT INTO apostilas (apostila_id, data, font_heading, font_body, updated_at)
      VALUES (${apostila_id}, ${data}, ${fontHeading}, ${fontBody}, NOW())
      ON CONFLICT (apostila_id)
      DO UPDATE SET 
        data = EXCLUDED.data, 
        font_heading = EXCLUDED.font_heading,
        font_body = EXCLUDED.font_body,
        updated_at = NOW();
    `;
    
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error("Erro ao salvar apostila:", error);
    
    const errorMessage = (error instanceof Error) ? error.message : 'Internal Server Error';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
