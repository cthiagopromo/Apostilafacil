
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import type { Project } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

interface FloatingNavProps {
  modules: Project[];
  currentIndex: number;
  onModuleSelect: (index: number) => void;
}

export default function FloatingNav({ modules, currentIndex, onModuleSelect }: FloatingNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (index: number) => {
    onModuleSelect(index);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 no-print">
       {isOpen && (
         <div className="absolute bottom-16 right-0 bg-card border rounded-lg shadow-lg p-2 space-y-1 w-64">
           <p className="font-semibold text-sm px-2 py-1">Módulos</p>
           <ScrollArea className="h-[200px]">
             <div className='p-1 space-y-1'>
                {modules.map((mod, index) => (
                  <button
                    key={mod.id}
                    onClick={() => handleSelect(index)}
                    className={cn(
                        "w-full text-left p-2 text-sm hover:bg-accent rounded-md transition-colors text-card-foreground",
                        currentIndex === index && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {index + 1}. {mod.title}
                  </button>
                ))}
             </div>
           </ScrollArea>
         </div>
       )}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="rounded-full h-14 w-14 shadow-lg"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    </div>
  );
}
