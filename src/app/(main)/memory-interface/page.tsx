
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { BrainCircuit, Loader2, Database, RefreshCw, Server, Folder } from 'lucide-react';
import { databaseInteraction } from '@/ai/flows/database-interaction';
import { browseDatabase, BrowseDatabaseOutput } from '@/ai/flows/browse-database';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  query: z.string().min(5, 'Your request must be at least 5 characters.'),
});

export default function MemoryInterfacePage() {
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [isBrowserLoading, setIsBrowserLoading] = useState(true);
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [dbContents, setDbContents] = useState<BrowseDatabaseOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: '' },
  });

  const fetchDbContents = useCallback(async () => {
    setIsBrowserLoading(true);
    try {
      const contents = await browseDatabase();
      setDbContents(contents);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch database contents.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsBrowserLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDbContents();
  }, [fetchDbContents]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsQueryLoading(true);
    setQueryResult(null);
    try {
      const response = await databaseInteraction({ query: values.query });
      setQueryResult(response.response);
      toast({ title: 'Success', description: 'AI processed the memory request.' });
      // Refresh the browser view after a successful command
      fetchDbContents();
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process request.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsQueryLoading(false);
    }
  }

  const renderTable = (data: Record<string, any>[], tableName: string) => {
    if (!data || data.length === 0) {
      return <p className="text-sm text-muted-foreground text-center p-4">Table `{tableName}` is empty.</p>;
    }
    const headers = Object.keys(data[0]);
    return (
      <ScrollArea className="h-48">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map(header => <TableHead key={header} className="capitalize">{header}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {headers.map(header => <TableCell key={header} className="font-mono text-xs">{String(row[header])}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  };

  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                    <CardTitle>Natural Language Interface</CardTitle>
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
                            rows={5}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    {isQueryLoading ? (
                         <div className="flex flex-col items-center gap-2 text-muted-foreground mt-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <p className="text-sm">AI is accessing its memory...</p>
                        </div>
                    ) : queryResult && (
                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">AI Response:</h3>
                            <div className="w-full text-sm p-3 bg-secondary rounded-lg">
                                <p className="whitespace-pre-wrap">{queryResult}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isQueryLoading} className="w-full">
                    {isQueryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                    Send Command
                    </Button>
                </CardFooter>
                </form>
            </Form>
            </Card>

            <Card>
                 <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Database Browser</CardTitle>
                            <CardDescription>A direct view of the AI's memory tables.</CardDescription>
                        </div>
                        <Button variant="outline" size="icon" onClick={fetchDbContents} disabled={isBrowserLoading}>
                           <RefreshCw className={cn("h-4 w-4", isBrowserLoading && "animate-spin")} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isBrowserLoading ? (
                         <div className="flex flex-col items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="mt-2 text-muted-foreground">Loading database...</p>
                        </div>
                    ) : dbContents ? (
                        <Accordion type="multiple" className="w-full">
                             <AccordionItem value="critical_facts">
                                <AccordionTrigger><Folder className="mr-2 h-4 w-4"/>Critical Facts ({dbContents.critical_facts.length})</AccordionTrigger>
                                <AccordionContent>{renderTable(dbContents.critical_facts, 'critical_facts')}</AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="learned_skills">
                                <AccordionTrigger><Folder className="mr-2 h-4 w-4"/>Learned Skills ({dbContents.learned_skills.length})</AccordionTrigger>
                                <AccordionContent>{renderTable(dbContents.learned_skills, 'learned_skills')}</AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="user_profiles">
                                <AccordionTrigger><Folder className="mr-2 h-4 w-4"/>User Profiles ({dbContents.user_profiles.length})</AccordionTrigger>
                                <AccordionContent>{renderTable(dbContents.user_profiles, 'user_profiles')}</AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="past_conversations">
                                <AccordionTrigger><Folder className="mr-2 h-4 w-4"/>Past Conversations ({dbContents.past_conversations.length})</AccordionTrigger>
                                <AccordionContent>{renderTable(dbContents.past_conversations, 'past_conversations')}</AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <Server className="h-8 w-8" />
                            <p className="mt-2">Could not load database contents.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
