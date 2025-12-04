'use client';

import { useEffect } from 'react';
import useProjectStore from '@/lib/store';
import { ProjectList } from '@/components/ProjectList';
import { FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { initializeStore, isInitialized } = useProjectStore();
  const router = useRouter();

  // Garante que a store seja inicializada na página inicial
  useEffect(() => {
    if (!isInitialized) {
      initializeStore(null); // Passa null para carregar do localstorage
    }
  }, [isInitialized, initializeStore]);

  const handleNavigateToEditor = (handbookId: string, projectId: string) => {
    router.push(`/editor/${handbookId}/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center my-10">
          <div className="inline-block p-4 bg-primary/10 rounded-2xl mb-4">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-primary">Apostila Fácil</h1>
          <p className="text-xl text-muted-foreground mt-2">Crie, edite e exporte suas apostilas interativas com facilidade.</p>
        </header>
        <main>
          <ProjectList onNavigate={handleNavigateToEditor} />
        </main>
      </div>
    </div>
  );
}
