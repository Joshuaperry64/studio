'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [isNsfwMode, setIsNsfwMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>Manage your preferences for AlphaLink.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="nsfw-mode" className="font-semibold">
                  NSFW Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable adults-only, private communication mode.
                </p>
              </div>
              <Switch
                id="nsfw-mode"
                checked={isNsfwMode}
                onCheckedChange={setIsNsfwMode}
                aria-label="Toggle NSFW mode"
              />
            </div>

             <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="notifications" className="font-semibold">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for important updates.
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
                aria-label="Toggle push notifications"
              />
            </div>
            
            <Separator />

            <div>
                <h3 className="text-lg font-medium">Account</h3>
                <p className="text-sm text-muted-foreground">Manage your account and data.</p>
            </div>
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4 gap-4">
              <div>
                <p className="font-medium">Export Your Data</p>
                <p className="text-sm text-muted-foreground">
                  Download a copy of all your conversations.
                </p>
              </div>
              <Button variant="outline">Export Data</Button>
            </div>
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border border-destructive/50 p-4 gap-4">
              <div>
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button variant="destructive">Delete My Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
