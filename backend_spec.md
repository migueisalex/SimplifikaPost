# Especificação Técnica do Backend - Simplifika Post

**Versão:** 1.1
**Data:** 19 de Julho de 2024

## 1. Visão Geral e Arquitetura

Este documento descreve a arquitetura e a funcionalidade do backend para o aplicativo Simplifika Post. O backend será responsável por toda a lógica de negócio, autenticação, gerenciamento de dados e integração com serviços de terceiros (IA e Pagamentos).

- **Arquitetura:** API RESTful.
- **Stack Sugerida:**
    - **Linguagem/Framework:** Node.js com TypeScript e Express.js.
    - **Banco de Dados:** PostgreSQL (pela sua robustez e integridade relacional) ou MongoDB (pela flexibilidade com documentos). A especificação assume um modelo relacional.
    - **Autenticação:** JWT (JSON Web Tokens).
    - **Hashing de Senhas:** bcrypt.
    - **Armazenamento de Mídia:** Serviço de armazenamento de objetos compatível com S3 (ex: AWS S3, Google Cloud Storage, DigitalOcean Spaces).
- **Princípios:**
    - **Segurança em Primeiro Lugar:** Nenhuma lógica de negócio crítica (contagem de uso, permissões) deve residir no front-end. O backend é a autoridade final.
    - **Escalabilidade:** A arquitetura deve prever o aumento do número de usuários e de dados armazenados.
    - **Integridade dos Dados:** Validações rigorosas e transações de banco de dados devem garantir a consistência dos dados.

## 2. Modelos de Dados (Schema do Banco de Dados)

### Tabela: `users`
- `id`: UUID (Chave Primária)
- `fullName`: String
- `email`: String (Único, Indexado)
- `passwordHash`: String
- `birthDate`: Date
- `role`: Enum (`user`, `admin`, `financeiro`) - Default: `user`
- `status`: Enum (`Ativo`, `Inadimplente`, `Bloqueado`) - Default: `Ativo`
- `geminiApiKey`: String (Criptografado) - Nulável
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Tabela: `subscriptions`
- `id`: UUID (Chave Primária)
- `userId`: UUID (Chave Estrangeira para `users.id`)
- `packageTier`: Integer (0: Freemium, 1: Pacote 1, etc.)
- `hasAiAddon`: Boolean
- `status`: Enum (`Active`, `Canceled`, `Defaulted`)
- `currentPeriodEnd`: Timestamp (Data de renovação ou expiração)
- `paymentGatewaySubscriptionId`: String (ID da assinatura no gateway de pagamento)

### Tabela: `usage_trackers`
- `id`: UUID (Chave Primária)
- `userId`: UUID (Chave Estrangeira para `users.id`)
- `period`: String (Formato: "YYYY-MM", ex: "2024-07")
- `postCount`: Integer
- `aiTextCount`: Integer
- `aiImageCount`: Integer
- **Nota:** Deve haver uma restrição única para (`userId`, `period`).

### Tabela: `posts`
- `id`: UUID (Chave Primária)
- `userId`: UUID (Chave Estrangeira para `users.id`)
- `content`: Text
- `platforms`: Array de Strings (ex: `['Instagram', 'Facebook']`)
- `scheduledAt`: Timestamp
- `status`: Enum (`scheduled`, `published`, `inativo_por_downgrade`)
- `postType`: Enum (`Post`, `Story`, `Reels`)
- `createdAt`: Timestamp

### Tabela: `media_items`
- `id`: UUID (Chave Primária)
- `postId`: UUID (Chave Estrangeira para `posts.id`)
- `storageUrl`: String (URL do arquivo no serviço de armazenamento de objetos)
- `mimeType`: String (ex: `image/jpeg`, `video/mp4`)
- `aspectRatio`: Float
- `edits`: JSONB (Objeto com edições de brilho, contraste, etc.)

### Tabela: `hashtag_groups`
- `id`: UUID (Chave Primária)
- `userId`: UUID (Chave Estrangeira para `users.id`)
- `name`: String
- `hashtags`: Text

### Tabela: `staff_members`
- `id`: UUID (Chave Primária)
- `email`: String (Único, Indexado)
- `passwordHash`: String
- `role`: Enum (`admin`, `financeiro`)

### Tabela: `audit_logs`
- `id`: UUID (Chave Primária)
- `staffMemberId`: UUID (Chave Estrangeira para `staff_members.id`)
- `actionType`: String (ex: `CLIENT_PLAN_CHANGED`, `PAYMENT_REMINDER_SENT`)
- `targetUserId`: UUID (Chave Estrangeira para `users.id`, se aplicável)
- `details`: JSONB (Objeto contendo: `{ "before": {...}, "after": {...} }`)
- `ipAddress`: String
- `createdAt`: Timestamp

