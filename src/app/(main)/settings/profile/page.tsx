
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, Save, Trash2, Download, Wand2, RefreshCw } from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fileToDataUri } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chat-store';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { generateAvatar } from '@/ai/flows/generate-avatar';

const profileFormSchema = z.object({
    username: z.string().min(3, 'Operator name must be at least 3 characters.'),
    pin: z.string().optional(),
    confirmPin: z.string().optional(),
}).refine(data => data.pin === data.confirmPin, {
    message: 'PINs do not match.',
    path: ['confirmPin'],
});

export default function ProfileSettingsPage() {
    const { user, login, logout } = useUserStore();
    const { messages: chatMessages } = useChatStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
    const [avatarPrompt, setAvatarPrompt] = useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            username: user?.username || '',
            pin: '',
            confirmPin: '',
        },
    });
    
    useEffect(() => {
        if (user) {
            form.reset({ username: user.username });
            setAvatarPreview(user.avatar || null);
        }
    }, [user, form]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
             if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({ title: 'Error', description: 'Image size cannot exceed 2MB.', variant: 'destructive' });
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };
    
    const handleGenerateAvatar = async () => {
        if (!avatarPrompt) {
            toast({ title: 'Prompt is empty', description: 'Please describe the avatar you want to generate.', variant: 'destructive' });
            return;
        }
        setIsGeneratingAvatar(true);
        try {
            const result = await generateAvatar({ prompt: avatarPrompt });
            setAvatarPreview(result.avatarDataUri);
            
            // Convert data URI to Blob/File to be saved
            const response = await fetch(result.avatarDataUri);
            const blob = await response.blob();
            const file = new File([blob], "ai_avatar.png", { type: "image/png" });
            setAvatarFile(file);

            toast({ title: 'Avatar Generated!', description: 'Click "Save Changes" to apply your new avatar.' });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
            toast({ title: 'Avatar Generation Failed', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsGeneratingAvatar(false);
        }
    };

    const handleSaveProfile = async (values: z.infer<typeof profileFormSchema>) => {
        setIsLoading(true);
        try {
            let avatarDataUri: string | undefined = undefined;
            if (avatarFile) {
                 avatarDataUri = await fileToDataUri(avatarFile);
            }
            
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    avatarDataUri,
                    username: values.username,
                    pin: values.pin,
                 }),
            });

            const data = await response.json();

            if (response.ok) {
                login(data.token);
                toast({ title: 'Success', description: 'Profile updated successfully.' });
                setAvatarFile(null);
                form.reset({ ...values, pin: '', confirmPin: '' });
            } else {
                 toast({ title: 'Error', description: data.message || 'Failed to update profile.', variant: 'destructive' });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
            toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch('/api/user/delete', {
                method: 'DELETE',
            });
            const data = await response.json();
            if(response.ok) {
                logout();
                toast({ title: 'Account Deleted', description: 'Your account has been permanently deleted.' });
                router.push('/login');
            } else {
                toast({ title: 'Error', description: data.message || 'Failed to delete account.', variant: 'destructive' });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
            toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsDeleting(false);
        }
    }
    
    const handleExportData = () => {
        try {
            const soloChatMessages = chatMessages.filter(msg => msg.sender);
            if (soloChatMessages.length === 0) {
                 toast({ title: 'No Data to Export', description: 'Your solo chat history is empty.' });
                 return;
            }
            const dataStr = JSON.stringify(soloChatMessages, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `alphalink_chat_history_${user?.username}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast({ title: 'Success', description: 'Your solo chat history has been downloaded.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to export your data.', variant: 'destructive' });
        }
    };


    if (!user) {
        return <p>Loading...</p>;
    }

    const isCreator = user.username === 'Joshua';

    return (
        <div className="space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSaveProfile)}>
                    <Card>
                         <CardHeader>
                            <CardTitle>Edit Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="relative">
                                    <Avatar className="h-32 w-32">
                                        <AvatarImage src={avatarPreview || undefined} alt={form.watch('username')} />
                                        <AvatarFallback className="text-4xl">
                                            {form.watch('username')?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute bottom-1 right-1 flex gap-1">
                                         <Button 
                                            type="button"
                                            size="icon" 
                                            className="h-8 w-8 rounded-full"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Camera className="h-4 w-4"/>
                                        </Button>
                                         <Popover>
                                            <PopoverTrigger asChild>
                                                <Button type="button" size="icon" className="h-8 w-8 rounded-full bg-purple-600 hover:bg-purple-700">
                                                    <Wand2 className="h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80">
                                                <div className="grid gap-4">
                                                <div className="space-y-2">
                                                    <h4 className="font-medium leading-none">Generate AI Avatar</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                    Describe the avatar you want.
                                                    </p>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Textarea
                                                        placeholder="e.g., a cyberpunk samurai with a neon katana"
                                                        value={avatarPrompt}
                                                        onChange={(e) => setAvatarPrompt(e.target.value)}
                                                        rows={3}
                                                    />
                                                    <Button onClick={handleGenerateAvatar} disabled={isGeneratingAvatar}>
                                                        {isGeneratingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                                        Generate
                                                    </Button>
                                                </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <Input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/png, image/jpeg, image/gif"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                            </div>
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Operator Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your operator name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="pin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New PIN</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="4-6 digits" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm New PIN</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Confirm PIN" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                             </div>
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button type="submit" disabled={isLoading || !form.formState.isDirty && !avatarFile}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>

             <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4 gap-4">
                        <div>
                            <p className="font-medium">Export Your Data</p>
                            <p className="text-sm text-muted-foreground">
                                Download a copy of all your solo chat conversations.
                            </p>
                        </div>
                        <Button variant="outline" onClick={handleExportData} disabled={chatMessages.filter(m => m.sender).length === 0}>
                            <Download className="mr-2 h-4 w-4" />
                            Export Data
                        </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border border-destructive/50 p-4 gap-4">
                        <div>
                            <p className="font-medium text-destructive">Delete Account</p>
                            <p className="text-sm text-muted-foreground">
                                Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isDeleting || user.role === 'admin'}>
                                     {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    Delete My Account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your account
                                        and remove your data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                    onClick={handleDeleteAccount}
                                    className="bg-destructive hover:bg-destructive/90"
                                    >
                                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Yes, delete my account
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
