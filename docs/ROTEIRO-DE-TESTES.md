# VIA — Roteiro de testes (branch `VIA-06-tts`)

Este roteiro cobre as issues do **segundo integrante** (VIA-06 a VIA-10). Ele é atualizado a cada etapa.

**Como usar:** depois de subir a branch, siga as seções na ordem, marque cada item e anote o que falhar no fim do arquivo.

> **Atualização de 20/11: a tela de teste foi removida do PR.** A interface é da equipe de interface. Este PR entrega só a **lógica**, empacotada no hook `useVia` (ver `docs/INTEGRACAO-INTERFACE.md`). As seções 1, 2 e 4 abaixo só podem ser feitas **depois que a tela for ligada ao hook**, com os botões "Descrever o que está à frente" e "Falar um comando". A tela `?teste-voz` citada na seção 1 não existe mais.

## Situação de cada etapa

| Issue | Etapa | Testado no celular? | Testado no PC? |
|---|---|---|---|
| VIA-06 | Voz (síntese de fala) | ✅ **Sim**, Android, 17/11 (tela `?teste-voz`) | ✅ |
| VIA-08 | Fluxo principal e acessibilidade | ❌ **Não** | ✅ Chrome, sem TalkBack |
| VIA-09 | Registro na planilha | ❌ **Não** | ⚠️ Só o registro no console. O envio à planilha real não foi testado |
| VIA-07 | Comandos de voz | ❌ **Não** | ⚠️ Só o reconhecimento das frases e a mensagem de microfone negado. O microfone de verdade não foi testado |
| VIA-10 | Roteiro de teste com usuários | — (é documento) | — |

> **Atenção:** a câmera (VIA-04) e o backend/Gemini (VIA-05) são do Ikaro. Até eles entrarem na `main`, o app usa **câmera e backend simulados**: a "foto" é falsa e a descrição é sempre a mesma frase de exemplo. A seção 6 explica como trocar para o real.

> **Microfone e câmera só funcionam em HTTPS.** No endereço `http://192.168...` do Wi-Fi, a voz de resposta funciona, mas os **comandos de voz (seção 4) e a câmera real só podem ser testados no link da Vercel**.

## Arquivos desta branch

| Arquivo | Issue | O que faz |
|---|---|---|
| `frontend/web/src/services/voz.ts` | VIA-06 | Fala os textos, informa se a fala terminou e quando começou |
| `frontend/web/src/services/mensagens.ts` | VIA-06 | **Todas as frases faladas**. Edite aqui entre as rodadas |
| `frontend/web/src/types/erros.ts` | VIA-06 | Códigos de erro (copiados do contrato da API) |
| `frontend/web/src/hooks/useVia.ts` | VIA-08 e 07 | **Toda a lógica pronta para a interface:** `descrever()` e `comandoDeVoz()` |
| `docs/INTEGRACAO-INTERFACE.md` | VIA-08 | Como ligar a tela ao hook, com as regras de acessibilidade |
| `frontend/web/src/services/fluxo.ts` | VIA-08 | Toque → foto → IA → voz, e monta o registro |
| `frontend/web/src/services/api.ts` | VIA-08 | Chama `POST /api/describe` (contrato). Tem o modo simulado |
| `frontend/web/src/services/camera.ts` | VIA-04 (encaixe) | **Simulado.** O Ikaro substitui o conteúdo |
| `frontend/web/src/services/registro.ts` | VIA-09 | Envia cada pedido para a planilha |
| `ferramentas/planilha/registro.gs` | VIA-09 | Código que roda **dentro** da planilha (Apps Script) |
| `frontend/web/src/services/comandos.ts` | VIA-07 | Reconhece descrever, repetir, ajuda e parar |
| `docs/ROTEIRO-TESTE-USUARIOS.md` | VIA-10 | Roteiro da sessão de teste com pessoas cegas |

---

## 0. Preparação

