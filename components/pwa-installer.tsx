"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se o app já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }
    
    // Verificar para iOS (Safari)
    const nav = window.navigator as any;
    if (nav && nav.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Capturar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar quando o app é instalado
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallButton(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostrar o prompt de instalação
    deferredPrompt.prompt();

    // Esperar pela escolha do usuário
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('Usuário aceitou a instalação do PWA');
    } else {
      console.log('Usuário recusou a instalação do PWA');
    }

    // Limpar o prompt salvo
    setDeferredPrompt(null);
  };

  if (!showInstallButton || isInstalled) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 flex items-center space-x-3 border border-gray-200 dark:border-gray-700">
          <div className="bg-fedora-blue/10 dark:bg-fedora-blue/20 p-2 rounded-full">
            <div className="text-2xl font-bold text-fedora-blue">F</div>
          </div>
          <div>
            <p className="font-medium">Instalar FreeBet Stock</p>
            <p className="text-sm text-muted-foreground">Acesse mais rápido</p>
          </div>
          <Button 
            onClick={handleInstallClick}
            className="ml-2 bg-fedora-blue hover:bg-fedora-blue/90"
          >
            Instalar
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
