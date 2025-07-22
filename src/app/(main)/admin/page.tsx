
'use client';

import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/store/user-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { User, Feedback } from '@/lib/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type DisplayUser = Omit<User, 'pinHash' | 'apiKeyEncrypted'>;

export default function AdminPage() {
    const { user } = useUserStore();
    const router = useRouter();
    const [users, setUsers] = useState<DisplayUser[]>([]);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [usersResponse, feedbackResponse] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/admin/feedback')
            ]);

            if (usersResponse.ok) {
                const data = await usersResponse.json();
                setUsers(data);
            } else {
                toast({ title: 'Error', description: 'Failed to fetch users.', variant: 'destructive' });
            }
            
            if (feedbackResponse.ok) {
                const data = await feedbackResponse.json();
                setFeedback(data);
            } else {
                 toast({ title: 'Error', description: 'Failed to fetch feedback.', variant: 'destructive' });
            }

        } catch (error) {
            toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchAllData();
        } else if (user) {
            router.push('/chat');
        }
    }, [user, router, toast]);
    
    if (!user || user.role !== 'admin') {
        return (
            <main className="p-4 sm:p-6 flex-1">
                <div className="max-w-3xl mx-auto text-center">
                    <p>Access Denied. Redirecting...</p>
                </div>
            </main>
        );
    }
    
    const handleUpdateUser = async (userId: number, data: Partial<DisplayUser>) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                toast({ title: 'Success', description: 'User updated successfully.' });
                fetchAllData(); // Refresh all data
            } else {
                 const errorData = await response.json();
                 toast({ title: 'Error', description: errorData.message || 'Failed to update user.', variant: 'destructive' });
            }
        } catch (error) {
             toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
        }
    };
    
    const handleDeleteUser = async (userId: number) => {
         try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast({ title: 'Success', description: 'User deleted successfully.' });
                fetchAllData(); // Refresh all data
            } else {
                const errorData = await response.json();
                toast({ title: 'Error', description: errorData.message || 'Failed to delete user.', variant: 'destructive' });
            }
        } catch (error) {
             toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
        }
    }


  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="max-w-7xl mx-auto space-y-6">
       <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="feedback">User Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
            <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Approve, manage roles for, and remove users.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <p>Loading users...</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell>{u.username}</TableCell>
                                    <TableCell>
                                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{u.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                         <Badge
                                            variant="outline"
                                            className={cn("capitalize", {
                                                'bg-green-700/50 text-green-400 border-green-400/50': u.status === 'approved',
                                                'bg-yellow-700/50 text-yellow-400 border-yellow-400/50': u.status === 'pending',
                                            })}
                                            >
                                            {u.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {u.id !== user.userId && (
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {u.status === 'pending' && (
                                                        <DropdownMenuItem onClick={() => handleUpdateUser(u.id, { status: 'approved' })}>
                                                            Approve Registration
                                                        </DropdownMenuItem>
                                                    )}
                                                    {u.role !== 'admin' && (
                                                        <DropdownMenuItem onClick={() => handleUpdateUser(u.id, { role: 'admin' })}>
                                                            Make Admin
                                                        </DropdownMenuItem>
                                                    )}
                                                    {u.role === 'admin' && (
                                                        <DropdownMenuItem onClick={() => handleUpdateUser(u.id, { role: 'user' })}>
                                                            Make User
                                                        </DropdownMenuItem>
                                                    )}
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem className="text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the user account for {u.username}.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteUser(u.id)} className="bg-destructive hover:bg-destructive/90">
                                                    Delete
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="feedback">
             <Card>
                <CardHeader>
                    <CardTitle>User Feedback</CardTitle>
                    <CardDescription>Review feedback and suggestions submitted by users.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p>Loading feedback...</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[150px]">From</TableHead>
                                    <TableHead className="w-[180px]">Date</TableHead>
                                    <TableHead>Feedback</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {feedback.map((f) => (
                                    <TableRow key={f.id}>
                                        <TableCell className="font-medium">{f.username}</TableCell>
                                        <TableCell>{format(new Date(f.createdAt), "PPP p")}</TableCell>
                                        <TableCell className="whitespace-pre-wrap">{f.feedback}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
       </Tabs>
      </div>
    </main>
  );
}

    