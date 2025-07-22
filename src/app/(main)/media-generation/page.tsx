'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateVisualMedia, GenerateVisualMediaInput } from '@/ai/flows/generate-visual-media';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Clapperboard, ImageIcon as ImageIconLucide } from 'lucide-react';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

const formSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters long.'),
  mediaType: z.enum(['image', 'video']),
  aspectRatio: z.enum(['16:9', '9:16']).optional(),
  durationSeconds: z.number().min(5).max(8).optional(),
});

export default function MediaGenerationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
      mediaType: 'image',
      aspectRatio: '16:9',
      durationSeconds: 5,
    },
  });

  const watchMediaType = form.watch('mediaType');
  
  React.useEffect(() => {
      setMediaType(watchMediaType);
      setResultUrl(null);
  }, [watchMediaType]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResultUrl(null);
    try {
      const input: GenerateVisualMediaInput = { ...values };
      const result = await generateVisualMedia(input);
      setResultUrl(result.mediaUrl);
      toast({ title: 'Success', description: `${watchMediaType === 'image' ? 'Image' : 'Video'} generated successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: `Failed to generate ${watchMediaType}.`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create Visual Media</CardTitle>
            <CardDescription>Generate stunning images or videos from a text prompt using AI.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="mediaType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Media Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select media type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., A futuristic city skyline at sunset, cyberpunk style" {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchMediaType === 'video' && (
                  <>
                    <FormField
                      control={form.control}
                      name="aspectRatio"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Aspect Ratio</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex items-center space-x-4"
                            >
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="16:9" />
                                </FormControl>
                                <FormLabel className="font-normal">16:9 (Landscape)</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="9:16" />
                                </FormControl>
                                <FormLabel className="font-normal">9:16 (Portrait)</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                        control={form.control}
                        name="durationSeconds"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Duration: {field.value} seconds</FormLabel>
                                <FormControl>
                                    <Slider
                                        min={5}
                                        max={8}
                                        step={1}
                                        defaultValue={[field.value || 5]}
                                        onValueChange={(value) => field.onChange(value[0])}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                  </>
                )}

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Generate'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="flex items-center justify-center p-6 bg-secondary/50 border-dashed">
            <div className="w-full h-full aspect-video flex items-center justify-center rounded-lg bg-background/50">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p>Generating your {mediaType}... this might take a minute.</p>
                    </div>
                ) : resultUrl ? (
                    mediaType === 'image' ? (
                        <Image src={resultUrl} alt="Generated image" className="object-contain rounded-lg" width={512} height={512} data-ai-hint="ai generated" />
                    ) : (
                        <video src={resultUrl} controls autoPlay loop className="w-full h-full rounded-lg" data-ai-hint="ai generated" />
                    )
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        {mediaType === 'image' ? <ImageIconLucide className="h-12 w-12" /> : <Clapperboard className="h-12 w-12" />}
                        <p>Your generated media will appear here.</p>
                    </div>
                )}
            </div>
        </Card>
      </div>
    </main>
  );
}
