
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 hud-background">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0" />
      <div className="z-10 w-full">
        {children}
      </div>
    </div>
  );
}
