'use client';

import type { Module } from '@/lib/types';
import { useProject } from '@/context/ProjectContext';

interface PreviewViewProps {
  module: Module;
}

export default function PreviewView({ module }: PreviewViewProps) {
  const { project } = useProject();
  
  // This is a basic preview. A real implementation would sanitize the HTML
  // and render interactive blocks properly.
  return (
    <div className="p-8 prose prose-lg max-w-4xl mx-auto bg-white rounded-md shadow-sm h-full overflow-y-auto">
      <style jsx global>{`
        :root {
            --theme-primary: ${project.theme.colorPrimary};
            --theme-background: ${project.theme.colorBackground};
            --theme-accent: ${project.theme.colorAccent};
        }
        .prose h1, .prose h2, .prose h3 { color: var(--theme-primary); }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: module.contentHTML }} />
    </div>
  );
}
