
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex items-center justify-center p-4 sm:p-8 hud-background relative">
        <div className="w-full max-w-md mx-auto relative z-10">
          {children}
        </div>
      </div>
      <div className="hidden md:block bg-background">
        {/* This is the empty right panel on desktop */}
      </div>
    </div>
  );
}
