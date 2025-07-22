'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';

const formSchema = z.object({
  feedback: z.string().min(10, 'Feedback must be at least 10 characters.').max(5000, 'Feedback cannot exceed 5000 characters.'),
});

export default function FeedbackPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feedback: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Success', description: 'Your feedback has been submitted. Thank you!' });
        form.reset();
      } else {
        toast({ title: 'Submission Failed', description: data.message || 'An error occurred.', variant: 'destructive' });
      }
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Could not connect to the server.';
       toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="max-w-3xl mx-auto">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                <CardHeader>
                    <CardTitle>Submit Feedback</CardTitle>
                    <CardDescription>Have a suggestion, bug report, or general feedback? Let us know!</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="feedback"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Message</FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder="Tell us what's on your mind..."
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
                    <Button type="submit" disabled={isLoading} className="ml-auto">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Submit
                    </Button>
                </CardFooter>
                </Card>
            </form>
        </Form>
      </div>
    </main>
  );
}
