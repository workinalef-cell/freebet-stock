import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://psoyzfwdaeqbkfxddbyq.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzb3l6ZndkYWVxYmtmeGRkYnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNjk4MTUsImV4cCI6MjA3MTc0NTgxNX0.0kbjZYxbLHXlwD8NuKAvhZBWWJvaTeKg7K61K2tgZ3g'

// Configuração avançada com persistência de sessão
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Habilitar persistência de sessão entre recarregamentos
    persistSession: true,
    // Armazenar sessão no localStorage
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Atualizar automaticamente o token quando expirar
    autoRefreshToken: true,
    // Detectar alterações de autenticação entre abas
    detectSessionInUrl: true,
  }
})

// Tipos para as tabelas do Supabase
export interface SupabaseFreebet {
  id: string
  user_id: string
  casa: string
  valor: number
  odd_minima: number
  situacao: string
  data: string
  data_expiracao?: string
  utilizada: boolean
  extraida: boolean
  valor_extraido?: number
  created_at: string
  updated_at: string
}

export interface SupabaseUser {
  id: string
  email: string
  created_at: string
}
