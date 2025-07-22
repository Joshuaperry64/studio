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
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPin, setRegisterPin] = useState('');
  const [registerPinConfirm, setRegisterPinConfirm] = useState('');

  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, pin: loginPin }),
      });
      
      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Login Successful', description: "Welcome back!" });
        router.push('/chat');
      } else {
        toast({ title: 'Login Failed', description: data.message || 'An error occurred.', variant: 'destructive' });
      }
    } catch (error) {
       toast({ title: 'Error', description: 'Could not connect to the server.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (registerPin !== registerPinConfirm) {
      toast({ title: 'Registration Failed', description: 'PINs do not match.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
       const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: registerUsername, pin: registerPin }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Registration Successful', description: 'You can now log in.' });
        setActiveTab('login');
      } else {
         toast({ title: 'Registration Failed', description: data.message || 'An error occurred.', variant: 'destructive' });
      }
    } catch (error) {
       toast({ title: 'Error', description: 'Could not connect to the server.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background hud-background">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md z-10">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card className="bg-background/80">
            <form onSubmit={handleLogin}>
              <CardHeader>
                <CardTitle className="text-2xl">Login to AlphaLink</CardTitle>
                <CardDescription>Enter your username and PIN to access your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input id="login-username" required placeholder="alphatester" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-pin">PIN</Label>
                  <Input id="login-pin" type="password" required placeholder="&#9679;&#9679;&#9679;&#9679;" value={loginPin} onChange={(e) => setLoginPin(e.target.value)} />
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
          <Card className="bg-background/80">
            <form onSubmit={handleRegister}>
              <CardHeader>
                <CardTitle className="text-2xl">Create an Account</CardTitle>
                <CardDescription>Choose a username and a 4-6 digit PIN to get started.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Username</Label>
                  <Input id="register-username" required value={registerUsername} onChange={(e) => setRegisterUsername(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-pin">PIN</Label>
                  <Input id="register-pin" type="password" required minLength={4} maxLength={6} value={registerPin} onChange={(e) => setRegisterPin(e.target.value)} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="register-pin-confirm">Confirm PIN</Label>
                  <Input id="register-pin-confirm" type="password" required minLength={4} maxLength={6} value={registerPinConfirm} onChange={(e) => setRegisterPinConfirm(e.target.value)} />
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
