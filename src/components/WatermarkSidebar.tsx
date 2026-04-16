'use client';

import { WatermarkSettings } from '@/lib/types';

interface WatermarkSidebarProps {
  watermark: WatermarkSettings;
}

export default function WatermarkSidebar({ watermark }: WatermarkSidebarProps) {
  const text = watermark.text || 'CONFIDENCIAL';
  const opacity = watermark.opacity || 0.1;
  const color = watermark.color || '#000000';
  const fontSize = watermark.fontSize || 60;

  return (
    <div 
      className="absolute left-0 top-0 bottom-0 w-20 pointer-events-none z-40 flex items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, transparent 0%, ${color}10 20%, ${color}10 80%, transparent 100%)`,
      }}
    >
      <div 
        className="whitespace-nowrap"
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          fontSize: `${fontSize}px`,
          fontWeight: 700,
          color: color,
          opacity: opacity * 0.8,
          fontFamily: 'inherit',
          letterSpacing: '0.1em',
        }}
      >
        {text.repeat(5)}
      </div>
    </div>
  );
}