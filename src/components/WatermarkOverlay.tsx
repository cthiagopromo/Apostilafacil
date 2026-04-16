'use client';

import useProjectStore from '@/lib/store';
import React from 'react';
import WatermarkSidebar from './WatermarkSidebar';

export default function WatermarkOverlay() {
  const { handbookTheme } = useProjectStore();
  const watermark = handbookTheme?.watermark;

  if (!watermark || !watermark.enabled) return null;

  const text = watermark.text || 'CONFIDENCIAL';
  const style = watermark.style || 'sidebar';
  
  const cssVars = {
    '--wm-opacity': watermark.opacity,
    '--wm-color': watermark.color,
    '--wm-size': `${watermark.fontSize}px`,
  } as React.CSSProperties;

  // BARRA LATERAL
  if (style === 'sidebar') {
    return <WatermarkSidebar watermark={watermark} />;
  }

  return (
    <>
      {/* 2. CENTRALIZADO */}
      {style === 'center' && (
        <div className="absolute inset-0 pointer-events-none z-[9999] flex items-center justify-center overflow-hidden" style={cssVars}>
          <div 
            className="text-[var(--wm-size)] font-bold text-[var(--wm-color)] opacity-[var(--wm-opacity)] whitespace-nowrap"
          >
            {text}
          </div>
        </div>
      )}

      {style === 'ghost' && (
        <div className="absolute inset-0 pointer-events-none z-[9999] overflow-hidden" style={cssVars}>
          <div className="grid grid-cols-2 gap-2 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="text-[7vw] font-black whitespace-nowrap"
                style={{ 
                  WebkitTextStroke: `1px ${watermark.color}`, 
                  color: 'transparent',
                  opacity: watermark.opacity 
                }}
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      )}

      {style === 'classic' && (
        <div className="absolute inset-0 pointer-events-none z-[9999] overflow-hidden" style={cssVars}>
          <div className="grid grid-cols-2 gap-2 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="text-[7vw] font-bold whitespace-nowrap"
                style={{ 
                  color: watermark.color,
                  opacity: watermark.opacity 
                }}
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
