# VIA — Como as partes se ligam (integração VIA-04/05 + VIA-06 a 09)

## Fluxo de ponta a ponta

```
[CameraCapture]  Ativar câmera → Capturar fotografia → foto JPEG ≤ 1024 px, ≤ 2 MB   (VIA-04)
      │ onImageReady(file)
      ▼
[App.tsx]  botão "Descrever imagem"  ou  comando de voz "descrever"                  (VIA-08 / VIA-07)
      │ descreverEFalar(file, origem)
      ▼
[services/fluxo.ts]  fala "Analisando" → describeImage() → fala a descrição ou o erro  (VIA-08)
      │                     │
      │                     ▼
      │      [services/descriptionService.ts]  POST /api/describe                      (VIA-05)
      │                     │
      │                     ▼
      │      [backend/api/describe.ts]  valida, aplica o limite de pedidos e chama o Gemini (VIA-05)
      ▼
[services/voz.ts]  fala em pt-BR (voz do Chrome)                                        (VIA-06)
      │ quando a fala termina
      ▼
[services/registro.ts]  envia uma linha para a planilha (Apps Script)                   (VIA-09)
```

## Quem faz o quê

| Arquivo | Responsável | Função |
|---|---|---|
| `components/CameraCapture.tsx` | Ikaro (VIA-04) | Câmera, captura e redução da foto. Anuncia os próprios estados ao TalkBack (`aria-live`) |
| `services/descriptionService.ts` | Ikaro (VIA-05) | Chama `/api/describe`. Na integração, ganhou `ErroDescricao` com o **código** do contrato |
| `backend/` | Ikaro (VIA-05) | Serverless na Vercel: validação, limite de pedidos e Gemini |
| `App.tsx` | Ikaro (interface) + integração | O visual é do Ikaro. A integração adicionou a voz, o botão "Falar um comando" e removeu o `aria-live` dos blocos que agora são falados |
| `services/fluxo.ts` | VIA-08 | Liga descrição, voz e registro |
| `services/voz.ts` e `services/mensagens.ts` | VIA-06 | Fala e **todas as frases faladas** |
| `services/comandos.ts` | VIA-07 | Reconhece descrever, repetir, ajuda e parar |
| `services/registro.ts` e `ferramentas/planilha/registro.gs` | VIA-09 | Registro de tempos na planilha |

## Regras de acessibilidade combinadas

1. **Quem fala o quê, sem repetir:**
   - **Câmera:** os estados ("Câmera ativa", "Imagem preparada", erros de câmera) são lidos pelo **TalkBack**, pelo `aria-live` do `CameraCapture`.
   - **Descrição:** "Analisando", a descrição e os erros da descrição são falados pela **voz do VIA** (`fluxo.ts`). Por isso, esses blocos **não** têm `aria-live` no `App.tsx`.
2. **Se adicionar textos novos que o VIA já fala, não use `aria-live` neles.**
3. As frases faladas citam os nomes dos botões ("Ativar câmera", "Capturar fotografia", "Descrever imagem", "Falar um comando"). **Se um botão mudar de nome, atualize `services/mensagens.ts`.**
4. O botão "Falar um comando" cala o VIA quando ele está falando.

## Limitações conhecidas

- Sem leitor de tela, os estados da câmera **não são falados**: só o TalkBack os lê. Se os testes mostrarem que isso atrapalha, dá para falar esses estados também.
- O comando "descrever" usa a foto que **já foi capturada**. Se não houver foto, o VIA explica como capturar. O comando de voz não abre a câmera sozinho.
