# VIA — Roteiro de teste com usuários (VIA-10)

**Objetivo:** verificar a hipótese do MVP.

> Uma pessoa cega ou com baixa visão consegue pedir **sozinha** a descrição do que está à frente e receber uma resposta **útil** em até **15 segundos**.

**Participantes:** de 5 a 10 pessoas cegas ou com baixa visão, por rodada.
**Duração:** cerca de 20 minutos por pessoa.
**Equipe por sessão:** 1 **facilitador** (conduz e fala) e 1 **observador** (anota e cronometra).

---

## 1. Antes da sessão (checklist da equipe)

- [ ] O app está publicado na Vercel, com câmera e backend **reais** (`USAR_SIMULADO = false`).
- [ ] A planilha de registros está funcionando (seção 3 do `ROTEIRO-DE-TESTES.md`).
- [ ] `VERSAO_APP` está certo em `src/services/registro.ts` (`rodada-1` ou `rodada-2`).
- [ ] O celular do teste está carregado, com volume alto e internet testada.
- [ ] Cada participante tem um **código anônimo** (P01, P02...). **Nunca** use o nome no link nem nas anotações.
- [ ] Os termos de consentimento estão impressos e em versão acessível, para ler em voz alta.
- [ ] Os cenários de teste estão preparados (ver tarefas).
- [ ] O app foi aberto numa **aba nova** com `?participante=P01` (trocando o código a cada pessoa).

## 2. Abertura (cerca de 3 min)

1. Apresente a equipe e o objetivo: "Estamos testando o aplicativo, não você. Não existe resposta errada."
2. **Leia o termo de consentimento** em voz alta. Ele precisa dizer:
   - que fotos e comandos de voz são processados por serviços do Google;
   - que nenhuma foto é guardada pela equipe;
   - que os dados são anônimos;
   - que a pessoa pode parar quando quiser.
3. Deixe claro: **"O VIA pode errar. Ele não serve para se locomover sozinho. Hoje, a gente vai estar sempre do seu lado."**
4. Pergunte se a pessoa usa TalkBack e se prefere testar com ele ligado ou desligado. Anote a resposta.

## 3. Tarefas

Dê a instrução **uma vez** e só ajude se a pessoa pedir ou travar por mais de 1 minuto. Se ajudar, anote **o quê** e **quando**.

| # | Tarefa (fala do facilitador) | Cenário | Sucesso quando |
|---|---|---|---|
| T1 | "Abra o VIA e ouça as instruções." | Celular entregue com o app aberto | Ouviu o aviso de boas-vindas |
| T2 | "Descubra o que tem à sua frente." | Uma mesa com objetos à frente | Ouviu a descrição até o fim |
| T3 | "Descubra se há algum obstáculo no caminho." | Uma cadeira ou caixa no corredor | A descrição citou o obstáculo e a pessoa entendeu |
| T4 | "Peça para o VIA repetir a última descrição usando a voz." | — | Usou o botão de comando e ouviu a repetição |
| T5 | "Peça ajuda ao VIA usando a voz." | — | Ouviu a explicação de uso |

## 4. Folha do observador (uma por participante)

**Participante:** `P__`  **Data:** __/__  **Rodada:** __  **TalkBack:** sim / não

| Tarefa | Concluiu? (sim / com ajuda / não) | Tempo até concluir | Onde travou / o que disse |
|---|---|---|---|
| T1 | | | |
| T2 | | | |
| T3 | | | |
| T4 | | | |
| T5 | | | |

**Dica:** o tempo técnico (`msAteVoz`) já vai sozinho para a planilha. Aqui, anote o tempo **da tarefa inteira**, contando o tempo que a pessoa leva para achar o botão.

## 5. Perguntas finais (cerca de 5 min)

Notas de **1 (péssimo) a 5 (ótimo)**:

1. Foi fácil pedir uma descrição? `1 2 3 4 5`
2. A descrição foi útil? `1 2 3 4 5`
3. O tempo de espera foi aceitável? `1 2 3 4 5`
4. As mensagens faladas (avisos e erros) foram claras? `1 2 3 4 5`
5. Você usaria o VIA no dia a dia? `1 2 3 4 5`

Perguntas abertas:
- O que mais ajudou?
- O que mais atrapalhou?
- Prefere tocar na tela ou falar um comando? Por quê?
- O que a descrição deveria dizer que não disse?

## 6. Depois de cada rodada

1. Na planilha, **filtre** `simulado = FALSE` e a `versao` da rodada.
2. Calcule:
   - **Taxa de conclusão:** tarefas concluídas sem ajuda ÷ total de tarefas.
   - **Tempo técnico:** média e máximo de `msAteVoz`, e quantos pedidos ficaram abaixo de 15000.
   - **Taxa de sucesso técnico:** linhas com `faladaAteOFim = TRUE` ÷ total.
   - **Nota média** de cada pergunta.
3. Liste os **3 maiores pontos de travamento** e decida o que muda antes da próxima rodada. Ajustes rápidos:
   - frases faladas: `src/services/mensagens.ts`;
   - palavras dos comandos: `src/services/comandos.ts`;
   - velocidade da fala: `src/services/voz.ts`;
   - texto do prompt da IA: com o Ikaro (VIA-05).
4. Mude `VERSAO_APP` para a próxima rodada.
5. Registre no relatório **o que mudou** e **por quê**. O professor pede essa evidência.

---

## 7. Demonstração no Demo Day (8 a 10 min)

**Roteiro sugerido:**
1. **Problema** (1 min): quem são os usuários e o que já existe no mercado.
2. **Demo ao vivo** (3 min):
   - Com o TalkBack ligado, mostrar um toque, a descrição de uma cena preparada (com um obstáculo), o comando "repetir" por voz e um erro falado (por exemplo, modo avião).
3. **Resultados dos testes** (2 min): taxa de conclusão, tempo médio contra a meta de 15 s, notas e o que mudou entre as rodadas.
4. **Próximos passos** (1 min): o kit com óculos, relógio, fone de condução óssea e alerta offline.
5. **Perguntas.**

**Plano B, se a internet falhar:**
- Mostrar que o app **fala o erro** com clareza. Isso também é parte da acessibilidade.
- Ter um **vídeo de backup** da demo gravado com antecedência.
- Levar o celular com **dados móveis** como alternativa ao Wi-Fi do evento.
