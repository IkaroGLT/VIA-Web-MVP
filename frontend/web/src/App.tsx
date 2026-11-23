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

  // Refs mantêm os valores atuais mesmo depois de operações assíncronas.
  const isAnalyzingRef = useRef(false)
  const isListeningRef = useRef(false)
  const selectedImageRef = useRef<File | null>(null)

  function handleImageReady(file: File | null) {
    selectedImageRef.current = file
    setSelectedImage(file)
    setDescription('')
    setAnalysisError('')
  }

  /** Pede a descrição e fala o resultado (VIA-08). */
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

  /** Botão de comando de voz: apertar e falar. */
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
        <a href="/" className="brand" aria-label="VIA - Página inicial">
          <img
            src="/via-logo.png"
            alt="VIA - Página inicial"
            className="brand__logo"
          />
        </a>

        <span className="site-header__badge">
          <span className="status-dot" aria-hidden="true" />
          Protótipo acadêmico
        </span>
      </header>

      <main className="main-content">
        <section className="intro">
          <p className="eyebrow">
            <span className="eyebrow__line" />
            TECNOLOGIA ASSISTIVA COM INTELIGÊNCIA ARTIFICIAL
          </p>

          <h1>
            O mundo ao seu redor,
            <span> em novas perspectivas.</span>
          </h1>

          <p className="intro__description">
            O VIA transforma informações visuais em descrições por áudio,
            ajudando você a compreender melhor o ambiente ao seu redor.
          </p>

          <div className="intro__features" aria-label="Recursos do VIA">
            <span><span aria-hidden="true">✦</span> Visão computacional</span>
            <span><span aria-hidden="true">◉</span> Interação por voz</span>
            <span><span aria-hidden="true">⌁</span> Mais autonomia</span>
          </div>
        </section>

        <section
          className="workspace"
          aria-label="Área de captura e descrição"
        >
          <div className="capture-panel">
            <div className="section-heading">
              <div>
                <p className="section-kicker">01 / CAPTURA</p>
                <h2>Traga o mundo para perto.</h2>
                <p>Capture uma imagem ou escolha uma fotografia para começar.</p>
              </div>
              <span className="step-icon" aria-hidden="true">◎</span>
            </div>

            <div className="capture-panel__content">
              <CameraCapture
                onImageReady={handleImageReady}
                disabled={isAnalyzing}
              />
            </div>
          </div>

          <section
            className="analysis-panel"
            aria-labelledby="analysis-title"
          >
            <div className="section-heading">
              <div>
                <p className="section-kicker">02 / INTELIGÊNCIA</p>
                <h2 id="analysis-title">Descrição inteligente</h2>
                <p>O VIA interpreta a imagem e transforma o conteúdo visual em palavras.</p>
              </div>
              <span className="step-icon step-icon--cyan" aria-hidden="true">✧</span>
            </div>

            <div className="action-buttons">
              <button
                type="button"
                className="action-button"
                onClick={() => void handleDescribeImage()}
                disabled={!selectedImage || isAnalyzing}
              >
                <span aria-hidden="true">✧</span>
                {isAnalyzing ? 'Analisando imagem...' : 'Descrever imagem'}
              </button>

              <button
                type="button"
                className={`action-button action-button--secondary${isListening ? ' is-listening' : ''}`}
                onClick={() => void handleVoiceCommand()}
                aria-label="Falar um comando"
                aria-pressed={isListening}
              >
                <span aria-hidden="true">{isListening ? '◉' : '⌁'}</span>
                {isListening ? 'Ouvindo...' : 'Falar um comando'}
              </button>
            </div>

            {/*
              Sem aria-live / role="alert": o VIA já fala a descrição e os erros.
              Evita que o leitor de tela anuncie o mesmo conteúdo sobre a voz do app.
            */}
            {isAnalyzing && (
              <div className="analysis-status" role="status">
                <span className="loading-indicator" aria-hidden="true" />
                <div>
                  <strong>O VIA está analisando a imagem</strong>
                  <p>Estamos interpretando os elementos visuais. Aguarde um instante.</p>
                </div>
              </div>
            )}

            {analysisError && (
              <div className="analysis-error">
                <strong>Não foi possível concluir a análise</strong>
                <p>{analysisError}</p>
              </div>
            )}

            {description && (
              <div className="description-card">
                <div className="description-card__heading">
                  <span className="description-card__icon" aria-hidden="true">✧</span>
                  <div>
                    <p className="section-kicker">RESULTADO DA ANÁLISE</p>
                    <h3>O que o VIA identificou</h3>
                  </div>
                </div>
                <p className="description-card__text">{description}</p>
              </div>
            )}

            {!description && !isAnalyzing && !analysisError && (
              <div className="analysis-empty">
                <span className="analysis-empty__icon" aria-hidden="true">◉</span>
                <strong>Sua descrição aparecerá aqui</strong>
                <p>Depois de enviar uma imagem, o VIA apresentará uma descrição clara do conteúdo.</p>
              </div>
            )}
          </section>
        </section>

        <aside className="notice">
          <span className="notice__icon" aria-hidden="true">ⓘ</span>
          <div>
            <h2>Uma tecnologia de apoio, não de substituição.</h2>
            <p>
              O VIA é uma solução experimental de acessibilidade. Suas descrições
              podem conter erros e não substituem bengalas, cães-guia ou técnicas
              de orientação e mobilidade. Não utilize suas respostas como garantia
              de segurança para locomoção.
            </p>
          </div>
        </aside>
      </main>

      <footer className="site-footer">
        <span className="site-footer__brand">VIA</span>
        <span>Assistente Inteligente de Acessibilidade</span>
        <span className="site-footer__tagline">DESCREVA · ENTENDA · DESCUBRA</span>
      </footer>
    </div>
  )
}

export default App
