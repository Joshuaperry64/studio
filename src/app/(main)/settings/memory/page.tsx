
'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/store/user-store';
import { useSettingsStore, MemorySettings } from '@/store/settings-store';
import { AlertCircle, CheckCircle, Loader2, Save, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  enabled: z.boolean(),
  host: z.string().min(1, 'Host is required.'),
  shareName: z.string().min(1, 'Share Name is required.'),
  username: z.string().min(1, 'Username is required.'),
  password: z.string(),
});

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

export default function MemorySettingsPage() {
  const { user } = useUserStore();
  const { memorySettings, saveMemorySettings } = useSettingsStore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [diagnostics, setDiagnostics] = useState('');

  const form = useForm<MemorySettings>({
    resolver: zodResolver(formSchema),
    defaultValues: memorySettings,
  });

  const onSubmit = async (data: MemorySettings) => {
    setIsSaving(true);
    try {
      await saveMemorySettings(data);
      toast({ title: 'Success', description: 'Memory settings saved successfully.' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setDiagnostics('');
    try {
        const response = await fetch('/api/settings/memory/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form.getValues()),
        });
        const result = await response.json();
        if (response.ok) {
            setConnectionStatus('success');
            setDiagnostics(result.message);
            toast({ title: 'Connection Successful', description: result.message });
        } else {
            setConnectionStatus('error');
            setDiagnostics(result.message);
            toast({ title: 'Connection Failed', description: result.message, variant: 'destructive' });
        }
    } catch (error) {
        setConnectionStatus('error');
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        setDiagnostics(errorMessage);
        toast({ title: 'Connection Error', description: errorMessage, variant: 'destructive' });
    }
  }


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
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Persistent Memory</CardTitle>
          <CardDescription>
            Configure the connection to the external SQLite database for the AI's memory.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="enabled-switch" className="font-semibold">
                Enable Persistent Memory
              </Label>
              <p className="text-sm text-muted-foreground">
                Applies to all users and AI profiles.
              </p>
            </div>
            <Controller
              name="enabled"
              control={form.control}
              render={({ field }) => (
                 <Switch
                    id="enabled-switch"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Toggle persistent memory"
                />
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="host">Host / IP Address</Label>
              <Input id="host" {...form.register('host')} placeholder="e.g., 192.168.1.1" />
              {form.formState.errors.host && <p className="text-sm text-destructive">{form.formState.errors.host.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shareName">Samba Share Name</Label>
              <Input id="shareName" {...form.register('shareName')} placeholder="e.g., ai_memory" />
               {form.formState.errors.shareName && <p className="text-sm text-destructive">{form.formState.errors.shareName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...form.register('username')} placeholder="e.g., aiuser" />
               {form.formState.errors.username && <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register('password')} />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Connection Diagnostics</h3>
            <div className="flex flex-col items-start gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', {
                        'bg-muted': connectionStatus === 'idle',
                        'bg-blue-500/20 text-blue-500': connectionStatus === 'testing',
                        'bg-green-500/20 text-green-500': connectionStatus === 'success',
                        'bg-red-500/20 text-red-500': connectionStatus === 'error',
                    })}>
                        {connectionStatus === 'testing' ? <Loader2 className="h-5 w-5 animate-spin" /> :
                         connectionStatus === 'success' ? <Wifi className="h-5 w-5" /> :
                         connectionStatus === 'error' ? <WifiOff className="h-5 w-5" /> :
                         <Wifi className="h-5 w-5 text-muted-foreground" />
                        }
                    </div>
                    <div>
                        <p className="font-semibold capitalize">
                            {connectionStatus === 'idle' ? 'Not Tested' :
                             connectionStatus === 'testing' ? 'Testing...' :
                             connectionStatus === 'success' ? 'Connected' :
                             'Connection Failed'
                            }
                        </p>
                         <p className="text-sm text-muted-foreground">
                            {connectionStatus === 'idle' ? 'Click "Test Connection" to check status.' :
                             connectionStatus === 'testing' ? 'Attempting to reach the host...' :
                             diagnostics || 'Successfully connected to the database share.'
                            }
                        </p>
                    </div>
                </div>
                <Button type="button" variant="outline" onClick={handleTestConnection} disabled={connectionStatus === 'testing'}>
                    {connectionStatus === 'testing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Test Connection
                </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSaving} className="ml-auto">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
