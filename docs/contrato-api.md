# VIA — Contrato Técnico da API

**Projeto:** VIA — MVP Web
**Versão:** 1.1
**Status:** Contrato de implementação VIA-05
**Responsável:** Equipe VIA
**Data:** 19/11/2026

---

## 1. Objetivo

Este documento define a comunicação entre o frontend e o backend do VIA.

O sistema utiliza uma aplicação React para capturar fotografias e uma API Node.js para encaminhar imagens ao Google Gemini.

A API deverá retornar descrições em português brasileiro.

## 2. Arquitetura

### Frontend

Tecnologias:

- React
- TypeScript
- Vite
- MediaDevices API

Responsabilidades:

- Solicitar autorização da câmera.
- Capturar fotografias.
- Converter imagens para JPEG.
- Reduzir dimensões e tamanho.
- Codificar imagens em Base64.
- Enviar requisições ao backend.
- Apresentar descrições e erros.

### Backend

Tecnologias:

- Node.js
- TypeScript
- Vercel Functions
- Google GenAI SDK
- Upstash Redis

Responsabilidades:

- Receber requisições.
- Verificar origem e método.
- Aplicar rate limiting.
- Validar imagens.
- Consultar o Gemini.
- Normalizar respostas.
- Tratar falhas sem expor informações internas.

### Inteligência Artificial

Serviço: Gemini API.

Modelo inicial configurável:
`gemini-3.8-flash`

Responsabilidades:

- Interpretar imagens.
- Identificar elementos visíveis.
- Produzir descrições objetivas.
- Responder em português brasileiro.
- Informar incertezas.

A IA não deverá oferecer garantias de segurança para locomoção.

---

## 3. Fluxo de comunicação

1. Usuário solicita a captura.
2. Frontend acessa a câmera mediante autorização.
3. Imagem é capturada.
4. Imagem é convertida para JPEG.
5. Imagem é codificada em Base64.
6. Frontend envia a requisição.
7. Backend verifica origem, método e limite de utilização.
8. Backend valida a imagem.
9. Backend envia a imagem ao Gemini.
10. Gemini produz a descrição.
11. Backend devolve o resultado.
12. Frontend apresenta a descrição.

Nenhuma imagem deverá ser enviada automaticamente.

---

## 4. Endpoint

### POST /api/describe

**Content-Type:** application/json

Finalidade: receber uma imagem e retornar sua descrição.

### 4.1. Requisição

```json
{
  "imageBase64": "CONTEUDO_BASE64",
  "mimeType": "image/jpeg"
}
```

### 4.2. Campos

| Campo       | Tipo   | Obrigatório |
| ----------- | ------ | ----------- |
| imageBase64 | string | Sim         |
| mimeType    | string | Sim         |

### 4.3. Validações

- Somente JPEG.
- Imagem não vazia.
- Base64 válido.
- Assinatura JPEG verificada.
- Tamanho máximo de 2 MiB após decodificação.
- Requisição JSON limitada a 3,2 MiB.
- Dados adicionais inesperados não deverão ser utilizados.

A plataforma Vercel também possui limite próprio de payload, atualmente de 4,5 MB.

---

## 5. Resposta de sucesso

HTTP 200.

```json
{
  "description": "A imagem mostra uma mesa com um notebook aberto e uma garrafa de água."
}
```

### Requisitos

- Português brasileiro.
- Linguagem natural.
- Objetividade.
- Informações visualmente identificáveis.
- No máximo cinco frases como orientação do prompt.
- Adequação à futura reprodução por voz.
- Ausência de garantias de segurança física.

---

## 6. Tratamento de erros

