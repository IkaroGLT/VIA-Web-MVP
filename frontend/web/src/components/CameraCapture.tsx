
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'

import './CameraCapture.css'

const MAX_IMAGE_DIMENSION = 1024
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024
const MAX_SOURCE_SIZE_BYTES = 15 * 1024 * 1024

type CameraStatus =
  | 'idle'
  | 'starting'
  | 'active'
  | 'processing'
  | 'captured'
  | 'error'

interface CameraCaptureProps {
  onImageReady: (file: File | null) => void
  disabled?: boolean
}

async function createJpegBlob(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
): Promise<Blob> {
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error('Não foi possível identificar a imagem.')
  }

  const scale = Math.min(
    1,
    MAX_IMAGE_DIMENSION / Math.max(sourceWidth, sourceHeight),
  )

  let width = Math.max(1, Math.round(sourceWidth * scale))
  let height = Math.max(1, Math.round(sourceHeight * scale))
  let quality = 0.82

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Não foi possível preparar a imagem.')
  }

  while (true) {
    canvas.width = width
    canvas.height = height

    context.drawImage(source, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', quality)
    })

    if (!blob) {
      throw new Error('Falha ao converter a imagem.')
    }

    if (blob.size <= MAX_IMAGE_SIZE_BYTES) {
      return blob
    }

    if (quality > 0.45) {
      quality = Math.max(
        0.45,
        Number((quality - 0.1).toFixed(2)),
      )

      continue
    }

    if (Math.max(width, height) <= 320) {
      break
    }

    width = Math.max(1, Math.floor(width * 0.85))
    height = Math.max(1, Math.floor(height * 0.85))
    quality = 0.72
  }

  throw new Error(
    'Não foi possível reduzir a imagem ao limite de 2 MB.',
  )
}

function getCameraErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'Acesso à câmera negado. Autorize o uso nas configurações do navegador.'

      case 'NotFoundError':
        return 'Nenhuma câmera foi encontrada neste dispositivo.'

      case 'NotReadableError':
        return 'A câmera está sendo utilizada por outro aplicativo.'

      case 'OverconstrainedError':
        return 'Não foi possível utilizar as configurações solicitadas da câmera.'

      case 'SecurityError':
        return 'O navegador bloqueou o acesso à câmera por questões de segurança.'

      default:
        return 'Não foi possível acessar a câmera.'
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocorreu um erro inesperado ao acessar a câmera.'
}

