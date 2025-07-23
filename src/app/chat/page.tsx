
'use client';

import { redirect } from 'next/navigation';

export default function DeprecatedChatPage() {
  // This page is obsolete and its functionality is handled by /app/(main)/chat/page.tsx.
  // Redirecting to avoid route conflicts.
  redirect('/chat');
}
