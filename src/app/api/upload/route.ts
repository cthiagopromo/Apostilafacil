
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    return NextResponse.json({ error: 'Credenciais do Cloudflare não configuradas no servidor.' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
      body: uploadFormData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro do Cloudflare:', errorData);
        throw new Error('Falha ao enviar para o Cloudflare.');
    }

    const result = await response.json();

    if (!result.success) {
      console.error('API do Cloudflare retornou erro:', result.errors);
      throw new Error('Erro na API do Cloudflare.');
    }

    return NextResponse.json({ id: result.result.id });
    
  } catch (error: any) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: error.message || 'Erro interno do servidor.' }, { status: 500 });
  }
}
