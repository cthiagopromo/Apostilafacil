'use client';

import { WatermarkSettings } from '@/lib/types';

interface WatermarkPrintProps {
  watermark: WatermarkSettings;
}

export default function WatermarkPrint({ watermark }: WatermarkPrintProps) {
  const text = watermark.text || 'CONFIDENCIAL';
  const style = watermark.style || 'sidebar';
  const opacity = watermark.opacity || 0.1;
  const color = watermark.color || '#000000';
  const fontSize = watermark.fontSize || 60;

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 9999,
  };

  if (style === 'sidebar') {
    return (
      <div 
        className="print-watermark-sidebar"
        style={{
          ...baseStyle,
          left: 0,
          top: 0,
          bottom: 0,
          width: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <div 
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            fontSize: `${fontSize * 0.6}px`,
            fontWeight: 700,
            color: color,
            opacity: opacity * 0.8,
            letterSpacing: '0.1em',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          {text.repeat(4)}
        </div>
      </div>
    );
  }

  if (style === 'center') {
    return (
      <div style={{ ...baseStyle, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          fontWeight: 700,
          fontSize: `${fontSize}px`,
          opacity: opacity,
          color: color,
          whiteSpace: 'nowrap',
        }}>
          {text}
        </div>
      </div>
    );
  }

if (style === 'ghost') {
    return (
      <div style={{ ...baseStyle, inset: 0, overflow: 'hidden' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '20px', 
          padding: '20px',
        }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i}
              style={{
                fontSize: '7vw',
                fontWeight: 900,
                color: 'transparent',
                WebkitTextStroke: `1px ${color}`,
                opacity: opacity,
                whiteSpace: 'nowrap',
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (style === 'classic') {
    return (
      <div style={{ ...baseStyle, inset: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          padding: '20px',
        }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                fontSize: '7vw',
                fontWeight: 700,
                color: color,
                opacity: opacity,
                whiteSpace: 'nowrap',
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}