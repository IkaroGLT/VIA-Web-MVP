/**
 * Todas as frases que o VIA fala em voz alta ficam AQUI.
 *
 * Por que num arquivo só? Entre uma rodada de teste e outra, vamos ajustar
 * o texto das mensagens. Assim ninguém precisa procurar frase espalhada no código.
 *
 * Regras para escrever as mensagens:
 * - Frases curtas: a pessoa ouve, não lê.
 * - Sempre dizer o que fazer em seguida ("tente de novo", "toque na tela").
 * - Nada de termos técnicos (nada de "erro 503", "timeout", "API").
 */

import type { CodigoErro } from '../types/erros'

/** Avisos de estado: dizem ao usuário o que o app está fazendo agora. */
export const ESTADOS = {
  tirandoFoto: 'Tirando a foto.',
  analisando: 'Analisando a imagem. Aguarde.',
} as const

/**
 * Aviso de abertura. Deixa claro que a IA pode errar e que o app
 * não serve para se locomover sozinho (requisito de honestidade do projeto).
 */
export const BOAS_VINDAS =
  'Bem-vindo ao VIA. Toque na parte de cima da tela para descrever o que está à sua frente. ' +
  'Na parte de baixo fica o botão de comando de voz. ' +
  'As descrições são feitas por inteligência artificial e podem conter erros. ' +
  'Não use o VIA para se locomover sozinho.'

/** Explicação de uso, falada no comando "ajuda". */
export const AJUDA =
  'Para descrever o que está à frente, toque na parte de cima da tela. ' +
  'Aponte a câmera traseira do celular para a frente e mantenha o aparelho parado. ' +
  'Na parte de baixo da tela fica o botão de comando de voz. ' +
  'Toque nele, espere o aviso, e diga: descrever, repetir, ajuda ou parar.'

/** Frases dos comandos de voz (VIA-07). */
export const COMANDOS = {
  podeFalar: 'Pode falar.',
  naoOuvi: 'Não ouvi nenhum comando. Toque no botão de comando e tente de novo.',
  naoEntendi: 'Não entendi. Os comandos são: descrever, repetir, ajuda e parar.',
  semSuporte: 'O comando de voz não funciona neste navegador. Use o toque na parte de cima da tela.',
  microfoneNegado:
    'O VIA não tem permissão para usar o microfone. Use o toque na parte de cima da tela, ou peça ajuda para liberar o microfone.',
  erroReconhecimento: 'Não foi possível ouvir o comando agora. Use o toque na parte de cima da tela.',
} as const

/** Quando o comando "repetir" é usado antes de existir qualquer descrição. */
export const NADA_PARA_REPETIR = 'Ainda não há descrição para repetir. Toque na tela para descrever.'

/**
 * Uma frase para cada erro possível.
 *
 * Os códigos em MAIÚSCULAS vêm do contrato da API (docs/contrato-api.md, seção 5.2).
 * Os demais são erros que acontecem no próprio celular, antes de chegar ao servidor.
 *
 * Observação: o contrato diz que o backend também manda uma "message", mas
 * preferimos falar as frases daqui, para manter o mesmo tom em todo o app.
 */
export const ERROS: Record<CodigoErro, string> = {
  // --- Erros vindos do backend (contrato da API) ---
  INVALID_REQUEST: 'Não foi possível enviar a foto. Toque na tela para tentar de novo.',
  INVALID_IMAGE: 'Não foi possível analisar a imagem. Toque na tela para tirar outra foto.',
  METHOD_NOT_ALLOWED: 'Ocorreu um erro no aplicativo. Toque na tela para tentar de novo.',
  IMAGE_TOO_LARGE: 'A foto ficou grande demais para enviar. Toque na tela para tentar de novo.',
  UNSUPPORTED_MEDIA_TYPE: 'O formato da foto não é aceito. Toque na tela para tentar de novo.',
  RATE_LIMIT_EXCEEDED: 'Muitos pedidos em pouco tempo. Aguarde um minuto e toque na tela de novo.',
  AI_UNAVAILABLE: 'O serviço de descrição está fora do ar no momento. Tente de novo em alguns minutos.',
  AI_TIMEOUT: 'A descrição demorou demais. Toque na tela para tentar de novo.',
  INTERNAL_ERROR: 'Ocorreu um erro inesperado. Toque na tela para tentar de novo.',

  // --- Erros detectados no celular ---
  SEM_INTERNET: 'Sem conexão com a internet. Verifique a internet e toque na tela para tentar de novo.',
  CAMERA_NEGADA:
    'O VIA não tem permissão para usar a câmera. Peça ajuda para liberar a câmera nas configurações do navegador.',
  CAMERA_INDISPONIVEL: 'Não foi possível abrir a câmera. Feche outros aplicativos que usam a câmera e tente de novo.',
  ERRO_DESCONHECIDO: 'Ocorreu um erro inesperado. Toque na tela para tentar de novo.',
}

/** Devolve a frase de um erro. Se vier um código que não conhecemos, usa a genérica. */
export function mensagemDeErro(codigo: string): string {
  return ERROS[codigo as CodigoErro] ?? ERROS.ERRO_DESCONHECIDO
}
