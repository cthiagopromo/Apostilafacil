'use client';

import type { Block } from '@/lib/types';

const BlockRenderer = ({ block }: { block: Block }) => {
    switch(block.type) {
        case 'text':
            return <div dangerouslySetInnerHTML={{ __html: block.content.text || '' }} className="prose dark:prose-invert max-w-none" />;
        case 'image':
            return (
                <div className='flex justify-center'>
                    <img src={block.content.url || 'https://placehold.co/600x400.png'} alt={block.content.alt || 'Placeholder image'} className="rounded-md shadow-md max-w-full h-auto" />
                </div>
            )
        default:
            return <p className="text-muted-foreground">Bloco <strong>{block.type}</strong> ainda não é renderizado.</p>
    }
}

export default BlockRenderer;
