# Checklist de Deploy do FreeBet Stock

## Pré-requisitos

- [ ] Todas as dependências estão instaladas e atualizadas
- [ ] Variáveis de ambiente configuradas corretamente
- [ ] Build local concluído com sucesso
- [ ] Testes passando (se aplicável)

## Configuração do Supabase

- [ ] Banco de dados Supabase está configurado corretamente
- [ ] Políticas de segurança RLS (Row Level Security) estão configuradas
- [ ] Chaves de API do Supabase estão configuradas como variáveis de ambiente
- [ ] Autenticação do Supabase está configurada corretamente

## Configuração da Vercel

- [ ] Projeto está configurado na Vercel
- [ ] Variáveis de ambiente estão configuradas na Vercel:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] Outras variáveis específicas do projeto

## PWA (Progressive Web App)

- [ ] Manifest.json está configurado corretamente
- [ ] Service Worker está funcionando
- [ ] Ícones estão disponíveis em todos os tamanhos necessários
- [ ] Tema e cores estão configurados corretamente

## Verificações Finais

- [ ] Navegação funciona corretamente
- [ ] Autenticação funciona corretamente
- [ ] Dados são carregados e salvos corretamente
- [ ] Interface responsiva em diferentes tamanhos de tela
- [ ] Animações e transições funcionam como esperado
- [ ] Não há erros no console do navegador

## Pós-deploy

- [ ] Verificar se a aplicação está online
- [ ] Testar autenticação em produção
- [ ] Verificar se os dados estão sendo salvos e carregados corretamente
- [ ] Verificar se o PWA pode ser instalado
- [ ] Verificar se o refresh token está funcionando corretamente

## Comandos Úteis

```bash
# Limpar cache e construir
rm -rf .next && npm run build

# Deploy para produção
vercel --prod

# Deploy para ambiente de desenvolvimento
vercel
```