
'use client';

import useProjectStore from '@/lib/store';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';

export default function PreviewHeader() {
  const { handbookTitle } = useProjectStore();

  return (
    <header className="py-8 no-print">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold text-foreground">{handbookTitle}</h1>
        <AccessibilityToolbar />
      </div>
    </header>
  );
}
