'use client';

import useProjectStore from '@/lib/store';
import { cn } from '@/lib/utils';

export function ContentBackgroundOverlay() {
  const { handbookTheme } = useProjectStore();
  const bg = handbookTheme.contentBackground;

  if (!bg?.imageUrl || !bg.enabled) return null;

  // Simular opacidade usando linear-gradient por cima da imagem (mais robusto)
  const overlayColor = `rgba(255, 255, 255, ${1 - bg.opacity})`;

  return (
    <div 
      className={cn(
        "absolute inset-0 pointer-events-none select-none overflow-hidden",
        "z-[0]" // Fica no fundo
      )}
    >
      <div 
        className="w-full h-full"
        style={{
          backgroundImage: `linear-gradient(${overlayColor}, ${overlayColor}), url(${bg.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </div>
  );
}
