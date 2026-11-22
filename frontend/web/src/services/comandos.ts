/**
 * Comandos de voz do VIA (VIA-07), nível 1: "apertar e falar".
 *
 * O microfone só abre quando a pessoa toca no botão de comando, e escuta
 * UMA frase. Não existe escuta contínua nem palavra de ativação ("VIA, ...").
 * Isso evita gastar bateria, o app ouvir a própria voz e disparos por engano.
 *
 * Usa o reconhecimento de fala do Chrome (webkitSpeechRecognition).
 * Observação de privacidade: no Chrome, o áudio do comando é processado
 * pelos servidores do Google. Isso precisa constar no termo de consentimento.
 *
 * Regra de ouro: se a voz falhar, o toque continua funcionando.
 */

export type Comando = 'descrever' | 'repetir' | 'ajuda' | 'parar'

export type ResultadoComando =
  | { ok: true; comando: Comando; ouvido: string }
  | { ok: false; motivo: 'sem_suporte' | 'microfone_negado' | 'nao_ouvi' | 'nao_entendi' | 'erro'; ouvido?: string }

/**
 * Palavras que disparam cada comando. A ordem importa: testamos de cima para baixo.
 * "descrever" vem primeiro porque frases como "o que tem para frente" contêm "para",
 * que também é uma palavra de "parar".
 * Tudo sem acento e em minúsculas (o texto ouvido é normalizado do mesmo jeito).
 * Para aceitar novas formas de falar, basta acrescentar palavras aqui.
 */
const PALAVRAS: [Comando, string[]][] = [
  ['descrever', ['descrev', 'descricao', 'o que tem', 'o que ha', 'frente', 'foto', 'olha']],
  ['repetir', ['repet', 'de novo', 'novamente', 'outra vez']],
  ['ajuda', ['ajuda', 'como usa', 'como funciona', 'instruc']],
  ['parar', ['parar', 'pare', 'para', 'silencio', 'chega', 'cancela']],
]

/** Tira acentos e deixa minúsculo: "Descrição" -> "descricao". */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** Procura um comando dentro da frase ouvida. Usa palavras inteiras (ou começo de palavra). */
export function identificarComando(frase: string): Comando | null {
  const texto = ` ${normalizar(frase)} `
  for (const [comando, palavras] of PALAVRAS) {
    if (palavras.some((p) => texto.includes(` ${p}`))) return comando
  }
  return null
}

// --- Tipos mínimos da API de reconhecimento (o TypeScript não traz todos) ---
interface AlternativaReconhecida {
  transcript: string
}
interface EventoResultado {
  results: ArrayLike<ArrayLike<AlternativaReconhecida>>
}
interface EventoErro {
  error: string
}
interface Reconhecedor {
  lang: string
  interimResults: boolean
  continuous: boolean
  maxAlternatives: number
  onresult: ((e: EventoResultado) => void) | null
  onerror: ((e: EventoErro) => void) | null
  onend: (() => void) | null
  start(): void
  abort(): void
}
type ConstrutorReconhecedor = new () => Reconhecedor

function obterConstrutor(): ConstrutorReconhecedor | null {
  const w = window as unknown as {
    SpeechRecognition?: ConstrutorReconhecedor
    webkitSpeechRecognition?: ConstrutorReconhecedor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function comandoDeVozDisponivel(): boolean {
  return obterConstrutor() !== null
}

/** Tempo máximo de escuta. Se a pessoa não falar nada, desistimos. */
const TEMPO_MAXIMO_ESCUTA_MS = 8_000

/**
 * Abre o microfone, escuta UMA frase e devolve o comando reconhecido.
 * Nunca lança erro: sempre devolve um ResultadoComando.
 * IMPORTANTE: chame só depois que o app terminou de falar, para ele não ouvir a si mesmo.
 */
export function ouvirComando(): Promise<ResultadoComando> {
  const Construtor = obterConstrutor()
  if (!Construtor) return Promise.resolve({ ok: false, motivo: 'sem_suporte' })

  return new Promise((resolve) => {
    const rec = new Construtor()
    rec.lang = 'pt-BR'
    rec.interimResults = false
    rec.continuous = false
    rec.maxAlternatives = 3 // o Chrome devolve até 3 "palpites"; testamos todos

    let resolvido = false
    const finalizar = (r: ResultadoComando) => {
      if (resolvido) return
      resolvido = true
      clearTimeout(vigia)
      resolve(r)
    }

    rec.onresult = (evento) => {
      const alternativas = Array.from(evento.results[0] ?? []).map((a) => a.transcript)
      for (const frase of alternativas) {
        const comando = identificarComando(frase)
        if (comando) return finalizar({ ok: true, comando, ouvido: frase })
      }
      finalizar({ ok: false, motivo: 'nao_entendi', ouvido: alternativas[0] })
    }

    rec.onerror = (evento) => {
      if (evento.error === 'not-allowed' || evento.error === 'service-not-allowed') {
        finalizar({ ok: false, motivo: 'microfone_negado' })
      } else if (evento.error === 'no-speech' || evento.error === 'aborted') {
        finalizar({ ok: false, motivo: 'nao_ouvi' })
      } else {
        // 'network', 'audio-capture' etc.
        console.warn('[VIA] erro no reconhecimento de voz:', evento.error)
        finalizar({ ok: false, motivo: 'erro' })
      }
    }

    // Se terminar sem resultado nem erro, a pessoa não falou nada.
    rec.onend = () => finalizar({ ok: false, motivo: 'nao_ouvi' })

    const vigia = setTimeout(() => {
      rec.abort()
      finalizar({ ok: false, motivo: 'nao_ouvi' })
    }, TEMPO_MAXIMO_ESCUTA_MS)

    try {
      rec.start()
    } catch (erro) {
      console.warn('[VIA] não foi possível iniciar o microfone:', erro)
      finalizar({ ok: false, motivo: 'erro' })
    }
  })
}
