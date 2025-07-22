'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [isNsfwMode, setIsNsfwMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveApiKey = async () => {
    if (!apiKey) {
        toast({ title: 'Error', description: 'API Key cannot be empty.', variant: 'destructive' });
        return;
    }
    setIsLoading(true);
    try {
        const response = await fetch('/api/user/key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey }),
        });

        const data = await response.json();

        if (response.ok) {
            toast({ title: 'Success', description: 'API Key saved successfully.' });
        } else {
            toast({ title: 'Error', description: data.message || 'Failed to save API Key.', variant: 'destructive' });
        }
    } catch (error) {
        toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>Manage your preferences for AlphaLink.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 rounded-lg border p-4">
               <div>
                <Label htmlFor="api-key" className="font-semibold">
                  Gemini API Key
                </Label>
                <p className="text-sm text-muted-foreground">
                  Your API key is stored securely and is only used to interact with the Gemini API.
                </p>
              </div>
              <div className="flex items-center gap-2">
                 <Input 
                    id="api-key" 
                    type="password"
                    placeholder="Enter your Gemini API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    />
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
                checked={isNsfwMode}
                onCheckedChange={setIsNsfwMode}
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
                onCheckedChange={setNotifications}
                aria-label="Toggle push notifications"
              />
            </div>
            
            <Separator />

            <div>
                <h3 className="text-lg font-medium">Account</h3>
                <p className="text-sm text-muted-foreground">Manage your account and data.</p>
            </div>
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4 gap-4">
              <div>
                <p className="font-medium">Export Your Data</p>
                <p className="text-sm text-muted-foreground">
                  Download a copy of all your conversations.
                </p>
              </div>
              <Button variant="outline">Export Data</Button>
            </div>
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border border-destructive/50 p-4 gap-4">
              <div>
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button variant="destructive">Delete My Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

    