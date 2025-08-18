'use client';

import useProjectStore from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from './ui/textarea';

const BlockSettings = () => {
    const { activeProject, activeBlockId, updateBlockContent } = useProjectStore();

    const activeBlock = activeProject?.blocks?.find(b => b.id === activeBlockId);

    if (!activeBlock) {
        return (
            <div className="text-center text-muted-foreground mt-8">
                <p>Selecione um bloco para ver suas configurações.</p>
            </div>
        );
    }
    
    const renderSettings = () => {
        switch (activeBlock.type) {
            case 'text':
                return (
                    <div className="space-y-2">
                        <Label htmlFor="text-content">Conteúdo do Texto (HTML)</Label>
                        <Textarea 
                            id="text-content"
                            value={activeBlock.content.text || ''}
                            onChange={(e) => updateBlockContent(activeBlock.id, { text: e.target.value })}
                            className="h-48 font-mono text-xs"
                        />
                    </div>
                )
            case 'image':
                 return (
                    <div className='space-y-4'>
                        <div className="space-y-2">
                            <Label htmlFor="image-url">URL da Imagem</Label>
                            <Input 
                                id="image-url" 
                                value={activeBlock.content.url || ''} 
                                onChange={e => updateBlockContent(activeBlock.id, { url: e.target.value })} 
                                placeholder="https://placehold.co/600x400.png"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image-alt">Texto Alternativo (Alt)</Label>
                            <Input 
                                id="image-alt" 
                                value={activeBlock.content.alt || ''} 
                                onChange={e => updateBlockContent(activeBlock.id, { alt: e.target.value })} 
                                placeholder="Descrição da imagem"
                            />
                        </div>
                    </div>
                )
            default:
                return <p>Configurações para o bloco <strong>{activeBlock.type}</strong> ainda não implementadas.</p>
        }
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle>Configurações do Bloco</CardTitle>
                <CardDescription>
                    Tipo de Bloco: <span className="font-semibold text-primary">{activeBlock.type}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {renderSettings()}
            </CardContent>
        </Card>
    )
}

export default BlockSettings;