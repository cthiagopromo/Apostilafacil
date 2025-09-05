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
    
    // A consulta com 'rows' vazios indica que não foi encontrado
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Apostila não encontrada' }, { status: 404 });
    }
    
    // Acessamos a primeira linha e a coluna 'data'
    const apostilaData = result.rows[0].data;

    if (!apostilaData) {
      return NextResponse.json({ error: 'Dados da apostila estão vazios ou corrompidos' }, { status: 404 });
    }

    return NextResponse.json(apostilaData, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar apostila:", error);
    
    const errorMessage = (error instanceof Error) ? error.message : 'Internal Server Error';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
