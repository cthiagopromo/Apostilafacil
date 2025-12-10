'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DOMPurify from 'dompurify';

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

    useEffect(() => {
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

    useEffect(() => {
        if (data && !loading) {
            // Auto-print after load
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [data, loading]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
                <p>Carregando apostila para impressão...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
                <p>Erro: {error || 'Dados não encontrados'}</p>
            </div>
        );
    }

    const renderBlock = (block: Block) => {
        switch (block.type) {
            case 'text':
                return (
                    <div
                        className="prose-content"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.content.text || '') }}
                    />
                );
            case 'image':
                return (
                    <figure style={{ margin: '1.5rem 0', textAlign: 'center' }}>
                        <img
                            src={block.content.url}
                            alt={block.content.alt || ''}
                            style={{ maxWidth: block.content.width ? `${block.content.width}%` : '100%', height: 'auto' }}
                        />
                        {block.content.caption && (
                            <figcaption style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                                {block.content.caption}
                            </figcaption>
                        )}
                    </figure>
                );
            case 'quote':
                return (
                    <blockquote style={{
                        borderLeft: '4px solid #3b82f6',
                        paddingLeft: '1rem',
                        margin: '1.5rem 0',
                        fontStyle: 'italic',
                        color: '#4b5563'
                    }}>
                        <p>{block.content.quote}</p>
                        {block.content.author && (
                            <footer style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>— {block.content.author}</footer>
                        )}
                    </blockquote>
                );
            case 'notice':
                const colors: Record<string, { bg: string; border: string }> = {
                    info: { bg: '#eff6ff', border: '#3b82f6' },
                    warning: { bg: '#fef3c7', border: '#f59e0b' },
                    success: { bg: '#d1fae5', border: '#10b981' },
                    error: { bg: '#fee2e2', border: '#ef4444' },
                };
                const color = colors[block.content.type] || colors.info;
                return (
                    <div style={{
                        backgroundColor: color.bg,
                        borderLeft: `4px solid ${color.border}`,
                        padding: '1rem',
                        margin: '1.5rem 0',
                        borderRadius: '0.25rem'
                    }}>
                        {block.content.title && <strong style={{ display: 'block', marginBottom: '0.5rem' }}>{block.content.title}</strong>}
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.content.content || '') }} />
                    </div>
                );
            case 'quiz':
                return (
                    <div style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        padding: '1.5rem',
                        margin: '1.5rem 0',
                        backgroundColor: '#f9fafb'
                    }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '1rem' }}>{block.content.question}</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {block.content.options?.map((opt: any, idx: number) => (
                                <li key={idx} style={{
                                    padding: '0.5rem 1rem',
                                    marginBottom: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.25rem',
                                    backgroundColor: 'white'
                                }}>
                                    {String.fromCharCode(65 + idx)}) {opt.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <style jsx global>{`
        @page {
          size: A4;
          margin: 0;
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        html, body {
          width: 210mm;
          background: white;
          font-family: ${data.theme.fontBody || 'Georgia, serif'};
          font-size: 11pt;
          line-height: 1.6;
          color: #1a1a1a;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: ${data.theme.fontHeading || 'Arial, sans-serif'};
          page-break-after: avoid;
        }
        
        img, figure, blockquote {
          page-break-inside: avoid;
        }
        
        .cover-page {
          width: 210mm;
          height: 297mm;
          page-break-after: always;
          position: relative;
          overflow: hidden;
        }
        
        .cover-page img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .content-page {
          width: 210mm;
          min-height: 297mm;
          padding: 3cm 2cm;
          page-break-after: always;
        }
        
        .content-page:last-child {
          page-break-after: auto;
        }
        
        .module-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .module-title {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }
        
        .module-description {
          color: #6b7280;
          font-size: 1rem;
        }
        
        .block-wrapper {
          margin-bottom: 1.5rem;
        }
        
        .prose-content {
          line-height: 1.8;
        }
        
        .prose-content h1 { font-size: 1.5rem; margin: 1.5rem 0 1rem; }
        .prose-content h2 { font-size: 1.25rem; margin: 1.25rem 0 0.75rem; }
        .prose-content h3 { font-size: 1.1rem; margin: 1rem 0 0.5rem; }
        .prose-content p { margin-bottom: 0.75rem; }
        .prose-content ul, .prose-content ol { margin-left: 1.5rem; margin-bottom: 0.75rem; }
        .prose-content li { margin-bottom: 0.25rem; }
        
        .back-cover-page {
          width: 210mm;
          height: 297mm;
          page-break-before: always;
          position: relative;
          overflow: hidden;
        }
        
        .back-cover-page img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        
        @media screen {
          body {
            max-width: 210mm;
            margin: 0 auto;
            background: #f0f0f0;
          }
          .cover-page, .content-page, .back-cover-page {
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          }
        }
      `}</style>

            {/* Capa */}
            {data.theme.cover && (
                <div className="cover-page">
                    <img src={data.theme.cover} alt="Capa" />
                </div>
            )}

            {/* Módulos */}
            {data.projects.map((project) => (
                <div key={project.id} className="content-page">
                    <header className="module-header">
                        <h2 className="module-title">{project.title}</h2>
                        {project.description && (
                            <p className="module-description">{project.description}</p>
                        )}
                    </header>

                    <div className="module-content">
                        {project.blocks.map((block) => (
                            <div key={block.id} className="block-wrapper">
                                {renderBlock(block)}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Contracapa */}
            {data.theme.backCover && (
                <div className="back-cover-page">
                    <img src={data.theme.backCover} alt="Contracapa" />
                </div>
            )}
        </>
    );
}
