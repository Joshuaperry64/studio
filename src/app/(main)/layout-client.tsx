
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
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { MessageSquare, ImageIcon, Users, Settings, Bot, Shield, Smile, BookOpen, MessageSquarePlus, LogOut, Map, Loader2, Wand2, Fingerprint, Code, Server, PanelLeft, Database, BarChart, BrainCircuit, HardDrive, Group, Globe, GanttChartSquare, FolderKanban, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserStore } from '@/store/user-store';
import { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ProfileSettingsPage from './settings/profile/page';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useSettingsStore } from '@/store/settings-store';
import {
    mainframeItems, fabricationItems, collaborationItems,
    systemItems, adminMenuItems, useActivePageTitle
} from '@/lib/menu-items';


function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  return <div className="font-mono text-lg">{format(time, 'hh:mm:ss a')}</div>;
}

function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { soundEnabled } = useSettingsStore();
  const [audioExists, setAudioExists] = useState(false);

  useEffect(() => {
    // Check if the background audio file exists only once
    fetch('/api/admin/background-audio/status')
      .then(res => res.json())
      .then(data => setAudioExists(data.exists))
      .catch(() => setAudioExists(false));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (soundEnabled && audioExists && !audio.src.endsWith('/audio/background_music.mp3')) {
        audio.src = '/audio/background_music.mp3';
        audio.play().catch(e => console.error("Audio playback failed:", e));
      } else if (!soundEnabled || !audioExists) {
        audio.pause();
        audio.currentTime = 0;
        if (audio.src) audio.src = '';
      }
    }
  }, [soundEnabled, audioExists]);
  

  return (
    <audio ref={audioRef} loop />
  );
}


export default function MainLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isInitialized } = useUserStore();
  const { toast } = useToast();
  const router = useRouter();
  const activePageTitle = useActivePageTitle();

   useEffect(() => {
    if (isInitialized && !user) {
        router.push('/login');
    }
  }, [isInitialized, user, router]);

  const handleLogout = async () => {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        useUserStore.getState().logout();
        toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
        router.push('/login');
    } catch(error) {
        toast({ title: 'Error', description: 'Failed to log out.', variant: 'destructive' });
    }
  }


  if (!isInitialized || !user) {
    return (
        <div className="flex items-center justify-center h-screen w-full bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }
  
  const getRoleDisplayName = () => {
      if (user?.username === 'Joshua') return 'Master Operator';
      if (user?.role === 'admin') return 'Licensed Operator';
      return 'Operator';
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-primary/10 text-primary flex-shrink-0">
                    <Bot className="h-5 w-5" />
                </Button>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <h2 className="font-headline text-lg tracking-tight">AlphaLink</h2>
                </div>
            </div>
             <SidebarTrigger className="hidden md:flex" />
        </SidebarHeader>
        <SidebarContent>
            <Accordion type="multiple" defaultValue={['mainframe']} className="w-full">
                <AccordionItem value="mainframe">
                    <AccordionTrigger className="p-2 hover:no-underline hover:bg-sidebar-accent rounded-md group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:size-8">
                         <h3 className="text-lg font-medium uppercase tracking-wider text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">Mainframe</h3>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0">
                        <SidebarMenu>
                            {mainframeItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild isActive={pathname.startsWith(item.subpath || item.href) && (item.href !== '/chat' || pathname === '/chat')} tooltip={{ children: item.label }} className="justify-start" >
                                    <Link href={item.href}> <item.icon className="h-5 w-5" /> <span className="group-data-[collapsible=icon]:hidden">{item.label}</span> </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </AccordionContent>
                </AccordionItem>
                 <SidebarSeparator />
                 <AccordionItem value="fabrication">
                    <AccordionTrigger className="p-2 hover:no-underline hover:bg-sidebar-accent rounded-md group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:size-8">
                         <h3 className="text-lg font-medium uppercase tracking-wider text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">Fabrication</h3>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0">
                        <SidebarMenu>
                            {fabricationItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={{ children: item.label }} className="justify-start" >
                                    <Link href={item.href}> <item.icon className="h-5 w-5" /> <span className="group-data-[collapsible=icon]:hidden">{item.label}</span> </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </AccordionContent>
                </AccordionItem>
                 <SidebarSeparator />
                 <AccordionItem value="collaboration">
                    <AccordionTrigger className="p-2 hover:no-underline hover:bg-sidebar-accent rounded-md group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:size-8">
                         <h3 className="text-lg font-medium uppercase tracking-wider text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">Collaboration</h3>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0">
                         <SidebarMenu>
                            {collaborationItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild isActive={pathname.startsWith(item.subpath || item.href)} tooltip={{ children: item.label }} className="justify-start" >
                                    <Link href={item.href}> <item.icon className="h-5 w-5" /> <span className="group-data-[collapsible=icon]:hidden">{item.label}</span> </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </AccordionContent>
                </AccordionItem>
                 <SidebarSeparator />
                <AccordionItem value="system">
                    <AccordionTrigger className="p-2 hover:no-underline hover:bg-sidebar-accent rounded-md group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:size-8">
                         <h3 className="text-lg font-medium uppercase tracking-wider text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">System</h3>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0">
                         <SidebarMenu>
                            {systemItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild isActive={pathname.startsWith(item.subpath || item.href)} tooltip={{ children: item.label }} className="justify-start" >
                                    <Link href={item.subpath || item.href}> <item.icon className="h-5 w-5" /> <span className="group-data-[collapsible=icon]:hidden">{item.label}</span> </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </AccordionContent>
                </AccordionItem>
                 <SidebarSeparator />
            </Accordion>


          {user?.role === 'admin' && (
             <Accordion type="multiple" defaultValue={[]} className="w-full">
                <AccordionItem value="administration">
                    <AccordionTrigger className="p-2 hover:no-underline hover:bg-sidebar-accent rounded-md group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:size-8">
                         <h3 className="text-lg font-medium uppercase tracking-wider text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">Administration</h3>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0">
                        <SidebarMenu>
                            {adminMenuItems.map((item) => (
                            <SidebarMenuItem key={item.label}>
                                <SidebarMenuButton asChild isActive={pathname.startsWith(item.subpath || item.href)} tooltip={{ children: item.label }} className="justify-start" >
                                    <Link href={item.href}> <item.icon className="h-5 w-5" /> <span className="group-data-[collapsible=icon]:hidden">{item.label}</span> </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </AccordionContent>
                </AccordionItem>
             </Accordion>
          )}

        </SidebarContent>
        <SidebarFooter>
           {/* Profile card moved to header */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="tech-background">
          <AudioPlayer />
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
            <div className='flex items-center gap-4'>
                <SidebarTrigger className="flex md:hidden" />
                <h1 className="text-lg font-semibold md:text-xl font-headline">
                    {activePageTitle}
                </h1>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
                <Clock />
            </div>
            <Dialog>
             <DialogTrigger asChild>
                <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent text-left">
                     <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.avatar} alt={user?.username} />
                        <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-col hidden sm:flex">
                        <span className="text-sm font-medium">{user?.username}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {getRoleDisplayName()}
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
          </header>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
