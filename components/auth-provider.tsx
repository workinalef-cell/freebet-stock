"use client";

import { HydrationErrorFix } from '@/components/hydration-error-fix';
import { AuthContent } from '@/components/auth-content';

// Wrapper que usa o AuthContent para renderizar o conteúdo baseado no estado de autenticação
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <HydrationErrorFix>
      <AuthContent>{children}</AuthContent>
    </HydrationErrorFix>
  );
}