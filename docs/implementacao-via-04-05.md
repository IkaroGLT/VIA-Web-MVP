# VIA — Documentação de Implementação VIA-04 e VIA-05

**Projeto:** VIA Web MVP  
**Versão:** 1.0  
**Responsável técnico:** Ikaro Guilherme  
**Issues:** VIA-04 e VIA-05
**Data:** 19/11/2026

---

# 1. Objetivo

Documentar a implementação da captura de imagens e da integração com a API Gemini.

O objetivo é permitir que a equipe compreenda o funcionamento do sistema e consiga continuar seu desenvolvimento.

# 2. VIA-04 — Captura de imagens

## 2.1. Objetivo

Permitir que o usuário utilize a câmera do dispositivo ou selecione uma fotografia existente.

## 2.2. Tecnologias

- React
- TypeScript
- MediaDevices API
- Canvas API
- File API

## 2.3. Componente

Arquivo:

`frontend/web/src/components/CameraCapture.tsx`

Responsabilidades:

- Solicitar acesso à câmera.
- Exibir a pré-visualização.
- Capturar fotografias.
- Encerrar a câmera.
- Selecionar imagens existentes.
- Converter imagens para JPEG.
- Reduzir dimensões e tamanho.
- Disponibilizar o arquivo ao componente pai.

## 2.4. Parâmetros

| Parâmetro          | Valor                     |
| ------------------ | ------------------------- |
| Formato            | JPEG                      |
| Dimensão máxima    | 1024 px                   |
| Tamanho máximo     | 2 MiB                     |
| Origem alternativa | Arquivo local             |
| Fonte da câmera    | Preferência pela traseira |

## 2.5. Segurança

- Permissão explícita.
- Captura sob demanda.
- Encerramento das trilhas de vídeo.
- Liberação de URLs temporárias.
- Ausência de armazenamento permanente.
- Ausência de envio automático.

# 3. VIA-05 — Integração Gemini

## 3.1. Objetivo

Receber uma fotografia, encaminhá-la ao Gemini e devolver uma descrição em português brasileiro.

## 3.2. Tecnologias

- Node.js
- TypeScript
- Vercel Functions
- Google GenAI SDK
- Gemini API
- Upstash Redis

## 3.3. Endpoint

`POST /api/describe`

## 3.4. Fluxo

1. Recebimento da imagem.
2. Verificação da origem.
3. Verificação do método.
4. Controle de requisições.
5. Validação do JSON.
6. Validação do Base64.
7. Verificação da assinatura JPEG.
8. Verificação do tamanho.
9. Comunicação com Gemini.
10. Normalização da descrição.
11. Retorno ao frontend.

## 3.5. Modelo

Variável:

`GEMINI_MODEL`

Valor inicial:

`gemini-3.8-flash`

A substituição do modelo não deverá exigir alterações no frontend.

# 4. Estrutura de arquivos

## Backend

| Arquivo                 | Responsabilidade        |
| ----------------------- | ----------------------- |
| api/describe.ts         | Endpoint HTTP           |
| src/gemini.ts           | Comunicação com Gemini  |
| src/image-validation.ts | Validação de imagens    |
| src/rate-limit.ts       | Controle de requisições |
| .env.example            | Exemplo de configuração |
| package.json            | Dependências            |
| tsconfig.json           | Configuração TypeScript |
| vercel.json             | Configuração da função  |

## Frontend

| Arquivo                        | Responsabilidade         |
| ------------------------------ | ------------------------ |
| components/CameraCapture.tsx   | Captura de imagens       |
| components/CameraCapture.css   | Estilos da câmera        |
| services/descriptionService.ts | Comunicação com backend  |
| App.tsx                        | Integração da interface  |
| App.css                        | Estilos principais       |
| index.css                      | Estilos globais          |
| vite.config.ts                 | Proxy de desenvolvimento |

# 5. Variáveis de ambiente

## Backend

- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `FRONTEND_ORIGIN`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Frontend

- `VITE_API_BASE_URL`

Nenhuma credencial deverá ser adicionada ao frontend.

# 6. Execução local

## Backend

A partir da raiz do projeto:

```powershell
cd backend
npm install
```

Criar `.env.local` a partir de `.env.example` e configurar as variáveis.

Vincular o projeto à Vercel, quando necessário:

```powershell
npx vercel login
npx vercel link
```

Iniciar o servidor local:

```powershell
npx vercel dev --listen 3000
```

Servidor esperado:

`http://localhost:3000`

## Frontend

Em outro terminal, a partir da raiz do projeto:

```powershell
cd frontend/web
npm install
npm run dev
```

Interface esperada:

`http://localhost:5173`

O Vite encaminhará `/api` ao backend local.

# 7. Testes

## Frontend

```powershell
npm run lint
npm run build
```

## Backend

```powershell
npm run typecheck
npm test
```

## Testes funcionais

- Ativar câmera.
- Capturar fotografia.
- Selecionar arquivo.
- Enviar imagem.
- Receber descrição.
- Tratar imagem inválida.
- Tratar ausência de imagem.
- Tratar timeout.
- Tratar falha Gemini.
- Tratar limite de utilização.

# 8. Segurança

- GEMINI_API_KEY exclusivamente no servidor.
- CORS com origem definida.
- Rate limiting distribuído em produção.
- Validação de imagens.
- Limitação de tamanho.
- Timeout.
- Respostas de erro padronizadas.
- Logs sem conteúdo de imagem ou credenciais.
- HTTPS em produção.

# 9. Privacidade

A aplicação não possui armazenamento permanente das fotografias nesta implementação.

A imagem é encaminhada ao Google Gemini para análise. O tratamento externo da informação depende das políticas e condições aplicáveis ao serviço do Google.

# 10. Limitações

O MVP não executa:

- Navegação autônoma.
- Identificação contínua de obstáculos.
- Prevenção de acidentes.
- Reconhecimento facial.
- Monitoramento permanente.
- Funcionamento integralmente offline.

# 11. Integrações futuras

- VIA-06: Text-to-Speech.
- VIA-07: Speech-to-Text.
- VIA-08: integração e acessibilidade.
- VIA-09: testes de qualidade.
- VIA-10: testes com usuários.

# 12. Critério de conclusão

As Issues somente deverão ser concluídas após:

- Implementação.
- Testes.
- Revisão de segurança.
- Documentação.
- Pull Request aprovado.
- Integração à branch main.

---

**VIA — Assistente Inteligente de Acessibilidade**
