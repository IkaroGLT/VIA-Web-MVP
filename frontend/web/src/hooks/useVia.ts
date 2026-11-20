/**
 * useVia — toda a lógica do VIA pronta para a interface usar (VIA-08 e VIA-07).
 *
 * A INTERFACE (visual) é responsabilidade da equipe de interface. Este hook
 * entrega o comportamento: a tela só precisa ligar dois botões a duas funções.
 *
 * Exemplo de uso numa tela:
 *
 *   const { descrever, comandoDeVoz, ocupado, estado } = useVia()
 *
 *   <button aria-label="Descrever o que está à frente" aria-busy={ocupado} onClick={descrever}>...</button>
 *   <button aria-label="Falar um comando" onClick={comandoDeVoz}>...</button>
 *
 * Regras de acessibilidade para quem montar a tela (ver docs/INTEGRACAO-INTERFACE.md):
 * - Poucos elementos na tela (o ideal são só estes dois botões).
 * - NÃO mudar o aria-label durante o uso (o TalkBack leria de novo, por cima da descrição).
 * - Textos visuais de estado devem ter aria-hidden="true": o VIA já FALA cada estado.
 *
 * Comportamento:
 * - Primeiro toque da sessão (em qualquer botão): fala o aviso de boas-vindas
 *   ("a IA pode errar..."). O Chrome não deixa falar antes de um toque do usuário.
 * - Só uma tarefa por vez: toques repetidos durante um pedido são ignorados.
 * - comandoDeVoz() durante uma descrição funciona como "parar a fala".
 * - Cada descrição gera um registro enviado para a planilha (VIA-09).
 */
import { useRef, useState } from 'react'
import { ouvirComando, type Comando, type ResultadoComando } from '../services/comandos'
import { obterUltimaDescricao, pedirDescricao, type OrigemPedido } from '../services/fluxo'
import { AJUDA, BOAS_VINDAS, COMANDOS, NADA_PARA_REPETIR } from '../services/mensagens'
import { enviarRegistro } from '../services/registro'
import { falar, pararFala } from '../services/voz'

/** O que o app está fazendo agora. Útil para a tela mostrar algo a quem enxerga. */
export type EstadoVia = 'pronto' | 'aviso' | 'descrevendo' | 'ouvindo_comando'

/** Chave para lembrar, nesta aba, que o aviso de boas-vindas já foi falado. */
const CHAVE_AVISO = 'via-aviso-falado'

function avisoJaFalado(): boolean {
  try {
    return sessionStorage.getItem(CHAVE_AVISO) === 'sim'
  } catch {
    return false // navegador bloqueou o armazenamento: fala o aviso de novo, sem problema
  }
}

function marcarAvisoFalado(): void {
  try {
    sessionStorage.setItem(CHAVE_AVISO, 'sim')
  } catch {
    /* ignorar */
  }
}

/** Frase falada quando o comando de voz não deu certo. */
function fraseDeFalha(r: Extract<ResultadoComando, { ok: false }>): string {
  switch (r.motivo) {
    case 'sem_suporte':
      return COMANDOS.semSuporte
    case 'microfone_negado':
      return COMANDOS.microfoneNegado
    case 'nao_ouvi':
      return COMANDOS.naoOuvi
    case 'nao_entendi':
      return COMANDOS.naoEntendi
    default:
      return COMANDOS.erroReconhecimento
  }
}

async function descreverERegistrar(origem: OrigemPedido) {
  const registro = await pedirDescricao(origem)
  enviarRegistro(registro)
}

export function useVia() {
  const [estado, setEstado] = useState<EstadoVia>('pronto')
  // useRef em vez de state: precisamos saber NA HORA se já tem algo rodando,
  // para ignorar toques repetidos (state só atualiza na próxima renderização).
  const ocupado = useRef(false)

  /** Executa uma tarefa garantindo que só uma roda por vez. Fala o aviso no 1º toque. */
  async function executar(estadoDurante: EstadoVia, tarefa: () => Promise<void>) {
    if (ocupado.current) return
    ocupado.current = true
    try {
      if (!avisoJaFalado()) {
        marcarAvisoFalado()
        setEstado('aviso')
        await falar(BOAS_VINDAS)
        return // o próximo toque já faz a ação
      }
      setEstado(estadoDurante)
      await tarefa()
    } finally {
      ocupado.current = false
      setEstado('pronto')
    }
  }

  async function realizarComando(comando: Comando) {
    switch (comando) {
      case 'descrever':
        setEstado('descrevendo')
        return descreverERegistrar('voz')
      case 'repetir':
        await falar(obterUltimaDescricao() ?? NADA_PARA_REPETIR)
        return
      case 'ajuda':
        await falar(AJUDA)
        return
      case 'parar':
        pararFala()
        return
    }
  }

  /** Ligar ao botão principal: tira a foto, descreve e fala. */
  function descrever() {
    void executar('descrevendo', () => descreverERegistrar('toque'))
  }

  /** Ligar ao botão de comando: "Pode falar", escuta UMA frase e executa o comando. */
  function comandoDeVoz() {
    // Durante uma descrição, este botão serve para calar o app.
    if (ocupado.current) {
      pararFala()
      return
    }
    void executar('ouvindo_comando', async () => {
      // Espera o "Pode falar" TERMINAR antes de abrir o microfone,
      // senão o reconhecimento ouve a própria voz do app.
      await falar(COMANDOS.podeFalar)
      const resultado = await ouvirComando()
      console.info('[VIA] comando de voz', resultado)
      if (resultado.ok) await realizarComando(resultado.comando)
      else await falar(fraseDeFalha(resultado))
    })
  }

  return { descrever, comandoDeVoz, estado, ocupado: estado !== 'pronto' }
}
