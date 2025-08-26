-- Schema para o FreeBet Stock no Supabase

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de freebets
CREATE TABLE IF NOT EXISTS freebets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  casa TEXT NOT NULL,
  valor NUMERIC(10, 2) NOT NULL,
  odd_minima NUMERIC(10, 2) NOT NULL,
  situacao TEXT NOT NULL,
  data DATE NOT NULL,
  data_expiracao DATE,
  utilizada BOOLEAN NOT NULL DEFAULT false,
  extraida BOOLEAN NOT NULL DEFAULT false,
  valor_extraido NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações do usuário
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  comissao_padrao NUMERIC(5, 2) DEFAULT 2.0,
  tema TEXT DEFAULT 'system',
  notificacoes BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp na tabela freebets
CREATE TRIGGER update_freebets_updated_at
BEFORE UPDATE ON freebets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar o timestamp na tabela user_settings
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Configurar políticas de segurança (RLS)
ALTER TABLE freebets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela freebets
CREATE POLICY freebets_select_policy ON freebets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY freebets_insert_policy ON freebets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY freebets_update_policy ON freebets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY freebets_delete_policy ON freebets
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para tabela user_settings
CREATE POLICY user_settings_select_policy ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_settings_insert_policy ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_settings_update_policy ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Função para criar configurações padrão para novos usuários
CREATE OR REPLACE FUNCTION create_default_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar configurações padrão para novos usuários
CREATE TRIGGER create_default_settings_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_default_settings();

-- Índices para melhorar a performance
CREATE INDEX IF NOT EXISTS freebets_user_id_idx ON freebets (user_id);
CREATE INDEX IF NOT EXISTS freebets_data_idx ON freebets (data);
CREATE INDEX IF NOT EXISTS freebets_extraida_idx ON freebets (extraida);