1. Na pasta `frontend/web`, rode:
   ```bash
   npm install
   ```
   ```bash
   npm run lint
   ```
   ```bash
   npm run build
   ```
   - [ ] O lint termina sem erros.
   - [ ] O build termina sem erros.
2. Com o celular e o PC **no mesmo Wi-Fi**, rode:
   ```bash
   npm run dev -- --host
   ```
3. No Chrome do Android, abra o endereço **Network** que aparece no terminal (ex.: `http://192.168.0.10:5173`).
4. Aumente o volume do celular.

---

## 1. VIA-06 — Voz ✅ (já testado em 17/11)

Endereço: `.../?teste-voz`

- [x] A voz está em português do Brasil.
- [x] Cada botão fala sua frase.
- [x] "Parar fala" corta na hora.
- [x] Aparece "Terminou: sim" no fim de cada frase.
- [ ] **Novo, não testado:** ouvir as frases "Comando: ..." (VIA-07) e a "Ajuda", que foi reescrita.

**Para reajustar depois:** as frases ficam em `src/services/mensagens.ts` e a velocidade em `VELOCIDADE_FALA`, no `src/services/voz.ts`.

---

## 2. VIA-08 — Fluxo principal e acessibilidade ❌ (não testado)

### 2.1 Sem leitor de tela

Endereço: `.../` (sem nada no fim)

- [ ] A tela tem **duas áreas**: em cima (grande, preta) "VIA / Toque para descrever", e embaixo (faixa amarela) "🎤 Falar um comando".
- [ ] **1º toque** (em qualquer área): fala o aviso de boas-vindas ("...podem conter erros. Não use o VIA para se locomover sozinho.").
- [ ] **2º toque, na área de cima:** fala "Tirando a foto", "Analisando a imagem" e depois a descrição de exemplo.
- [ ] Tocar várias vezes na área de cima enquanto analisa **não** começa outro pedido.
- [ ] Tocar na **faixa amarela durante a descrição** cala o app.
- [ ] Depois da descrição, o texto volta para "Toque para descrever".
- [ ] Recarregar a página na mesma aba **não** repete o aviso. Uma aba nova repete.

### 2.2 Erros falados (simulados)

Abra cada endereço numa **aba nova**. O 1º toque fala o aviso, e o 2º (na área de cima) deve falar o erro.

| Endereço | Deve falar | OK? |
|---|---|---|
| `.../?erro=CAMERA_NEGADA` | "O VIA não tem permissão para usar a câmera..." | [ ] |
| `.../?erro=CAMERA_INDISPONIVEL` | "Não foi possível abrir a câmera..." | [ ] |
| `.../?erro=SEM_INTERNET` | "Sem conexão com a internet..." | [ ] |
| `.../?erro=AI_UNAVAILABLE` | "O serviço de descrição está fora do ar..." | [ ] |
| `.../?erro=AI_TIMEOUT` | "A descrição demorou demais..." | [ ] |
| `.../?erro=RATE_LIMIT_EXCEEDED` | "Muitos pedidos em pouco tempo..." | [ ] |
| `.../?erro=QUALQUER_COISA` | "Ocorreu um erro inesperado..." | [ ] |

### 2.3 Com TalkBack ligado (o mais importante)

Ligue em *Configurações → Acessibilidade → TalkBack*. Faça o teste **sem olhar a tela**.

- [ ] Deslizar o dedo para a direita ou a esquerda alterna entre "Descrever o que está à frente, botão" e "Falar um comando, botão".
- [ ] O **toque duplo** em "Descrever" ativa o VIA.
- [ ] O TalkBack **não** fala por cima de "Tirando a foto", "Analisando" ou da descrição.
- [ ] O TalkBack **não** lê "Descrevendo..." nem os outros textos da tela (eles são só para quem enxerga).
- [ ] Dá para repetir o pedido várias vezes seguidas sem travar.

