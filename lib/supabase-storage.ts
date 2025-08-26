import { supabase, SupabaseFreebet } from './supabase'
import { Freebet } from './types'

// Converter de Freebet local para SupabaseFreebet
function freebetToSupabase(freebet: Freebet, userId: string): Omit<SupabaseFreebet, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    casa: freebet.casa,
    valor: freebet.valor,
    odd_minima: freebet.oddMinima,
    situacao: freebet.situacao,
    data: freebet.data,
    data_expiracao: freebet.dataExpiracao,
    utilizada: freebet.utilizada,
    extraida: freebet.extraida || false,
    valor_extraido: freebet.valorExtraido
  }
}

// Converter de SupabaseFreebet para Freebet local
function supabaseToFreebet(supabaseFreebet: SupabaseFreebet): Freebet {
  return {
    id: supabaseFreebet.id,
    casa: supabaseFreebet.casa,
    valor: supabaseFreebet.valor,
    oddMinima: supabaseFreebet.odd_minima,
    situacao: supabaseFreebet.situacao,
    data: supabaseFreebet.data,
    dataExpiracao: supabaseFreebet.data_expiracao,
    utilizada: supabaseFreebet.utilizada,
    extraida: supabaseFreebet.extraida,
    valorExtraido: supabaseFreebet.valor_extraido
  }
}

// Obter freebets do usuário atual
export async function getFreebetsFromSupabase(): Promise<Freebet[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('freebets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar freebets:', error)
      return []
    }

    return data.map(supabaseToFreebet)
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error)
    return []
  }
}

// Adicionar nova freebet
export async function addFreebetToSupabase(freebet: Omit<Freebet, 'id'>): Promise<Freebet | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const supabaseFreebet = freebetToSupabase({ ...freebet, id: '' }, user.id)

    const { data, error } = await supabase
      .from('freebets')
      .insert([supabaseFreebet])
      .select()
      .single()

    if (error) {
      console.error('Erro ao adicionar freebet:', error)
      return null
    }

    return supabaseToFreebet(data)
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error)
    return null
  }
}

// Atualizar freebet existente
export async function updateFreebetInSupabase(freebet: Freebet): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const supabaseFreebet = freebetToSupabase(freebet, user.id)

    const { error } = await supabase
      .from('freebets')
      .update(supabaseFreebet)
      .eq('id', freebet.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao atualizar freebet:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error)
    return false
  }
}

// Deletar freebet
export async function deleteFreebetFromSupabase(id: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from('freebets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao deletar freebet:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error)
    return false
  }
}

// Migrar dados locais para Supabase (função de migração única)
export async function migrateLocalDataToSupabase(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Obter dados do localStorage
  const localData = localStorage.getItem('freebets')
  if (!localData) return

  try {
    const freebets: Freebet[] = JSON.parse(localData)
    
    // Inserir cada freebet no Supabase
    for (const freebet of freebets) {
      const supabaseFreebet = freebetToSupabase(freebet, user.id)
      
      await supabase
        .from('freebets')
        .upsert([{ ...supabaseFreebet, id: freebet.id }])
    }

    console.log('Migração concluída com sucesso!')
  } catch (error) {
    console.error('Erro na migração:', error)
  }
}
