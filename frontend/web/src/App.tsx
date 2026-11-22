
import { useRef, useState } from 'react'

import CameraCapture from './components/CameraCapture'
import { ouvirComando, type Comando, type ResultadoComando } from './services/comandos'
import { descreverEFalar, obterUltimaDescricao, type OrigemPedido } from './services/fluxo'
import { AJUDA, COMANDOS, NADA_PARA_REPETIR } from './services/mensagens'
import { estaFalando, falar, pararFala } from './services/voz'

import './App.css'

/** Frase falada quando o comando de voz não deu certo (VIA-07). */
function fraseDeFalha(resultado: Extract<ResultadoComando, { ok: false }>): string {
  switch (resultado.motivo) {
    case 'sem_suporte':
      return COMANDOS.semSuporte
    case 'microfone_negado':
      return COMANDOS.microfoneNegado
    case 'nao_ouvi':
      return COMANDOS.naoOuvi
    case 'nao_entendi':
      return COMANDOS.naoEntendi
    default:
      return COMANDOS.erroReconhecimento
  }
}

function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const [isListening, setIsListening] = useState(false)

  // Refs: valores lidos NA HORA, inclusive depois de um await (o state da
  // renderização antiga ficaria desatualizado dentro do comando de voz).
  const isAnalyzingRef = useRef(false)
  const isListeningRef = useRef(false)
  const selectedImageRef = useRef<File | null>(null)

  function handleImageReady(file: File | null) {
    selectedImageRef.current = file
    setSelectedImage(file)
    setDescription('')
    setAnalysisError('')
  }

  /**
   * Pede a descrição e FALA o resultado (VIA-08).
   * A voz, os erros falados e o registro de tempos ficam em services/fluxo.ts.
   */
  async function handleDescribeImage(origem: OrigemPedido = 'toque') {
    const image = selectedImageRef.current

    if (!image || isAnalyzingRef.current) {
      return
    }

    isAnalyzingRef.current = true
    setIsAnalyzing(true)
    setDescription('')
    setAnalysisError('')

    try {
      const result = await descreverEFalar(image, origem)

      if (result.ok) {
        setDescription(result.descricao)
      } else {
        setAnalysisError(result.mensagem)
      }
    } finally {
      isAnalyzingRef.current = false
      setIsAnalyzing(false)
    }
  }

  /** Executa um comando reconhecido (VIA-07). */
  async function runCommand(command: Comando) {
    switch (command) {
      case 'descrever':
        if (isAnalyzingRef.current) {
          await falar(COMANDOS.aguarde)
        } else if (!selectedImageRef.current) {
          await falar(COMANDOS.precisaFoto)
        } else {
          await handleDescribeImage('voz')
        }
        return
      case 'repetir':
        await falar(obterUltimaDescricao() ?? NADA_PARA_REPETIR)
        return
      case 'ajuda':
        await falar(AJUDA)
        return
      case 'parar':
        pararFala()
        return
    }
  }

  /**
   * Botão "Falar um comando" (VIA-07, nível 1: apertar e falar).
   * Se o VIA estiver falando, o botão apenas cala a fala.
   */
  async function handleVoiceCommand() {
    if (estaFalando()) {
      pararFala()
      return
    }

    if (isListeningRef.current) {
      return
    }

    isListeningRef.current = true
    setIsListening(true)

    try {
      // Espera o "Pode falar" TERMINAR antes de abrir o microfone,
      // senão o reconhecimento ouve a própria voz do app.
      await falar(COMANDOS.podeFalar)
      const result = await ouvirComando()
      console.info('[VIA] comando de voz', result)

      isListeningRef.current = false
      setIsListening(false)

      if (result.ok) {
        await runCommand(result.comando)
      } else {
        await falar(fraseDeFalha(result))
      }
    } finally {
      isListeningRef.current = false
      setIsListening(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a
          href="/"
          className="brand"
          aria-label="VIA - Página inicial"
        >
          <span className="brand__name">VIA</span>
          <span className="brand__subtitle">
            Assistente visual
          </span>
        </a>

        <span className="site-header__badge">
          Protótipo acadêmico
        </span>
      </header>

      <main className="main-content">
        <section className="intro">
          <p className="eyebrow">TECNOLOGIA ASSISTIVA</p>

          <h1>
            Mais acesso à informação.
            <span> Mais autonomia.</span>
          </h1>

          <p>
            O VIA utiliza inteligência artificial para transformar
            informações visuais em descrições compreensíveis.
          </p>
        </section>

        <section
          className="workspace"
          aria-label="Área de captura e descrição"
        >
          <CameraCapture
            onImageReady={handleImageReady}
            disabled={isAnalyzing}
          />

          <section
            className="analysis-panel"
            aria-labelledby="analysis-title"
          >
            <div className="analysis-panel__intro">
              <h2 id="analysis-title">
                Descrição inteligente
              </h2>

              <p>
                Prepare uma fotografia e solicite ao VIA
                que descreva o conteúdo visual.
              </p>
            </div>

            <div className="action-buttons">
              <button
                type="button"
                className="action-button"
                onClick={() => void handleDescribeImage()}
                disabled={!selectedImage || isAnalyzing}
              >
                {isAnalyzing
                  ? 'Analisando imagem...'
                  : 'Descrever imagem'}
              </button>

              <button
                type="button"
                className="action-button action-button--secondary"
                onClick={() => void handleVoiceCommand()}
                aria-label="Falar um comando"
              >
                {isListening ? 'Ouvindo...' : 'Falar um comando'}
              </button>
            </div>

            {/*
              Sem aria-live / role="alert" nos três blocos abaixo: o VIA já FALA
              o "analisando", a descrição e os erros (services/fluxo.ts).
              Com aria-live, o TalkBack leria o mesmo texto por cima da voz.
            */}
            {isAnalyzing && (
              <p className="analysis-status">
                O VIA está interpretando a fotografia.
                Aguarde a resposta.
              </p>
            )}

            {analysisError && (
              <p className="analysis-error">
                {analysisError}
              </p>
            )}

            {description && (
              <div className="description-card">
                <h3>Descrição do VIA</h3>

                <p>{description}</p>
              </div>
            )}

            {!description && !isAnalyzing && !analysisError && (
              <p className="analysis-empty">
                A descrição produzida pela inteligência artificial
                aparecerá aqui.
              </p>
            )}
          </section>
        </section>

        <section className="notice">
          <h2>Sobre o protótipo</h2>

          <p>
            O VIA é uma solução experimental de acessibilidade.
            Suas descrições podem conter erros e não substituem
            bengalas, cães-guia ou técnicas de orientação e mobilidade.
            Não utilize suas respostas como garantia de segurança
            para locomoção.
          </p>
        </section>
      </main>

      <footer className="site-footer">
        VIA — Assistente Inteligente de Acessibilidade
      </footer>
    </div>
  )
}

export default App
