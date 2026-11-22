import type { CodigoErro } from '../types/erros'

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024

/**
 * Erro da descrição com o CÓDIGO do contrato (docs/contrato-api.md, seção 5.2).
 * A mensagem continua sendo o texto para exibir na tela; o código permite
 * ao app escolher a frase FALADA certa (services/mensagens.ts).
 */
export class ErroDescricao extends Error {
  readonly codigo: CodigoErro

  constructor(codigo: CodigoErro, mensagem: string, options?: ErrorOptions) {
    super(mensagem, options)
    this.name = 'ErroDescricao'
    this.codigo = codigo
  }
}

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? ''
).replace(/\/+$/, '')

interface ApiResponse {
  description?: unknown
  error?: {
    code?: unknown
    message?: unknown
  }
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => {
      reject(
        new Error('Não foi possível ler a imagem selecionada.'),
      )
    }

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(
          new Error('Não foi possível converter a imagem.'),
        )
        return
      }

      const separator = reader.result.indexOf(',')

      if (separator < 0) {
        reject(
          new Error('Formato de imagem não reconhecido.'),
        )
        return
      }

      resolve(reader.result.slice(separator + 1))
    }

    reader.readAsDataURL(file)
  })
}

export async function describeImage(file: File): Promise<string> {
  if (file.type !== 'image/jpeg') {
    throw new ErroDescricao('UNSUPPORTED_MEDIA_TYPE', 'A imagem precisa estar no formato JPEG.')
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new ErroDescricao('IMAGE_TOO_LARGE', 'A imagem ultrapassa o limite de 2 MB.')
  }

  // Sem internet: avisa na hora, sem esperar o tempo limite.
  if (!navigator.onLine) {
    throw new ErroDescricao('SEM_INTERNET', 'Sem conexão com a internet.')
  }

  const imageBase64 = await readFileAsBase64(file)

  const controller = new AbortController()

  const timeoutId = window.setTimeout(() => {
    controller.abort()
  }, 35_000)

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/describe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          mimeType: 'image/jpeg',
        }),
        signal: controller.signal,
      },
    )

    const payload = await response
      .json()
      .catch(() => null) as ApiResponse | null

    if (!response.ok) {
      const message = payload?.error?.message
      const code = payload?.error?.code

      throw new ErroDescricao(
        typeof code === 'string' ? (code as CodigoErro) : 'INTERNAL_ERROR',
        typeof message === 'string'
          ? message
          : 'Não foi possível realizar a análise.',
      )
    }

    if (
      typeof payload?.description !== 'string' ||
      !payload.description.trim()
    ) {
      throw new ErroDescricao(
        'INTERNAL_ERROR',
        'O servidor não retornou uma descrição válida.',
      )
    }

    return payload.description.trim()
  } catch (error) {
    if (
        error instanceof DOMException &&
        error.name === 'AbortError'
        ) {
        throw new ErroDescricao(
            'AI_TIMEOUT',
            'A análise demorou mais que o esperado. Tente novamente.',
            { cause: error },
        )
        }

    if (error instanceof TypeError) {
    throw new ErroDescricao(
        'SEM_INTERNET',
        'Não foi possível conectar ao servidor do VIA.',
        { cause: error },
        )
        }

    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}
