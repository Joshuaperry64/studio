'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collaborativeAiAssistance, CollaborativeAiAssistanceOutput } from '@/ai/flows/collaborative-ai-assistance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, ThumbsDown, ThumbsUp, Trash2, Wand2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  projectDescription: z.string().min(20, 'Project description must be at least 20 characters.'),
  aiPersonaDescription: z.string().min(10, 'AI persona must be at least 10 characters.'),
  groupSuggestions: z.array(z.object({ value: z.string().min(5, 'Suggestion must be at least 5 characters.') })),
});

export default function CoPilotPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CollaborativeAiAssistanceOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectDescription: '',
      aiPersonaDescription: 'A helpful and creative assistant',
      groupSuggestions: [{ value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "groupSuggestions",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const input = {
        ...values,
        groupSuggestions: values.groupSuggestions.map(s => s.value),
      };
      const assistanceResult = await collaborativeAiAssistance(input);
      setResult(assistanceResult);
      toast({ title: 'Success', description: 'AI analysis complete.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to get AI assistance.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>AI Co-Pilot</CardTitle>
              <CardDescription>Collaborate with your team and get AI-powered feedback on your project.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="projectDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your project goals, scope, and current state." {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="aiPersonaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI Persona</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., A critical project manager, an enthusiastic creative..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <FormLabel>Group Suggestions</FormLabel>
                    <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`groupSuggestions.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                                <FormControl>
                                <Input placeholder={`Suggestion #${index + 1}`} {...field} />
                                </FormControl>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Suggestion
                    </Button>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Wand2 className="mr-2 h-4 w-4" />Analyze Suggestions</>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
            <Card className="flex items-center justify-center p-6 bg-secondary/50 border-dashed min-h-[400px]">
                {isLoading ? (
                     <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p>AI is analyzing... please wait.</p>
                    </div>
                ) : !result ? (
                     <div className="flex flex-col items-center gap-2 text-muted-foreground text-center">
                        <Wand2 className="h-12 w-12" />
                        <p>Your AI analysis results will appear here.</p>
                    </div>
                ) : (
                    <div className="w-full space-y-4">
                        <h3 className="text-xl font-headline">Analysis Results</h3>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Revised Project Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{result.revisedProjectDescription}</p>
                            </CardContent>
                        </Card>
                         <Accordion type="single" collapsible className="w-full">
                            {result.analyzedSuggestions.map((item, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        {item.isIncorporated ? <ThumbsUp className="h-4 w-4 text-green-500" /> : <ThumbsDown className="h-4 w-4 text-red-500" />}
                                        <span className="truncate flex-1 text-left">{item.suggestion}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-sm text-muted-foreground">{item.incorporationRationale}</p>
                                </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                )}
            </Card>
        </div>

      </div>
    </main>
  );
}
