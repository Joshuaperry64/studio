import MainLayoutClient from './layout-client';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  // This is now a clean server component.
  // All client-side logic and state has been moved to MainLayoutClient.
  return <MainLayoutClient>{children}</MainLayoutClient>;
}
