
'use client';

import useProjectStore from '@/lib/store';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const colorOptions = [
  { name: 'Azul', hsl: '221 83% 53%', className: 'bg-blue-600' },
  { name: 'Amarelo', hsl: '48 96% 53%', className: 'bg-yellow-500' },
  { name: 'Roxo', hsl: '262 84% 53%', className: 'bg-purple-600' },
  { name: 'Rosa', hsl: '322 84% 53%', className: 'bg-pink-600' },
];

export default function ThemeSettings() {
  const { activeProject, updateThemeColor } = useProjectStore();

  if (!activeProject) {
    return (
      <div className='text-sm text-muted-foreground p-4 text-center'>
        Nenhum módulo selecionado.
      </div>
    );
  }
  
  const handleColorSelect = (hsl: string) => {
    if (activeProject) {
      updateThemeColor(activeProject.id, hsl);
    }
  }

  const currentColor = activeProject.theme?.colorPrimary || '221 83% 53%';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Cor Principal</Label>
        <div className="flex items-center gap-3 pt-1">
          {colorOptions.map((color) => (
            <button
              key={color.name}
              title={color.name}
              onClick={() => handleColorSelect(color.hsl)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all",
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

    