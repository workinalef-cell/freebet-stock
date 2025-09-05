import { Freebet, MonthlyStats } from "./types";
import { 
  getFreebetsFromSupabase, 
  addFreebetToSupabase, 
  updateFreebetInSupabase, 
  deleteFreebetFromSupabase 
} from "./supabase-storage";

// Cache simples para melhorar performance
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 3 * 60 * 1000; // 3 minutos

  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = ttl || this.defaultTTL;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }
}

// Exportado para permitir invalidação direta
export const cache = new SimpleCache();

const FREEBETS_KEY = "freebets";
const STATS_KEY = "monthly_stats";
export const CACHE_KEY_FREEBETS = "cached_freebets";

// Função principal otimizada com cache
export async function getFreebets(): Promise<Freebet[]> {
  // Verificar cache primeiro
  const cached = cache.get<Freebet[]>(CACHE_KEY_FREEBETS);
  if (cached) {
    return cached;
  }

  try {
    // Tentar carregar do Supabase primeiro
    const supabaseFreebets = await getFreebetsFromSupabase();
    if (supabaseFreebets.length >= 0) {
      // Cache o resultado
      cache.set(CACHE_KEY_FREEBETS, supabaseFreebets);
      return supabaseFreebets;
    }
  } catch (error) {
    console.error("Erro ao carregar do Supabase, usando localStorage:", error);
  }
  
  // Fallback para localStorage
  if (typeof window === "undefined") return [];
  
  try {
    const storedData = localStorage.getItem(FREEBETS_KEY);
    const result = storedData ? JSON.parse(storedData) : [];
    // Cache também o resultado do localStorage
    cache.set(CACHE_KEY_FREEBETS, result);
    return result;
  } catch (error) {
    console.error("Erro ao carregar freebets:", error);
    return [];
  }
}

export async function saveFreebet(freebet: Omit<Freebet, 'id'>): Promise<Freebet | null> {
  try {
    // Tentar salvar no Supabase primeiro
    const result = await addFreebetToSupabase(freebet);
    if (result) {
      // Invalidar cache após modificação
      cache.invalidate(CACHE_KEY_FREEBETS);
      return result;
    }
  } catch (error) {
    console.error("Erro ao salvar no Supabase, usando localStorage:", error);
  }
  
  // Fallback para localStorage
  if (typeof window === "undefined") return null;
  
  try {
    const newFreebet: Freebet = {
      ...freebet,
      id: Date.now().toString()
    };
    
    const freebets = await getFreebets();
    freebets.push(newFreebet);
    localStorage.setItem(FREEBETS_KEY, JSON.stringify(freebets));
    
    // Invalidar cache após modificação
    cache.invalidate(CACHE_KEY_FREEBETS);
    return newFreebet;
  } catch (error) {
    console.error("Erro ao salvar freebet:", error);
    return null;
  }
}

