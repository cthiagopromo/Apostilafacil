'use client';

import useProjectStore from '@/lib/store';
import { cn } from '@/lib/utils';

export function WatermarkOverlay({ isExport = false }: { isExport?: boolean }) {
  const { handbookTheme } = useProjectStore();
  const watermark = handbookTheme.watermark;

  if (!watermark || !watermark.enabled) return null;
  
  // No export, we handle visibility via classes/styles
  // In editor preview, we always show it if enabled
  if (isExport) {
    if (watermark.visibility === 'print') {
        // Handled by CSS @media print
    } else if (watermark.visibility === 'screen') {
        // Handled by CSS @media screen
    }
  }

  const style: React.CSSProperties = {
    color: watermark.color,
    opacity: watermark.opacity,
    pointerEvents: 'none',
    zIndex: isExport ? 0 : 50,
  };

  if (watermark.pattern === 'diagonal') {
    return (
      <div 
        className={cn(
            isExport ? "fixed" : "absolute",
            "inset-0 pointer-events-none overflow-hidden select-none",
            watermark.visibility === 'print' && "screen-hidden",
            watermark.visibility === 'screen' && "print-hidden"
        )}
        style={style}
      >
        <div 
          className="absolute inset-[-100%] flex flex-wrap justify-center items-center gap-x-32 gap-y-32 rotate-[-45deg] scale-150"
          style={{ width: '300%', height: '300%' }}
        >
          {Array.from({ length: 48 }).map((_, i) => (
            <span key={i} className="text-xl sm:text-2xl md:text-4xl font-bold whitespace-nowrap opacity-100">
              {watermark.text}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
          isExport ? "fixed" : "absolute",
          "inset-0 flex items-center justify-center pointer-events-none select-none",
          watermark.visibility === 'print' && "screen-hidden",
          watermark.visibility === 'screen' && "print-hidden"
      )}
      style={style}
    >
      <span className="text-6xl md:text-9xl font-bold rotate-[-30deg] border-8 p-8 border-current rounded-3xl">
        {watermark.text}
      </span>
    </div>
  );
}
