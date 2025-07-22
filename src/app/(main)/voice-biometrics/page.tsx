
'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { voiceBiometrics } from '@/ai/flows/voice-biometrics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, FileAudio, Mic, Bot } from 'lucide-react';
import { fileToDataUri } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  audioFile: z.instanceof(File).refine(file => file.size > 0, 'An audio file is required.'),
});

export default function VoiceBiometricsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      audioFile: new File([], ''),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setTranscription(null);
    try {
      const audioDataUri = await fileToDataUri(values.audioFile);
      const result = await voiceBiometrics({ audioDataUri });
      setTranscription(result.transcription);
      toast({ title: 'Success', description: 'Audio transcribed successfully.' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ title: 'Error', description: 'File size cannot exceed 10MB.', variant: 'destructive' });
        return;
      }
      form.setValue('audioFile', file);
    }
  };

  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Voice Biometrics Analysis</CardTitle>
            <CardDescription>Upload an audio file to transcribe it and identify different speakers.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="audioFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audio File</FormLabel>
                      <FormControl>
                        <div className="flex items-center justify-center w-full">
                          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/80">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">WAV, MP3, OGG, or WEBM (MAX. 10MB)</p>
                            </div>
                            <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="audio/*" />
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('audioFile')?.name && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-secondary rounded-md">
                    <FileAudio className="h-4 w-4" />
                    <span>{form.watch('audioFile').name}</span>
                  </div>
                )}
                
                <Button type="submit" disabled={isLoading || !form.formState.isValid} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
                  Analyze Audio
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Transcription Result</CardTitle>
            <CardDescription>The transcribed text will appear here with speaker labels.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-6 bg-secondary/50 border-dashed rounded-b-lg">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p>Analyzing audio... this may take a moment.</p>
              </div>
            ) : transcription ? (
              <div className="w-full h-full text-sm whitespace-pre-wrap font-mono bg-background/50 p-4 rounded-lg overflow-auto">
                {transcription}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Bot className="mx-auto h-12 w-12" />
                <p className="mt-2">The analysis result will be shown here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
