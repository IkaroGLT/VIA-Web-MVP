# VIA — Como ligar a interface à lógica (VIA-06 a 09)

A lógica do VIA está pronta em `frontend/web/src/hooks/useVia.ts`. A interface só precisa de **dois botões**.

```tsx
import { useVia } from './hooks/useVia'

export default function App() {
  const { descrever, comandoDeVoz, estado, ocupado } = useVia()

  return (
    <main>
      <button type="button" aria-label="Descrever o que está à frente" aria-busy={ocupado} onClick={descrever}>
        <span aria-hidden="true">{estado === 'pronto' ? 'Toque para descrever' : 'Aguarde...'}</span>
      </button>

      <button type="button" aria-label="Falar um comando" onClick={comandoDeVoz}>
        <span aria-hidden="true">Falar um comando</span>
      </button>
    </main>
  )
}
```

## O que o hook entrega

| Item | Tipo | Para quê |
|---|---|---|
| `descrever()` | função | Botão principal: foto → IA → fala a descrição |
| `comandoDeVoz()` | função | Botão de comando: "Pode falar" → escuta descrever / repetir / ajuda / parar. **Durante uma descrição, cala o app** |
| `estado` | `'pronto' \| 'aviso' \| 'descrevendo' \| 'ouvindo_comando'` | Mostrar algo para quem enxerga |
| `ocupado` | boolean | `true` enquanto qualquer tarefa roda |

O primeiro toque da sessão, em qualquer botão, fala o **aviso de boas-vindas** ("a IA pode errar..."). Os toques seguintes fazem a ação.

## Regras de acessibilidade (importantes)

1. **Poucos elementos.** O ideal é só os dois botões, grandes e de alto contraste.
2. **Não mude o `aria-label`** durante o uso. O TalkBack leria de novo, por cima da descrição.
3. **Textos visuais de estado com `aria-hidden="true"`.** O VIA já fala cada estado, e sem isso o usuário ouve tudo duas vezes.
4. **Nada de `aria-live`** para os estados, pelo mesmo motivo.
5. Botão principal **grande** (de preferência a maior parte da tela) e com `touch-action: manipulation`, para evitar o zoom do toque duplo.

## Pontos de encaixe com a VIA-04 e a VIA-05 (Ikaro)

- **Câmera:** substituir o conteúdo de `capturarFoto()` em `src/services/camera.ts`, mantendo o retorno `{ ok: true, imagemBase64 }` (JPEG, sem o prefixo `data:`) ou `{ ok: false, codigo: 'CAMERA_NEGADA' | 'CAMERA_INDISPONIVEL' }`.
- **Backend:** quando `/api/describe` estiver pronto, mudar `USAR_SIMULADO` para `false` em `src/services/api.ts`.
- **Mensagens de erro:** o app fala as frases de `src/services/mensagens.ts` com base no `error.code`. A `message` que o backend envia não é falada.
- **Tempo limite:** o app desiste depois de 15 s e fala "A descrição demorou demais...". Se o backend tiver um limite próprio, ele deve ser menor que esse.
