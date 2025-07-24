
'use client';

import {
    MessageSquare, ImageIcon, Users, Settings, Bot, Shield, Smile, BookOpen, MessageSquarePlus,
    LogOut, Map, Loader2, Wand2, Fingerprint, Code, Server, PanelLeft, Database, BarChart,
    BrainCircuit, HardDrive, Group, Globe, GanttChartSquare, FolderKanban, LayoutDashboard
} from 'lucide-react';
import { usePathname } from 'next/navigation';

export const mainframeItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/chat', label: 'Alpha Comm', icon: MessageSquare, subpath: '/chat' },
    { href: '/virtual-environment', label: 'Virtual Environment', icon: Globe, subpath: '/virtual-environment' },
    { href: '/memory-interface', label: 'Memory Interface', icon: BrainCircuit },
];

export const fabricationItems = [
    { href: '/media-generation', label: 'Visual Synthesis', icon: ImageIcon },
    { href: '/code-synthesis', label: 'Code Synthesis', icon: Code },
    { href: '/voice-biometrics', label: 'Voice Biometrics', icon: Fingerprint },
];

export const collaborationItems = [
    { href: '/projects', label: 'Projects', icon: FolderKanban, subpath: '/projects' },
    { href: '/character-hub', label: 'Character Hub', icon: Smile },
    { href: '/lobby', label: 'Chat Lobby', icon: Users, subpath: '/lobby' },
];

export const systemItems = [
    { href: '/instructions', label: 'Instructions', icon: BookOpen },
    { href: '/feedback', label: 'Feedback', icon: MessageSquarePlus },
    { href: '/settings', label: 'Settings', icon: Settings, subpath: '/settings' },
];

export const adminMenuItems = [
    { href: '/admin', label: 'Admin Panel', icon: Shield, subpath: '/admin' },
    { href: '/analytics', label: 'Analytics', icon: BarChart },
    { href: '/local-deployment', label: 'Local Deployment', icon: Server },
    { href: '/roadmap', label: 'Dev Roadmap', icon: GanttChartSquare },
];

export const allMenuItems = [...mainframeItems, ...fabricationItems, ...collaborationItems, ...systemItems, ...adminMenuItems];

export function useActivePageTitle() {
    const pathname = usePathname();
    
    // First, check for an exact match
    const exactMatch = allMenuItems.find(item => item.href === pathname);
    if (exactMatch) return exactMatch.label;

    // Then, check for subpath matches, from most specific to least specific
    const sortedItems = [...allMenuItems].sort((a, b) => (b.subpath?.length || 0) - (a.subpath?.length || 0));

    const activeItem = sortedItems.find(item => {
        if (!item.subpath) return false;
        return pathname.startsWith(item.subpath);
    });
    
    return activeItem?.label || 'AlphaLink';
}
