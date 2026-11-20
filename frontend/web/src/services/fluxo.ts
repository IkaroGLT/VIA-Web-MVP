/**
 * O fluxo principal do VIA (VIA-08): toque -> foto -> IA -> voz.
 *
 * Esta é a função que a tela chama quando a pessoa toca no botão.
 * Ela junta as peças:
 *   - camera.ts   (VIA-04, Ikaro)  tira a foto
 *   - api.ts      (VIA-08)         manda para o backend (VIA-05, Ikaro)
 *   - voz.ts      (VIA-06)         fala os avisos, a descrição e os erros
 *
 * No final devolve um "registro" do pedido (tempos e resultado, SEM a foto).
 * A VIA-09 vai enviar esse registro para a planilha.
 */

import { descreverImagem } from './api'
import { capturarFoto } from './camera'
import { ESTADOS, mensagemDeErro } from './mensagens'
import { falar } from './voz'

export type OrigemPedido = 'toque' | 'voz'

/** Dados de um pedido, para o relatório de testes. Não contém a foto nem dados pessoais. */
export interface RegistroPedido {
  /** Data e hora do toque, em ISO (ex.: 2026-11-18T14:03:00.000Z). */
  dataHora: string
  /** Como o pedido foi feito: tocando na tela ou por comando de voz (VIA-07). */
  origem: OrigemPedido
  /** 'sucesso' ou o código do erro (ex.: 'AI_TIMEOUT', 'CAMERA_NEGADA'). */
  resultado: string
  /** Do toque até a VOZ DA DESCRIÇÃO começar, em ms. É a métrica dos 15 s. null se não chegou a falar a descrição. */
  msAteVoz: number | null
  /** Quanto o backend + IA demoraram, em ms. null se nem chegou a pedir. */
  msIA: number | null
  /** A descrição foi falada até o fim? (definição de SUCESSO do projeto) */
  faladaAteOFim: boolean
}

/** Última descrição recebida, para o comando "repetir" (VIA-07). */
let ultimaDescricao: string | null = null
export function obterUltimaDescricao(): string | null {
  return ultimaDescricao
}

export async function pedirDescricao(origem: OrigemPedido): Promise<RegistroPedido> {
  const toqueEm = performance.now()
  const dataHora = new Date().toISOString()
  const base = { dataHora, origem }

  // Não esperamos a frase acabar (não usamos await): a câmera trabalha enquanto o app fala.
  void falar(ESTADOS.tirandoFoto)
  const foto = await capturarFoto()

  if (!foto.ok) {
    await falar(mensagemDeErro(foto.codigo))
    return { ...base, resultado: foto.codigo, msAteVoz: null, msIA: null, faladaAteOFim: false }
  }

  // interromper = false: entra na fila depois de "Tirando a foto", sem cortá-la.
  void falar(ESTADOS.analisando, false)
  const pedidoIAEm = performance.now()
  const resposta = await descreverImagem(foto.imagemBase64)
  const msIA = Math.round(performance.now() - pedidoIAEm)

  if (!resposta.ok) {
    await falar(mensagemDeErro(resposta.codigo))
    return { ...base, resultado: resposta.codigo, msAteVoz: null, msIA, faladaAteOFim: false }
  }

  ultimaDescricao = resposta.descricao

  // A descrição corta qualquer aviso que ainda esteja tocando: ela é o que importa.
  const fala = await falar(resposta.descricao)
  return {
    ...base,
    resultado: 'sucesso',
    msAteVoz: fala.inicioEm === null ? null : Math.round(fala.inicioEm - toqueEm),
    msIA,
    faladaAteOFim: fala.terminou,
  }
}
