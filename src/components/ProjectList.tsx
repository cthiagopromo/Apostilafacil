'use client';

import useProjectStore from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ProjectList() {
  const { projects, addProject } = useProjectStore();
  const router = useRouter();
  
  const handleNewProject = () => {
    const newProject = addProject();
    router.push(`/editor/${newProject.id}`);
  };

  return (
    <div className="space-y-4">
       <div className="flex justify-end">
         <Button onClick={handleNewProject}>
           <PlusCircle className="mr-2" />
           Novo Projeto
         </Button>
       </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.blocks?.length || 0} blocos</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href={`/editor/${project.id}`} passHref>
                <Button className="w-full">
                  Editar Apostila <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