## 3. Lógica de Negócio Detalhada

### 3.1. Assinaturas e Pagamentos

- **Inadimplência (Lógica Crítica):**
    1. **Gatilho:** O gateway de pagamento informa (via webhook) uma falha na renovação da assinatura.
    2. **Ação Imediata:**
        - O status do usuário em `users.status` é alterado para `Inadimplente`.
        - A assinatura em `subscriptions.status` é alterada para `Defaulted`.
        - O `packageTier` do usuário é efetivamente tratado como `0` (Freemium) para todas as verificações de permissão, independentemente do que está no banco de dados.
    3. **Experiência do Usuário:** Ao fazer login, a API retorna o status `Inadimplente`. O front-end deve forçar o redirecionamento para a página de pagamento. O usuário pode usar o sistema com os limites do Freemium por 30 dias.
    4. **Bloqueio Automático:** Uma tarefa agendada (cron job) rodará diariamente. Se um usuário estiver com status `Inadimplente` por mais de 30 dias, seu status em `users.status` será alterado para `Bloqueado`.
    5. **Acesso Bloqueado:** Para usuários com status `Bloqueado`, a API de login deve permitir a autenticação, mas todos os outros endpoints (exceto os de pagamento) devem retornar erro `403 Forbidden`.

- **Downgrade Voluntário para Freemium:**
    1. **Gatilho:** O usuário solicita o downgrade através de um endpoint da API.
    2. **Ação:**
        - A API localiza todos os posts futuros (`status` = `scheduled`) do usuário.
        - Os 5 primeiros posts em ordem cronológica são mantidos como `scheduled`.
        - O status dos posts restantes é alterado para `inativo_por_downgrade`.
        - O backend dispara um e-mail notificando o usuário sobre a desativação dos posts excedentes.
    3. **Limpeza Automática:** O cron job diário também deve excluir permanentemente todos os posts com status `inativo_por_downgrade` que foram criados há mais de 30 dias. Um e-mail de aviso pode ser enviado 7 dias antes da exclusão.

### 3.2. Rastreamento de Uso (Usage Tracker)

- A tabela `usage_trackers` é a fonte da verdade.
- Antes de executar qualquer ação limitada (criar post, gerar texto/imagem com IA), a API deve:
    1. Verificar o plano do usuário. Se não for Freemium, permitir a ação.
    2. Se for Freemium, consultar a tabela `usage_trackers` para o `userId` e o período atual ("YYYY-MM").
    3. Comparar o `postCount`, `aiTextCount` ou `aiImageCount` com os limites definidos.
    4. Se o limite foi atingido, retornar um erro `402 Payment Required` com uma mensagem clara.
    5. Se permitido, executar a ação e, na mesma transação, incrementar o contador correspondente.
- **Reset de Limites:** Um cron job deve rodar no primeiro dia de cada mês. Ele não precisa apagar registros antigos, apenas garantir que as novas contagens comecem do zero para o novo mês.

### 3.3. Otimização de Dados

- Um cron job diário deve executar as seguintes tarefas de limpeza:
    1. **Posts Antigos:** Excluir todos os posts com `status` = `published` onde `scheduledAt` for mais antigo que 90 dias.
    2. **Mídia Órfã:** Ao excluir um post, o backend deve também deletar todos os arquivos de mídia associados do serviço de armazenamento de objetos.

### 3.4. Integração com IA (Gemini)

- O front-end nunca chamará a API do Gemini diretamente.
- Será criado um endpoint de proxy, ex: `POST /api/ai/generate-text`.
- **Lógica do Endpoint:**
    1. Recebe o prompt e o tipo de tarefa do front-end.
    2. Verifica as permissões de IA do usuário (via `usage_trackers` se Freemium).
    3. Determina qual chave de API usar:
        - Se o usuário for do plano Pro e tiver uma chave cadastrada (`users.geminiApiKey`), usar essa chave.
        - Caso contrário, usar a chave de API principal do sistema, armazenada como uma variável de ambiente no backend.
    4. Faz a chamada para a API do Gemini.
    5. Retorna a resposta para o front-end.
    6. Se a ação foi bem-sucedida, incrementa o contador de uso de IA (se aplicável).

### 3.5. Logs e Auditoria

