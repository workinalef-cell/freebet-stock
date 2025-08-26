-- =====================================
-- VERIFICAÇÃO E CORREÇÃO DO SUPABASE
-- =====================================
-- Execute este script para verificar o estado atual
-- =====================================

-- 1. Verificar se as tabelas foram criadas
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('freebets', 'monthly_stats');

-- 2. Verificar se as políticas RLS estão ativas
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('freebets', 'monthly_stats');

-- 3. Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('freebets', 'monthly_stats');

-- 4. Verificar índices criados
SELECT 
  indexname,
  tablename
FROM pg_indexes 
WHERE tablename IN ('freebets', 'monthly_stats')
  AND schemaname = 'public';

-- 5. Verificar funções criadas
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name LIKE '%monthly_stats%';

-- =====================================
-- RESULTADO ESPERADO
-- =====================================

/*
✅ Se você executou o script anterior, deve ver:

TABELAS:
- freebets (table)
- monthly_stats (table)

RLS:
- freebets: rls_enabled = true
- monthly_stats: rls_enabled = true

POLÍTICAS:
- Users can view own freebets (SELECT)
- Users can insert own freebets (INSERT)
- Users can update own freebets (UPDATE)
- Users can delete own freebets (DELETE)
- (mesmas para monthly_stats)

ÍNDICES:
- idx_freebets_user_id
- idx_freebets_data
- idx_freebets_user_data
- idx_monthly_stats_user_year_month

FUNÇÕES:
- calculate_monthly_stats (pode ter dado erro)

📋 PRÓXIMOS PASSOS:
- Se tudo estiver OK: Não precisa executar nada mais!
- Se a função deu erro: Execute o script simples para corrigir
*/
