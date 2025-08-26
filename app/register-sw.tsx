"use client";

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(
          function(registration) {
            console.log('Service Worker registrado com sucesso:', registration.scope);
          },
          function(err) {
            console.log('Falha ao registrar Service Worker:', err);
          }
        );
      });
    }
  }, []);

  return null;
}