**Se o TalkBack falar por cima:** anote em qual momento. O ajuste fica em `src/App.tsx`.

---

## 3. VIA-09 — Registro na planilha ❌ (não testado)

Cada pedido gera **uma linha** na planilha, sem foto e sem dados pessoais.

### 3.1 Instalar a planilha (uma vez só)

1. No Google Drive, crie uma planilha nova, por exemplo "VIA — Registros de teste".
2. Na planilha, abra **Extensões → Apps Script**.
3. Apague o que estiver lá e cole todo o conteúdo de `ferramentas/planilha/registro.gs`. Salve.
4. Clique em **Implantar → Nova implantação**:
   - Tipo: **App da Web**.
   - Executar como: **Eu**.
   - Quem pode acessar: **Qualquer pessoa**. É necessário, porque o app não faz login.
5. Autorize o acesso quando o Google pedir.
6. Copie a **URL do app da Web** (termina em `/exec`).
7. **No PC:** crie o arquivo `frontend/web/.env.local` com a linha abaixo. O `.gitignore` já ignora esse arquivo.
   ```
   VITE_URL_PLANILHA=https://script.google.com/macros/s/.../exec
   ```
8. **Na Vercel:** em *Settings → Environment Variables*, crie `VITE_URL_PLANILHA` com a mesma URL e faça um novo deploy.

> A URL **não é segredo**, porque vai para o navegador. Ela só permite **adicionar** linhas. O script corta textos longos e bloqueia fórmulas. Se alguém fizer spam na planilha, basta criar uma nova implantação, que gera outra URL.

### 3.2 Testar

1. Reinicie o `npm run dev -- --host`, porque ele só lê o `.env.local` ao iniciar.
2. Abra `.../?participante=TESTE` e faça um pedido completo.
- [ ] Apareceu a aba **Registros** na planilha, com o cabeçalho.
- [ ] Apareceu uma linha com `participante = TESTE`, `origem = toque`, `resultado = sucesso`, `simulado = TRUE` e `versao = rodada-1`.
- [ ] Com `.../?participante=TESTE&erro=AI_TIMEOUT`, a linha mostra `resultado = AI_TIMEOUT`.
- [ ] Com `?participante=Joao Silva` (com espaço), o app grava `sem-id`. Isso impede gravar nomes.

### 3.3 Como ler a planilha no relatório

| Coluna | Significado |
|---|---|
| `msAteVoz` | Tempo do toque até a **voz da descrição** começar. **Meta: até 15000 (15 s)** |
| `msIA` | Tempo gasto pelo backend e pela IA |
| `faladaAteOFim` | `TRUE` = sucesso (descrição ouvida até o fim) |
| `simulado` | `TRUE` = backend falso. **Ignore essas linhas no relatório** |
| `versao` | Mude `VERSAO_APP` em `src/services/registro.ts` entre as rodadas (`rodada-1`, `rodada-2`) |

---

## 4. VIA-07 — Comandos de voz ❌ (não testado) — **só no link HTTPS da Vercel**

1. Toque na **faixa amarela**. O app diz "Pode falar." Fale **depois** que a frase terminar.
2. Na primeira vez, o Chrome pede permissão do microfone. Toque em **Permitir**.

| Diga | Deve acontecer | OK? |
|---|---|---|
| "descrever" ou "o que tem na frente" | Faz uma descrição completa (registro com `origem = voz`) | [ ] |
| "repetir" ou "fala de novo" | Repete a última descrição | [ ] |
| "repetir", antes de qualquer descrição | "Ainda não há descrição para repetir..." | [ ] |
| "ajuda" | Explica como usar | [ ] |
| "parar" | Silêncio | [ ] |
| "bom dia" (qualquer outra coisa) | "Não entendi. Os comandos são..." | [ ] |
| (ficar calado) | Em até ~8 s: "Não ouvi nenhum comando..." | [ ] |
| Negar o microfone | "O VIA não tem permissão para usar o microfone..." | [ ] |

