"use client";

import { useEffect, useState } from 'react';

// Este componente ajuda a evitar problemas de hidratação no Next.js
// Ele garante que o conteúdo só seja renderizado no cliente
export function HydrationErrorFix({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Enquanto não estiver montado no cliente, não renderiza nada
  // Isso evita problemas de hidratação onde o HTML do servidor
  // não corresponde ao HTML gerado no cliente
  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
}
