#!/bin/bash

# Script para facilitar o deploy do FreeBet Stock na Vercel

echo "🚀 Preparando o FreeBet Stock para deploy na Vercel..."

# Limpar cache e arquivos temporários
echo "🧹 Limpando cache e arquivos temporários..."
rm -rf .next
rm -rf node_modules/.cache

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Executar lint
echo "🔍 Verificando código com ESLint..."
npm run lint

# Executar build
echo "🏗️ Construindo aplicação..."
npm run build

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
  echo "✅ Build concluído com sucesso!"
  echo "🌐 Pronto para deploy na Vercel!"
  echo ""
  echo "Para fazer o deploy, execute:"
  echo "vercel --prod"
  echo ""
  echo "Para fazer o deploy em ambiente de desenvolvimento, execute:"
  echo "vercel"
else
  echo "❌ Erro durante o build. Corrija os erros e tente novamente."
  exit 1
fi
