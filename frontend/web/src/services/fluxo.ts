/**
 * Descrição FALADA (VIA-08): liga o serviço de descrição (VIA-05) à voz (VIA-06)
 * e ao registro de testes (VIA-09).
 *
 * Quem chama (a tela) passa a foto já preparada pela câmera (VIA-04).
 * Esta função:
 *   1. fala "Analisando a imagem";
 *   2. pede a descrição ao backend (descriptionService.ts);
 *   3. fala a descrição ou a frase do erro;
 *   4. quando a fala termina, envia o registro do pedido para a planilha.
 *
 * Ela devolve o resultado ASSIM QUE a descrição chega (para a tela mostrar o texto),
 * sem esperar a fala acabar.
 */

import { describeImage, ErroDescricao } from './descriptionService'
import { ESTADOS, mensagemDeErro } from './mensagens'
import { enviarRegistro } from './registro'
import { falar } from './voz'

export type OrigemPedido = 'toque' | 'voz'

/** Dados de um pedido, para o relatório de testes. Não contém a foto nem dados pessoais. */
export interface RegistroPedido {
  /** Data e hora do pedido, em ISO (ex.: 2026-11-18T14:03:00.000Z). */
  dataHora: string
  /** Como o pedido foi feito: tocando no botão ou por comando de voz (VIA-07). */
  origem: OrigemPedido
  /** 'sucesso' ou o código do erro (ex.: 'AI_TIMEOUT'). */
  resultado: string
  /** Do pedido até a VOZ DA DESCRIÇÃO começar, em ms. É a métrica dos 15 s. null se não chegou a falar a descrição. */
  msAteVoz: number | null
  /** Quanto o backend + IA demoraram, em ms. */
  msIA: number | null
  /** A descrição foi falada até o fim? (definição de SUCESSO do projeto) */
  faladaAteOFim: boolean
}

export type ResultadoDescricaoFalada =
  | { ok: true; descricao: string }
  /** mensagem = texto para exibir na tela (o mesmo que foi falado). */
  | { ok: false; mensagem: string }

/** Última descrição recebida, para o comando "repetir" (VIA-07). */
let ultimaDescricao: string | null = null
export function obterUltimaDescricao(): string | null {
  return ultimaDescricao
}

export async function descreverEFalar(foto: File, origem: OrigemPedido): Promise<ResultadoDescricaoFalada> {
  const pedidoEm = performance.now()
  const base = { dataHora: new Date().toISOString(), origem }

  void falar(ESTADOS.analisando)

  let descricao: string
  try {
    descricao = await describeImage(foto)
  } catch (erro) {
    const msIA = Math.round(performance.now() - pedidoEm)
    const codigo = erro instanceof ErroDescricao ? erro.codigo : 'ERRO_DESCONHECIDO'
    const frase = mensagemDeErro(codigo)
    void falar(frase)
    enviarRegistro({ ...base, resultado: codigo, msAteVoz: null, msIA, faladaAteOFim: false })
    return { ok: false, mensagem: frase }
  }

  const msIA = Math.round(performance.now() - pedidoEm)
  ultimaDescricao = descricao

  // A descrição corta o "Analisando" se ele ainda estiver tocando.
  // O registro só é enviado quando a fala termina, para saber se foi ouvida até o fim.
  void falar(descricao).then((fala) => {
    enviarRegistro({
      ...base,
      resultado: 'sucesso',
      msAteVoz: fala.inicioEm === null ? null : Math.round(fala.inicioEm - pedidoEm),
      msIA,
      faladaAteOFim: fala.terminou,
    })
  })

  return { ok: true, descricao }
}
