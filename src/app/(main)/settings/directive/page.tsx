
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/store/user-store';
import { Loader2, Save, TerminalSquare } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  directive: z.string().min(1, 'Directive content cannot be empty.'),
});

export default function DirectiveSettingsPage() {
  const { user } = useUserStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<{ directive: string }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      directive: '',
    },
  });

  useEffect(() => {
    async function fetchDirective() {
      if (user?.role !== 'admin') return;
      setIsFetching(true);
      try {
        const response = await fetch('/api/settings/directive');
        if (response.ok) {
          const data = await response.json();
          form.setValue('directive', data.content);
        } else {
          toast({ title: 'Error', description: 'Failed to fetch AI directive.', variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Could not connect to server.', variant: 'destructive' });
      } finally {
        setIsFetching(false);
      }
    }
    fetchDirective();
  }, [user, toast, form]);

  const onSubmit = async (data: { directive: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/directive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.directive }),
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'AI directive saved successfully.' });
      } else {
        const errorData = await response.json();
        toast({ title: 'Error', description: errorData.message || 'Failed to save directive.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You do not have permission to view this page.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <TerminalSquare />
                AI Core Directive
            </CardTitle>
            <CardDescription>
              Manage the master prompt (AlphaCore.txt) that defines the AI's core programming and personality. Changes will take effect on the next interaction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
                <FormField
                    control={form.control}
                    name="directive"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Textarea
                                placeholder="Loading AI Core Directive..."
                                className="min-h-[500px] font-mono text-xs"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || isFetching} className="ml-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Directive
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
