
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateCharacter, GenerateCharacterOutput } from '@/ai/flows/generate-character';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bot, Edit, Loader2, Plus, Sparkles, Trash2, Wand2 } from 'lucide-react';
import Image from 'next/image';
import { useCharacterStore, Character } from '@/store/character-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const createFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  concept: z.string().min(10, 'Concept must be at least 10 characters.'),
});

const editFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  personality: z.string().min(10, 'Personality must be at least 10 characters.'),
  backstory: z.string().min(20, 'Backstory must be at least 20 characters.'),
});

export default function CharacterHubPage() {
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const { characters, addCharacter, removeCharacter, setActiveCharacter, updateCharacter } = useCharacterStore();
  const { toast } = useToast();

  const createForm = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(createFormSchema),
    defaultValues: { name: '', concept: '' },
  });

  const editForm = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: { name: '', personality: '', backstory: '' },
  });
  
  useEffect(() => {
    if (selectedCharacter) {
      editForm.reset({
        name: selectedCharacter.name,
        personality: selectedCharacter.personality,
        backstory: selectedCharacter.backstory,
      });
    }
  }, [selectedCharacter, editForm]);

  async function onCreateSubmit(values: z.infer<typeof createFormSchema>) {
    setIsCreateLoading(true);
    try {
      const newCharacter = await generateCharacter(values);
      addCharacter(newCharacter);
      toast({ title: 'Success', description: `Character "${newCharacter.name}" created!` });
      createForm.reset();
      setIsCreateDialogOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate character.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsCreateLoading(false);
    }
  }
  
  async function onEditSubmit(values: z.infer<typeof editFormSchema>) {
    if (!selectedCharacter) return;
    setIsEditLoading(true);
    try {
      const updated: Character = { ...selectedCharacter, ...values };
      updateCharacter(selectedCharacter.name, updated);
      toast({ title: 'Success', description: `Character "${updated.name}" updated!` });
      setIsEditDialogOpen(false);
      setSelectedCharacter(null);
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Failed to update character.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsEditLoading(false);
    }
  }
  
  const handleEditClick = (character: Character) => {
    setSelectedCharacter(character);
    setIsEditDialogOpen(true);
  }

  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-headline">AI Character Hub</h1>
            <p className="text-muted-foreground">Create, manage, and select your AI personas.</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Character
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New AI Character</DialogTitle>
                <DialogDescription>
                  Provide a name and a core concept. The AI will generate the rest.
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Commander Valerius" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="concept"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Concept</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., A stoic, cybernetically enhanced Roman general lost in a futuristic city."
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isCreateLoading} className="w-full">
                    {isCreateLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate Character
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg py-24">
            <Bot size={48} />
            <h2 className="text-xl font-semibold mt-4">No Characters Found</h2>
            <p>Get started by creating your first AI character.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {characters.map((char) => (
              <Card key={char.name} className="flex flex-col">
                <CardHeader className="relative">
                   <div className="absolute top-2 right-2 flex gap-2">
                       <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEditClick(char)}
                        >
                          <Edit className="h-4 w-4" />
                       </Button>
                       <Button
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeCharacter(char.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                       </Button>
                   </div>
                  <div className="aspect-square relative w-full rounded-md overflow-hidden">
                    <Image
                      src={char.avatarDataUri}
                      alt={`Avatar for ${char.name}`}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint="character avatar"
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <CardTitle>{char.name}</CardTitle>
                  <ScrollArea className="h-24 mt-2">
                    <CardDescription>{char.personality}</CardDescription>
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => {
                        setActiveCharacter(char.name);
                        toast({title: "Active Character Changed", description: `${char.name} is now the active chat persona.`})
                    }}
                  >
                    Set as Active
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Edit Character Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit {selectedCharacter?.name}</DialogTitle>
            <DialogDescription>
              Fine-tune your character's personality and backstory.
            </DialogDescription>
          </DialogHeader>
           <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1 flex justify-center">
                          <Image
                            src={selectedCharacter?.avatarDataUri || 'https://placehold.co/200x200.png'}
                            alt={`Avatar for ${selectedCharacter?.name}`}
                            width={150}
                            height={150}
                            className="rounded-md object-cover aspect-square"
                          />
                      </div>
                      <div className="md:col-span-2">
                          <FormField
                            control={editForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                      </div>
                  </div>
                   <FormField
                    control={editForm.control}
                    name="personality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personality</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={editForm.control}
                    name="backstory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Backstory</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={6} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isEditLoading}>
                        {isEditLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                  </DialogFooter>
                </form>
              </Form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
