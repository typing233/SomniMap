import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dream-50 via-soft-light/10 to-calm-light/10">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-soft-light/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-calm-light/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative min-h-screen flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 md:px-8 md:py-6">
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-soft-light flex items-center justify-center shadow-lg shadow-accent/20">
              <span className="text-white text-xl">🌙</span>
            </div>
            <span className="text-xl font-bold text-dream-800">SomniMap</span>
          </a>
        </header>
        
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          {children}
        </main>
        
        <footer className="px-6 py-4 md:px-8">
          <div className="text-center text-sm text-dream-500">
            <p>© {new Date().getFullYear()} SomniMap. 探索你的潜意识世界</p>
          </div>
        </footer>
      </div>
    </div>
  );
};
