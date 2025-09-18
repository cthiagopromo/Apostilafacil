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

    try {
      const tableCheck = await db`
        SELECT EXISTS (
          SELECT FROM 
              information_schema.tables 
          WHERE 
              table_name = 'apostilas'
        );
      `;
      if (!tableCheck.rows[0].exists) {
        console.warn("Tabela 'apostilas' não encontrada, retornando 404.");
        return NextResponse.json({ error: 'Apostila não encontrada' }, { status: 404 });
      }
    } catch (checkError) {
        console.error("Erro ao verificar a existência da tabela 'apostilas':", checkError);
        return NextResponse.json({ error: 'Erro interno no servidor ao acessar o banco de dados' }, { status: 500 });
    }
    
    const result = await db`
      SELECT data, font_heading, font_body FROM apostilas WHERE apostila_id = ${apostila_id};
    `;
    
    if (result.rows.length === 0 || !result.rows[0].data) {
      return NextResponse.json({ error: 'Apostila não encontrada' }, { status: 404 });
    }
    
    const apostilaData = result.rows[0].data;
    const fontHeading = result.rows[0].font_heading;
    const fontBody = result.rows[0].font_body;

    // Garante que a estrutura de 'theme' exista antes de adicionar as fontes
    if (typeof apostilaData === 'object' && apostilaData !== null) {
      if (!('theme' in apostilaData)) {
        (apostilaData as any).theme = {};
      }
      (apostilaData as any).theme.fontHeading = fontHeading;
      (apostilaData as any).theme.fontBody = fontBody;
    }

    return NextResponse.json(apostilaData, { status: 200 });

  } catch (error) {
    console.error("Erro fatal ao buscar apostila:", error);
    const errorMessage = (error instanceof Error) ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
