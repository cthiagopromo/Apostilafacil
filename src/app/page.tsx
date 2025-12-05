'use client';

import { useEffect, useState } from 'react';
import useProjectStore from '@/lib/store';
import { ProjectList } from '@/components/ProjectList';
import { FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const HomeSkeleton = () => (
  <div className="w-full max-w-5xl mx-auto">
    <header className="text-center my-10">
        <div className="inline-block p-4 bg-primary/10 rounded-2xl mb-4">
            <FileText className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl font-bold text-primary">Apostila Fácil</h1>
        <p className="text-xl text-muted-foreground mt-2">Crie, edite e exporte suas apostilas interativas com facilidade.</p>
    </header>
    <main>
      <div className="space-y-6">
        <div className="flex justify-center gap-4">
          <Skeleton className="h-11 w-48" />
          <Skeleton className="h-11 w-48" />
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-0">
              <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"><Skeleton className="h-5 w-32" /></th>
                              <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground w-[120px]"><Skeleton className="h-5 w-20 mx-auto" /></th>
                              <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground w-[120px]"><Skeleton className="h-5 w-20 mx-auto" /></th>
                              <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[200px]"><Skeleton className="h-5 w-40" /></th>
                              <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right w-[200px]"><Skeleton className="h-5 w-20 ml-auto" /></th>
                          </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                              <td className="p-4 align-middle"><Skeleton className="h-5 w-48" /></td>
                              <td className="p-4 align-middle text-center"><Skeleton className="h-5 w-8 mx-auto" /></td>
                              <td className="p-4 align-middle text-center"><Skeleton className="h-5 w-8 mx-auto" /></td>
                              <td className="p-4 align-middle"><Skeleton className="h-5 w-32" /></td>
                              <td className="p-4 align-middle text-right">
                                <div className="flex justify-end gap-2">
                                  <Skeleton className="h-9 w-24" />
                                  <Skeleton className="h-9 w-9" />
                                </div>
                              </td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default function Home() {
  const { initializeStore, isInitialized } = useProjectStore();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      initializeStore(null); 
    }
  }, [isInitialized, initializeStore]);

  const handleNavigateToEditor = (handbookId: string, projectId: string) => {
    setIsNavigating(true);
    router.push(`/editor/${handbookId}/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      {!isInitialized || isNavigating ? (
          <HomeSkeleton />
      ) : (
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
      )}
    </div>
  );
}
