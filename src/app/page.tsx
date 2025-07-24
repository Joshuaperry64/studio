import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to the main dashboard page. The layout will handle authentication.
  redirect('/dashboard');
}
