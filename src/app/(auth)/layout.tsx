
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 hud-background">
      <div className="w-full max-w-md mx-auto relative z-10">
        {children}
      </div>
    </div>
  );
}