export default function CameraCapture({
  onImageReady,
  disabled = false,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const previewUrlRef = useRef<string | null>(null)
  const isMountedRef = useRef(true)
  const operationIdRef = useRef(0)

  const [status, setStatus] = useState<CameraStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [capturedFile, setCapturedFile] = useState<File | null>(null)
  const [isCameraVisible, setIsCameraVisible] = useState(false)

  function isCurrentOperation(operationId: number): boolean {
    return (
      isMountedRef.current &&
      operationIdRef.current === operationId
    )
  }

  function stopStream(stream: MediaStream) {
    stream.getTracks().forEach((track) => {
      track.stop()
    })

    if (videoRef.current?.srcObject === stream) {
      videoRef.current.srcObject = null
    }

    if (streamRef.current === stream) {
      streamRef.current = null
    }
  }

  function releaseCamera() {
    const stream = streamRef.current

    if (stream) {
      stopStream(stream)
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    if (isMountedRef.current) {
      setIsCameraVisible(false)
    }
  }

  function clearCapturedImage() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }

    previewUrlRef.current = null

    setPreviewUrl(null)
    setCapturedFile(null)
    setErrorMessage(null)
    setStatus('idle')

    onImageReady(null)
  }

  function savePreparedImage(file: File) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }

    const url = URL.createObjectURL(file)

    previewUrlRef.current = url

    setPreviewUrl(url)
    setCapturedFile(file)
    setErrorMessage(null)
    setStatus('captured')

    onImageReady(file)
  }

  async function startCamera() {
    if (disabled) return

    const operationId = ++operationIdRef.current

    clearCapturedImage()
    releaseCamera()

    setErrorMessage(null)

    if (!window.isSecureContext) {
      setErrorMessage(
        'A câmera exige uma conexão segura. Utilize HTTPS ou localhost.',
      )

      setStatus('error')
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage(
        'Este navegador não oferece suporte ao acesso à câmera.',
      )

      setStatus('error')
      return
    }

    setStatus('starting')

    let stream: MediaStream | null = null

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      if (!isCurrentOperation(operationId)) {
        stopStream(stream)
        return
      }

      streamRef.current = stream

      const video = videoRef.current

      if (!video) {
        releaseCamera()
        throw new Error('Elemento de vídeo indisponível.')
      }

      video.srcObject = stream

      await video.play()

      if (!isCurrentOperation(operationId)) {
        stopStream(stream)
        return
      }

      setIsCameraVisible(true)
      setStatus('active')
    } catch (error) {
      if (stream && streamRef.current !== stream) {
        stopStream(stream)
      }

      if (!isCurrentOperation(operationId)) {
        return
      }

      releaseCamera()
      setErrorMessage(getCameraErrorMessage(error))
      setStatus('error')
    }
  }

  function stopCamera() {
    ++operationIdRef.current

    releaseCamera()
    setErrorMessage(null)
    setStatus('idle')
  }

  async function capturePhoto() {
    const video = videoRef.current

    if (
      !video ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      releaseCamera()

      setErrorMessage(
        'A câmera ainda não está pronta para capturar.',
      )

      setStatus('error')
      return
    }

    const operationId = ++operationIdRef.current

    setStatus('processing')
    setErrorMessage(null)

    try {
      const blob = await createJpegBlob(
        video,
        video.videoWidth,
        video.videoHeight,
      )

      if (!isCurrentOperation(operationId)) {
        return
      }

      const file = new File(
        [blob],
        `via-captura-${Date.now()}.jpg`,
        {
          type: 'image/jpeg',
          lastModified: Date.now(),
        },
      )

      releaseCamera()
      savePreparedImage(file)
    } catch (error) {
      if (!isCurrentOperation(operationId)) {
        return
      }

      releaseCamera()

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível capturar a fotografia.',
      )

      setStatus('error')
    }
  }

  async function handleFileSelection(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const input = event.currentTarget
    const file = input.files?.[0]

    input.value = ''

    if (!file) return

    const operationId = ++operationIdRef.current

    releaseCamera()
    clearCapturedImage()

    if (file.size > MAX_SOURCE_SIZE_BYTES) {
      setErrorMessage(
        'O arquivo selecionado ultrapassa o limite de 15 MB.',
      )

      setStatus('error')
      return
    }

    if (file.type && !file.type.startsWith('image/')) {
      setErrorMessage('Selecione um arquivo de imagem válido.')
      setStatus('error')
      return
    }

    setStatus('processing')

    try {
      const bitmap = await createImageBitmap(file)

      let blob: Blob

      try {
        blob = await createJpegBlob(
          bitmap,
          bitmap.width,
          bitmap.height,
        )
      } finally {
        bitmap.close()
      }

      if (!isCurrentOperation(operationId)) {
        return
      }

      const preparedFile = new File(
        [blob],
        `via-imagem-${Date.now()}.jpg`,
        {
          type: 'image/jpeg',
          lastModified: Date.now(),
        },
      )

      savePreparedImage(preparedFile)
    } catch {
      if (!isCurrentOperation(operationId)) {
        return
      }

      setErrorMessage(
        'Não foi possível processar esta imagem. Tente selecionar outra fotografia.',
      )

      setStatus('error')
    }
  }

  function discardImage() {
    ++operationIdRef.current

    clearCapturedImage()
  }

  useEffect(() => {
  const videoElement = videoRef.current
  const operationId = operationIdRef

  isMountedRef.current = true

  return () => {
    isMountedRef.current = false
    operationId.current += 1

    streamRef.current?.getTracks().forEach((track) => {
      track.stop()
    })

    streamRef.current = null

    if (videoElement) {
      videoElement.srcObject = null
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
  }
}, [])

  const isBusy =
    status === 'starting' ||
    status === 'processing'

  const controlsDisabled = disabled || isBusy

  const statusMessages: Record<CameraStatus, string> = {
    idle: 'Câmera desligada. Ative a câmera ou selecione uma imagem.',
    starting: 'Solicitando acesso à câmera...',
    active: 'Câmera ativa. Posicione o ambiente e capture a fotografia.',
    processing: 'Preparando sua imagem...',
    captured: 'Imagem preparada com sucesso.',
    error: 'Ocorreu um problema. Consulte a mensagem de erro.',
  }

  return (
    <section
      className="camera-capture"
      aria-labelledby="camera-title"
    >
      <header className="camera-capture__header">
        <h2 id="camera-title">Captura de imagem</h2>

        <p>
          Utilize a câmera ou selecione uma fotografia
          para preparar uma imagem para o VIA.
        </p>
      </header>

      <p
        className="camera-capture__status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {statusMessages[status]}
      </p>

      {errorMessage && (
        <p
          className="camera-capture__error"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      <div className="camera-capture__preview">
        <video
          ref={videoRef}
          className="camera-capture__media"
          autoPlay
          muted
          playsInline
          hidden={!isCameraVisible}
          aria-label="Pré-visualização da câmera"
        />

        {previewUrl && (
          <img
            src={previewUrl}
            className="camera-capture__media"
            alt="Pré-visualização da fotografia selecionada."
          />
        )}

        {!isCameraVisible && !previewUrl && (
          <div className="camera-capture__placeholder">
            <p>A imagem aparecerá aqui.</p>
          </div>
        )}
      </div>

      <div className="camera-capture__controls">
        <button
          type="button"
          onClick={() => void startCamera()}
          disabled={controlsDisabled || status === 'active'}
          className="camera-capture__button camera-capture__button--primary"
        >
          Ativar câmera
        </button>

        <button
          type="button"
          onClick={() => void capturePhoto()}
          disabled={disabled || status !== 'active'}
          className="camera-capture__button camera-capture__button--primary"
        >
          Capturar fotografia
        </button>

        <button
          type="button"
          onClick={stopCamera}
          disabled={disabled || status !== 'active'}
          className="camera-capture__button camera-capture__button--secondary"
        >
          Encerrar câmera
        </button>

        <label className="camera-capture__button camera-capture__button--secondary">
          Selecionar imagem

          <input
            type="file"
            accept="image/*"
            onChange={(event) => void handleFileSelection(event)}
            disabled={controlsDisabled}
            className="camera-capture__file-input"
            aria-label="Selecionar fotografia do dispositivo"
          />
        </label>

        {previewUrl && (
          <button
            type="button"
            onClick={discardImage}
            disabled={disabled}
            className="camera-capture__button camera-capture__button--danger"
          >
            Descartar imagem
          </button>
        )}
      </div>

      {capturedFile && (
        <div className="camera-capture__file-info">
          <p>
            <strong>Arquivo preparado:</strong>{' '}
            {capturedFile.name}
          </p>

          <p>
            Formato: JPEG | Dimensão máxima: 1024 px |
            Tamanho: {(capturedFile.size / 1024).toFixed(1)} KB
          </p>
        </div>
      )}

      <p className="camera-capture__privacy">
        Sua imagem permanece no navegador nesta etapa.
        Nenhum envio automático é realizado.
      </p>
    </section>
  )
}