- [ ] O app **não** "ouve a si mesmo", ou seja, não reconhece o "Pode falar" como comando.
- [ ] Com o **TalkBack ligado**, o comando funciona. O TalkBack fala "Falar um comando" ao focar; espere o "Pode falar".
- [ ] Repetir os testes num lugar com barulho (simulando o Demo Day).

**Para aceitar outras formas de falar:** acrescente palavras na lista `PALAVRAS` em `src/services/comandos.ts`.

---

## 5. VIA-09 — Checagens técnicas, de segurança e de desempenho

### 5.1 Segurança (dá para fazer no PC agora)

- [ ] Rode `git status`: **nenhum** `.env` ou `.env.local` aparece para commit.
- [ ] Depois do `npm run build`, procure a chave do Gemini no resultado. **Não pode haver nenhum resultado:**
  ```bash
  grep -r "AIza" frontend/web/dist
  ```
- [ ] Não existe nenhuma variável `VITE_GEMINI...` no projeto (regra do contrato):
  ```bash
  grep -rn "VITE_GEMINI" frontend/web/src
  ```
- [ ] As fotos não são guardadas: o app não usa `localStorage` nem `IndexedDB` para imagens, e o registro não contém foto.

### 5.2 Desempenho (com backend e câmera reais, no link da Vercel)

- [ ] Faça **10 pedidos** com boa internet e confira na planilha: quantos ficaram com `msAteVoz` abaixo de 15000?
- [ ] Repita 5 pedidos usando os **dados móveis (4G)**.
- [ ] Anote a média de `msIA`. Se a IA for a parte mais lenta, avise o Ikaro (VIA-05).

### 5.3 Robustez

- [ ] **Modo avião** depois de abrir o app: com o backend real, deve falar "Sem conexão com a internet...".
- [ ] Bloquear a tela no meio da descrição e desbloquear: o app volta a funcionar no próximo toque.
- [ ] Usar o app 20 vezes seguidas: não trava nem fica mudo.

---

## 6. Trocar o simulado pelo real (quando a VIA-04 e a VIA-05 entrarem)

1. **Backend:** em `src/services/api.ts`, mude `USAR_SIMULADO = true` para `false`.
2. **Câmera:** a VIA-04 substitui o conteúdo de `capturarFoto()` em `src/services/camera.ts`, **mantendo**:
   - o retorno `{ ok: true, imagemBase64 }`, em JPEG e sem o prefixo `data:`;
   - os erros `CAMERA_NEGADA` e `CAMERA_INDISPONIVEL`.
3. **Teste real:** a câmera só funciona em **HTTPS**. Por isso, o teste com câmera de verdade precisa ser feito no link da Vercel.
4. Refaça as seções 2.1, 2.3, 4 e 5.2 com fotos reais.

---

## 7. Pendências e decisões a confirmar

- [ ] **Termo de consentimento** (fica com o Cauã). Ele precisa citar:
  - que as fotos são enviadas ao Google (Gemini);
  - que o áudio dos comandos de voz é processado pelo Google (reconhecimento do Chrome).
  Os dois pontos ainda precisam ser confirmados nos termos atuais do Google.
- [ ] **Conferir com o Ikaro:**
  - a assinatura de `capturarFoto()`;
  - que o app fala as frases de `mensagens.ts` e não a `message` que o backend envia;
  - o tempo limite de 15 s no `api.ts`.
- [ ] **Limitações aceitas no MVP:**
  - Se o pedido acontecer sem internet, o registro se perde.
  - Tocar em "parar" durante o "Analisando" cala o aviso, mas a descrição ainda é falada quando chegar.
- [ ] **Arquivos do template do Vite** que não são mais usados: `src/App.css` e `src/assets/`. Podem ser apagados.

---

## Registro de problemas encontrados

| Data | Seção | O que aconteceu | Celular / versão do Android |
|---|---|---|---|
| | | | |
