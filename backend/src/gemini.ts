
import { Buffer } from 'node:buffer'

import { GoogleGenAI } from '@google/genai'

const DEFAULT_MODEL = 'gemini-3.8-flash'
const REQUEST_TIMEOUT_MS = 15_000

const VIA_PROMPT = `
Você é o assistente visual do VIA, um sistema experimental
de acessibilidade para pessoas com deficiência visual.

Sua tarefa é descrever a imagem fornecida de maneira clara,
objetiva e útil para uma pessoa que não consegue enxergá-la.

REGRAS:

1. Responda exclusivamente em português brasileiro.
2. Comece apresentando uma visão geral da cena.
3. Identifique os objetos e elementos visualmente relevantes.
4. Informe posições relativas somente quando forem claras.
5. Utilize frases naturais, curtas e fáceis de compreender.
6. Priorize informações que ajudem o usuário a compreender
   o conteúdo visual.
7. Não invente informações que não estejam visíveis.
8. Não afirme que algo é seguro apenas pela imagem.
9. Não ofereça instruções de deslocamento ou navegação.
10. Não apresente suposições como fatos.
11. Se a imagem estiver escura, ilegível ou sem conteúdo
    identificável, informe essa limitação.
12. Se houver texto legível e relevante, informe-o apenas
    quando a leitura estiver suficientemente clara.

A resposta deve possuir no máximo cinco frases e ser
adequada para futura reprodução por voz.
`

export type GeminiFailureKind =
  | 'configuration'
  | 'timeout'
  | 'unavailable'

export class GeminiServiceError extends Error {
  constructor(
    public readonly kind: GeminiFailureKind,
  ) {
    super('Falha no serviço de inteligência artificial.')
    this.name = 'GeminiServiceError'
  }
}

let cachedClient: GoogleGenAI | null = null

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim()

  if (!apiKey) {
    throw new GeminiServiceError('configuration')
  }

  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          timeout: REQUEST_TIMEOUT_MS,
          apiVersion: 'v1beta',
           retryOptions: {
            attempts: 1,
          },
        },
      })
  }

  return cachedClient
}

function getProviderStatus(error: unknown): number | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error
  ) {
    const status = (error as { status?: unknown }).status

    if (typeof status === 'number') {
      return status
    }
  }

  return undefined
}

export async function generateImageDescription(
  image: Buffer,
): Promise<string> {
  const client = getGeminiClient()

  const model =
    process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL

  try {
    const interaction = await client.interactions.create({
      model,
      input: [
        {
          type: 'text',
          text: VIA_PROMPT,
        },
        {
          type: 'image',
          data: image.toString('base64'),
          mime_type: 'image/jpeg',
        },
      ],
      generation_config: {
        max_output_tokens: 220,
        temperature: 0.2,
      },
    })

    const description = interaction.output_text?.trim()

    if (!description) {
      throw new GeminiServiceError('unavailable')
    }

    return description.slice(0, 1000)
  } catch (error) {
      if (error instanceof GeminiServiceError) {
        throw error
      }

      const status = getProviderStatus(error)

      const errorName =
        error instanceof Error ? error.name.toLowerCase() : ''

      const errorMessage =
        error instanceof Error
          ? error.message.slice(0, 1500)
          : String(error).slice(0, 1500)

      const errorDetails =
        typeof error === 'object' && error !== null
          ? JSON.stringify(error, Object.getOwnPropertyNames(error)).slice(0, 3000)
          : String(error).slice(0, 3000)

      console.error('[VIA] Erro original do Gemini:', {
        name: errorName,
        status: status ?? null,
        message: errorMessage,
        details: errorDetails,
      })

      if (
        status === 408 ||
        status === 504 ||
        errorName.includes('timeout') ||
        errorName.includes('abort')
      ) {
        throw new GeminiServiceError('timeout')
      }

      throw new GeminiServiceError('unavailable')
    }
  }
