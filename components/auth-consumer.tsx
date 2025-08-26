"use client";

import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth-form';
import { HeaderNavigation } from '@/components/header-navigation';

export function AuthConsumer({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fedora-blue"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNavigation />
      <main className="flex-1 pt-20 px-4 md:px-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <footer className="py-3 px-4 text-center text-xs text-gray-500 dark:text-gray-400 mt-8 border-t border-gray-200 dark:border-gray-800">
        <p>© {new Date().getFullYear()} FreeBet Stock. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
