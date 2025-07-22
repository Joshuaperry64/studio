
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 auth-hud-background">
        <div className="w-full max-w-md mx-auto auth-hud-border">
          {children}
        </div>
    </div>
  );
}
