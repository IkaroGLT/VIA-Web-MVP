
import { Buffer } from 'node:buffer'

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024

const MAX_BASE64_LENGTH = Math.ceil(
  MAX_IMAGE_BYTES / 3,
) * 4

const BASE64_PATTERN =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/

export class ApiInputError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiInputError'
  }
}

export function validateImagePayload(body: unknown): Buffer {
  if (
    typeof body !== 'object' ||
    body === null ||
    Array.isArray(body)
  ) {
    throw new ApiInputError(
      400,
      'INVALID_REQUEST',
      'A requisição enviada é inválida.',
    )
  }

  const payload = body as Record<string, unknown>

  const { imageBase64, mimeType } = payload

  if (
    typeof imageBase64 !== 'string' ||
    typeof mimeType !== 'string'
  ) {
    throw new ApiInputError(
      400,
      'INVALID_REQUEST',
      'Os campos obrigatórios não foram informados.',
    )
  }

  if (mimeType !== 'image/jpeg') {
    throw new ApiInputError(
      415,
      'UNSUPPORTED_MEDIA_TYPE',
      'Somente imagens JPEG são aceitas.',
    )
  }

  if (!imageBase64) {
    throw new ApiInputError(
      400,
      'INVALID_IMAGE',
      'A imagem enviada está vazia.',
    )
  }

  if (imageBase64.length > MAX_BASE64_LENGTH) {
    throw new ApiInputError(
      413,
      'IMAGE_TOO_LARGE',
      'A imagem ultrapassa o tamanho permitido.',
    )
  }

  if (
    imageBase64.length % 4 !== 0 ||
    !BASE64_PATTERN.test(imageBase64)
  ) {
    throw new ApiInputError(
      400,
      'INVALID_IMAGE',
      'O conteúdo da imagem não possui codificação válida.',
    )
  }

  const imageBuffer = Buffer.from(imageBase64, 'base64')

  if (imageBuffer.length === 0) {
    throw new ApiInputError(
      400,
      'INVALID_IMAGE',
      'Não foi possível interpretar a imagem.',
    )
  }

  if (imageBuffer.length > MAX_IMAGE_BYTES) {
    throw new ApiInputError(
      413,
      'IMAGE_TOO_LARGE',
      'A imagem ultrapassa o limite de 2 MB.',
    )
  }

  const isJpeg =
    imageBuffer.length >= 3 &&
    imageBuffer[0] === 0xff &&
    imageBuffer[1] === 0xd8 &&
    imageBuffer[2] === 0xff

  if (!isJpeg || imageBuffer.toString('base64') !== imageBase64) {
    throw new ApiInputError(
      400,
      'INVALID_IMAGE',
      'O arquivo enviado não apresenta a assinatura esperada de uma imagem JPEG.',
    )
  }

  return imageBuffer
}
