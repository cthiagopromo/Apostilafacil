
'use client';

import useProjectStore from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Check, Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const colorOptions = [
  { name: 'Azul', hsl: '221 83% 53%', className: 'bg-blue-600' },
  { name: 'Laranja', hsl: '32 100% 47%', className: 'bg-orange-500' },
  { name: 'Roxo', hsl: '262 84% 53%', className: 'bg-purple-600' },
  { name: 'Rosa', hsl: '322 84% 53%', className: 'bg-pink-600' },
];


export default function HandbookSettings() {
  const { 
      handbookTitle, 
      handbookDescription, 
      handbookTheme,
      updateHandbookTitle, 
      updateHandbookDescription,
      updateHandbookTheme
  } = useProjectStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleColorSelect = (hsl: string) => {
    updateHandbookTheme({ colorPrimary: hsl });
  }

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
            variant: 'destructive',
            title: 'Imagem muito grande',
            description: 'Por favor, escolha uma imagem com menos de 2MB.',
        });
        return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
        const base64Url = loadEvent.target?.result as string;
        updateHandbookTheme({ cover: base64Url });
        toast({
            title: 'Upload da capa concluído',
            description: 'A imagem de capa foi incorporada com sucesso.',
        });
    };
    reader.onerror = () => {
         toast({
            variant: 'destructive',
            title: 'Erro no Upload',
            description: 'Não foi possível ler o arquivo da imagem.',
        });
    }
    reader.readAsDataURL(file);
  };
  
  const removeCover = () => {
    updateHandbookTheme({ cover: undefined });
  }

  const currentColor = handbookTheme?.colorPrimary || '221 83% 53%';


  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="handbook-title">Título da Apostila</Label>
          <Input
            id="handbook-title"
            value={handbookTitle}
            onChange={(e) => updateHandbookTitle(e.target.value)}
            placeholder="Ex: Curso Completo de Biologia"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="handbook-description">Descrição da Apostila</Label>
          <Textarea
            id="handbook-description"
            value={handbookDescription}
            onChange={(e) => updateHandbookDescription(e.target.value)}
            placeholder="Uma breve descrição sobre toda a apostila."
            rows={4}
          />
        </div>
      </div>
       <div className="space-y-2">
        <Label>Cor Principal</Label>
        <div className="flex items-center gap-3 pt-1">
          {colorOptions.map((color) => (
            <button
              key={color.name}
              title={color.name}
              onClick={() => handleColorSelect(color.hsl)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center",
                color.className,
                currentColor === color.hsl ? 'border-primary ring-2 ring-offset-2 ring-ring' : 'border-transparent'
              )}
            >
              {currentColor === color.hsl && (
                <Check className="w-5 h-5 text-white" />
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Imagem de Capa</Label>
        {handbookTheme.cover ? (
            <div className='relative group'>
                <img src={handbookTheme.cover} alt="Pré-visualização da capa" className='rounded-md border' />
                <Button onClick={removeCover} variant="destructive" size="icon" className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <X />
                </Button>
            </div>
        ) : (
            <>
              <Button variant="outline" className='w-full' onClick={() => fileInputRef.current?.click()}>
                  <Upload className='mr-2' />
                  Enviar Imagem (Max 2MB)
              </Button>
              <Input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif, image/webp"
                  onChange={handleCoverUpload}
              />
            </>
        )}
      </div>
    </div>
  );
}
