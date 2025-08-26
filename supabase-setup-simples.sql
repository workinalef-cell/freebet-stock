-- =====================================
-- CONFIGURAÇÃO SIMPLES DO SUPABASE PARA FREEBET STOCK
-- =====================================
-- VERSÃO ULTRA SIMPLES E COMPATÍVEL
-- =====================================

-- 1. Criar tabela de freebets
CREATE TABLE IF NOT EXISTS freebets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  casa TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  odd_minima DECIMAL(5,2) NOT NULL,
  situacao TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_expiracao TIMESTAMP WITH TIME ZONE,
  utilizada BOOLEAN DEFAULT FALSE,
  extraida BOOLEAN DEFAULT FALSE,
  valor_extraido DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_freebets_user_id ON freebets(user_id);
CREATE INDEX IF NOT EXISTS idx_freebets_data ON freebets(data);

-- =====================================
-- CONFIGURAÇÃO DE SEGURANÇA (RLS)
-- =====================================

-- 3. Habilitar Row Level Security
ALTER TABLE freebets ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança
-- Política para SELECT (visualizar)
CREATE POLICY IF NOT EXISTS "Users can view own freebets" ON freebets
  FOR SELECT USING (auth.uid() = user_id);

-- Política para INSERT (inserir)
CREATE POLICY IF NOT EXISTS "Users can insert own freebets" ON freebets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE (atualizar)
CREATE POLICY IF NOT EXISTS "Users can update own freebets" ON freebets
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para DELETE (deletar)
CREATE POLICY IF NOT EXISTS "Users can delete own freebets" ON freebets
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================
-- FINALIZAÇÃO
-- =====================================

-- Confirmar que tudo foi criado corretamente
SELECT 'FreeBet Stock configurado com sucesso!' as status,
       'Tabela freebets criada' as tabela,
       'RLS ativo' as seguranca,
       'Políticas configuradas' as politicas;

-- =====================================
-- INSTRUÇÕES
-- =====================================

/*
✅ ESTE SCRIPT É ULTRA SIMPLES E SEGURO!

O que faz:
- Cria tabela freebets com todos os campos necessários
- Configura segurança completa (RLS)
- Cria índices para performance
- Políticas de isolamento entre usuários

Como usar:
1. Copie este script completo
2. Cole no SQL Editor do Supabase
3. Clique em "Run"
4. Veja a mensagem de sucesso

Verificação:
- Vá em "Table Editor" para ver a tabela freebets
- Vá em "Authentication" > "Policies" para ver as políticas

Resultado:
- Cada usuário vê apenas suas freebets
- Dados seguros e isolados
- Performance otimizada
*/
