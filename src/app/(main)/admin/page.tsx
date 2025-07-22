
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
import { MoreHorizontal, Trash2, Users, UserCheck, UserX, Server, CheckCircle, AlertCircle, Wifi, Loader2, Home } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settings-store';
import Link from 'next/link';

type DisplayUser = Omit<User, 'pinHash' | 'apiKeyEncrypted'>;

interface UserStats {
    total: number;
    approved: number;
    pending: number;
}
interface ActiveSession {
    id: string;
    name: string;
    createdBy: string;
}

export default function AdminPage() {
    const { user } = useUserStore();
    const router = useRouter();
    const { memorySettings } = useSettingsStore();

    // Data states
    const [users, setUsers] = useState<DisplayUser[]>([]);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

    // Loading and error states
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [usersResponse, feedbackResponse, statsResponse, sessionsResponse] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/admin/feedback'),
                fetch('/api/admin/stats/users'),
                fetch('/api/admin/stats/sessions'),
            ]);

            // Process all responses
            if (usersResponse.ok) setUsers(await usersResponse.json()); else toast({ title: 'Error', description: 'Failed to fetch users.', variant: 'destructive' });
            if (feedbackResponse.ok) setFeedback(await feedbackResponse.json()); else toast({ title: 'Error', description: 'Failed to fetch feedback.', variant: 'destructive' });
            if (statsResponse.ok) setUserStats(await statsResponse.json()); else toast({ title: 'Error', description: 'Failed to fetch user stats.', variant: 'destructive' });
            if (sessionsResponse.ok) setActiveSessions(await sessionsResponse.json()); else toast({ title: 'Error', description: 'Failed to fetch active sessions.', variant: 'destructive' });

        } catch (error) {
            toast({ title: 'Error', description: 'An unexpected error occurred while fetching data.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                fetchAllData();
            } else {
                router.push('/chat');
            }
        }
    }, [user, router]);
    
    if (!user) return <main className="p-4 sm:p-6 flex-1"><div className="max-w-3xl mx-auto text-center"><p>Loading...</p></div></main>;
    if (user.role !== 'admin') return <main className="p-4 sm:p-6 flex-1"><div className="max-w-3xl mx-auto text-center"><p>Access Denied. Redirecting...</p></div></main>;
    
    const handleUpdateUser = async (userId: string, data: Partial<DisplayUser>) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                toast({ title: 'Success', description: 'User updated successfully.' });
                fetchAllData();
            } else {
                 const errorData = await response.json();
                 toast({ title: 'Error', description: errorData.message || 'Failed to update user.', variant: 'destructive' });
            }
        } catch (error) {
             toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
        }
    };
    
    const handleDeleteUser = async (userId: string) => {
         try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast({ title: 'Success', description: 'User deleted successfully.' });
                fetchAllData();
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
       <Tabs defaultValue="dashboard">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="feedback">User Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading || !userStats ? <Loader2 className="h-6 w-6 animate-spin" /> : userStats.total}</div>
                         <div className="flex space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center"><UserCheck className="h-3 w-3 mr-1 text-green-500"/> Approved: {isLoading || !userStats ? '-' : userStats.approved}</div>
                            <div className="flex items-center"><UserX className="h-3 w-3 mr-1 text-yellow-500"/> Pending: {isLoading || !userStats ? '-' : userStats.pending}</div>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Status</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-2 pt-2">
                       <div className="flex items-center text-sm">
                           <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                           <span>Firebase Services: <span className="font-semibold">Operational</span></span>
                       </div>
                       <div className="flex items-center text-sm">
                           {memorySettings.enabled ? <Wifi className="h-4 w-4 mr-2 text-green-500" /> : <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />}
                           <span>Persistent Memory: <span className="font-semibold">{memorySettings.enabled ? 'Enabled' : 'Disabled'}</span></span>
                       </div>
                        <div className="flex items-center text-sm">
                           <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                           <span>Google Home: <span className="font-semibold">Not Connected</span></span>
                       </div>
                       <div className="flex items-center text-sm">
                           <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                           <span>Amazon Alexa: <span className="font-semibold">Not Connected</span></span>
                       </div>
                    </CardContent>
                </Card>
            </div>
            <Card className="mt-6">
                 <CardHeader>
                    <CardTitle>Active Co-Pilot Sessions</CardTitle>
                    <CardDescription>Real-time list of ongoing collaborative sessions.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? <p>Loading sessions...</p> : 
                    activeSessions.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Session Name</TableHead>
                                <TableHead>Created By</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {activeSessions.map((session) => (
                                <TableRow key={session.id}>
                                    <TableCell className="font-medium">{session.name}</TableCell>
                                    <TableCell>{session.createdBy}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/co-pilot/${session.id}`}>View</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    ) : (
                         <p className="text-sm text-muted-foreground text-center py-4">No active Co-Pilot sessions.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
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
                                                        <DropdownMenuItem onClick={() => handleUpdateUser(u.id!, { status: 'approved' })}>
                                                            Approve Registration
                                                        </DropdownMenuItem>
                                                    )}
                                                    {u.role !== 'admin' && (
                                                        <DropdownMenuItem onClick={() => handleUpdateUser(u.id!, { role: 'admin' })}>
                                                            Make Admin
                                                        </DropdownMenuItem>
                                                    )}
                                                    {u.role === 'admin' && (
                                                        <DropdownMenuItem onClick={() => handleUpdateUser(u.id!, { role: 'user' })}>
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
                                                <AlertDialogAction onClick={() => handleDeleteUser(u.id!)} className="bg-destructive hover:bg-destructive/90">
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
