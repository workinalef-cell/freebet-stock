"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { PageHeader } from "@/components/page-header";
import { motion, AnimatePresence } from "framer-motion";
import { getSettings, saveSettings, UserSettings } from "@/lib/storage";
import { 
  Cog6ToothIcon,
  SunIcon, 
  MoonIcon,
  CheckIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const [commission, setCommission] = useState<number>(2);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(500);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(theme === "dark");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Carregar configurações salvas ao montar o componente
  useEffect(() => {
    const settings = getSettings();
    setCommission(settings.commission);
    setMonthlyGoal(settings.monthlyGoal);
    setIsDarkMode(settings.theme === 'dark');
  }, []);

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    setTheme(checked ? "dark" : "light");
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Salvar configurações usando a função utilitária
    const newSettings: UserSettings = {
      commission,
      monthlyGoal,
      theme: isDarkMode ? 'dark' : 'light'
    };
    saveSettings(newSettings);
    
    setIsSaving(false);
    setShowSuccess(true);
    
    // Esconder mensagem de sucesso após 3 segundos
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Personalize suas preferências e defina metas"
        icon={<Cog6ToothIcon className="w-6 h-6" />}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="absolute top-0 h-1 left-0 right-0 bg-gradient-to-r from-fedora-blue to-fedora-accent"></div>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">Tema Escuro</h3>
                  <p className="text-sm text-muted-foreground">
                    Alterne entre tema claro e escuro
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <SunIcon className={`h-5 w-5 ${!isDarkMode ? 'text-yellow-500' : 'text-gray-400'}`} />
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={handleThemeChange}
                  />
                  <MoonIcon className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-gray-400'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="absolute top-0 h-1 left-0 right-0 bg-gradient-to-r from-fedora-blue to-fedora-accent"></div>
            <CardHeader>
              <CardTitle>Valores Padrão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="commission"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Comissão Padrão (%)
                </label>
                <div className="flex space-x-2">
                  <Input
                    id="commission"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={commission}
                    onChange={(e) =>
                      setCommission(parseFloat(e.target.value) || 0)
                    }
                    className="border-gray-300 dark:border-gray-700 focus:ring-fedora-blue focus:border-fedora-blue"
                  />
                  <Button
                    onClick={() => setCommission(2)}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    Redefinir
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Comissão aplicada pela exchange em todos os cálculos
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="monthlyGoal"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Meta Mensal (R$)
                </label>
                <div className="flex space-x-2">
                  <Input
                    id="monthlyGoal"
                    type="number"
                    min={0}
                    step={50}
                    value={monthlyGoal}
                    onChange={(e) =>
                      setMonthlyGoal(parseFloat(e.target.value) || 0)
                    }
                    className="border-gray-300 dark:border-gray-700 focus:ring-fedora-blue focus:border-fedora-blue"
                  />
                  <Button
                    onClick={() => setMonthlyGoal(500)}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    Redefinir
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sua meta mensal de lucro com extração de freebets
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="absolute top-0 h-1 left-0 right-0 bg-gradient-to-r from-fedora-blue to-fedora-accent"></div>
            <CardHeader>
              <CardTitle>Suporte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="flex flex-col items-center text-center p-8 rounded-lg bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-fedora-blue/30 dark:hover:border-fedora-accent/30 hover:shadow-md transition-all max-w-sm">
                  <div className="w-16 h-16 rounded-full bg-fedora-blue/10 dark:bg-fedora-blue/20 flex items-center justify-center mb-4">
                    <ClockIcon className="h-8 w-8 text-fedora-blue dark:text-fedora-accent" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Suporte</h3>
                  <p className="text-sm text-muted-foreground">
                    Disponível das 9h às 19h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end mt-4 relative">
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="absolute right-32 top-1/2 transform -translate-y-1/2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg flex items-center space-x-2 border border-green-200 dark:border-green-700"
            >
              <CheckIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Configurações salvas!</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 bg-fedora-blue hover:bg-fedora-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Salvando...</span>
            </div>
          ) : (
            "Salvar Configurações"
          )}
        </Button>
      </div>
    </div>
  );
}