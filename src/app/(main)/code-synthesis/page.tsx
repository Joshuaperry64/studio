
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
import { Code, Loader2, Sparkles, Terminal } from 'lucide-react';
import { proposeCodeChanges, ProposeCodeChangesOutput } from '@/ai/flows/propose-code-changes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


const formSchema = z.object({
  request: z.string().min(10, 'Your request must be at least 10 characters.'),
});

export default function CodeSynthesisPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProposeCodeChangesOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { request: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await proposeCodeChanges({ request: values.request });
      setResult(response);
      toast({ title: 'Success', description: 'AI has generated a plan.' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate code changes.';
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
                <CardTitle>Code Synthesis</CardTitle>
                <CardDescription>
                  Describe the code changes you want to make. The AI will analyze the codebase and generate a plan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="request"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Request</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'Add a new page that displays a list of users from the database.'"
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
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate Plan
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Generated Plan</CardTitle>
            <CardDescription>The AI's proposed changes. Review the plan and code before applying.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-6 bg-secondary/50 border-dashed rounded-b-lg">
             {isLoading ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p>AI is analyzing the codebase...</p>
              </div>
            ) : result ? (
               <ScrollArea className="w-full h-[500px] p-4 bg-background rounded-md">
                 <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Summary</h3>
                        <p className="text-sm text-muted-foreground p-3 bg-secondary rounded-md">{result.summary}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Plan</h3>
                        <ol className="list-decimal list-inside text-sm text-muted-foreground p-3 bg-secondary rounded-md space-y-1">
                            {result.plan.map((step, index) => <li key={index}>{step}</li>)}
                        </ol>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Changeset</h3>
                         <Accordion type="single" collapsible className="w-full">
                            {result.changeset.map((change, index) => (
                               <AccordionItem value={`item-${index}`} key={index}>
                                 <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <Terminal className="h-4 w-4" />
                                        <span className="font-mono text-sm">{change.file}</span>
                                    </div>
                                </AccordionTrigger>
                                 <AccordionContent>
                                    <SyntaxHighlighter
                                        language="typescript" // Or determine dynamically
                                        style={atomDark}
                                        showLineNumbers
                                    >
                                        {change.content}
                                    </SyntaxHighlighter>
                                 </AccordionContent>
                               </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                 </div>
               </ScrollArea>
            ) : (
              <div className="text-center text-muted-foreground">
                <Code className="mx-auto h-12 w-12" />
                <p className="mt-2">The AI's plan will appear here.</p>
              </div>
            )}
          </CardContent>
          {result && (
              <CardFooter className="border-t pt-6">
                <Button className="w-full" disabled>Apply Changes (Coming Soon)</Button>
              </CardFooter>
          )}
        </Card>
      </div>
    </main>
  );
}
