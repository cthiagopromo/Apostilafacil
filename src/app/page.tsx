
import { ProjectList } from '@/components/ProjectList';
import { FileText } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary/40 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <div className="inline-block p-4 bg-primary/10 rounded-2xl mb-4">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-primary">Editor de Apostilas</h1>
          <p className="text-xl text-muted-foreground mt-2">Crie, edite e exporte suas apostilas interativas com facilidade.</p>
        </header>
        <main>
          <ProjectList />
        </main>
      </div>
    </div>
  );
}
