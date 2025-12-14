'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PDFViewer } from '@react-pdf/renderer';
import { PdfDocument } from '@/components/pdf/PdfDocument';

interface Block {
    id: string;
    type: string;
    content: any;
}

interface Project {
    id: string;
    title: string;
    description: string;
    blocks: Block[];
}

interface Theme {
    cover?: string;
    backCover?: string;
    colorPrimary?: string;
    fontHeading?: string;
    fontBody?: string;
}

interface HandbookData {
    id: string;
    title: string;
    description: string;
    projects: Project[];
    theme: Theme;
}

export default function PrintPage() {
    const params = useParams();
    const apostilaId = params.apostila_id as string;
    const [data, setData] = useState<HandbookData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/getApostila/${apostilaId}`);
                if (!response.ok) {
                    throw new Error('Falha ao carregar apostila');
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro desconhecido');
            } finally {
                setLoading(false);
            }
        };

        if (apostilaId) {
            fetchData();
        }
    }, [apostilaId]);

    if (!isClient) {
        return null;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen font-sans">
                <p>Carregando apostila...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex justify-center items-center h-screen font-sans">
                <p>Erro: {error || 'Dados não encontrados'}</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px', background: '#f4f4f5', borderBottom: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{data.title} - Visualização de Impressão (PDF) - Debug v4</h1>
                <p style={{ fontSize: '0.875rem', color: '#666' }}>O arquivo PDF abaixo é gerado sem metadados do navegador.</p>
            </div>
            <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
                <PdfDocument data={data} />
            </PDFViewer>
        </div>
    );
}
