
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, CheckCircle } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const safetyCategories = [
    { id: 'HARM_CATEGORY_HATE_SPEECH', name: 'Hate Speech' },
    { id: 'HARM_CATEGORY_DANGEROUS_CONTENT', name: 'Dangerous Content' },
    { id: 'HARM_CATEGORY_HARASSMENT', name: 'Harassment' },
    { id: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', name: 'Sexually Explicit' },
    { id: 'HARM_CATEGORY_CIVIC_INTEGRITY', name: 'Civic Integrity' },
];

const blockThresholds = [
    { id: 'BLOCK_NONE', name: 'Block None' },
    { id: 'BLOCK_ONLY_HIGH', name: 'Block Only High' },
    { id: 'BLOCK_MEDIUM_AND_ABOVE', name: 'Block Medium & Above' },
    { id: 'BLOCK_LOW_AND_ABOVE', name: 'Block Low & Above' },
];

const textModels = [
    { id: 'googleai/gemini-2.5-pro', name: 'Gemini 2.5 Pro (Recommended)' },
    { id: 'googleai/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
];

const imageModels = [
    { id: 'googleai/gemini-2.0-flash-preview-image-generation', name: 'Gemini 2.0 Flash Image Generation' },
];


export default function ApplicationSettingsPage() {
  const {
    apiKey,
    nsfwMode,
    enableNsfwMode,
    disableNsfwMode,
    notifications,
    toggleNotifications,
    saveApiKey,
    setHasSeenWelcomeScreen,
    textModel,
    setTextModel,
    imageModel,
    setImageModel,
    safetySettings,
    setSafetySetting,
  } = useSettingsStore();

  const [isLoading, setIsLoading] = useState(false);
  const [localApiKey, setLocalApiKey] = useState('');
  const [isNsfwDialogOpen, setIsNsfwDialogOpen] = useState(false);
  const [nsfwAccessCode, setNsfwAccessCode] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState<'loading' | 'exists' | 'missing'>('loading');
  const { toast } = useToast();

  useEffect(() => {
    async function checkApiKeyStatus() {
        try {
            const response = await fetch('/api/user/key/status');
            if (response.ok) {
                const { keyExists } = await response.json();
                setApiKeyStatus(keyExists ? 'exists' : 'missing');
            } else {
                setApiKeyStatus('missing');
            }
        } catch (error) {
            setApiKeyStatus('missing');
        }
    }
    checkApiKeyStatus();
  }, []);
  
  useEffect(() => {
      setLocalApiKey(apiKey);
  }, [apiKey]);


  const handleSaveApiKey = async () => {
    if (!localApiKey) {
        toast({ title: 'Error', description: 'API Key cannot be empty.', variant: 'destructive' });
        return;
    }
    setIsLoading(true);
    try {
        await saveApiKey(localApiKey);
        toast({ title: 'Success', description: 'API Key saved successfully.' });
        setApiKeyStatus('exists');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  const handleNsfwToggle = (checked: boolean) => {
    if (checked) {
      // open dialog to ask for code
      setIsNsfwDialogOpen(true);
    } else {
      // disable without code
      disableNsfwMode();
      toast({ title: 'NSFW Mode Disabled' });
    }
  };

  const handleNsfwAccessCodeSubmit = () => {
    if (nsfwAccessCode === '2002') {
      enableNsfwMode();
      toast({ title: 'Success', description: 'NSFW Mode Enabled.' });
      setIsNsfwDialogOpen(false);
      setNsfwAccessCode('');
    } else {
      toast({ title: 'Error', description: 'Incorrect access code.', variant: 'destructive' });
    }
  };


  const handleShowWelcome = () => {
      setHasSeenWelcomeScreen(false);
      toast({ title: 'Welcome Screen Enabled', description: 'The welcome screen will be shown the next time you visit the chat page.'});
  }

  return (
    <>
    <Card>
        <CardHeader>
        <CardTitle>Application Settings</CardTitle>
        <CardDescription>Manage your preferences for AlphaLink.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

        <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Customize the look and feel of the application.
              </p>
            </div>
            <ModeToggle />
          </div>


        <div className="flex flex-col gap-4 rounded-lg border p-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Label htmlFor="api-key" className="font-semibold">
                        Gemini API Key
                    </Label>
                    {apiKeyStatus === 'exists' && (
                        <div className="flex items-center gap-1 text-xs text-green-500">
                            <CheckCircle className="h-3 w-3" />
                            <span>Key on file</span>
                        </div>
                    )}
                     {apiKeyStatus === 'loading' && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    Your API key is stored securely and is only used to interact with the Gemini API.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Input 
                id="api-key" 
                type="password"
                placeholder="Enter your Gemini API Key"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                />
                <Button asChild variant="outline">
                <Link href="https://aistudio.google.com/app/apikey" target="_blank">Get API Key</Link>
                </Button>
                <Button onClick={handleSaveApiKey} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
            </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
            <Label htmlFor="nsfw-mode" className="font-semibold">
                NSFW Mode
            </Label>
            <p className="text-sm text-muted-foreground">
                Enable adults-only, private communication mode.
            </p>
            </div>
            <Switch
            id="nsfw-mode"
            checked={nsfwMode}
            onCheckedChange={handleNsfwToggle}
            aria-label="Toggle NSFW mode"
            />
        </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
            <Label htmlFor="notifications" className="font-semibold">
                Push Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
                Receive notifications for important updates.
            </p>
            </div>
            <Switch
            id="notifications"
            checked={notifications}
            onCheckedChange={toggleNotifications}
            aria-label="Toggle push notifications"
            />
        </div>

        
        <Separator />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4 gap-4">
            <div>
            <p className="font-medium">Show Welcome Screen</p>
            <p className="text-sm text-muted-foreground">
                Display the initial welcome guide on your next visit.
            </p>
            </div>
            <Button variant="outline" onClick={handleShowWelcome}>Show Again</Button>
        </div>
        </CardContent>
    </Card>

    {nsfwMode && (
      <div className="mt-6">
        <div className="mb-4">
            <h2 className="text-xl font-headline flex items-center gap-2"><ShieldCheck />NSFW Mode: Advanced Configuration</h2>
            <p className="text-muted-foreground">Manage AI generation models and safety overrides.</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>AI Model Configuration</CardTitle>
                <CardDescription>Select the models used for generation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="rounded-lg border p-4">
                    <Label htmlFor="text-model" className="font-semibold">Default Text Model</Label>
                    <p className="text-sm text-muted-foreground mb-2">The primary model for chat and text-based analysis.</p>
                    <Select value={textModel} onValueChange={setTextModel}>
                        <SelectTrigger id="text-model">
                            <SelectValue placeholder="Select a text model" />
                        </SelectTrigger>
                        <SelectContent>
                            {textModels.map(model => <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="rounded-lg border p-4">
                    <Label htmlFor="image-model" className="font-semibold">Image Generation Model</Label>
                     <p className="text-sm text-muted-foreground mb-2">The model used for the Visual Media Generation page.</p>
                    <Select value={imageModel} onValueChange={setImageModel}>
                        <SelectTrigger id="image-model">
                            <SelectValue placeholder="Select an image model" />
                        </SelectTrigger>
                        <SelectContent>
                            {imageModels.map(model => <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

        <Card className="mt-6">
            <CardHeader>
                <CardTitle>AI Safety Settings</CardTitle>
                <CardDescription>Configure the content safety filters for the AI. Applies to text generation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {safetyCategories.map(category => (
                    <div key={category.id} className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <Label className="font-medium">{category.name}</Label>
                            <p className="text-sm text-muted-foreground">Set the blocking threshold for {category.name.toLowerCase()} content.</p>
                        </div>
                        <Select
                            value={safetySettings[category.id as keyof typeof safetySettings]}
                            onValueChange={(value) => setSafetySetting(category.id as keyof typeof safetySettings, value)}
                        >
                            <SelectTrigger className="w-full sm:w-[220px]">
                                <SelectValue placeholder="Select threshold" />
                            </SelectTrigger>
                            <SelectContent>
                                 {blockThresholds.map(threshold => <SelectItem key={threshold.id} value={threshold.id}>{threshold.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                ))}
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">Note: These settings provide control over the model's safety filters but do not override any underlying safety policies of the service.</p>
            </CardFooter>
        </Card>
      </div>
    )}

    <AlertDialog open={isNsfwDialogOpen} onOpenChange={setIsNsfwDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Enter Access Code</AlertDialogTitle>
            <AlertDialogDescription>
                To enable NSFW mode, please enter the 4-digit access code.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
            <Input
                id="nsfw-code"
                type="password"
                maxLength={4}
                placeholder="●●●●"
                value={nsfwAccessCode}
                onChange={(e) => setNsfwAccessCode(e.target.value)}
                className="text-center text-lg tracking-[0.5em]"
            />
            </div>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleNsfwAccessCodeSubmit}>
                Submit
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
