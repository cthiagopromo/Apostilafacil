'use client';

import { useEffect } from 'react';
import useProjectStore from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, PlusCircle } from 'lucide-react';
import { initialProjects } from '@/lib/initial-data';

export function ProjectList() {
  const { projects, setProjects } = useProjectStore();
  
  useEffect(() => {
    const storedProjects = localStorage.getItem('apostila-facil-projects');
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    } else {
      setProjects(initialProjects);
    }
  }, [setProjects]);


  return (
    <div className="space-y-4">
       <div className="flex justify-end">
         <Button>
           <PlusCircle className="mr-2" />
           Novo Projeto
         </Button>
       </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href={`/editor/${project.id}`} passHref>
                <Button className="w-full">
                  Editar Projeto <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
