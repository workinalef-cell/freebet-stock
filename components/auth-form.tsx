"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { signIn } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Tente fazer login
      const success = await signIn(email, password);
      
      // Verificar se houve erro
      if (!success) {
        setErrorMessage('Credenciais inválidas. Tente novamente.');
      }
    } catch (err) {
      setErrorMessage('Ocorreu um erro ao fazer login. Tente novamente mais tarde.');
      console.error('Erro no login:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-fedora-blue/10 mb-4">
            <div className="text-5xl font-bold text-fedora-blue">F</div>
          </div>
          <h1 className="text-2xl font-bold">FreeBet Stock</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Faça login para acessar sua conta
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-md"
              >
                {errorMessage}
              </motion.div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-fedora-blue hover:bg-fedora-blue/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()} FreeBet Stock. Todos os direitos reservados.
          </p>
        </div>
      </motion.div>
    </div>
  );
}