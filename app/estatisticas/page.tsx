"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { ChartBarIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

import { getMonthlyStats, calculateRealTimeStats } from "@/lib/storage";

// Função para obter o nome do mês em português
const getMonthName = (monthIndex: number): string => {
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return monthNames[monthIndex];
};

// Obter anos únicos das estatísticas armazenadas
const getUniqueYears = (stats: any[]): number[] => {
  const uniqueYears = Array.from(new Set(stats.map(stat => stat.year)));
  
  // Adicionar o ano atual se não estiver presente
  const currentYear = new Date().getFullYear();
  if (!uniqueYears.includes(currentYear)) {
    uniqueYears.push(currentYear);
  }
  
  // Ordenar do mais recente para o mais antigo
  return uniqueYears.sort((a, b) => b - a);
};

// Formatar os dados das estatísticas para o formato esperado pela interface
const formatStatsData = (stats: any[]): Record<number, any[]> => {
  const years = getUniqueYears(stats);
  
  return years.reduce((acc, year) => {
    // Filtrar estatísticas para este ano
    const yearStats = stats.filter(stat => stat.year === year)
      .map(stat => ({
        name: getMonthName(stat.month),
        monthIndex: stat.month,
        year: stat.year,
        freebetsExtraidas: stat.freebetsExtraidas,
        mediaExtracao: stat.mediaExtracao,
        freebetsPerdidas: stat.freebetsPerdidas,
        valorTotal: stat.valorTotal,
        lucroTotal: stat.lucroTotal || 0, // Adicionar lucro total
        date: new Date(stat.date)
      }));
      
    acc[year] = yearStats;
    return acc;
  }, {} as Record<number, any[]>);
};

