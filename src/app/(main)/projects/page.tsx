
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, FolderKanban, Lock, Globe, ArrowRight } from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import { useRouter } from 'next/navigation';
import { createProject } from '@/ai/flows/projects/create-project';
import { listProjects } from '@/ai/flows/projects/list-projects';
import { formatDistanceToNow } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';

const formSchema = z.object({
  name: z.string().min(5, 'Project name must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  isPrivate: z.boolean().default(false),
});

interface Project {
    id: string;
    name: string;
    description: string;
    isPrivate: boolean;
    createdBy: string;
    updatedAt: any;
}

export default function ProjectsLobbyPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const { user } = useUserStore();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      isPrivate: false,
    },
  });

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoadingProjects(true);
    try {
      const { projects: fetchedProjects } = await listProjects({ userId: user.userId });
      setProjects(fetchedProjects);
    } catch (error) {
      toast({ title: 'Error fetching projects', description: 'Could not load available projects.', variant: 'destructive' });
    } finally {
      setLoadingProjects(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to create a project.', variant: 'destructive' });
      return;
    }
    setIsCreating(true);
    try {
      const { projectId } = await createProject({
        ...values,
        createdBy: user.username,
        creatorId: user.userId,
      });
      toast({ title: 'Success', description: `Project "${values.name}" created!` });
      form.reset();
      fetchProjects();
      router.push(`/projects/${projectId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-headline">Projects</h1>
            <p className="text-muted-foreground">Manage your collaborative and private projects.</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4"/>Create Project</Button>
            </DialogTrigger>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Create a New Project</DialogTitle>
                    <DialogDescription>Start a new project to collaborate, brainstorm, and build.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Name</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., Mars Colonization Initiative" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                <Textarea placeholder="A brief description of your project's goals." {...field} rows={3} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="isPrivate"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Private Project</FormLabel>
                                    <FormDescription>
                                    Only you will be able to see this project.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                </FormItem>
                            )}
                            />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        {loadingProjects ? (
          <div className="flex items-center justify-center h-64 rounded-lg border border-dashed">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg py-24">
            <FolderKanban size={48} />
            <h2 className="text-xl font-semibold mt-4">No Projects Found</h2>
            <p>Get started by creating your first project.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                    {project.isPrivate 
                        ? <Badge variant="secondary"><Lock className="mr-1.5 h-3 w-3"/>Private</Badge> 
                        : <Badge variant="outline"><Globe className="mr-1.5 h-3 w-3"/>Public</Badge>
                    }
                  </div>
                  <CardDescription>
                    By {project.createdBy} &middot; Updated {formatDistanceToNow(new Date(project.updatedAt.seconds * 1000), { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/projects/${project.id}`}>Open Project <ArrowRight className="ml-2 h-4 w-4"/></Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
