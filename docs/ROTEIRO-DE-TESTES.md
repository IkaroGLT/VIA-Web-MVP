# VIA — Roteiro de testes do app integrado

Este roteiro testa o app **completo**: a câmera e o backend do Ikaro (VIA-04 e 05) junto com a voz, os comandos e o registro (VIA-06 a 09).

**Como usar:** siga as seções na ordem, marque cada item e anote o que falhar no fim do arquivo. Para entender como as partes se ligam, veja `docs/INTEGRACAO-INTERFACE.md`.

## Situação

| Parte | Testado no celular? | Observação |
|---|---|---|
| VIA-06 Voz | ✅ Android, 17/11 | Testado só isoladamente, antes da integração |
| Integração (voz + câmera + backend) | ❌ **Não** | No PC: lint e build passam. A voz da descrição e dos erros foi testada no navegador com respostas simuladas pelo console |
| VIA-07 Comandos de voz | ❌ **Não** | O reconhecimento das frases foi testado no PC. O microfone de verdade não foi testado |
| VIA-09 Registro na planilha | ❌ **Não** | O registro aparece no console. O envio à planilha real não foi testado |

> **Câmera e microfone só funcionam em HTTPS** (ou em `localhost` no próprio PC). No celular, use o **link da Vercel**. O endereço `http://192.168...` bloqueia os dois.

---

## 0. Preparação

1. **Frontend**, na pasta `frontend/web`:
   ```bash
   npm install
   ```
   ```bash
   npm run lint
   ```
   ```bash
   npm run build
   ```
   - [ ] O lint e o build terminam sem erros.
2. **Backend**, na pasta `backend`:
   ```bash
   npm install
   ```
   ```bash
   npm test
   ```
   - [ ] Os testes passam.
3. **Rodar tudo no PC:** siga `docs/implementacao-via-04-05.md` para o backend (`.env` com a `GEMINI_API_KEY` e `npx vercel dev --listen 3000`). Depois, em `frontend/web`, rode `npm run dev`. O Vite repassa `/api` para a porta 3000.
4. **No celular:** abra o link da Vercel no Chrome do Android e aumente o volume.

---

## 1. Fluxo principal com botões (sem leitor de tela)

- [ ] **Ativar câmera:** o Chrome pede permissão e a imagem da câmera traseira aparece.
- [ ] **Capturar fotografia:** a foto aparece e o botão "Descrever imagem" é liberado.
- [ ] **Descrever imagem:** o VIA **fala** "Analisando a imagem. Aguarde." e depois **fala a descrição**. O texto também aparece no cartão "Descrição do VIA".
- [ ] A descrição começa pelos obstáculos e diz a posição (esquerda, frente). *Isso depende do prompt, que é da VIA-05.*
- [ ] Do toque em "Descrever imagem" até a voz começar: **menos de 15 s**. Confira `msAteVoz` na planilha ou no console.
- [ ] Capturar outra foto e descrever de novo funciona sem recarregar a página.

## 2. Erros falados

| Como provocar | Deve falar | OK? |
|---|---|---|
| Ativar o modo avião **depois** de capturar a foto e tocar em Descrever | "Sem conexão com a internet..." | [ ] |
| Desligar o backend (no PC) e tocar em Descrever | "Sem conexão com a internet..." | [ ] |
| Mais de 10 pedidos seguidos em 1 minuto (limite do backend, `backend/src/rate-limit.ts`) | "Muitos pedidos em pouco tempo..." | [ ] |
| Colocar uma `GEMINI_API_KEY` errada no backend | "O serviço de descrição está fora do ar..." | [ ] |
| Negar a permissão da câmera | O TalkBack lê "Acesso à câmera negado..." (essa mensagem vem do componente de câmera) | [ ] |

- [ ] A mensagem falada aparece também, escrita, no bloco vermelho de erro.

## 3. Com TalkBack ligado (o mais importante)

Ligue em *Configurações → Acessibilidade → TalkBack*. Faça o teste **sem olhar a tela**.

- [ ] Deslizando o dedo, dá para achar "Ativar câmera", "Capturar fotografia", "Descrever imagem" e "Falar um comando".
- [ ] O TalkBack anuncia "Câmera ativa..." e "Imagem preparada com sucesso".
- [ ] Ao tocar duas vezes em "Descrever imagem", o VIA fala a descrição **e o TalkBack não lê o mesmo texto por cima**.
- [ ] Os erros da descrição também são falados **uma vez só**.
- [ ] **Anote quantos gestos** foram necessários do início até ouvir a descrição. A tela tem vários elementos, e isso é informação para o Ikaro.

## 4. Comandos de voz (só no link HTTPS)

