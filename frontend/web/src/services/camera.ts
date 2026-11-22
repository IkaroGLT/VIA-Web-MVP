/**
 * PONTO DE ENCAIXE DA CÂMERA — a implementação real é da VIA-04 (Ikaro).
 *
 * A integração (VIA-08) só precisa que exista uma função `capturarFoto()`
 * com a assinatura abaixo. Enquanto a VIA-04 não chega, esta versão
 * SIMULADA devolve uma imagem falsa, para podermos testar o fluxo inteiro
 * (voz, erros, acessibilidade) sem depender da câmera.
 *
 * Combinado com a VIA-04: manter exatamente esta assinatura e estes códigos de erro.
 */

export type ResultadoCaptura =
  /** Foto em JPEG, em Base64 SEM o prefixo "data:image/jpeg;base64," (regra do contrato da API). */
  | { ok: true; imagemBase64: string }
  /** CAMERA_NEGADA = usuário recusou a permissão. CAMERA_INDISPONIVEL = câmera ocupada ou inexistente. */
  | { ok: false; codigo: 'CAMERA_NEGADA' | 'CAMERA_INDISPONIVEL' }

/**
 * SIMULAÇÃO. Para testar os erros de câmera, abra o app com
 * ?erro=CAMERA_NEGADA ou ?erro=CAMERA_INDISPONIVEL no endereço.
 */
export async function capturarFoto(): Promise<ResultadoCaptura> {
  const erroSimulado = new URLSearchParams(window.location.search).get('erro')
  if (erroSimulado === 'CAMERA_NEGADA' || erroSimulado === 'CAMERA_INDISPONIVEL') {
    return { ok: false, codigo: erroSimulado }
  }

  await new Promise((r) => setTimeout(r, 300)) // imita o tempo de captura
  return { ok: true, imagemBase64: 'SIMULADA' }
}
