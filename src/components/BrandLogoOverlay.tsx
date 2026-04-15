'use client';

import useProjectStore from '@/lib/store';
import { cn } from '@/lib/utils';

export function BrandLogoOverlay({ isExport = false }: { isExport?: boolean }) {
  const { handbookTheme } = useProjectStore();
  const logo = handbookTheme.brandLogo;

  if (!logo?.imageUrl || (!logo.enabled && !isExport)) return null;

  // No export, o fundo é resolvido via CSS no Body/Root (visto no export.ts)
  // Esta overlay é usada apenas para o Editor (Preview em tempo real)
  if (isExport) return null;

  return (
    <div 
      className={cn(
        "absolute inset-0 pointer-events-none select-none overflow-hidden rounded-xl",
        "z-[0]" // Fica no nível da base, acima do fundo mas abaixo do conteúdo
      )}
      style={{
        zIndex: 0
      }}
    >
      <div 
        className="w-full h-full"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, ${1 - logo.opacity}), rgba(255, 255, 255, ${1 - logo.opacity})), url(${logo.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: logo.visibility === 'print' ? 0.3 : 1 // No editor, se for "apenas imprimir", deixamos clarinho
        }}
      />
    </div>
  );
}
