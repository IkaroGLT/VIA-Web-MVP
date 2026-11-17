# VIA — Contrato Técnico da API

**Projeto:** VIA — MVP Web
**Versão do contrato:** 1.0 — Proposta inicial
**Status:** Definido para implementação
**Responsável:** Ikaro Guilherme
**Issue:** VIA-03 — Arquitetura e Setup
**Implementação:** VIA-05 — Integração com Gemini API
**Data:** 17/11/2026

---

## 1. Objetivo

Este documento estabelece o contrato técnico de comunicação entre o frontend e o backend do VIA.

O VIA é uma solução de acessibilidade que utiliza inteligência artificial para produzir descrições textuais e faladas de imagens capturadas pelo usuário.

O contrato define:

- Como o frontend enviará imagens ao backend.
- Como o backend realizará a comunicação com o Gemini.
- Como as respostas serão estruturadas.
- Quais validações serão obrigatórias.
- Como erros serão tratados.
- Quais medidas de segurança deverão ser implementadas.

O objetivo é garantir que diferentes integrantes possam desenvolver componentes independentes mantendo a compatibilidade entre eles.

---

## 2. Arquitetura

O sistema será composto por três elementos principais.

### 2.1 Frontend

**Tecnologias:** React, TypeScript e Vite.

Responsabilidades:

1. Apresentar a interface acessível.
2. Solicitar permissão para utilizar a câmera.
3. Capturar uma fotografia.
4. Converter a imagem para o formato exigido.
5. Enviar a imagem ao backend.
6. Receber e apresentar a descrição.
7. Encaminhar a descrição para o mecanismo de síntese de voz.
8. Informar erros e estados da operação.

O frontend não poderá acessar diretamente a chave privada do Gemini.

### 2.2 Backend

**Tecnologia:** Node.js, utilizando funções serverless.

Responsabilidades:

1. Receber requisições do frontend.
2. Verificar o método HTTP.
3. Validar os dados recebidos.
4. Validar o tipo e o tamanho da imagem.
5. Aplicar controles de segurança e consumo.
6. Encaminhar a solicitação à API Gemini.
7. Processar a resposta.
8. Retornar um resultado padronizado ao frontend.
9. Tratar falhas sem expor informações sensíveis.

### 2.3 Inteligência Artificial

**Serviço:** Gemini API, disponibilizada pelo Google AI Studio.

Responsabilidades:

- Interpretar o conteúdo visual fornecido.
- Identificar elementos visíveis.
- Produzir descrições em português brasileiro.
- Informar incertezas quando o conteúdo não puder ser identificado adequadamente.

A IA não deverá afirmar que uma imagem é segura para locomoção.

---

## 3. Fluxo de comunicação

1. O usuário solicita a descrição de uma imagem.
2. O frontend obtém uma fotografia capturada com autorização.
3. A fotografia é convertida para JPEG e codificada em Base64.
4. O frontend envia uma requisição ao backend.
5. O backend valida a requisição.
6. O backend solicita a análise ao Gemini.
7. O Gemini retorna uma descrição.
8. O backend normaliza a resposta.
9. O frontend apresenta a descrição.
10. O mecanismo Text-to-Speech reproduz o conteúdo em voz.

A requisição deverá ocorrer somente após uma ação do usuário.

---

# 4. Endpoint principal

## 4.1 Descrever imagem

**Método HTTP:** `POST`

**Endpoint:**

`/api/describe`

**Content-Type:**

`application/json`

### Finalidade

Receber uma imagem capturada pelo usuário e retornar uma descrição textual produzida por inteligência artificial.

---

## 4.2 Estrutura da requisição

```json
{
  "imageBase64": "CONTEUDO_BASE64_DA_IMAGEM",
  "mimeType": "image/jpeg"
}
```

### Campos

| Campo         | Tipo   | Obrigatório | Descrição                               |
| ------------- | ------ | ----------- | --------------------------------------- |
| `imageBase64` | string | Sim         | Conteúdo da imagem codificado em Base64 |
| `mimeType`    | string | Sim         | Tipo MIME da imagem enviada             |

### Regras

1. A imagem deverá estar codificada em Base64.
2. O conteúdo não deverá incluir o prefixo `data:image/jpeg;base64,`.
3. O MVP aceitará inicialmente somente imagens JPEG.
4. O tamanho máximo proposto será de 2 MiB após a decodificação.
5. A imagem não poderá estar vazia.
6. O backend deverá rejeitar dados inválidos.
7. O backend deverá validar o conteúdo real do arquivo, não apenas a informação declarada em `mimeType`.
8. A imagem deverá ser processada temporariamente, sem armazenamento permanente.

