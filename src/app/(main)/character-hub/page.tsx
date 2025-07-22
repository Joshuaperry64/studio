'use client';

import React, { useState } from 'react';
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
import { Bot, Loader2, Plus, Sparkles, Trash2, Wand2 } from 'lucide-react';
import Image from 'next/image';
import { useCharacterStore } from '@/store/character-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  concept: z.string().min(10, 'Concept must be at least 10 characters.'),
});

export default function CharacterHubPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { characters, addCharacter, removeCharacter, setActiveCharacter } = useCharacterStore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      concept: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const newCharacter = await generateCharacter(values);
      addCharacter(newCharacter);
      toast({ title: 'Success', description: `Character "${newCharacter.name}" created!` });
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate character.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-headline">AI Character Hub</h1>
            <p className="text-muted-foreground">Create, manage, and select your AI personas.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
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
                   <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => removeCharacter(char.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                   </Button>
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
    </main>
  );
}
