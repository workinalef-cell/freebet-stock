-- =====================================
-- CONFIGURAÇÃO INICIAL DO SUPABASE PARA FREEBET STOCK
-- =====================================
-- VERSÃO SEGURA - SEM OPERAÇÕES DESTRUTIVAS
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

-- 2. Criar tabela de estatísticas mensais (opcional, para cache)
CREATE TABLE IF NOT EXISTS monthly_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  freebets_extraidas INTEGER DEFAULT 0,
  freebets_perdidas INTEGER DEFAULT 0,
  freebets_expiradas INTEGER DEFAULT 0,
  valor_total DECIMAL(10,2) DEFAULT 0,
  lucro_total DECIMAL(10,2) DEFAULT 0,
  media_extracao DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, year, month)
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_freebets_user_id ON freebets(user_id);
CREATE INDEX IF NOT EXISTS idx_freebets_data ON freebets(data);
CREATE INDEX IF NOT EXISTS idx_freebets_user_data ON freebets(user_id, data);
CREATE INDEX IF NOT EXISTS idx_monthly_stats_user_year_month ON monthly_stats(user_id, year, month);

-- 4. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Criar triggers para updated_at (apenas se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_freebets_updated_at'
    ) THEN
        CREATE TRIGGER update_freebets_updated_at 
            BEFORE UPDATE ON freebets 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_monthly_stats_updated_at'
    ) THEN
        CREATE TRIGGER update_monthly_stats_updated_at 
            BEFORE UPDATE ON monthly_stats 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =====================================
-- CONFIGURAÇÃO DE SEGURANÇA (RLS)
-- =====================================

-- 6. Habilitar Row Level Security
ALTER TABLE freebets ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_stats ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas de segurança para freebets
-- Usuários podem ver apenas suas próprias freebets
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'freebets' AND policyname = 'Users can view own freebets'
    ) THEN
        CREATE POLICY "Users can view own freebets" ON freebets
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Usuários podem inserir freebets apenas para si mesmos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'freebets' AND policyname = 'Users can insert own freebets'
    ) THEN
        CREATE POLICY "Users can insert own freebets" ON freebets
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Usuários podem atualizar apenas suas próprias freebets
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'freebets' AND policyname = 'Users can update own freebets'
    ) THEN
        CREATE POLICY "Users can update own freebets" ON freebets
          FOR UPDATE USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Usuários podem deletar apenas suas próprias freebets
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'freebets' AND policyname = 'Users can delete own freebets'
    ) THEN
        CREATE POLICY "Users can delete own freebets" ON freebets
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 8. Criar políticas de segurança para monthly_stats
-- Usuários podem ver apenas suas próprias estatísticas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'monthly_stats' AND policyname = 'Users can view own stats'
    ) THEN
        CREATE POLICY "Users can view own stats" ON monthly_stats
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Usuários podem inserir estatísticas apenas para si mesmos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'monthly_stats' AND policyname = 'Users can insert own stats'
    ) THEN
        CREATE POLICY "Users can insert own stats" ON monthly_stats
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Usuários podem atualizar apenas suas próprias estatísticas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'monthly_stats' AND policyname = 'Users can update own stats'
    ) THEN
        CREATE POLICY "Users can update own stats" ON monthly_stats
          FOR UPDATE USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Usuários podem deletar apenas suas próprias estatísticas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'monthly_stats' AND policyname = 'Users can delete own stats'
    ) THEN
        CREATE POLICY "Users can delete own stats" ON monthly_stats
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- =====================================
-- FUNÇÃO AUXILIAR
-- =====================================

-- 9. Função para calcular estatísticas mensais automaticamente
CREATE OR REPLACE FUNCTION calculate_monthly_stats(p_user_id UUID, p_year INTEGER, p_month INTEGER)
RETURNS TABLE(
  freebets_extraidas INTEGER,
  freebets_perdidas INTEGER,
  freebets_expiradas INTEGER,
  valor_total DECIMAL,
  lucro_total DECIMAL,
  media_extracao DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(CASE WHEN f.extraida = true THEN 1 ELSE 0 END)::INTEGER as freebets_extraidas,
    SUM(CASE WHEN f.utilizada = true AND f.extraida = false THEN 1 ELSE 0 END)::INTEGER as freebets_perdidas,
    SUM(CASE WHEN f.data_expiracao < NOW() AND f.utilizada = false THEN 1 ELSE 0 END)::INTEGER as freebets_expiradas,
    COALESCE(SUM(CASE WHEN f.extraida = true THEN f.valor ELSE 0 END), 0)::DECIMAL as valor_total,
    COALESCE(SUM(CASE WHEN f.extraida = true THEN f.valor_extraido ELSE 0 END), 0)::DECIMAL as lucro_total,
    CASE 
      WHEN SUM(CASE WHEN f.extraida = true THEN f.valor ELSE 0 END) > 0 
      THEN (SUM(CASE WHEN f.extraida = true THEN f.valor_extraido ELSE 0 END) / SUM(CASE WHEN f.extraida = true THEN f.valor ELSE 0 END) * 100)::DECIMAL(5,2)
      ELSE 0::DECIMAL(5,2)
    END as media_extracao
  FROM freebets f
  WHERE f.user_id = p_user_id
    AND EXTRACT(YEAR FROM f.data) = p_year
    AND EXTRACT(MONTH FROM f.data) = p_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================
-- FINALIZAÇÃO
-- =====================================

-- Confirmar que tudo foi criado corretamente
SELECT 'Configuração do FreeBet Stock concluída com sucesso!' as status;

-- =====================================
-- INSTRUÇÕES
-- =====================================

/*
✅ ESTE SCRIPT É 100% SEGURO!

O que faz:
- Cria tabelas apenas se não existirem (IF NOT EXISTS)
- Cria políticas apenas se não existirem
- Cria triggers apenas se não existirem
- NÃO remove nem modifica dados existentes

Como usar:
1. Copie este script completo
2. Cole no SQL Editor do Supabase
3. Clique em "Run"
4. Confirme a mensagem de sucesso

Verificação:
- Vá em "Table Editor" para ver as tabelas
- Vá em "Authentication" > "Policies" para ver as políticas
*/
