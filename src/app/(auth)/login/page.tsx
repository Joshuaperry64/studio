
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    // TODO: Implement actual login logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({ title: 'Login Successful', description: "Welcome back!" });
    router.push('/chat');
    setIsLoading(false);
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    // TODO: Implement actual registration logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({ title: 'Registration Successful', description: 'You can now log in.' });
    setActiveTab('login');
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <form onSubmit={handleLogin}>
              <CardHeader>
                <CardTitle className="text-2xl">Login to AlphaLink</CardTitle>
                <CardDescription>Enter your username and PIN to access your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input id="login-username" required placeholder="alphatester" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-pin">PIN</Label>
                  <Input id="login-pin" type="password" required placeholder="&#9679;&#9679;&#9679;&#9679;" />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                  <span>Login</span>
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="register">
          <Card>
            <form onSubmit={handleRegister}>
              <CardHeader>
                <CardTitle className="text-2xl">Create an Account</CardTitle>
                <CardDescription>Choose a username and a 4-6 digit PIN to get started.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Username</Label>
                  <Input id="register-username" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-pin">PIN</Label>
                  <Input id="register-pin" type="password" required minLength={4} maxLength={6} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="register-pin-confirm">Confirm PIN</Label>
                  <Input id="register-pin-confirm" type="password" required minLength={4} maxLength={6} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                   {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                   <span>Register</span>
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
