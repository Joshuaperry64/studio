import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to the main chat page. The layout will handle authentication.
  redirect('/chat');
}
