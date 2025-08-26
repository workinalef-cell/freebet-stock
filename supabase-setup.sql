-- =====================================
-- CONFIGURAÇÃO DO SUPABASE PARA FREEBET STOCK
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

-- 5. Criar triggers para updated_at
DROP TRIGGER IF EXISTS update_freebets_updated_at ON freebets;
CREATE TRIGGER update_freebets_updated_at 
    BEFORE UPDATE ON freebets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_monthly_stats_updated_at ON monthly_stats;
CREATE TRIGGER update_monthly_stats_updated_at 
    BEFORE UPDATE ON monthly_stats 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- CONFIGURAÇÃO DE SEGURANÇA (RLS)
-- =====================================

-- 6. Habilitar Row Level Security
ALTER TABLE freebets ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_stats ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas de segurança para freebets
-- Usuários podem ver apenas suas próprias freebets
CREATE POLICY "Users can view own freebets" ON freebets
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem inserir freebets apenas para si mesmos
CREATE POLICY "Users can insert own freebets" ON freebets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar apenas suas próprias freebets
CREATE POLICY "Users can update own freebets" ON freebets
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar apenas suas próprias freebets
CREATE POLICY "Users can delete own freebets" ON freebets
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Criar políticas de segurança para monthly_stats
-- Usuários podem ver apenas suas próprias estatísticas
CREATE POLICY "Users can view own stats" ON monthly_stats
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem inserir estatísticas apenas para si mesmos
CREATE POLICY "Users can insert own stats" ON monthly_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar apenas suas próprias estatísticas
CREATE POLICY "Users can update own stats" ON monthly_stats
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar apenas suas próprias estatísticas
CREATE POLICY "Users can delete own stats" ON monthly_stats
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================
-- FUNÇÕES AUXILIARES
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
    COUNT(*)::INTEGER FILTER (WHERE f.extraida = true) as freebets_extraidas,
    COUNT(*)::INTEGER FILTER (WHERE f.utilizada = true AND f.extraida = false) as freebets_perdidas,
    COUNT(*)::INTEGER FILTER (WHERE f.data_expiracao < NOW() AND f.utilizada = false) as freebets_expiradas,
    COALESCE(SUM(f.valor) FILTER (WHERE f.extraida = true), 0)::DECIMAL as valor_total,
    COALESCE(SUM(f.valor_extraido) FILTER (WHERE f.extraida = true), 0)::DECIMAL as lucro_total,
    CASE 
      WHEN SUM(f.valor) FILTER (WHERE f.extraida = true) > 0 
      THEN (SUM(f.valor_extraido) FILTER (WHERE f.extraida = true) / SUM(f.valor) FILTER (WHERE f.extraida = true) * 100)::DECIMAL(5,2)
      ELSE 0::DECIMAL(5,2)
    END as media_extracao
  FROM freebets f
  WHERE f.user_id = p_user_id
    AND EXTRACT(YEAR FROM f.data) = p_year
    AND EXTRACT(MONTH FROM f.data) = p_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- =====================================

-- 10. Inserir alguns dados de exemplo para teste (remover em produção)
-- INSERT INTO freebets (user_id, casa, valor, odd_minima, situacao, data, utilizada, extraida)
-- VALUES 
--   (auth.uid(), 'Bet365', 50.00, 2.50, 'Ativa', NOW() - INTERVAL '5 days', false, false),
--   (auth.uid(), 'Betfair', 25.00, 3.00, 'Utilizada', NOW() - INTERVAL '3 days', true, true),
--   (auth.uid(), 'Sportingbet', 100.00, 2.00, 'Expirada', NOW() - INTERVAL '10 days', false, false);

-- =====================================
-- INSTRUÇÕES DE USO
-- =====================================

/*
COMO EXECUTAR ESTE SCRIPT:

1. Acesse o Supabase Dashboard: https://app.supabase.com
2. Selecione seu projeto
3. Vá em "SQL Editor" no menu lateral
4. Cole este script completo
5. Clique em "Run" para executar

VERIFICAÇÃO:
- Vá em "Table Editor" para ver as tabelas criadas
- Vá em "Authentication" > "Policies" para ver as políticas de segurança

PERMISSÕES:
- Apenas usuários autenticados podem acessar seus próprios dados
- Cada usuário vê apenas suas freebets e estatísticas
- Dados são automaticamente filtrados por user_id
*/

