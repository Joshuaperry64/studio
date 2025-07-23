'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { BrainCircuit, Loader2, Database } from 'lucide-react';
import { databaseInteraction } from '@/ai/flows/database-interaction';

const formSchema = z.object({
  query: z.string().min(5, 'Your request must be at least 5 characters.'),
});

export default function MemoryInterfacePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await databaseInteraction({ query: values.query });
      setResult(response.response);
      toast({ title: 'Success', description: 'AI processed the memory request.' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process request.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Memory Interface</CardTitle>
                <CardDescription>
                  Issue commands to the AI's persistent memory. The AI will interact with its database and report back the results.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Request</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'Add a learned skill: I can now speak French.' or 'What are the current user profiles?'"
                          {...field}
                          rows={8}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                  Send Command
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>AI Response</CardTitle>
            <CardDescription>This is the AI's response after interacting with its memory.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-6 bg-secondary/50 border-dashed rounded-b-lg">
             {isLoading ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p>AI is accessing its memory...</p>
              </div>
            ) : result ? (
               <div className="w-full h-full p-4 bg-background/50 rounded-lg">
                  <p className="whitespace-pre-wrap">{result}</p>
               </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Database className="mx-auto h-12 w-12" />
                <p className="mt-2">The AI's response will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
