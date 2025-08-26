"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { User, Session } from '@supabase/supabase-js';

// Interface para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

// Criar o contexto com um valor padrão
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => false,
  signOut: async () => {},
});

// Hook para usar o contexto
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar e configurar sessão ao montar
  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Verificar sessão existente
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        }
        
        // Configurar listener para mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user || null);
            setLoading(false);
          }
        );
        
        // Garantir que loading seja definido como false mesmo se não houver mudanças de estado
        setLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erro ao configurar autenticação:', error);
        setLoading(false);
      }
    };
    
    setupAuth();
  }, []);

  // Função de login simplificada
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return !error;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  // Função de logout
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Valor do contexto
  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
