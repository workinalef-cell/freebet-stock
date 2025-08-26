# 🔧 Configuração do Supabase para FreeBet Stock

## 📋 Passo a Passo

### 1. **Acessar o Supabase Dashboard**
- Acesse: https://app.supabase.com
- Faça login na sua conta
- Selecione o projeto: `psoyzfwdaeqbkfxddbyq`

### 2. **Executar o Script SQL**
- No menu lateral, clique em **"SQL Editor"**
- Abra o arquivo `supabase-setup.sql` deste projeto
- Copie todo o conteúdo do arquivo
- Cole no SQL Editor do Supabase
- Clique em **"Run"** para executar

### 3. **Verificar Criação das Tabelas**
- Vá em **"Table Editor"** no menu lateral
- Você deve ver duas tabelas criadas:
  - ✅ `freebets` - Armazena as freebets dos usuários
  - ✅ `monthly_stats` - Cache de estatísticas mensais

### 4. **Verificar Políticas de Segurança**
- Vá em **"Authentication"** > **"Policies"**
- Você deve ver as políticas RLS ativas:
  - ✅ Row Level Security habilitado
  - ✅ Usuários veem apenas seus dados
  - ✅ Isolamento total entre usuários

## 📊 Estrutura da Tabela `freebets`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `user_id` | UUID | Referência ao usuário (auth.users) |
| `casa` | TEXT | Nome da casa de apostas |
| `valor` | DECIMAL | Valor da freebet |
| `odd_minima` | DECIMAL | Odd mínima exigida |
| `situacao` | TEXT | Situação da freebet |
| `data` | TIMESTAMP | Data de criação |
| `data_expiracao` | TIMESTAMP | Data de expiração |
| `utilizada` | BOOLEAN | Se foi utilizada |
| `extraida` | BOOLEAN | Se foi extraída |
| `valor_extraido` | DECIMAL | Valor extraído |
| `created_at` | TIMESTAMP | Data de criação no DB |
| `updated_at` | TIMESTAMP | Data de atualização |

## 🔒 Segurança Implementada

### Row Level Security (RLS)
- ✅ **Isolamento Total**: Cada usuário vê apenas seus dados
- ✅ **Autenticação Obrigatória**: Apenas usuários logados acessam
- ✅ **Políticas Granulares**: SELECT, INSERT, UPDATE, DELETE controlados

### Políticas Criadas
```sql
-- Visualizar apenas próprias freebets
"Users can view own freebets"

-- Inserir freebets apenas para si mesmo
"Users can insert own freebets" 

-- Atualizar apenas próprias freebets
"Users can update own freebets"

-- Deletar apenas próprias freebets
"Users can delete own freebets"
```

## 🚀 Funcionalidades Automáticas

### 1. **Timestamps Automáticos**
- `created_at` preenchido automaticamente
- `updated_at` atualizado a cada modificação

### 2. **Índices de Performance**
- Busca rápida por usuário
- Busca rápida por data
- Queries otimizadas

### 3. **Função de Estatísticas**
```sql
-- Calcular stats automaticamente
SELECT * FROM calculate_monthly_stats(user_id, 2024, 1);
```

## 🧪 Teste da Configuração

### 1. **Verificar Conexão**
- Execute a aplicação: `npm run dev`
- Faça login na aplicação
- Tente criar uma freebet

### 2. **Verificar no Supabase**
- Vá em "Table Editor" > "freebets"
- Você deve ver a freebet criada
- Confirme que o `user_id` está correto

### 3. **Testar Isolamento**
- Crie outro usuário no Supabase
- Faça login com o novo usuário
- Confirme que não vê freebets do usuário anterior

## 📁 Migração de Dados Locais

Se você já tem dados no `localStorage`, a aplicação automaticamente:
1. Carrega dados do Supabase primeiro
2. Se não houver dados, usa localStorage como fallback
3. Oferece função de migração para mover dados locais para a nuvem

## ⚠️ Importante

### Antes do Deploy
- ✅ Execute o script SQL no Supabase
- ✅ Teste a criação de freebets
- ✅ Verifique isolamento entre usuários
- ✅ Configure variáveis de ambiente no Vercel/Netlify

### Backup
- Os dados ficam seguros no Supabase
- RLS garante que cada usuário acesse apenas seus dados
- Backup automático pelo Supabase

## 🎯 Resultado Final

Após a configuração:
- ✅ **Dados na Nuvem**: Freebets sincronizam entre dispositivos
- ✅ **Segurança Total**: Isolamento completo entre usuários  
- ✅ **Performance**: Queries otimizadas com índices
- ✅ **Escalabilidade**: Suporta milhares de usuários
- ✅ **Backup Automático**: Dados protegidos

