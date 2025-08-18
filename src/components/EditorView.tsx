'use client';

import type { Page } from '@/lib/types';
import useProjectStore from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface EditorViewProps {
  page: Page;
}

function renderTemplateForm(page: Page, updatePageContent: (id: string, content: any) => void) {
    switch (page.template) {
        case 'cover':
            return (
                <div className='space-y-4'>
                    <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" value={page.content.title || ''} onChange={e => updatePageContent(page.id, { title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subtitle">Subtítulo</Label>
                        <Input id="subtitle" value={page.content.subtitle || ''} onChange={e => updatePageContent(page.id, { subtitle: e.target.value })} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="bg-image">URL da Imagem de Fundo</Label>
                        <Input id="bg-image" value={page.content.backgroundImageUrl || ''} onChange={e => updatePageContent(page.id, { backgroundImageUrl: e.target.value })} />
                    </div>
                </div>
            )
        case 'text_image':
             return (
                <div className='space-y-4'>
                    <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" value={page.content.title || ''} onChange={e => updatePageContent(page.id, { title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="text">Texto</Label>
                        <Textarea id="text" value={page.content.text || ''} onChange={e => updatePageContent(page.id, { text: e.target.value })} className="h-48"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="image-url">URL da Imagem</Label>
                        <Input id="image-url" value={page.content.imageUrl || ''} onChange={e => updatePageContent(page.id, { imageUrl: e.target.value })} />
                    </div>
                </div>
            )
        default:
            return <p>Este template ainda não foi implementado: {page.template}</p>
    }
}


export default function EditorView({ page }: EditorViewProps) {
  const { updatePageContent } = useProjectStore();

  return (
    <div className="p-6 space-y-6 h-full">
        <div className='space-y-2 border-b pb-4'>
            <h2 className='text-2xl font-bold'>{page.title}</h2>
            <p className='text-sm text-muted-foreground'>Template: <span className='font-semibold text-primary'>{page.template}</span></p>
        </div>
        
        {renderTemplateForm(page, updatePageContent)}
    </div>
  );
}
