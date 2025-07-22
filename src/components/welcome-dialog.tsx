'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bot, ImageIcon, Smile, Users, Wand2 } from 'lucide-react';
import React from 'react';

interface WelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeDialog({ open, onOpenChange }: WelcomeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Bot className="h-8 w-8 text-primary" />
            Welcome to AlphaLink!
          </DialogTitle>
          <DialogDescription className="pt-2 text-base">
            This is your new hub for AI-powered creation and collaboration. Here’s a quick tour of what you can do:
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="flex items-start gap-4">
                <Smile className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-semibold">AI Character Hub</h3>
                    <p className="text-sm text-muted-foreground">Create unique AI personas with generated backstories and avatars. Set them as your active chat partner!</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <ImageIcon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-semibold">Visual Media Generation</h3>
                    <p className="text-sm text-muted-foreground">Bring your ideas to life by generating images and short videos from simple text prompts.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <Users className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-semibold">AI Co-Pilot</h3>
                    <p className="text-sm text-muted-foreground">Collaborate with your team by getting AI feedback on project descriptions and suggestions.</p>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            <Wand2 className="mr-2 h-4 w-4" />
            Let's Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
