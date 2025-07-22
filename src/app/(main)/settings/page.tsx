
'use client';

import React from 'react';
import { redirect } from 'next/navigation';

export default function SettingsRedirectPage() {
    // This page just redirects to the main application settings page.
    // The sub-pages are now handled in the layout.
    redirect('/settings/application');
}
