
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { MessageSquare, Image as ImageIcon, Users, Settings, Bot, Shield, Smile, BookOpen, MessageSquarePlus, UserCog, LogOut, Map, Loader2, Wand2, Fingerprint, Code, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useUserStore } from '@/store/user-store';
import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ProfileSettingsPage from './settings/profile/page';
import { useToast } from '@/hooks/use-toast';


export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isInitialized, initialize, logout } = useUserStore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs once on mount to initialize the user state from cookies.
    if (!isInitialized) {
        initialize();
    }
  }, [initialize, isInitialized]);

   useEffect(() => {
    // This effect redirects to login if initialization is complete and there's still no user.
    if (isInitialized && !user) {
        router.push('/login');
    }
  }, [isInitialized, user, router]);


  const handleLogout = async () => {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        logout(); // Clear user from zustand store
        toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
        router.push('/login');
    } catch(error) {
        toast({ title: 'Error', description: 'Failed to log out.', variant: 'destructive' });
    }
  }

  const menuItems = [
    { href: '/chat', label: 'AI Chat', icon: MessageSquare },
    { href: '/character-hub', label: 'Character Hub', icon: Smile },
    { href: '/media-generation', label: 'Visual Media', icon: ImageIcon },
    { href: '/co-pilot', label: 'AI Co-Pilot', icon: Wand2 },
    { href: '/lobby', label: 'Collaboration', icon: Users },
    { href: '/voice-biometrics', label: 'Voice Biometrics', icon: Fingerprint },
    { href: '/code-synthesis', label: 'Code Synthesis', icon: Code },
    { href: '/roadmap', label: 'Roadmap', icon: Map },
  ];

  const bottomMenuItems = [
      { href: '/feedback', label: 'Feedback', icon: MessageSquarePlus },
      { href: '/instructions', label: 'Instructions', icon: BookOpen },
      { href: '/settings', label: 'Application', icon: Settings, subpath: '/settings/application' },
  ];

  const adminMenuItems = [
    { href: '/admin', label: 'Admin Panel', icon: Shield },
    { href: '/local-deployment', label: 'Local Deployment', icon: Server },
  ]

  if (!isInitialized || !user) {
    // Render a full-page loading indicator while the user state is being initialized
    // or if the user is not yet available (which can happen briefly during redirects).
    return (
        <div className="flex items-center justify-center h-screen w-full bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-primary/10 text-primary">
              <Bot className="h-5 w-5" />
            </Button>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <h2 className="font-headline text-lg tracking-tight">AlphaLink</h2>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label }}
                  className="justify-start"
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {user?.username === 'Joshua' && adminMenuItems.map((item) => (
               <SidebarMenuItem key={item.label}>
               <SidebarMenuButton
                 asChild
                 isActive={pathname === item.href}
                 tooltip={{ children: item.label }}
                 className="justify-start"
               >
                 <Link href={item.href}>
                   <item.icon className="h-5 w-5" />
                   <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                 </Link>
               </SidebarMenuButton>
             </SidebarMenuItem>
            ))}
             {user?.role === 'admin' && user?.username !== 'Joshua' && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/admin'}
                  tooltip={{ children: 'Admin Panel' }}
                  className="justify-start"
                >
                  <Link href={'/admin'}>
                    <Shield className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">Admin Panel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <Separator className="my-2" />
          <SidebarContent>
              <SidebarMenu>
                 {bottomMenuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.href)}
                        tooltip={{ children: item.label }}
                        className="justify-start"
                        >
                        <Link href={item.subpath || item.href}>
                            <item.icon className="h-5 w-5" />
                            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    ))}
              </SidebarMenu>
          </SidebarContent>
        <SidebarFooter>
          <Dialog>
             <DialogTrigger asChild>
                <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent w-full text-left">
                     <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.avatar} alt={user?.username} />
                        <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-medium">{user?.username}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {user?.username === 'Joshua' ? 'Creator' : user?.role}
                        </span>
                    </div>
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Profile Settings</DialogTitle>
                </DialogHeader>
                <ProfileSettingsPage />
                <Button variant="outline" className="mt-4 w-full" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </DialogContent>
           </Dialog>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="tech-background">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-lg font-semibold md:text-xl font-headline">
              {[...menuItems, ...adminMenuItems, ...bottomMenuItems].find((item) => pathname.startsWith(item.href))?.label || 'AlphaLink'}
            </h1>
          </header>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
