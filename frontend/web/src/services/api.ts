/**
 * Comunicação do celular com o backend (VIA-08).
 *
 * Segue o contrato docs/contrato-api.md:
 *   POST /api/describe  { imageBase64, mimeType: "image/jpeg" }
 *   200 -> { description }
 *   erro -> { error: { code, message } }
 *
 * A função NUNCA lança exceção: sempre devolve { ok: true, ... } ou { ok: false, codigo }.
 * Assim, quem chama só precisa transformar o código numa frase falada.
 *
 * MODO SIMULADO: enquanto o backend da VIA-05 não existe, USAR_SIMULADO = true
 * faz esta função devolver uma descrição de exemplo. Para simular um erro do
 * backend, abra o app com ?erro=AI_TIMEOUT (ou qualquer código do contrato) no endereço.
 */

import type { CodigoErro } from '../types/erros'

const ENDPOINT = '/api/describe'

/**
 * Tempo máximo que o celular espera o backend. A meta do projeto é a voz começar
 * em até 15 s; acima disso a resposta já não é útil, então desistimos e avisamos.
 */
const TEMPO_LIMITE_MS = 15_000

/** MUDAR PARA false quando o backend da VIA-05 estiver na main. */
export const USAR_SIMULADO = true

export type ResultadoDescricao =
  | { ok: true; descricao: string }
  | { ok: false; codigo: CodigoErro }

export async function descreverImagem(imagemBase64: string): Promise<ResultadoDescricao> {
  if (USAR_SIMULADO) return simular()

  // Sem internet: nem tenta, avisa na hora.
  if (!navigator.onLine) return { ok: false, codigo: 'SEM_INTERNET' }

  // AbortController permite cancelar o pedido quando passa do tempo limite.
  const controle = new AbortController()
  const relogio = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS)

  try {
    const resposta = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: imagemBase64, mimeType: 'image/jpeg' }),
      signal: controle.signal,
    })

    const corpo = await resposta.json().catch(() => null)

    if (resposta.ok && typeof corpo?.description === 'string' && corpo.description.trim()) {
      return { ok: true, descricao: corpo.description.trim() }
    }

    // Erro no formato do contrato: usamos o código. Se o formato vier estranho, erro genérico.
    const codigo = corpo?.error?.code
    return { ok: false, codigo: typeof codigo === 'string' ? (codigo as CodigoErro) : 'INTERNAL_ERROR' }
  } catch (erro) {
    if (controle.signal.aborted) return { ok: false, codigo: 'AI_TIMEOUT' }
    // fetch só lança exceção quando a rede falha (sem internet, servidor inalcançável).
    console.warn('Falha de rede ao chamar o backend:', erro)
    return { ok: false, codigo: 'SEM_INTERNET' }
  } finally {
    clearTimeout(relogio)
  }
}

/** Resposta falsa, no mesmo formato do backend real. */
async function simular(): Promise<ResultadoDescricao> {
  await new Promise((r) => setTimeout(r, 2000)) // imita o tempo da IA
  const erroSimulado = new URLSearchParams(window.location.search).get('erro')
  if (erroSimulado && !erroSimulado.startsWith('CAMERA')) {
    return { ok: false, codigo: erroSimulado as CodigoErro }
  }
  return {
    ok: true,
    descricao:
      'À frente, a cerca de dois passos, há um degrau para baixo. ' +
      'À esquerda, uma pessoa está parada perto de uma porta. ' +
      'Esta é uma descrição simulada.',
  }
}
