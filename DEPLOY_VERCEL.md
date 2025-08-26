# Deploy do FreeBet Stock na Vercel

## Pré-requisitos

1. Conta na Vercel (https://vercel.com)
2. CLI da Vercel instalada (opcional)
   ```bash
   npm i -g vercel
   ```
3. Conta no Supabase (https://supabase.com)

## Configuração do Supabase

1. Crie um novo projeto no Supabase
2. Configure a autenticação com email/senha
3. Execute o script SQL para criar as tabelas necessárias:

```sql
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

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp
CREATE TRIGGER update_freebets_updated_at
BEFORE UPDATE ON freebets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Configurar políticas de segurança (RLS)
ALTER TABLE freebets ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas suas próprias freebets
CREATE POLICY freebets_select_policy ON freebets
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários criem suas próprias freebets
CREATE POLICY freebets_insert_policy ON freebets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem apenas suas próprias freebets
CREATE POLICY freebets_update_policy ON freebets
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que usuários excluam apenas suas próprias freebets
CREATE POLICY freebets_delete_policy ON freebets
  FOR DELETE USING (auth.uid() = user_id);
```

4. Obtenha as credenciais do Supabase (URL e chave anônima)

## Configuração da Vercel

### Usando a Interface Web

1. Faça login na Vercel
2. Clique em "New Project"
3. Importe o repositório do GitHub
4. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do seu projeto Supabase
5. Clique em "Deploy"

### Usando a CLI

1. Faça login na CLI da Vercel:
   ```bash
   vercel login
   ```

2. Execute o script de deploy:
   ```bash
   ./deploy.sh
   ```

3. Depois que o script terminar, execute:
   ```bash
   vercel --prod
   ```

4. Configure as variáveis de ambiente quando solicitado:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do seu projeto Supabase

## Verificação Pós-deploy

1. Acesse a URL fornecida pela Vercel
2. Verifique se a autenticação está funcionando
3. Verifique se os dados estão sendo salvos e carregados corretamente
4. Verifique se o PWA pode ser instalado
5. Verifique se o refresh token está funcionando corretamente

## Solução de Problemas

### Erro: "useAuth deve ser usado dentro de um AuthProvider"

Se você encontrar este erro, verifique:

1. Se o arquivo `lib/auth-context.tsx` está configurado corretamente
2. Se o `AuthProvider` está importado corretamente no `app/layout.tsx`
3. Se o `AuthContent` está sendo usado corretamente dentro do `AuthProvider`

### Erro: "Erro ao verificar sessão"

Se você encontrar este erro, verifique:

1. Se as variáveis de ambiente estão configuradas corretamente
2. Se o cliente Supabase está configurado corretamente
3. Se as políticas de segurança estão configuradas corretamente no Supabase
