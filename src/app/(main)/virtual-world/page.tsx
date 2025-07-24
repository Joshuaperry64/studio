
import { redirect } from 'next/navigation';

// This page now simply redirects to the main virtual environment status page.
export default function VirtualWorldRedirectPage() {
  redirect('/virtual-environment');
}
