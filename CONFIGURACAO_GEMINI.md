# Configuração da API do Gemini - SimplifikaPost

## Alterações Implementadas

Este documento descreve as alterações realizadas para integrar a API do Google Gemini de forma segura no sistema SimplifikaPost.

### Problema Identificado

O código anterior fazia chamadas **diretas** à API do Gemini no frontend, expondo a chave da API no navegador (risco crítico de segurança).

### Solução Implementada

Criamos **funções serverless** (API Routes) no Vercel que atuam como proxy entre o frontend e a API do Gemini, mantendo a chave da API segura no servidor.

---

## Arquivos Criados/Modificados

### 1. Novos Arquivos (Backend - API Routes)

#### `/api/copy-suggestions.ts`
- **Função**: Gera 3 sugestões de copy profissionais usando Gemini
- **Método**: POST
- **Body**: `{ "text": "texto original" }`
- **Resposta**: Array de `{ "title": "string", "copy": "string" }`

#### `/api/hashtag-suggestions.ts`
- **Função**: Gera 4 conjuntos de hashtags otimizadas
- **Método**: POST
- **Body**: `{ "text": "conteúdo do post" }`
- **Resposta**: `{ "suggestions": ["hashtags1", "hashtags2", ...] }`

### 2. Arquivos Modificados (Frontend)

#### `/components/SuggestionsModal.tsx`
- **Antes**: Chamava diretamente `GoogleGenAI` com `process.env.API_KEY`
- **Depois**: Faz requisição `fetch` para `/api/copy-suggestions`

#### `/components/HashtagModal.tsx`
- **Antes**: Chamava diretamente `GoogleGenAI` com `process.env.API_KEY`
- **Depois**: Faz requisição `fetch` para `/api/hashtag-suggestions`

### 3. Dependências Atualizadas

#### `/package.json`
- **Removido**: `@google/genai` (pacote não oficial)
- **Adicionado**: 
  - `@google/generative-ai` (pacote oficial do Google)
  - `@vercel/node` (tipos para funções serverless)

---

## Configuração no Vercel

### Passo 1: Adicionar Variável de Ambiente

1. Acesse o dashboard do projeto no Vercel: https://vercel.com/dashboard
2. Selecione o projeto **SimplifikaPost**
3. Vá em **Settings** → **Environment Variables**
4. Adicione a seguinte variável:

| Nome | Valor |
|------|-------|
| `GEMINI_API_KEY` | Sua chave da API do Google Gemini |

**Como obter a chave da API:**
- Acesse: https://aistudio.google.com/app/apikey
- Faça login com sua conta Google
- Clique em "Create API Key"
- Copie a chave gerada

### Passo 2: Configurar para Todos os Ambientes

Certifique-se de marcar as opções:
- ✅ Production
- ✅ Preview
- ✅ Development

### Passo 3: Fazer Redeploy

Após adicionar a variável de ambiente:
1. Vá em **Deployments**
2. Clique nos três pontos do último deployment
3. Selecione **Redeploy**

---

## Testando Localmente

### 1. Instalar Dependências

```bash
npm install
```

### 2. Criar Arquivo .env

Crie um arquivo `.env` na raiz do projeto:

```bash
GEMINI_API_KEY=sua_chave_api_aqui
```

### 3. Executar em Modo Desenvolvimento

```bash
npm run dev
```

**Nota**: Para testar as API routes localmente, você precisará usar o Vercel CLI:

```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Executar localmente com suporte a API routes
vercel dev
```

---

## Estrutura de Pastas Atualizada

```
SimplifikaPost/
├── api/                          # ← NOVO: Funções serverless
│   ├── copy-suggestions.ts       # Endpoint de sugestões de copy
│   └── hashtag-suggestions.ts    # Endpoint de sugestões de hashtags
├── components/
│   ├── SuggestionsModal.tsx      # ← MODIFICADO
│   ├── HashtagModal.tsx          # ← MODIFICADO
│   └── ...
├── .env.example                  # ← NOVO: Exemplo de configuração
├── .gitignore                    # ← MODIFICADO: Adicionado .env
├── package.json                  # ← MODIFICADO: Novas dependências
└── ...
```

---

## Segurança

### ✅ Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Chave da API** | Exposta no bundle JavaScript | Segura no servidor |
| **Chamadas** | Frontend → Gemini (direto) | Frontend → Vercel → Gemini |
| **Risco** | Qualquer pessoa pode extrair a chave | Chave protegida por variáveis de ambiente |

### 🔒 Boas Práticas Implementadas

1. ✅ API Key armazenada como variável de ambiente
2. ✅ Validação de entrada nos endpoints
3. ✅ Tratamento de erros adequado
4. ✅ Logs de erro no servidor (não expostos ao cliente)
5. ✅ Métodos HTTP restritos (apenas POST)

---

## Modelos Gemini Utilizados

Ambos os endpoints usam o modelo **`gemini-2.0-flash-exp`**:
- Modelo mais recente e rápido do Google
- Suporte a JSON estruturado (response schema)
- Otimizado para geração de texto criativo

---

## Troubleshooting

### Erro: "Configuração do servidor incompleta"
**Causa**: Variável `GEMINI_API_KEY` não está configurada no Vercel  
**Solução**: Adicione a variável nas configurações do projeto e faça redeploy

### Erro: "Método não permitido"
**Causa**: Tentativa de usar GET ao invés de POST  
**Solução**: Certifique-se de que o frontend está usando `method: 'POST'`

### Erro: "Não foi possível gerar sugestões"
**Causa**: Problema na comunicação com a API do Gemini  
**Solução**: 
1. Verifique se a chave da API é válida
2. Verifique se há quota disponível na sua conta Google
3. Consulte os logs do Vercel para mais detalhes

---

## Próximos Passos (Opcional)

### Melhorias Futuras

1. **Cache de Respostas**: Implementar cache para evitar chamadas repetidas
2. **Rate Limiting**: Adicionar limite de requisições por usuário
3. **Autenticação**: Proteger os endpoints com autenticação JWT
4. **Monitoramento**: Adicionar logs e métricas de uso da API
5. **Fallback**: Implementar respostas alternativas em caso de falha

---

## Suporte

Em caso de dúvidas ou problemas:
1. Verifique os logs do Vercel: https://vercel.com/dashboard → Seu Projeto → Logs
2. Consulte a documentação do Gemini: https://ai.google.dev/docs
3. Revise este documento de configuração

---

**Data da Implementação**: Novembro 2025  
**Versão**: 1.0
