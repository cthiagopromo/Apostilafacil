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

    // Etapa de Segurança: Verifica se a tabela existe antes de fazer a consulta.
    // Isso previne erros 500 em um banco de dados novo ou vazio.
    try {
      // Usamos uma consulta ao information_schema que é padrão SQL para verificar a existência de tabelas.
      const tableCheck = await db`
        SELECT EXISTS (
          SELECT FROM 
              information_schema.tables 
          WHERE 
              table_name = 'apostilas'
        );
      `;
      // Se a tabela não existir, a consulta acima retorna 'exists: false'.
      if (!tableCheck.rows[0].exists) {
        console.warn("Tabela 'apostilas' não encontrada, retornando 404.");
        return NextResponse.json({ error: 'Apostila não encontrada' }, { status: 404 });
      }
    } catch (checkError) {
        console.error("Erro ao verificar a existência da tabela 'apostilas':", checkError);
        return NextResponse.json({ error: 'Erro interno no servidor ao acessar o banco de dados' }, { status: 500 });
    }
    
    // Se a tabela existe, prosseguimos com a busca da apostila.
    const result = await db`
      SELECT data FROM apostilas WHERE apostila_id = ${apostila_id};
    `;
    
    if (result.rows.length === 0 || !result.rows[0].data) {
      return NextResponse.json({ error: 'Apostila não encontrada' }, { status: 404 });
    }
    
    const apostilaData = result.rows[0].data;

    return NextResponse.json(apostilaData, { status: 200 });

  } catch (error) {
    console.error("Erro fatal ao buscar apostila:", error);
    const errorMessage = (error instanceof Error) ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
