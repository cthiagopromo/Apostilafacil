
'use client';

import type { Block, QuizOption } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import useProjectStore from '@/lib/store';
import { cn } from '@/lib/utils';
import { CheckCircle, Quote, XCircle } from 'lucide-react';
import DOMPurify from 'dompurify';

const YoutubeEmbed = ({ url, title, autoplay, showControls }: { url: string, title?: string, autoplay?: boolean, showControls?: boolean }) => {
    try {
        const urlObj = new URL(url);
        let videoId = urlObj.searchParams.get('v');
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.substring(1);
        }
        if (!videoId) return <p className="text-destructive">URL do YouTube inválida.</p>;

        const src = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&controls=${showControls ? 1 : 0}`;

        return (
            <iframe
                className="w-full aspect-video rounded-md"
                src={src}
                title={title || "YouTube video player"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        );
    } catch (e) {
        return <p className="text-destructive">URL do vídeo inválida.</p>;
    }
};

const CloudflareEmbed = ({ videoId, title, autoplay, showControls }: { videoId: string, title?: string, autoplay?: boolean, showControls?: boolean }) => {
    if (!videoId) return <p className="text-destructive">ID do vídeo do Cloudflare inválido.</p>;

    const src = `https://customer-mhnunnb897evy1sb.cloudflarestream.com/${videoId}/iframe?autoplay=${autoplay}&controls=${showControls}`;

    return (
        <iframe
            className="w-full aspect-video rounded-md"
            src={src}
            title={title || "Cloudflare video player"}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        ></iframe>
    );
};


const QuizBlock = ({ block }: { block: Block }) => {
    const { updateBlockContent, resetQuiz } = useProjectStore();
    const { question, options, userAnswerId } = block.content;
    const isAnswered = userAnswerId != null;
    
    const handleValueChange = (optionId: string) => {
        if (!isAnswered) {
            updateBlockContent(block.id, { userAnswerId: optionId });
        }
    };

    // This component is used in both the live preview and the static export.
    // For the static export, the interactivity is handled by `script.js`.
    // The data attributes `data-correct` are essential for that script.
    return (
        <Card className="quiz-card bg-muted/30">
            <CardHeader className="quiz-card-header">
                <CardTitle className="quiz-card-title">{question}</CardTitle>
                <CardDescription className="quiz-card-desc">Selecione a resposta correta.</CardDescription>
            </CardHeader>
            <CardContent className="quiz-card-content">
                <RadioGroup value={userAnswerId || undefined} onValueChange={handleValueChange} disabled={isAnswered}>
                    {options?.map((option) => {
                        const isSelected = userAnswerId === option.id;
                        const showResult = isAnswered && isSelected;
                        
                        return (
                            <div key={option.id} 
                                className={cn(
                                "quiz-option flex items-center space-x-3 p-3 rounded-md transition-all",
                                isAnswered && option.isCorrect && 'bg-primary/10 dark:bg-primary/20 border-primary/50 border',
                                showResult && !option.isCorrect && 'bg-red-100 dark:bg-red-900/50 border-red-500 border'
                                )}
                                data-correct={String(option.isCorrect)}
                            >
                                <RadioGroupItem value={option.id} id={option.id} className="radio-group-item" />
                                <Label htmlFor={option.id} className="flex-1 cursor-pointer">{option.text}</Label>
                                {showResult && option.isCorrect && <CheckCircle className="text-primary" />}
                                {showResult && !option.isCorrect && <XCircle className="text-red-600" />}
                            </div>
                        )
                    })}
                </RadioGroup>
            </CardContent>
            <CardFooter className="quiz-card-footer">
                <Button variant="outline" className="retry-btn" onClick={() => resetQuiz(block.id)} style={{ display: isAnswered ? 'inline-flex' : 'none' }}>Tentar Novamente</Button>
            </CardFooter>
        </Card>
    )
}


const BlockRenderer = ({ block }: { block: Block }) => {
    const createSanitizedHtml = (html: string) => {
        if (typeof window !== 'undefined') {
            return { __html: DOMPurify.sanitize(html) };
        }
        return { __html: html };
    };

    switch(block.type) {
        case 'text':
            return <div dangerouslySetInnerHTML={createSanitizedHtml(block.content.text || '')} className="prose dark:prose-invert max-w-none" />;
        case 'image':
            const imageUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT 
                ? `https://imagedelivery.net/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT}/${block.content.url}/public`
                : block.content.url;
            const width = block.content.width ?? 100;
            return (
                <div className='flex justify-center'>
                    <figure className='flex flex-col items-center gap-2' style={{ width: `${width}%` }}>
                        <img 
                          src={imageUrl || 'https://placehold.co/600x400.png'} 
                          alt={block.content.alt || 'Placeholder image'} 
                          className="rounded-md shadow-md max-w-full h-auto" 
                        />
                        {block.content.caption && (
                            <figcaption className="text-sm text-center text-muted-foreground italic mt-2">{block.content.caption}</figcaption>
                        )}
                    </figure>
                </div>
            )
        case 'quote':
            return (
                 <div className="relative">
                    <blockquote className="p-6 bg-muted/50 border-l-4 border-primary rounded-r-lg text-lg italic text-foreground/80 m-0">
                         <Quote className="absolute -top-3 -left-2 h-10 w-10 text-primary/20 quote-icon" />
                        {block.content.text}
                    </blockquote>
                 </div>
            )
        case 'video':
            const { videoType, videoUrl, cloudflareVideoId, videoTitle, autoplay, showControls } = block.content;

            if (videoType === 'cloudflare') {
                if (!cloudflareVideoId) return <p className="text-muted-foreground">ID do vídeo do Cloudflare não definido.</p>
                return <CloudflareEmbed videoId={cloudflareVideoId} title={videoTitle} autoplay={autoplay} showControls={showControls} />
            }
            
            if (!videoUrl) return <p className="text-muted-foreground">URL do vídeo não definida.</p>
            return <YoutubeEmbed url={videoUrl} title={videoTitle} autoplay={autoplay} showControls={showControls} />
        case 'button':
            return (
                <div className='flex justify-center'>
                    <Button asChild size="lg" className="btn btn-primary">
                        <a href={block.content.buttonUrl || '#'} target="_blank" rel="noopener noreferrer">
                            {block.content.buttonText || 'Botão'}
                        </a>
                    </Button>
                </div>
            )
        case 'quiz':
            return <QuizBlock block={block} />
        default:
            return <p className="text-muted-foreground">Bloco <strong>{block.type}</strong> ainda não é renderizado.</p>
    }
}

export default BlockRenderer;
