import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function calculateExtraction(
  stake: number,
  backOdds: number,
  layOdds: number,
  commission: number = 2
): { 
  profit: number;
  layStake: number;
  extraction: number;
  liability: number;
} {
  // Cálculo correto para freebet SNR (Stake Not Returned)
  // Fórmula correta: layStake = (stake * (backOdds - 1)) / (layOdds - commission/100)
  
  // 1. Calcular o lay stake correto
  const layStake = (stake * (backOdds - 1)) / (layOdds - (commission / 100));
  
  // 2. Calcular a responsabilidade (liability)
  const liability = layStake * (layOdds - 1);
  
  // 3. Calcular lucros nos dois cenários
  // Cenário 1: Back ganha (freebet SNR significa que não recebemos a stake de volta)
  const backWinsProfit = (stake * (backOdds - 1)) - liability;
  
  // Cenário 2: Lay ganha (aplicamos comissão sobre o lucro)
  const layWinsProfit = layStake - (layStake * (commission / 100));
  
  // O lucro garantido é o menor entre os dois cenários
  const profit = Math.min(backWinsProfit, layWinsProfit);
  
  // Calcular a porcentagem de extração
  const extraction = (profit / stake) * 100;
  
  return {
    profit: parseFloat(profit.toFixed(2)),
    layStake: parseFloat(layStake.toFixed(2)),
    extraction: parseFloat(extraction.toFixed(2)),
    liability: parseFloat(liability.toFixed(2)),
  };
}

