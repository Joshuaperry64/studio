
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-8" 
      style={{
        backgroundImage: "url('https://placehold.co/1920x1080.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      data-ai-hint="ai hud"
    >
        <div className="w-full max-w-md mx-auto relative z-10">
          {children}
        </div>
    </div>
  );
}
