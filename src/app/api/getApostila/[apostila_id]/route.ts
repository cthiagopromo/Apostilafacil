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

    // Primeiro, verifica se a tabela existe para evitar erros em um banco de dados novo.
    // Esta é uma medida de segurança extra. A rota de saveApostila deve criá-la.
    try {
      await db`SELECT 1 FROM apostilas LIMIT 1;`;
    } catch (tableError) {
      // Se a tabela não existe, consideramos que a apostila não foi encontrada.
      console.warn("Tabela 'apostilas' não encontrada, retornando 404.");
      return NextResponse.json({ error: 'Apostila não encontrada' }, { status: 404 });
    }

    const result = await db`
      SELECT data FROM apostilas WHERE apostila_id = ${apostila_id};
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Apostila não encontrada' }, { status: 404 });
    }
    
    const apostilaData = result[0].data;

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