export async function updateFreebet(updatedFreebet: Freebet): Promise<boolean> {
  try {
    // Tentar atualizar no Supabase primeiro
    const success = await updateFreebetInSupabase(updatedFreebet);
    if (success) {
      // Invalidar cache após modificação
      cache.invalidate(CACHE_KEY_FREEBETS);
      return true;
    }
  } catch (error) {
    console.error("Erro ao atualizar no Supabase, usando localStorage:", error);
  }
  
  // Fallback para localStorage
  if (typeof window === "undefined") return false;
  
  try {
    const freebets = await getFreebets();
    const index = freebets.findIndex((fb) => fb.id === updatedFreebet.id);
    
    if (index !== -1) {
      freebets[index] = updatedFreebet;
      localStorage.setItem(FREEBETS_KEY, JSON.stringify(freebets));
      // Invalidar cache após modificação
      cache.invalidate(CACHE_KEY_FREEBETS);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erro ao atualizar freebet:", error);
    return false;
  }
}

export async function deleteFreebet(id: string): Promise<boolean> {
  let success = false;
  
  try {
    // Tentar deletar do Supabase primeiro
    success = await deleteFreebetFromSupabase(id);
  } catch (error) {
    console.error("Erro ao deletar do Supabase, usando localStorage:", error);
  }
  
  // Sempre atualizar o localStorage também, independente do resultado do Supabase
  if (typeof window !== "undefined") {
    try {
      const freebets = await getFreebets();
      const updatedFreebets = freebets.filter((fb) => fb.id !== id);
      localStorage.setItem(FREEBETS_KEY, JSON.stringify(updatedFreebets));
      success = true;
      
      // Garantir que o cache seja invalidado
      cache.invalidate(CACHE_KEY_FREEBETS);
    } catch (error) {
      console.error("Erro ao deletar freebet do localStorage:", error);
      if (!success) return false;
    }
  }
  
  return success;
}

// Funções para estatísticas mensais
export function getMonthlyStats(): MonthlyStats[] {
  if (typeof window === "undefined") return [];
  
  try {
    const storedData = localStorage.getItem(STATS_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("Erro ao carregar estatísticas mensais:", error);
    return [];
  }
}

export function saveMonthlyStats(stats: MonthlyStats): void {
  if (typeof window === "undefined") return;
  
  try {
    const allStats = getMonthlyStats();
    
    // Verificar se já existe um registro para esse mês/ano
    const existingIndex = allStats.findIndex(
      (s) => s.year === stats.year && s.month === stats.month
    );
    
    if (existingIndex !== -1) {
      // Atualizar estatísticas existentes
      allStats[existingIndex] = stats;
    } else {
      // Adicionar novas estatísticas
      allStats.push(stats);
    }
    
    localStorage.setItem(STATS_KEY, JSON.stringify(allStats));
  } catch (error) {
    console.error("Erro ao salvar estatísticas mensais:", error);
  }
}

// Função para calcular estatísticas em tempo real
export async function calculateRealTimeStats(): Promise<Record<string, MonthlyStats>> {
  if (typeof window === "undefined") return {};
  
  try {
    const allFreebets = await getFreebets();
    
    // Agrupar freebets por mês/ano
    const groupedByMonth: Record<string, Freebet[]> = {};
    
    allFreebets.forEach((freebet) => {
      const freebetDate = new Date(freebet.data);
      const year = freebetDate.getFullYear();
      const month = freebetDate.getMonth();
      const key = `${year}-${month}`;
      
      if (!groupedByMonth[key]) {
        groupedByMonth[key] = [];
      }
      
      groupedByMonth[key].push(freebet);
    });
    
    // Converter grupos em estatísticas mensais
    const realTimeStats: Record<string, MonthlyStats> = {};
    
    Object.entries(groupedByMonth).forEach(([key, freebets]) => {
      const [year, month] = key.split('-').map(Number);
      
      // Calcular estatísticas
      const extraidas = freebets.filter((fb) => fb.extraida).length;
      const perdidas = freebets.filter((fb) => fb.utilizada && !fb.extraida).length;
      const expiradas = freebets.filter(fb => {
        if (!fb.dataExpiracao) return false;
        const expirationDate = new Date(fb.dataExpiracao);
        return new Date() > expirationDate;
      }).length;
      
      // Calcular média de extração e lucro total
      const extraidasFreebets = freebets.filter((fb) => fb.extraida);
      const totalValor = freebets.reduce((sum, fb) => sum + fb.valor, 0); // Alterado para considerar todas as freebets
      const totalLucro = extraidasFreebets.reduce((sum, fb) => sum + (fb.valorExtraido || 0), 0);
      
      // Calcular média de extração real
      const mediaExtracao = extraidasFreebets.length > 0 && extraidasFreebets.reduce((sum, fb) => sum + fb.valor, 0) > 0
        ? (totalLucro / extraidasFreebets.reduce((sum, fb) => sum + fb.valor, 0)) * 100
        : 0;
      
      // Criar objeto de estatísticas
      const monthlyStats: MonthlyStats = {
        year,
        month,
        freebetsExtraidas: extraidas,
        freebetsPerdidas: perdidas,
        freebetsExpiradas: expiradas,
        valorTotal: totalValor,
        lucroTotal: totalLucro,
        mediaExtracao: parseFloat(mediaExtracao.toFixed(2)),
        date: new Date(year, month, 15).toISOString()
      };
      
      realTimeStats[key] = monthlyStats;
      
      // Também salvar nas estatísticas persistentes
      saveMonthlyStats(monthlyStats);
    });
    
    return realTimeStats;
    
  } catch (error) {
    console.error("Erro ao calcular estatísticas em tempo real:", error);
    return {};
  }
}

// Função para arquivar freebets do mês anterior e movê-las para estatísticas (mantida para compatibilidade)
export async function archiveMonthlyFreebets(): Promise<void> {
  // Agora esta função apenas chama a nova função de cálculo em tempo real
  await calculateRealTimeStats();
}

// Configurações do usuário
export interface UserSettings {
  commission: number;
  theme: 'light' | 'dark';
}

const SETTINGS_KEY = 'freebet-settings';

// Configurações padrão
const DEFAULT_SETTINGS: UserSettings = {
  commission: 2,
  theme: 'light'
};

// Obter configurações
export function getSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const settings = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...settings };
    }
  } catch (error) {
    console.error("Erro ao carregar configurações:", error);
  }
  
  return DEFAULT_SETTINGS;
}

// Salvar configurações
export function saveSettings(settings: UserSettings): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
  }
}

// Obter apenas a comissão padrão
export function getDefaultCommission(): number {
  return getSettings().commission;
}





