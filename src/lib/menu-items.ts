
'use client';

import {
    MessageSquare, ImageIcon, Users, Settings, Bot, Shield, Smile, BookOpen, MessageSquarePlus,
    LogOut, Map, Loader2, Wand2, Fingerprint, Code, Server, PanelLeft, Database, BarChart,
    BrainCircuit, HardDrive, Group, Globe, GanttChartSquare, FolderKanban, LayoutDashboard
} from 'lucide-react';
import { usePathname } from 'next/navigation';

export const mainframeItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/chat', label: 'Alpha Comm', icon: MessageSquare },
    { href: '/virtual-environment', label: 'Virtual Environment', icon: Globe, subpath: '/virtual-environment' },
    { href: '/memory-interface', label: 'Memory Interface', icon: BrainCircuit },
];

export const fabricationItems = [
    { href: '/visual-synthesis', label: 'Visual Synthesis', icon: ImageIcon },
    { href: '/code-synthesis', label: 'Code Synthesis', icon: Code },
    { href: '/voice-biometrics', label: 'Voice Biometrics', icon: Fingerprint },
];

export const collaborationItems = [
    { href: '/projects', label: 'Projects', icon: FolderKanban, subpath: '/projects' },
    { href: '/character-hub', label: 'Character Hub', icon: Smile },
    { href: '/lobby', label: 'Chat Lobby', icon: Users, subpath: '/chat/' },
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
    const activeItem = allMenuItems.find(item => {
        const itemPath = item.subpath || item.href;
        // Exact match for base paths like '/chat' or '/projects'
        if (itemPath === pathname) {
            return true;
        }
        // StartsWith match for sub-pages, but exclude the base path itself if it's a subpath root
        if (item.subpath && pathname.startsWith(item.subpath) && pathname !== item.subpath) {
            // Special case to avoid matching /chat/* for the lobby
            if (item.href === '/chat' && pathname.startsWith('/chat/')) return false;
            return true;
        }
        return false;
    });

    // A more specific check for top-level pages that also have sub-pages
    const exactMatch = allMenuItems.find(item => item.href === pathname);
    
    return exactMatch?.label || activeItem?.label || 'AlphaLink';
}
