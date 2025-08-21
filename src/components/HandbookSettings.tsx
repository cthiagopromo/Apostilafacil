
'use client';

import useProjectStore from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

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

  const handleColorSelect = (hsl: string) => {
    updateHandbookTheme({ colorPrimary: hsl });
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
    </div>
  );
}

    