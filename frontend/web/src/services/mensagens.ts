/**
 * Todas as frases que o VIA fala em voz alta ficam AQUI.
 *
 * Por que num arquivo só? Entre uma rodada de teste e outra, vamos ajustar
 * o texto das mensagens. Assim ninguém precisa procurar frase espalhada no código.
 *
 * Regras para escrever as mensagens:
 * - Frases curtas: a pessoa ouve, não lê.
 * - Sempre dizer o que fazer em seguida ("tente de novo", "toque em Descrever imagem").
 * - Nada de termos técnicos (nada de "erro 503", "timeout", "API").
 * - Os nomes dos botões citados aqui precisam bater com os da tela.
 *
 * Observação: os estados da CÂMERA ("Câmera ativa", "Imagem preparada"...) são
 * anunciados pelo próprio componente de câmera (CameraCapture) via leitor de tela.
 */

import type { CodigoErro } from '../types/erros'

/** Avisos de estado: dizem ao usuário o que o app está fazendo agora. */
export const ESTADOS = {
  analisando: 'Analisando a imagem. Aguarde.',
} as const

/** Explicação de uso, falada no comando "ajuda". */
export const AJUDA =
  'Para descrever o que está à frente: toque em Ativar câmera, aponte a câmera traseira para a frente, ' +
  'toque em Capturar fotografia e depois em Descrever imagem. ' +
  'Pelo botão Falar um comando, você pode dizer: descrever, repetir, ajuda ou parar. ' +
  'As descrições são feitas por inteligência artificial e podem conter erros. Não use o VIA para se locomover sozinho.'

/** Frases dos comandos de voz (VIA-07). */
export const COMANDOS = {
  podeFalar: 'Pode falar.',
  naoOuvi: 'Não ouvi nenhum comando. Toque em Falar um comando e tente de novo.',
  naoEntendi: 'Não entendi. Os comandos são: descrever, repetir, ajuda e parar.',
  semSuporte: 'O comando de voz não funciona neste navegador. Use os botões da tela.',
  microfoneNegado:
    'O VIA não tem permissão para usar o microfone. Use os botões da tela, ou peça ajuda para liberar o microfone.',
  erroReconhecimento: 'Não foi possível ouvir o comando agora. Use os botões da tela.',
  precisaFoto: 'Ainda não há fotografia. Toque em Ativar câmera e depois em Capturar fotografia.',
  aguarde: 'Aguarde, ainda estou analisando a imagem.',
} as const

/** Quando o comando "repetir" é usado antes de existir qualquer descrição. */
export const NADA_PARA_REPETIR = 'Ainda não há descrição para repetir.'

/**
 * Uma frase para cada erro possível da descrição.
 *
 * Os códigos em MAIÚSCULAS vêm do contrato da API (docs/contrato-api.md, seção 5.2).
 * Os demais são erros que acontecem no próprio celular, antes de chegar ao servidor.
 *
 * Observação: o backend também manda uma "message", mas falamos as frases
 * daqui, para manter o mesmo tom em todo o app.
 */
export const ERROS: Record<CodigoErro, string> = {
  // --- Erros vindos do backend (contrato da API) ---
  INVALID_REQUEST: 'Não foi possível enviar a foto. Toque em Descrever imagem para tentar de novo.',
  INVALID_IMAGE: 'Não foi possível analisar a imagem. Capture outra fotografia.',
  METHOD_NOT_ALLOWED: 'Ocorreu um erro no aplicativo. Toque em Descrever imagem para tentar de novo.',
  IMAGE_TOO_LARGE: 'A foto ficou grande demais para enviar. Capture outra fotografia.',
  UNSUPPORTED_MEDIA_TYPE: 'O formato da foto não é aceito. Capture outra fotografia.',
  RATE_LIMIT_EXCEEDED: 'Muitos pedidos em pouco tempo. Aguarde um minuto e tente de novo.',
  AI_UNAVAILABLE: 'O serviço de descrição está fora do ar no momento. Tente de novo em alguns minutos.',
  AI_TIMEOUT: 'A descrição demorou demais. Toque em Descrever imagem para tentar de novo.',
  INTERNAL_ERROR: 'Ocorreu um erro inesperado. Toque em Descrever imagem para tentar de novo.',

  // --- Erros detectados no celular ---
  SEM_INTERNET: 'Sem conexão com a internet. Verifique a internet e tente de novo.',
  ERRO_DESCONHECIDO: 'Ocorreu um erro inesperado. Toque em Descrever imagem para tentar de novo.',
}

/** Devolve a frase de um erro. Se vier um código que não conhecemos, usa a genérica. */
export function mensagemDeErro(codigo: string): string {
  return ERROS[codigo as CodigoErro] ?? ERROS.ERRO_DESCONHECIDO
}
