"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { TicketIcon } from "@heroicons/react/24/outline";
import { FreebetForm } from "@/components/freebet-form";
import { FreebetList } from "@/components/freebet-list";
import { LoadingState, FreebetLoadingSkeleton } from "@/components/loading-state";
import { Freebet } from "@/lib/types";
import { getFreebets, calculateRealTimeStats, cache, CACHE_KEY_FREEBETS } from "@/lib/storage";

export default function FreebetsPage() {
  const [freebets, setFreebets] = useState<Freebet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Otimização das estatísticas com useMemo
  const stats = useMemo(() => {
    const freebetsAtivas = freebets.filter(fb => !fb.utilizada).length;
    const valorTotal = freebets.reduce((sum, fb) => sum + fb.valor, 0);
    const lucroTotal = freebets.filter(fb => fb.extraida).reduce((sum, fb) => sum + (fb.valorExtraido || 0), 0);
    const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    return {
      freebetsAtivas,
      valorTotal,
      lucroTotal,
      mesAtual,
    };
  }, [freebets]);

  // Função otimizada para carregar freebets
  const loadFreebets = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedFreebets = await getFreebets();
      
      // Calcular estatísticas
      const dataAtual = new Date();
      const anoAtual = dataAtual.getFullYear();
      const mesAtual = dataAtual.getMonth();
      
      // Filtrar apenas freebets do mês atual
      const mesAtualFreebets = loadedFreebets.filter(fb => {
        const freebetDate = new Date(fb.data);
        return (
          freebetDate.getFullYear() === anoAtual &&
          freebetDate.getMonth() === mesAtual
        );
      });
      
      setFreebets(mesAtualFreebets);
      
      // Calcular estatísticas em tempo real para atualizar os dados nas estatísticas
      await calculateRealTimeStats();
    } catch (error) {
      console.error("Erro ao carregar freebets:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar freebets ao montar o componente
  useEffect(() => {
    loadFreebets();
  }, [loadFreebets]);

  // Função otimizada chamada após adicionar/atualizar uma freebet
  const handleFreebetChange = async () => {
    try {
      // Forçar invalidação do cache antes de carregar
      cache.invalidate(CACHE_KEY_FREEBETS);
      
      // Recarregar dados e atualizar estatísticas
      await loadFreebets();
    } catch (error) {
      console.error("Erro ao atualizar freebets:", error);
    }
  };

  if (isLoading) {
    return <LoadingState cards={2} showHeader={true} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <PageHeader 
          title="Freebets"
          description="Gerencie suas freebets ativas e histórico"
          icon={<TicketIcon className="w-6 h-6" />}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="overflow-hidden border-0 shadow-md bg-white dark:bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
              <span>Freebets Ativas</span>
              <span className="text-xs font-normal">{stats.mesAtual}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.freebetsAtivas}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-md bg-white dark:bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
              <span>Valor Total</span>
              <span className="text-xs font-normal">{stats.mesAtual}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(stats.valorTotal)}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-md bg-white dark:bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
              <span>Lucro Total</span>
              <span className="text-xs font-normal">{stats.mesAtual}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(stats.lucroTotal)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Formulário */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <FreebetForm onSubmit={handleFreebetChange} />
        </div>
        
        {/* Lista de freebets */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <FreebetList freebets={freebets} onUpdate={handleFreebetChange} />
        </div>
      </div>
    </div>
  );
}