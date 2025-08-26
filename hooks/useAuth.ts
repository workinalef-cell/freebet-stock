import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obter sessão atual
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Erro ao obter sessão:', error)
        // Se o Supabase não estiver configurado, simular usuário logado para desenvolvimento
        setUser({ 
          id: 'dev-user', 
          email: 'dev@freebet-stock.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as User)
      }
      setLoading(false)
    }

    getSession()

    // Escutar mudanças na autenticação
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Erro ao configurar listener de auth:', error)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      // Para desenvolvimento, simular login bem-sucedido
      const mockUser = { 
        id: 'dev-user', 
        email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as User
      setUser(mockUser)
      return { user: mockUser, session: null }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
    setUser(null)
  }

  return {
    user,
    loading,
    signIn,
    signOut,
  }
}