---

## 4.3 Resposta de sucesso

**Status HTTP:** `200 OK`

```json
{
  "description": "A imagem mostra uma mesa com um notebook aberto, uma garrafa de água e duas cadeiras."
}
```

### Campos

| Campo         | Tipo   | Descrição                           |
| ------------- | ------ | ----------------------------------- |
| `description` | string | Descrição textual produzida pela IA |

### Requisitos da descrição

A resposta deverá:

- Estar em português brasileiro.
- Utilizar linguagem clara e objetiva.
- Priorizar os elementos mais relevantes.
- Evitar informações não observáveis.
- Informar incertezas quando necessário.
- Ser adequada à reprodução por voz.
- Evitar textos excessivamente longos.
- Não oferecer garantias de segurança física.

---

# 5. Tratamento de erros

Todos os erros deverão utilizar a mesma estrutura JSON.

## 5.1 Formato padrão

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem compreensível para o usuário."
  }
}
```

## 5.2 Códigos previstos

| HTTP | Código                   | Situação                          |
| ---- | ------------------------ | --------------------------------- |
| 400  | `INVALID_REQUEST`        | Requisição inválida ou incompleta |
| 400  | `INVALID_IMAGE`          | Conteúdo de imagem inválido       |
| 405  | `METHOD_NOT_ALLOWED`     | Método HTTP não permitido         |
| 413  | `IMAGE_TOO_LARGE`        | Imagem acima do limite            |
| 415  | `UNSUPPORTED_MEDIA_TYPE` | Formato de imagem não permitido   |
| 429  | `RATE_LIMIT_EXCEEDED`    | Limite de requisições atingido    |
| 503  | `AI_UNAVAILABLE`         | Serviço de IA indisponível        |
| 504  | `AI_TIMEOUT`             | Tempo de resposta excedido        |
| 500  | `INTERNAL_ERROR`         | Falha interna não prevista        |

### Exemplo: imagem inválida

```json
{
  "error": {
    "code": "INVALID_IMAGE",
    "message": "Não foi possível analisar a imagem. Tente tirar outra fotografia."
  }
}
```

### Exemplo: serviço indisponível

```json
{
  "error": {
    "code": "AI_UNAVAILABLE",
    "message": "O serviço de descrição está temporariamente indisponível. Tente novamente."
  }
}
```

### Exemplo: limite de requisições

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Muitas solicitações foram realizadas. Aguarde um momento antes de tentar novamente."
  }
}
```

### Regras

- Não retornar mensagens internas do provedor de IA diretamente ao usuário.
- Não incluir chaves, tokens ou credenciais nas respostas.
- Não retornar rastreamentos internos de exceções.
- Permitir que o frontend identifique o erro pelo campo `code`.
- Apresentar mensagens acessíveis, inclusive por leitores de tela.

---

# 6. Segurança

## 6.1 Proteção da chave de API

A chave Gemini deverá ser armazenada exclusivamente no ambiente do servidor.

Nome da variável:

`GEMINI_API_KEY`

É proibido:

- Adicionar a chave ao GitHub.
- Incluir a chave no frontend.
- Utilizar `VITE_GEMINI_API_KEY`.
- Inserir credenciais em arquivos públicos.
- Compartilhar a chave em logs ou capturas de tela.
- Enviar a chave por mensagens entre integrantes.

O backend deverá carregar a chave por variável de ambiente.

O arquivo `.env.example` poderá conter somente o nome da variável, sem valor real.

## 6.2 Validação de entrada

Antes de enviar uma imagem ao Gemini, o backend deverá:

- Validar o método HTTP.
- Verificar o `Content-Type`.
- Validar os campos obrigatórios.
- Limitar o tamanho da requisição.
- Validar a codificação Base64.
- Verificar a assinatura do arquivo JPEG.
- Rejeitar formatos não autorizados.
- Rejeitar entradas inesperadas.

## 6.3 Prevenção contra abuso

A implementação deverá considerar:

- Limitação de requisições por origem de acesso.
- Proteção contra requisições excessivas.
- Monitoramento de consumo da API Gemini.
- Definição de cotas e limites no provedor, quando disponíveis.
- Restrição de acesso à demonstração, quando possível.
- Bloqueio de chamadas desnecessárias ou repetitivas.

A solução de rate limiting deverá funcionar adequadamente no ambiente serverless, sem depender apenas de variáveis em memória de uma instância.

## 6.4 Comunicação segura

Em produção:

- Utilizar HTTPS.
- Evitar configurações CORS desnecessariamente permissivas
