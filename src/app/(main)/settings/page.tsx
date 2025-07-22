
'use client';

import React from 'react';
import { redirect } from 'next/navigation';

export default function SettingsRedirectPage() {
    // This page just redirects to the application settings page.
    redirect('/settings/application');
}
