'use client';

import React from 'react';
import { ChevronUp, ChevronDown, MoveHorizontal } from 'lucide-react';

export default function EditorNavigation() {
  const scrollTo = (position: 'top' | 'mid' | 'end') => {
    const viewport = document.querySelector('[data-editor-scroll="true"] [data-radix-scroll-area-viewport]');
    
    if (!viewport) return;

    if (position === 'top') {
      viewport.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (position === 'mid') {
      const center = (viewport.scrollHeight - viewport.clientHeight) / 2;
      viewport.scrollTo({ top: center, behavior: 'smooth' });
    } else {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="absolute bottom-8 right-8 z-30 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Dock Vertical Minimalista no Canto Inferior */}
      <div className="flex flex-col items-center gap-3 p-2 bg-background/90 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl">
        
        {/* TOPO */}
        <button
          onClick={() => scrollTo('top')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/5 hover:bg-primary text-primary hover:text-primary-foreground transition-all duration-300 group relative"
          title="Topo"
        >
          <ChevronUp className="w-5 h-5" />
          <span className="absolute right-full mr-3 px-2 py-1 bg-foreground text-background text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-tighter pointer-events-none">
            Início
          </span>
        </button>

        <div className="w-6 h-[1px] bg-primary/10" />

        {/* MEIO */}
        <button
          onClick={() => scrollTo('mid')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/5 hover:bg-primary text-primary hover:text-primary-foreground transition-all duration-300 group relative"
          title="Meio"
        >
          <MoveHorizontal className="w-4 h-4" />
          <span className="absolute right-full mr-3 px-2 py-1 bg-foreground text-background text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-tighter pointer-events-none">
            Meio
          </span>
        </button>

        <div className="w-6 h-[1px] bg-primary/10" />

        {/* FIM */}
        <button
          onClick={() => scrollTo('end')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/5 hover:bg-primary text-primary hover:text-primary-foreground transition-all duration-300 group relative"
          title="Fim"
        >
          <ChevronDown className="w-5 h-5" />
          <span className="absolute right-full mr-3 px-2 py-1 bg-foreground text-background text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-tighter pointer-events-none">
            Fim
          </span>
        </button>

      </div>
    </div>
  );
}
