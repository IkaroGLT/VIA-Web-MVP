
import { Buffer } from 'node:buffer'

import type {
  VercelRequest,
  VercelResponse,
} from '@vercel/node'

import {
  ApiInputError,
  validateImagePayload,
} from '../src/image-validation.js'

import {
  GeminiServiceError,
  generateImageDescription,
} from '../src/gemini.js'

import {
  consumeRateLimit,
  RateLimitUnavailableError,
} from '../src/rate-limit.js'

const MAX_REQUEST_BYTES = 3.2 * 1024 * 1024

function getHeader(
  req: VercelRequest,
  name: string,
): string | undefined {
  const value = req.headers[name.toLowerCase()]

  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

function sendError(
  res: VercelResponse,
  status: number,
  code: string,
  message: string,
) {
  return res.status(status).json({
    error: {
      code,
      message,
    },
  })
}

function applyCors(
  req: VercelRequest,
  res: VercelResponse,
): boolean {
  const origin = getHeader(req, 'origin')
  const allowedOrigin = process.env.FRONTEND_ORIGIN?.trim()

  if (origin && (!allowedOrigin || origin !== allowedOrigin)) {
    return false
  }

  if (origin && allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  }

  res.setHeader('Vary', 'Origin')

  res.setHeader(
    'Access-Control-Allow-Methods',
    'POST, OPTIONS',
  )

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type',
  )

  res.setHeader('Access-Control-Max-Age', '600')

  return true
}

function parseRequestBody(body: unknown): unknown {
  if (typeof body === 'string' || Buffer.isBuffer(body)) {
    try {
      return JSON.parse(
        Buffer.isBuffer(body) ? body.toString('utf8') : body,
      )
    } catch {
      throw new ApiInputError(
        400,
        'INVALID_REQUEST',
        'O conteúdo da requisição não é um JSON válido.',
      )
    }
  }

  return body
}


function getClientIp(req: VercelRequest): string {
  const realIp = getHeader(req, 'x-real-ip')?.trim()

  if (realIp) {
    return realIp
  }

  const forwarded = getHeader(req, 'x-forwarded-for')

  if (forwarded) {
    const clientIp = forwarded.split(',')[0]?.trim()

    if (clientIp) {
      return clientIp
    }
  }

  return req.socket.remoteAddress || 'unknown'
}


export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')

  if (!applyCors(req, res)) {
    return sendError(
      res,
      403,
      'ORIGIN_NOT_ALLOWED',
      'Origem não autorizada.',
    )
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS')

    return sendError(
      res,
      405,
      'METHOD_NOT_ALLOWED',
      'Método HTTP não permitido.',
    )
  }

  const contentType = getHeader(req, 'content-type')
    ?.split(';')[0]
    .trim()
    .toLowerCase()

  if (contentType !== 'application/json') {
    return sendError(
      res,
      415,
      'UNSUPPORTED_MEDIA_TYPE',
      'Utilize Content-Type application/json.',
    )
  }

  const contentLength = Number(
    getHeader(req, 'content-length'),
  )

  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_REQUEST_BYTES
  ) {
    return sendError(
      res,
      413,
      'IMAGE_TOO_LARGE',
      'A requisição ultrapassa o tamanho permitido.',
    )
  }

  try {
    const rateLimit = await consumeRateLimit(
      getClientIp(req),
    )

    if (!rateLimit.allowed) {
      res.setHeader(
        'Retry-After',
        String(rateLimit.retryAfterSeconds),
      )

      return sendError(
        res,
        429,
        'RATE_LIMIT_EXCEEDED',
        'Muitas solicitações foram realizadas. Aguarde antes de tentar novamente.',
      )
    }

    const body = parseRequestBody(req.body)

    const serializedBody = JSON.stringify(body ?? null)

    if (
      Buffer.byteLength(serializedBody, 'utf8') >
      MAX_REQUEST_BYTES
    ) {
      return sendError(
        res,
        413,
        'IMAGE_TOO_LARGE',
        'A requisição ultrapassa o tamanho permitido.',
      )
    }

    const image = validateImagePayload(body)

    const description = await generateImageDescription(image)

    return res.status(200).json({
      description,
    })
  } catch (error) {
    if (error instanceof ApiInputError) {
      return sendError(
        res,
        error.statusCode,
        error.code,
        error.message,
      )
    }

    if (error instanceof RateLimitUnavailableError) {
      console.error('[VIA] Serviço de limitação indisponível.')

      return sendError(
        res,
        503,
        'SERVICE_UNAVAILABLE',
        'O serviço está temporariamente indisponível. Tente novamente.',
      )
    }

    if (error instanceof GeminiServiceError) {
      if (error.kind === 'timeout') {
        return sendError(
          res,
          504,
          'AI_TIMEOUT',
          'A análise demorou mais que o esperado. Tente novamente.',
        )
      }

      console.error('[VIA] Falha controlada na integração Gemini.')

      return sendError(
        res,
        503,
        'AI_UNAVAILABLE',
        'O serviço de descrição está temporariamente indisponível.',
      )
    }

    console.error('[VIA] Erro interno não tratado', {
      name: error instanceof Error ? error.name : 'UnknownError',
    })

    return sendError(
      res,
      500,
      'INTERNAL_ERROR',
      'Ocorreu um erro interno. Tente novamente mais tarde.',
    )
  }
}