export default function EstatisticasPage() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<{name: string, year: number, monthIndex: number} | null>(null);
  const [yearlyData, setYearlyData] = useState<Record<number, any[]>>({});
  const [years, setYears] = useState<number[]>([new Date().getFullYear()]);
  
  // Carregar estatísticas ao montar o componente
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Calcular estatísticas em tempo real
        await calculateRealTimeStats();
        
        // Obter estatísticas mensais do localStorage
        const stats = getMonthlyStats();
        
        if (stats.length > 0) {
          // Obter anos disponíveis nas estatísticas
          const availableYears = getUniqueYears(stats);
          setYears(availableYears);
          
          // Formatar dados para o formato esperado pela interface
          const formattedData = formatStatsData(stats);
          setYearlyData(formattedData);
        } else {
          // Se não houver dados salvos, mostrar apenas o ano atual vazio
          const currentYear = new Date().getFullYear();
          setYearlyData({ [currentYear]: [] });
        }
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      }
    };
    
    loadStats();
  }, []);
  
  // Ordenar meses do mais recente para o mais antigo
  const monthlyData = [...(yearlyData[selectedYear] || [])].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );

  // Obter os dados do mês selecionado
  const selectedMonthData = selectedMonth
    ? yearlyData[selectedMonth.year].find(
        (month) => month.monthIndex === selectedMonth.monthIndex
      )
    : null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estatísticas Mensais"
        description="Acompanhe o desempenho das suas freebets por mês"
        icon={<ChartBarIcon className="w-6 h-6" />}
      />

      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="absolute top-0 h-1 left-0 right-0 bg-gradient-to-r from-fedora-blue to-fedora-accent"></div>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between pb-4">
            <CardTitle>Histórico de Meses</CardTitle>
            <div className="flex space-x-2">
              {years.map(year => (
                <Button 
                  key={year}
                  variant={selectedYear === year ? "default" : "outline"} 
                  size="sm"
                  onClick={() => {
                    setSelectedYear(year);
                    setSelectedMonth(null);
                  }}
                  className={selectedYear === year ? "bg-fedora-blue hover:bg-fedora-blue/90" : ""}
                  disabled={!yearlyData[year]?.length}
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {monthlyData.map((month) => (
              <motion.div key={`${month.year}-${month.monthIndex}`} variants={itemVariants}>
                <Card
                  className={`cursor-pointer hover:shadow-lg transition-shadow border-0 overflow-hidden ${
                    selectedMonth?.monthIndex === month.monthIndex && selectedMonth?.year === month.year
                      ? "ring-2 ring-fedora-accent/50 shadow-lg"
                      : "shadow-md"
                  }`}
                  onClick={() => setSelectedMonth({
                    name: month.name,
                    year: month.year,
                    monthIndex: month.monthIndex
                  })}
                >
                  <div 
                    className={`absolute top-0 h-1 left-0 right-0 ${
                      selectedMonth?.monthIndex === month.monthIndex && selectedMonth?.year === month.year
                        ? "bg-fedora-accent"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  ></div>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      {month.name}/{month.year}
                      {selectedMonth?.monthIndex === month.monthIndex && selectedMonth?.year === month.year && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 rounded-full bg-fedora-accent"
                        />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-gray-50 dark:bg-gray-800/40 p-2">
                        <p className="text-xs text-muted-foreground">
                          Freebets Extraídas
                        </p>
                        <p className="text-lg font-bold text-fedora-blue dark:text-fedora-accent">
                          {month.freebetsExtraidas}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-50 dark:bg-gray-800/40 p-2">
                        <p className="text-xs text-muted-foreground">
                          Média de Extração
                        </p>
                        <p className="text-lg font-bold text-fedora-blue dark:text-fedora-accent">
                          {month.mediaExtracao}%
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-50 dark:bg-gray-800/40 p-2 col-span-2">
                        <p className="text-xs text-muted-foreground">
                          Valor Total / Lucro
                        </p>
                        <div className="flex justify-between">
                          <p className="text-lg font-bold">
                            {formatCurrency(month.valorTotal)}
                          </p>
                          <p className="text-lg font-bold text-green-500">
                            {formatCurrency(month.lucroTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {selectedMonth && selectedMonthData && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-fedora-blue/5 to-fedora-accent/5 dark:from-fedora-blue/10 dark:to-fedora-accent/10">
                <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                  <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fedora-blue to-fedora-accent">
                    Detalhes de {selectedMonthData.name}/{selectedMonthData.year}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg border-b pb-2 border-gray-200 dark:border-gray-800">
                        Métricas
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex justify-between items-center p-2 bg-white dark:bg-gray-900 rounded-md">
                          <span className="text-muted-foreground">
                            Freebets Extraídas:
                          </span>
                          <span className="font-medium text-fedora-blue dark:text-fedora-accent">
                            {selectedMonthData.freebetsExtraidas}
                          </span>
                        </li>
                        <li className="flex justify-between items-center p-2 bg-white dark:bg-gray-900 rounded-md">
                          <span className="text-muted-foreground">
                            Freebets Perdidas:
                          </span>
                          <span className="font-medium text-red-500">
                            {selectedMonthData.freebetsPerdidas}
                          </span>
                        </li>
                        <li className="flex justify-between items-center p-2 bg-white dark:bg-gray-900 rounded-md">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-medium">
                            {selectedMonthData.freebetsExtraidas +
                              selectedMonthData.freebetsPerdidas}
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg border-b pb-2 border-gray-200 dark:border-gray-800">
                        Desempenho
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex justify-between items-center p-2 bg-white dark:bg-gray-900 rounded-md">
                          <span className="text-muted-foreground">
                            Média de Extração:
                          </span>
                          <span className="font-medium text-fedora-blue dark:text-fedora-accent">
                            {selectedMonthData.mediaExtracao}%
                          </span>
                        </li>
                        <li className="flex justify-between items-center p-2 bg-white dark:bg-gray-900 rounded-md">
                          <span className="text-muted-foreground">
                            Valor Total:
                          </span>
                          <span className="font-medium">
                            {formatCurrency(selectedMonthData.valorTotal)}
                          </span>
                        </li>
                        <li className="flex justify-between items-center p-2 bg-white dark:bg-gray-900 rounded-md">
                          <span className="text-muted-foreground">
                            Lucro Total:
                          </span>
                          <span className="font-medium text-green-500">
                            {formatCurrency(selectedMonthData.lucroTotal)}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}