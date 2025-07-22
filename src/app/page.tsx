'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      router.push('/chat');
    }, 1000);
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute inset-0 z-0 h-full w-full bg-[radial-gradient(circle_500px_at_50%_200px,hsl(var(--primary)/0.15),transparent)]"></div>
      
      <Card className="w-full max-w-sm border-primary/20 shadow-xl shadow-primary/10">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              AlphaLink
            </CardTitle>
            <CardDescription className="text-center">Enter your credentials to begin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" placeholder="your_username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input id="pin" type="password" placeholder="••••" required minLength={4} maxLength={6} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Don't have an account? <Link href="#" className="text-primary hover:underline">Contact support</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
