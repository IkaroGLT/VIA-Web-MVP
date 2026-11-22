
import { describe, expect, it } from 'vitest'

import {
  ApiInputError,
  MAX_IMAGE_BYTES,
  validateImagePayload,
} from './image-validation.js'

const validJpeg = Buffer.from([
  0xff,
  0xd8,
  0xff,
  0xd9,
])

const validPayload = {
  imageBase64: validJpeg.toString('base64'),
  mimeType: 'image/jpeg',
}

describe('Validação de imagens do VIA', () => {
  it('aceita uma imagem JPEG com assinatura válida', () => {
    const result = validateImagePayload(validPayload)

    expect(result).toEqual(validJpeg)
  })

  it('rejeita uma requisição vazia', () => {
    expect(() => validateImagePayload(null))
      .toThrow(ApiInputError)
  })

  it('rejeita formato diferente de JPEG', () => {
    expect(() =>
      validateImagePayload({
        ...validPayload,
        mimeType: 'image/png',
      }),
    ).toThrow(ApiInputError)
  })

  it('rejeita Base64 inválido', () => {
    expect(() =>
      validateImagePayload({
        imageBase64: '@@@',
        mimeType: 'image/jpeg',
      }),
    ).toThrow(ApiInputError)
  })

  it('rejeita conteúdo que não é JPEG', () => {
    expect(() =>
      validateImagePayload({
        imageBase64: Buffer.from('texto comum').toString('base64'),
        mimeType: 'image/jpeg',
      }),
    ).toThrow(ApiInputError)
  })

  it('rejeita imagens acima de 2 MB', () => {
    const oversizedImage = Buffer.alloc(MAX_IMAGE_BYTES + 1)

    oversizedImage.set([0xff, 0xd8, 0xff])

    expect(() =>
      validateImagePayload({
        imageBase64: oversizedImage.toString('base64'),
        mimeType: 'image/jpeg',
      }),
    ).toThrow(ApiInputError)
  })
})
