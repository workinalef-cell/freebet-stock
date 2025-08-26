"use client";

import { useEffect, useRef } from 'react';

// Componente temporário para gerar os ícones do PWA
export default function IconGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    
    const drawIcon = (size: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Fundo
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      
      // Círculo de fundo
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size * 0.4;
      
      // Gradiente
      const gradient = ctx.createLinearGradient(
        centerX - radius, 
        centerY - radius, 
        centerX + radius, 
        centerY + radius
      );
      gradient.addColorStop(0, '#3b82f6'); // fedora-blue
      gradient.addColorStop(1, '#60a5fa'); // fedora-accent
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Letra F
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${size * 0.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('F', centerX, centerY);
      
      // Baixar o ícone
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `icon-${size}x${size}.png`;
      link.href = dataUrl;
      link.click();
    };
    
    // Gerar todos os ícones
    sizes.forEach(size => {
      setTimeout(() => drawIcon(size), 500);
    });
  }, []);
  
  return (
    <div className="hidden">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
