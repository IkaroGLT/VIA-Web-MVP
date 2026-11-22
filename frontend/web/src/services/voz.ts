/**
 * Serviço de voz do VIA (VIA-06): transforma texto em fala.
 *
 * Usa a API speechSynthesis, que já vem no navegador (no Chrome do Android
 * ela usa a voz do Google instalada no celular). Não custa nada e não precisa
 * de servidor.
 *
 * Uso básico:
 *   const resultado = await falar('Tirando a foto.')
 *   if (resultado.terminou) { ... a frase foi falada até o fim ... }
 *
 * O "terminou" é importante: no VIA, um pedido só conta como SUCESSO
 * quando a descrição foi falada até o fim (isso vai para o registro da VIA-09).
 */

/** Velocidade da fala. 1 = normal. Usuários de leitor de tela costumam preferir mais rápido; ajustar nos testes. */
export const VELOCIDADE_FALA = 1.0

/** Idioma desejado. */
const IDIOMA = 'pt-BR'

/** O que a função falar() devolve quando a fala acaba (ou é interrompida). */
export interface ResultadoFala {
  /** true = a frase foi falada até o fim. false = foi interrompida, deu erro ou travou. */
  terminou: boolean
  /** Momento (performance.now) em que a voz COMEÇOU a sair. null se nem começou. Usado para medir os 15 s. */
  inicioEm: number | null
  /** Momento (performance.now) em que a fala acabou ou falhou. */
  fimEm: number
  /** Motivo quando não terminou. Útil para o registro de testes. */
  motivo?: 'interrompida' | 'erro' | 'sem_resposta' | 'sem_suporte'
}

/** O navegador tem síntese de voz? */
export function vozDisponivel(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/**
 * Escolhe a voz em português do Brasil.
 * Se não houver pt-BR, aceita qualquer português; se não houver nenhuma, deixa o navegador decidir.
 *
 * Detalhe: no Chrome a lista de vozes carrega depois da página. Por isso
 * também chamamos esta função no evento "voiceschanged" (mais abaixo).
 */
let vozEscolhida: SpeechSynthesisVoice | null = null

function escolherVoz(): void {
  const vozes = window.speechSynthesis.getVoices()
  vozEscolhida =
    vozes.find((v) => v.lang === IDIOMA) ??
    vozes.find((v) => v.lang.replace('_', '-').toLowerCase() === 'pt-br') ??
    vozes.find((v) => v.lang.toLowerCase().startsWith('pt')) ??
    null
}

if (vozDisponivel()) {
  escolherVoz()
  window.speechSynthesis.addEventListener('voiceschanged', escolherVoz)
}

/** Nome da voz em uso (para a tela de teste e para depurar no celular). */
export function nomeDaVoz(): string {
  return vozEscolhida ? `${vozEscolhida.name} (${vozEscolhida.lang})` : 'voz padrão do navegador'
}

/**
 * Guarda a fala em andamento. Quando chamamos pararFala(), marcamos como
 * interrompida, para não confundir "parou porque o usuário pediu" com "terminou".
 */
let falaAtual: { interrompida: boolean } | null = null

/**
 * Fala um texto em voz alta.
 *
 * @param texto      o que será falado
 * @param interromper se true (padrão), corta qualquer fala anterior antes de começar.
 *                    Evita duas frases ao mesmo tempo (ex.: "analisando" e a descrição).
 * @returns uma Promise que só resolve quando a fala acaba. Nunca dá erro (reject):
 *          sempre devolve um ResultadoFala, para o app não travar por causa da voz.
 */
export function falar(texto: string, interromper = true): Promise<ResultadoFala> {
  if (!vozDisponivel()) {
    return Promise.resolve({ terminou: false, inicioEm: null, fimEm: performance.now(), motivo: 'sem_suporte' })
  }

  if (interromper) pararFala()

  return new Promise((resolve) => {
    const controle = { interrompida: false }
    falaAtual = controle

    const fala = new SpeechSynthesisUtterance(texto)
    fala.lang = IDIOMA
    fala.rate = VELOCIDADE_FALA
    if (vozEscolhida) fala.voice = vozEscolhida

    let inicioEm: number | null = null
    let resolvido = false

    // Garante que a Promise resolve uma única vez, venha o fim por onde vier.
    const finalizar = (resultado: Omit<ResultadoFala, 'inicioEm' | 'fimEm'>) => {
      if (resolvido) return
      resolvido = true
      clearTimeout(vigia)
      if (falaAtual === controle) falaAtual = null
      resolve({ ...resultado, inicioEm, fimEm: performance.now() })
    }

    fala.onstart = () => {
      inicioEm = performance.now()
    }

    fala.onend = () => {
      // O Chrome também dispara "onend" quando a fala é cancelada; por isso olhamos a marcação.
      if (controle.interrompida) finalizar({ terminou: false, motivo: 'interrompida' })
      else finalizar({ terminou: true })
    }

    fala.onerror = (evento) => {
      const foiCancelada = controle.interrompida || evento.error === 'interrupted' || evento.error === 'canceled'
      finalizar({ terminou: false, motivo: foiCancelada ? 'interrompida' : 'erro' })
    }

    // Vigia: em alguns aparelhos o navegador às vezes não avisa o fim da fala.
    // Para o app não ficar esperando para sempre, desistimos depois de um tempo
    // generoso (proporcional ao tamanho do texto).
    const tempoMaximoMs = 10_000 + texto.length * 150
    const vigia = setTimeout(() => finalizar({ terminou: false, motivo: 'sem_resposta' }), tempoMaximoMs)

    window.speechSynthesis.speak(fala)
  })
}

/** Para a fala imediatamente (comando "parar" e antes de começar uma fala nova). */
export function pararFala(): void {
  if (!vozDisponivel()) return
  if (falaAtual) falaAtual.interrompida = true
  window.speechSynthesis.cancel()
}

/** Está falando agora? */
export function estaFalando(): boolean {
  return vozDisponivel() && window.speechSynthesis.speaking
}