- **Logs de Acesso da Equipe:** Um middleware deve interceptar os logins da equipe (admin/financeiro) e registrar o `staffMemberId`, `loginTime` e `ipAddress` na tabela `audit_logs` com o tipo `STAFF_LOGIN`. O mesmo para logout.
- **Logs de Auditoria de Ações Críticas:** Para ações como alterar o plano de um cliente, um registro detalhado deve ser criado na tabela `audit_logs`. O campo `details` deve conter o estado do objeto antes e depois da alteração. Ex:
  ```json
  {
    "actionType": "CLIENT_PLAN_CHANGED",
    "details": {
      "before": { "packageTier": 3, "hasAiAddon": true },
      "after": { "packageTier": 1, "hasAiAddon": false }
    }
  }
  ```

## 4. Especificação dos Endpoints da API

- **URL Base:** `/api`
- **Autenticação:** Todos os endpoints, exceto `/auth/*`, devem exigir um `Authorization: Bearer <token>` no header.

---
### Recurso: Auth

- **POST `/auth/register`**
    - **Descrição:** Registra um novo usuário.
    - **Body:** `{ email, password, subscriptionData, paymentData }`
    - **Lógica:** Cria o usuário, subscription e paymentData. Dispara o e-mail de verificação (código fixo `123456` para simulação).
    - **Resposta:** `201 Created` - `{ message: "Verification code sent." }`
- **POST `/auth/verify-email`**
    - **Descrição:** Verifica o código do e-mail.
    - **Body:** `{ email, code }`
    - **Lógica:** Se o código for válido, ativa a conta do usuário.
    - **Resposta:** `200 OK` - `{ user, token, subscription }`
- **POST `/auth/login`**
    - **Descrição:** Autentica um usuário ou membro da equipe.
    - **Body:** `{ email, password }`
    - **Lógica:** Verifica as credenciais nas tabelas `users` e `staff_members`.
    - **Resposta:** `200 OK` - `{ user, token, subscription }`

---
### Recurso: Posts

- **GET `/posts`**
    - **Descrição:** Lista todos os posts do usuário autenticado.
    - **Resposta:** `200 OK` - `[Post]`
- **POST `/posts`**
    - **Descrição:** Cria um novo post.
    - **Lógica:** Antes de criar, verifica o `usage_trackers.postCount` se o usuário for Freemium.
    - **Body:** `{ content, platforms, scheduledAt, postType: Enum('Post', 'Story', 'Reels'), media: [MediaItem] }`
    - **Resposta:** `201 Created` - `Post`
- **PUT `/posts/:id`**
    - **Descrição:** Atualiza um post existente.
    - **Body:** `{ content, platforms, scheduledAt, postType: Enum('Post', 'Story', 'Reels'), media: [MediaItem] }`
    - **Resposta:** `200 OK` - `Post`
- **DELETE `/posts/:id`**
    - **Descrição:** Exclui um post.
    - **Lógica:** Também deve excluir a mídia associada do cloud storage.
    - **Resposta:** `204 No Content`
- **POST `/posts/:id/clone`**
    - **Descrição:** Clona um post existente.
    - **Lógica:** Antes de clonar, verifica o `usage_trackers.postCount` se o usuário for Freemium.
    - **Resposta:** `201 Created` - `{ newPost: Post }`

---
### Recurso: Media

- **POST `/media/upload`**
    - **Descrição:** Faz upload de um arquivo de mídia.
    - **Request:** `multipart/form-data` com o arquivo.
    - **Lógica:** Salva o arquivo no serviço de armazenamento de objetos.
    - **Resposta:** `201 Created` - `{ url, mimeType }`

---
### Recursos: AI, Users, Subscriptions etc.
(Uma lista completa de endpoints para todos os recursos (hashtags, users, subscriptions, etc.) seria criada seguindo o mesmo padrão acima, incluindo endpoints para o painel de administração com permissões de `admin` ou `financeiro`)

## 5. Variáveis de Ambiente

O backend deve ser configurado através das seguintes variáveis de ambiente:
- `PORT`: Porta da aplicação (ex: 3001)
- `DATABASE_URL`: String de conexão com o banco de dados.
- `JWT_SECRET`: Segredo para assinar os tokens JWT.
- `GEMINI_API_KEY`: Chave de API principal do Simplifika Post para o Gemini.
- `S3_BUCKET_NAME`: Nome do bucket de armazenamento.
- `S3_ACCESS_KEY_ID`: Chave de acesso do S3.
- `S3_SECRET_ACCESS_KEY`: Segredo de acesso do S3.
- `S3_ENDPOINT_URL`: Endpoint do serviço S3.
- `ENCRYPTION_KEY`: Chave para criptografar dados sensíveis como a API Key do usuário.
- `EMAIL_SERVICE_API_KEY`: Chave para o serviço de envio de e-mails (SendGrid, etc.).
