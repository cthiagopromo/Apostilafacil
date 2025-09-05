import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { apostila_id: string } }
) {
  try {
    const apostila_id = params.apostila_id;

    if (!apostila_id) {
      return NextResponse.json({ error: 'ID da apostila é obrigatório' }, { status: 400 });
    }

    const result = await db`
      SELECT data FROM apostilas WHERE apostila_id = ${apostila_id};
    `;
    
    if (result.length === 0 || !result[0]) {
      return NextResponse.json({ error: 'Apostila não encontrada' }, { status: 404 });
    }
    
    // O neon/serverless retorna os resultados como um array de objetos
    // Acessamos a primeira linha e a coluna 'data'
    const apostilaData = result[0].data;

    return NextResponse.json(apostilaData, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar apostila:", error);
    
    const errorMessage = (error instanceof Error) ? error.message : 'Internal Server Error';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}