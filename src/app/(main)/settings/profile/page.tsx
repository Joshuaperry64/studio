
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, LogOut, Save, Trash2 } from 'lucide-react';
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

export default function ProfileSettingsPage() {
    const { user, login, logout } = useUserStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const router = useRouter();

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

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            if (!avatarFile) {
                toast({ title: 'No changes to save.', variant: 'default' });
                return;
            }

            const avatarDataUri = await fileToDataUri(avatarFile);
            
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatarDataUri }),
            });

            const data = await response.json();

            if (response.ok) {
                login(data.token);
                toast({ title: 'Success', description: 'Profile updated successfully.' });
                setAvatarFile(null); // Reset file state
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


    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="relative">
                            <Avatar className="h-32 w-32">
                                <AvatarImage src={avatarPreview || undefined} alt={user.username} />
                                <AvatarFallback className="text-4xl">
                                    {user.username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <Button 
                                size="icon" 
                                className="absolute bottom-1 right-1 rounded-full"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera className="h-5 w-5"/>
                            </Button>
                            <Input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/png, image/jpeg, image/gif"
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{user.username}</p>
                            <p className="text-sm text-muted-foreground capitalize">{user.username === 'Joshua' ? 'Creator' : user.role}</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleSaveProfile} disabled={isLoading || !avatarFile}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>

             <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4 gap-4">
                        <div>
                            <p className="font-medium">Export Your Data</p>
                            <p className="text-sm text-muted-foreground">
                                Download a copy of all your conversations. (Not yet implemented)
                            </p>
                        </div>
                        <Button variant="outline" disabled>Export Data</Button>
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
                                <Button variant="destructive" disabled={isDeleting}>
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
