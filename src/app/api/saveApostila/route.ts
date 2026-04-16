 
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
 
export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[saveApostila] Falha ao parsear JSON:', parseError);
      return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 });
    }

    const { apostila_id, data } = body;

    if (!apostila_id) {
      console.warn('[saveApostila] apostila_id ausente');
      return NextResponse.json({ error: 'apostila_id é obrigatório' }, { status: 400 });
    }
    if (!data) {
      console.warn('[saveApostila] dados ausentes');
      return NextResponse.json({ error: 'dados são obrigatórios' }, { status: 400 });
    }

    // Log para debug (resumido)
    console.log('[saveApostila] Recebido:', { 
      apostila_id, 
      dataTitle: data?.title, 
      dataProjectsCount: data?.projects?.length,
      dataThemeKeys: data?.theme ? Object.keys(data.theme) : []
    });

    // Etapa de Setup Automático: Garante que a tabela exista antes de salvar.
    try {
      await db`
        CREATE TABLE IF NOT EXISTS apostilas (
          apostila_id VARCHAR(255) PRIMARY KEY,
          data JSONB,
          font_heading TEXT,
          font_body TEXT,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
    } catch (tableError) {
      console.error('[saveApostila] Erro ao criar tabela:', tableError);
      throw tableError;
    }

    // Ensure columns exist if table was created previously without them
    try {
      await db`ALTER TABLE apostilas ADD COLUMN IF NOT EXISTS font_heading TEXT`;
      await db`ALTER TABLE apostilas ADD COLUMN IF NOT EXISTS font_body TEXT`;
    } catch (colError) {
      console.error('[saveApostila] Erro ao adicionar colunas:', colError);
      // Pode ser que as colunas já existam, ignorar
    }

    // Extrai as configurações de fonte do objeto de dados
    const fontHeading = data?.theme?.fontHeading || null;
    const fontBody = data?.theme?.fontBody || null;

    // Lógica de Salvamento: Insere ou atualiza a apostila, incluindo os novos campos de fonte.
    try {
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
      
      console.log('[saveApostila] Sucesso:', apostila_id);
      return NextResponse.json({ result }, { status: 200 });
    } catch (insertError) {
      console.error('[saveApostila] Erro no INSERT/UPDATE:', insertError);
      throw insertError;
    }
  } catch (error) {
    console.error("Erro ao salvar apostila:", error);
    
    const errorMessage = (error instanceof Error) ? error.message : 'Internal Server Error';

    return NextResponse.json({ error: errorMessage, details: String(error) }, { status: 500 });
  }
}
