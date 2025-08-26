export interface Freebet {
  id: string;
  casa: string;
  oddMinima: number;
  valor: number;
  situacao: string;
  data: string;
  dataExpiracao?: string;
  utilizada: boolean;
  extraida?: boolean;
  valorExtraido?: number;
}

export type FreebetFormData = Omit<Freebet, "id" | "data" | "utilizada" | "extraida">;

export interface MonthlyStats {
  year: number;
  month: number;
  freebetsExtraidas: number;
  freebetsPerdidas: number;
  freebetsExpiradas: number;
  valorTotal: number;
  lucroTotal: number;
  mediaExtracao: number;
  date: string;
}

