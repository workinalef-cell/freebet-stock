"use client";

import { useState, useEffect } from 'react';
import { AuthForm } from '@/components/auth-form';
import { HeaderNavigation } from '@/components/header-navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthContent>{children}</AuthContent>;
}

// Componente separado para evitar o erro circular
function AuthContent({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Fallback para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      const timer = setTimeout(() => {
        if (loading) {
          console.warn('Usando usuário simulado para desenvolvimento');
          setLoading(false);
          setUser({
            id: 'dev-user-id',
            email: 'dev@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          } as User);
        }
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        authListener?.subscription.unsubscribe();
      };
    }

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [loading]);

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