Toque em **Falar um comando**. O VIA diz "Pode falar." Fale **depois** que a frase terminar. Na primeira vez, permita o microfone.

| Diga | Deve acontecer | OK? |
|---|---|---|
| "descrever", sem foto capturada | "Ainda não há fotografia. Toque em Ativar câmera..." | [ ] |
| "descrever", com foto capturada | Faz a descrição completa (registro com `origem = voz`) | [ ] |
| "repetir" ou "fala de novo" | Repete a última descrição | [ ] |
| "repetir", antes de qualquer descrição | "Ainda não há descrição para repetir." | [ ] |
| "ajuda" | Explica o passo a passo e o aviso "a IA pode errar" | [ ] |
| "bom dia" (qualquer outra coisa) | "Não entendi. Os comandos são..." | [ ] |
| (ficar calado) | Em até ~8 s: "Não ouvi nenhum comando..." | [ ] |
| Negar o microfone | "O VIA não tem permissão para usar o microfone..." | [ ] |

- [ ] Tocar em **Falar um comando enquanto o VIA fala** cala a fala na hora. Isso substitui dizer "parar".
- [ ] O app não "ouve a si mesmo" (o "Pode falar" não vira comando).
- [ ] Repetir num lugar com barulho, simulando o Demo Day.

**Para aceitar outras formas de falar:** acrescente palavras na lista `PALAVRAS`, em `src/services/comandos.ts`.

## 5. Registro na planilha (VIA-09)

### 5.1 Instalar (uma vez)

1. Crie uma planilha no Google Drive. Abra **Extensões → Apps Script**, cole todo o `ferramentas/planilha/registro.gs` e salve.
2. Clique em **Implantar → Nova implantação**. Tipo: **App da Web**, executar como **Eu**, acesso: **Qualquer pessoa**. Autorize quando o Google pedir.
3. Copie a URL que termina em `/exec`. Coloque-a como `VITE_URL_PLANILHA`:
   - no PC, no arquivo `frontend/web/.env.local` (o git já ignora);
   - na **Vercel**, em *Settings → Environment Variables* do projeto do **frontend*. Depois, faça um novo deploy.

> A URL não é segredo: ela só permite adicionar linhas, e o script bloqueia fórmulas. Se alguém fizer spam, crie uma nova implantação, que gera outra URL.

### 5.2 Testar

- [ ] Abra o app com `?participante=TESTE` no fim do endereço e faça uma descrição.
- [ ] Apareceu a aba **Registros**, com uma linha: `participante = TESTE`, `origem = toque`, `resultado = sucesso`, `faladaAteOFim = TRUE`.
- [ ] Um erro provocado (modo avião) gera uma linha com `resultado = SEM_INTERNET`.
- [ ] Com `?participante=Joao Silva` (com espaço), o app grava `sem-id`, o que impede gravar nomes.

### 5.3 Colunas

| Coluna | Significado |
|---|---|
| `msAteVoz` | Do toque em "Descrever imagem" (ou do comando) até a **voz da descrição** começar. **Meta: ≤ 15000** |
| `msIA` | Tempo do backend e do Gemini |
| `faladaAteOFim` | `TRUE` = sucesso (descrição ouvida até o fim) |
| `simulado` | Sempre `FALSE` agora (o modo simulado foi removido na integração) |
| `versao` | Mude `VERSAO_APP` em `src/services/registro.ts` entre as rodadas |

## 6. Segurança e desempenho

- [ ] `git status` não mostra nenhum `.env` nem `.env.local` para commit.
- [ ] Depois do build do frontend, a chave **não** aparece no resultado:
  ```bash
  grep -r "AIza" frontend/web/dist
  ```
- [ ] Faça 10 pedidos no 4G e no Wi-Fi. Quantos ficaram com `msAteVoz` abaixo de 15000? Qual é a média de `msIA`?
- [ ] Use o app 20 vezes seguidas: não trava nem fica mudo.

## 7. Pendências e decisões

- [ ] **Termo de consentimento:** deve citar que as fotos (Gemini) e o áudio dos comandos (reconhecimento do Chrome) são processados pelo Google.
- [ ] **Para o Ikaro avaliar com os testes:**
  - O fluxo com botões exige vários gestos (ativar, capturar, descrever). Se os testes mostrarem dificuldade, um botão "Tirar foto e descrever" resolveria.
  - Sem TalkBack, os estados da câmera não são falados.
- [ ] **O nome do modelo** `gemini-3.8-flash` (padrão do backend) precisa ser conferido na documentação do Gemini.

---

## Registro de problemas encontrados

| Data | Seção | O que aconteceu | Celular / versão do Android |
|---|---|---|---|
| | | | |
