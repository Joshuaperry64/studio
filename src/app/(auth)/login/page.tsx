
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { jwtDecode } from 'jwt-decode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPin, setRegisterPin] = useState('');
  const [registerPinConfirm, setRegisterPinConfirm] = useState('');
  const [allUsernames, setAllUsernames] = useState<string[]>([]);
  const { login } = useUserStore();

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchUsernames() {
      try {
        const response = await fetch('/api/users');
        if(response.ok) {
          const data = await response.json();
          setAllUsernames(data);
        } else {
          toast({ title: 'Error', description: 'Could not load user list.', variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Could not connect to server to get user list.', variant: 'destructive' });
      }
    }

    const rememberedUser = localStorage.getItem('rememberedUsername');
    if (rememberedUser) {
        setLoginUsername(rememberedUser);
        setRememberMe(true);
    }

    fetchUsernames();
  }, [toast]);

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
        if (rememberMe) {
            localStorage.setItem('rememberedUsername', loginUsername);
        } else {
            localStorage.removeItem('rememberedUsername');
        }
        toast({ title: 'Login Successful', description: "Welcome back!", duration: 3000 });
        login(data.token);
        router.push('/chat');
      } else {
        toast({ title: 'Login Failed', description: data.message || 'An error occurred.', variant: 'destructive' });
      }
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Could not connect to the server.';
       toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (registerPin !== registerPinConfirm) {
      toast({ title: 'Application Failed', description: 'PINs do not match.', variant: 'destructive' });
      return;
    }
     if (registerPin.length < 4 || registerPin.length > 6) {
      toast({ title: 'Application Failed', description: 'PIN must be between 4 and 6 digits.', variant: 'destructive' });
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
        toast({ title: 'Application Submitted', description: 'Your application is pending review.' });
        setActiveTab('login');
        setRegisterUsername('');
        setRegisterPin('');
        setRegisterPinConfirm('');
      } else {
         toast({ title: 'Application Failed', description: data.message || 'An error occurred.', variant: 'destructive' });
      }
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Could not connect to the server.';
       toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2 bg-transparent p-0">
        <TabsTrigger value="login" className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=inactive]:text-muted-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-none">Login</TabsTrigger>
        <TabsTrigger value="register" className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=inactive]:text-muted-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-none">Submit Application</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Card className="bg-card/80 backdrop-blur-sm">
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle className="text-2xl">Login to AlphaLink</CardTitle>
              <CardDescription>Enter your username and PIN to access your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">Username</Label>
                <Select value={loginUsername} onValueChange={setLoginUsername}>
                    <SelectTrigger id="login-username" className="bg-transparent border-0 border-b-2 rounded-none px-0 focus:ring-0 focus:ring-offset-0">
                        <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                        {allUsernames.map((name) => (
                            <SelectItem key={name} value={name}>
                                {name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-pin">PIN</Label>
                <Input id="login-pin" type="password" required placeholder="&#9679;&#9679;&#9679;&#9679;" value={loginPin} onChange={(e) => setLoginPin(e.target.value)} className="bg-transparent border-0 border-b-2 rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked: boolean) => setRememberMe(checked)} />
                <Label htmlFor="remember-me" className="text-sm font-normal text-muted-foreground">Remember Me</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading || !loginUsername}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                <span>Login</span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
      <TabsContent value="register">
        <Card className="bg-card/80 backdrop-blur-sm">
          <form onSubmit={handleRegister}>
            <CardHeader>
              <CardTitle className="text-2xl">Submit an Application</CardTitle>
              <CardDescription>Submit an application to gain access. Your application will be reviewed by an administrator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-username">Username</Label>
                <Input id="register-username" required value={registerUsername} onChange={(e) => setRegisterUsername(e.target.value)} className="bg-transparent border-0 border-b-2 rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-pin">PIN (4-6 digits)</Label>
                <Input id="register-pin" type="password" required minLength={4} maxLength={6} value={registerPin} onChange={(e) => setRegisterPin(e.target.value)} className="bg-transparent border-0 border-b-2 rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="register-pin-confirm">Confirm PIN</Label>
                <Input id="register-pin-confirm" type="password" required minLength={4} maxLength={6} value={registerPinConfirm} onChange={(e) => setRegisterPinConfirm(e.target.value)} className="bg-transparent border-0 border-b-2 rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                 {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                 <span>Submit Application</span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
