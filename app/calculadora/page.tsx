"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { calculateExtraction, formatCurrency } from "@/lib/utils";
import { getDefaultCommission } from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/loading-state";
import { CalculatorIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function CalculadoraPage() {
  const [stake, setStake] = useState<number>(0);
  const [backOdds, setBackOdds] = useState<number>(0);
  const [layOdds, setLayOdds] = useState<number>(0);
  const [commission, setCommission] = useState<number>(2);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Carregar comissão padrão das configurações
  useEffect(() => {
    const loadSettings = async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular carregamento
      const defaultCommission = getDefaultCommission();
      setCommission(defaultCommission);
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  // Cálculo automático em tempo real usando useMemo
  const result = useMemo(() => {
    if (stake > 0 && backOdds > 1 && layOdds > 1 && commission >= 0) {
      return calculateExtraction(stake, backOdds, layOdds, commission);
    }
    return null;
  }, [stake, backOdds, layOdds, commission]);

  // Verificação se os dados estão válidos
  const isValidCalculation = useMemo(() => {
    return stake > 0 && backOdds > 1 && layOdds > 1;
  }, [stake, backOdds, layOdds]);

  // Otimização dos handlers com useCallback
  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const value = parseFloat(e.target.value);
    setter(isNaN(value) ? 0 : value);
  }, []);

  const resetCalculator = useCallback(() => {
    setStake(0);
    setBackOdds(0);
    setLayOdds(0);
  }, []);

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

  if (isLoading) {
    return <LoadingState cards={2} showHeader={true} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calculadora"
        description="Calcule a extração de suas freebets (stake not returned)"
        icon={<CalculatorIcon className="w-6 h-6" />}
      />

      <motion.div
        className="grid gap-6 md:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="absolute top-0 h-1 left-0 right-0 bg-gradient-to-r from-fedora-blue to-fedora-accent"></div>
            <CardHeader>
              <CardTitle>Calculadora de Extração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="stake"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Valor da Freebet (R$)
                </label>
                <Input
                  id="stake"
                  type="number"
                  min={0}
                  step={0.01}
                  value={stake || ""}
                  onChange={(e) => handleInputChange(e, setStake)}
                  placeholder="Ex: 50"
                  className="border-gray-300 dark:border-gray-700 focus:ring-fedora-blue focus:border-fedora-blue dark:focus:ring-fedora-accent dark:focus:border-fedora-accent"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="backOdds"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Odd Back (Decimal)
                </label>
                <Input
                  id="backOdds"
                  type="number"
                  min={1}
                  step={0.01}
                  value={backOdds || ""}
                  onChange={(e) => handleInputChange(e, setBackOdds)}
                  placeholder="Ex: 5.0"
                  className="border-gray-300 dark:border-gray-700 focus:ring-fedora-blue focus:border-fedora-blue dark:focus:ring-fedora-accent dark:focus:border-fedora-accent"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="layOdds"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Odd Lay (Decimal)
                </label>
                <Input
                  id="layOdds"
                  type="number"
                  min={1}
                  step={0.01}
                  value={layOdds || ""}
                  onChange={(e) => handleInputChange(e, setLayOdds)}
                  placeholder="Ex: 5.2"
                  className="border-gray-300 dark:border-gray-700 focus:ring-fedora-blue focus:border-fedora-blue dark:focus:ring-fedora-accent dark:focus:border-fedora-accent"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="commission"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Comissão da Exchange (%)
                </label>
                <Input
                  id="commission"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={commission || ""}
                  onChange={(e) => handleInputChange(e, setCommission)}
                  placeholder="Ex: 2"
                  className="border-gray-300 dark:border-gray-700 focus:ring-fedora-blue focus:border-fedora-blue dark:focus:ring-fedora-accent dark:focus:border-fedora-accent"
                />
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={resetCalculator}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Limpar
                </button>
                <div className="flex items-center space-x-2 ml-auto">
                  {isValidCalculation && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {isValidCalculation ? "Cálculo automático ativo" : "Preencha os campos"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg overflow-hidden h-full">
            <div className="absolute top-0 h-1 left-0 right-0 bg-gradient-to-r from-fedora-accent to-fedora-blue"></div>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div 
                        className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <p className="text-sm text-muted-foreground">Lay Stake</p>
                        <p className="text-2xl font-bold text-fedora-blue dark:text-fedora-accent">
                          {formatCurrency(result.layStake)}
                        </p>
                      </motion.div>
                      <motion.div 
                        className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <p className="text-sm text-muted-foreground">
                          Responsabilidade
                        </p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {formatCurrency(result.liability)}
                        </p>
                      </motion.div>
                    </div>

                    <motion.div 
                      className="pt-6 mt-6 border-t"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div 
                        className="rounded-lg bg-green-50 dark:bg-green-900/20 p-6 border border-green-200 dark:border-green-800"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <p className="text-sm text-muted-foreground mb-2">
                          Lucro Garantido
                        </p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(result.profit)}
                        </p>
                        <div className="mt-2 flex items-center space-x-2">
                          <div className="h-1 bg-green-500 rounded-full" style={{ width: `${Math.min(result.extraction, 100)}%` }}></div>
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            {result.extraction.toFixed(1)}% de extração
                          </span>
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center py-16 px-4 text-center"
                  >
                    <motion.div 
                      className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CalculatorIcon className="h-10 w-10 text-gray-400" />
                    </motion.div>
                    <p className="text-muted-foreground">
                      Os resultados aparecerão automaticamente
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Preencha os campos para começar
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}