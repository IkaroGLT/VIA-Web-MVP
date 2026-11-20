/**
 * Códigos de erro que o VIA sabe falar.
 *
 * - Os do backend copiam exatamente a tabela do contrato (docs/contrato-api.md, seção 5.2).
 *   Se o contrato mudar, atualize aqui também.
 * - Os do frontend são erros que acontecem no celular (sem internet, câmera).
 */
export type CodigoErroBackend =
  | 'INVALID_REQUEST'
  | 'INVALID_IMAGE'
  | 'METHOD_NOT_ALLOWED'
  | 'IMAGE_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'AI_UNAVAILABLE'
  | 'AI_TIMEOUT'
  | 'INTERNAL_ERROR'

export type CodigoErroFrontend = 'SEM_INTERNET' | 'CAMERA_NEGADA' | 'CAMERA_INDISPONIVEL' | 'ERRO_DESCONHECIDO'

export type CodigoErro = CodigoErroBackend | CodigoErroFrontend