Formato padrão:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem compreensível."
  }
}
```

### Códigos HTTP

| HTTP | Código                 | Descrição                        |
| ---- | ---------------------- | -------------------------------- |
| 400  | INVALID_REQUEST        | Requisição inválida              |
| 400  | INVALID_IMAGE          | Imagem inválida                  |
| 403  | ORIGIN_NOT_ALLOWED     | Origem não autorizada            |
| 405  | METHOD_NOT_ALLOWED     | Método não permitido             |
| 413  | IMAGE_TOO_LARGE        | Arquivo acima do limite          |
| 415  | UNSUPPORTED_MEDIA_TYPE | Formato não permitido            |
| 429  | RATE_LIMIT_EXCEEDED    | Limite de requisições            |
| 503  | SERVICE_UNAVAILABLE    | Serviço de controle indisponível |
| 503  | AI_UNAVAILABLE         | Gemini indisponível              |
| 504  | AI_TIMEOUT             | Tempo de resposta excedido       |
| 500  | INTERNAL_ERROR         | Erro interno                     |

Mensagens internas e credenciais nunca deverão ser retornadas.

---

## 7. Segurança

### 7.1. Credenciais

A chave Gemini deverá existir exclusivamente no backend.

Variável:
`GEMINI_API_KEY`

Proibido:

- Chaves no React.
- Chaves em arquivos públicos.
- Chaves no GitHub.
- Chaves em logs.
- Utilização de VITE_GEMINI_API_KEY.

### 7.2. Variáveis de ambiente

Backend:

- GEMINI_API_KEY
- GEMINI_MODEL
- FRONTEND_ORIGIN
- UPSTASH_REDIS_REST_URL
- UPSTASH_REDIS_REST_TOKEN

Frontend:

- VITE_API_BASE_URL

A URL pública do backend não é uma credencial.

### 7.3. Rate limiting

Limite inicial:
10 requisições por minuto por identificador de cliente.

Produção:
Upstash Redis.

Desenvolvimento:
Controle em memória, exclusivamente local.

Se o serviço Redis não estiver disponível em produção, o backend deverá interromper a operação, sem ignorar o controle de utilização.

### 7.4. CORS

A API deverá aceitar somente a origem configurada em FRONTEND_ORIGIN.

Não utilizar:

`Access-Control-Allow-Origin: *`

O CORS não substitui autenticação. Requisições externas feitas por ferramentas que não sejam navegadores ainda poderão acessar o endpoint.

Para disponibilização pública futura, será necessário avaliar autenticação e controles adicionais contra abuso.

### 7.5. Privacidade

- Não armazenar imagens permanentemente pela aplicação.
- Não registrar imagens em logs.
- Não registrar chaves.
- Processar imagens temporariamente em memória.
- Informar que a fotografia é enviada ao serviço Gemini para análise.
- Considerar as políticas de tratamento de dados do provedor.

---

## 8. Timeout

O cliente Gemini terá timeout de 25 segundos.

O frontend terá timeout de 35 segundos.

A função serverless terá duração máxima configurada de 40 segundos.

Timeout deverá retornar:

HTTP 504 — AI_TIMEOUT.

---

## 9. Hospedagem

A arquitetura prevista utiliza dois projetos Vercel conectados ao mesmo repositório.

### Frontend

Diretório raiz:
`frontend/web`

### Backend

Diretório raiz:
`backend`

O frontend deverá utilizar VITE_API_BASE_URL para localizar o backend publicado.

O backend deverá utilizar FRONTEND_ORIGIN para restringir a origem autorizada.

---

## 10. Limitações

O endpoint realiza descrição de imagens estáticas.

Não oferece:

- Detecção contínua de obstáculos.
- Navegação autônoma.
- Identificação de perigos em tempo real.
- Garantia de segurança física.
- Processamento integralmente offline.

Essas funcionalidades não fazem parte da VIA-04 ou VIA-05.

---

## 11. Próximas integrações

- VIA-06: síntese de voz.
- VIA-07: reconhecimento de comandos.
- VIA-08: integração e acessibilidade.
- VIA-09: testes técnicos.
- VIA-10: validação com usuários.

---

**Documento mantido pela equipe VIA.**
