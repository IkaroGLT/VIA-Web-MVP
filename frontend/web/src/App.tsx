
import { useState } from 'react'

import CameraCapture from './components/CameraCapture'
import { describeImage } from './services/descriptionService'

import './App.css'

function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState('')

  function handleImageReady(file: File | null) {
    setSelectedImage(file)
    setDescription('')
    setAnalysisError('')
  }

  async function handleDescribeImage() {
    if (!selectedImage || isAnalyzing) {
      return
    }

    setIsAnalyzing(true)
    setDescription('')
    setAnalysisError('')

    try {
      const result = await describeImage(selectedImage)

      setDescription(result)
    } catch (error) {
      setAnalysisError(
        error instanceof Error
          ? error.message
          : 'Não foi possível analisar a imagem.',
      )
    } finally {
      setIsAnalyzing(false)
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

            {isAnalyzing && (
              <p
                className="analysis-status"
                role="status"
                aria-live="polite"
              >
                O VIA está interpretando a fotografia.
                Aguarde a resposta.
              </p>
            )}

            {analysisError && (
              <p
                className="analysis-error"
                role="alert"
              >
                {analysisError}
              </p>
            )}

            {description && (
              <div
                className="description-card"
                aria-live="polite"
              >
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
