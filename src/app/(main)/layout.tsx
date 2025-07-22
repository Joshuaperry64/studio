'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { MessageSquare, Image as ImageIcon, Users, Settings, Bot, Shield, Smile, BookOpen, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useUserStore } from '@/store/user-store';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUserStore();


  const menuItems = [
    { href: '/chat', label: 'AI Chat', icon: MessageSquare },
    { href: '/character-hub', label: 'Character Hub', icon: Smile },
    { href: '/media-generation', label: 'Visual Media', icon: ImageIcon },
    { href: '/co-pilot', label: 'Co-Pilot', icon: Users },
  ];

  const bottomMenuItems = [
      { href: '/feedback', label: 'Feedback', icon: MessageSquarePlus },
      { href: '/instructions', label: 'Instructions', icon: BookOpen },
      { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const adminMenuItems = [
    { href: '/admin', label: 'Admin', icon: Shield, admin: true },
  ]

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
            {user?.role === 'admin' && adminMenuItems.map((item) => (
               <SidebarMenuItem key={item.href}>
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
          </SidebarMenu>
        </SidebarContent>
        <Separator className="my-2" />
          <SidebarContent>
              <SidebarMenu>
                 {bottomMenuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
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
              </SidebarMenu>
          </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://placehold.co/40x40" alt={user?.username} />
              <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium">{user?.username}</span>
              <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="tech-background">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-lg font-semibold md:text-xl font-headline">
              {[...menuItems, ...adminMenuItems, ...bottomMenuItems].find((item) => item.href === pathname)?.label || 'AlphaLink'}
            </h1>
          </header>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
