'use client';

import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/store/user-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/auth';
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

type DisplayUser = Omit<User, 'pinHash' | 'apiKeyEncrypted'>;

export default function AdminPage() {
    const { user } = useUserStore();
    const router = useRouter();
    const [users, setUsers] = useState<DisplayUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                toast({ title: 'Error', description: 'Failed to fetch users.', variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchUsers();
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
                fetchUsers(); // Refresh the user list
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
                fetchUsers(); // Refresh the user list
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
      <div className="max-w-5xl mx-auto space-y-6">
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
                                    <Badge variant={u.status === 'approved' ? 'secondary' : 'destructive'} className="capitalize bg-green-700">{u.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                     {u.username !== 'Joshua' && (
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
                                                {u.role === 'admin' && u.username !== 'Joshua' && (
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
      </div>
    </main>
  );
}
