'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, Save } from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fileToDataUri } from '@/lib/utils';

export default function ProfileSettingsPage() {
    const { user, updateAvatar } = useUserStore();
    const [isLoading, setIsLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { toast } = useToast();

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
                updateAvatar(avatarDataUri);
                toast({ title: 'Success', description: 'Profile updated successfully.' });
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

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <main className="p-4 sm:p-6 flex-1">
            <div className="max-w-3xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Profile</CardTitle>
                        <CardDescription>Manage your public profile information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center gap-4">
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
                             <div className="text-center">
                                <p className="text-2xl font-bold">{user.username}</p>
                                <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                            </div>
                        </div>

                         <div className="flex justify-end pt-4">
                             <Button onClick={handleSaveProfile} disabled={isLoading || !avatarFile}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                             </Button>
                         </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-destructive">Account Management</CardTitle>
                        <CardDescription>Advanced account actions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4 gap-4">
                            <div>
                                <p className="font-medium">Export Your Data</p>
                                <p className="text-sm text-muted-foreground">
                                Download a copy of all your conversations.
                                </p>
                            </div>
                            <Button variant="outline">Export Data</Button>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border border-destructive/50 p-4 gap-4 mt-4">
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
