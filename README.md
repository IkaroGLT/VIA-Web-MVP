# VIA — Assistente Inteligente de Acessibilidade

### Tecnologia para ampliar a autonomia de pessoas com deficiência visual

O **VIA** é um projeto acadêmico de tecnologia assistiva que busca ampliar o acesso à informação e promover maior autonomia para pessoas cegas ou com baixa visão.

A proposta utiliza inteligência artificial para interpretar imagens e disponibilizar descrições em linguagem natural, incluindo respostas faladas.

O projeto foi concebido inicialmente como um kit inteligente que integra óculos com câmera, relógio, fones de condução óssea e smartphone.

O presente repositório corresponde à primeira etapa de desenvolvimento: o **VIA Web MVP**.

Nesta versão, o objetivo é utilizar uma aplicação web acessível para capturar fotografias, interpretar seu conteúdo por inteligência artificial e fornecer descrições em português brasileiro.

> **Status:** MVP em desenvolvimento. A infraestrutura inicial do frontend foi configurada, mas as funcionalidades principais ainda estão em implementação.

---

## 1. Contexto do projeto

### Problema

Pessoas com deficiência visual podem encontrar dificuldades para acessar informações apresentadas visualmente no cotidiano.

Entre os exemplos estão:

- Identificação de objetos.
- Compreensão de fotografias.
- Reconhecimento de informações presentes em embalagens.
- Identificação de elementos visuais de um ambiente.
- Acesso independente a determinadas informações.

O VIA busca investigar como tecnologias de inteligência artificial podem contribuir para reduzir algumas dessas barreiras.

### Solução proposta

Uma aplicação capaz de utilizar a câmera do smartphone para capturar uma fotografia e produzir uma descrição compreensível do conteúdo visual.

A interação deverá ser realizada por controles acessíveis e, quando houver suporte do navegador, por comandos de voz.

---

## 2. Objetivo do MVP

Demonstrar a viabilidade de uma aplicação web que integre:

1. Captura de fotografias.
2. Processamento de imagens por inteligência artificial.
3. Geração de descrições textuais.
4. Reprodução de respostas faladas.
5. Comandos básicos de voz.
6. Recursos de acessibilidade.

### Hipótese principal

> Pessoas com deficiência visual conseguem utilizar uma aplicação web, por comandos de voz ou controles acessíveis, para obter descrições faladas de fotografias capturadas pelo smartphone, com utilidade e tempo de resposta aceitáveis.

Essa hipótese será avaliada durante os testes com usuários.

---

## 3. Funcionalidades previstas

As funcionalidades a seguir representam o escopo do MVP e **não devem ser interpretadas como implementadas**.

| Funcionalidade      | Descrição                                                  | Issue  |
| ------------------- | ---------------------------------------------------------- | ------ |
| Captura de imagem   | Utilizar a câmera do dispositivo para obter uma fotografia | VIA-04 |
| Descrição por IA    | Interpretar imagens utilizando Gemini                      | VIA-05 |
| Resposta falada     | Reproduzir descrições com Text-to-Speech                   | VIA-06 |
| Comandos de voz     | Reconhecer solicitações básicas do usuário                 | VIA-07 |
| Interface acessível | Integrar os recursos com navegação acessível               | VIA-08 |
| Testes técnicos     | Validar funcionamento, segurança e desempenho              | VIA-09 |
| Testes com usuários | Avaliar utilidade e facilidade de uso                      | VIA-10 |

### Exemplos de interação planejada

**Usuário:**

"VIA, descreva o ambiente."

**Sistema:**

"Vou analisar a imagem."

Após a captura e o processamento:

**Sistema:**

"A imagem mostra uma mesa com um notebook aberto e uma garrafa de água. Ao fundo, há duas cadeiras."

Outro comando previsto:

**Usuário:**

"Repita a descrição."

**Sistema:**

Reproduz novamente a última descrição disponível.

O conteúdo das respostas dependerá das imagens analisadas.

---

## 4. Limitações do MVP

O VIA Web MVP não realizará:

- Navegação autônoma.
- Identificação contínua de obstáculos.
- Orientação para atravessar ruas.
- Detecção de colisões em tempo real.
- Reconhecimento facial biométrico.
- Integração com óculos inteligentes.
- Integração com relógios inteligentes.
- Alertas hápticos por dispositivos externos.
- Monitoramento contínuo por vídeo.
- Processamento integralmente offline.

Esses recursos pertencem à visão futura do produto e exigirão estudos adicionais de viabilidade, segurança e acessibilidade.

### Aviso importante

O VIA Web MVP **não é um dispositivo de navegação ou prevenção de acidentes**.

As descrições geradas por inteligência artificial podem conter erros, omissões ou interpretações imprecisas.

O sistema não substitui bengalas, cães-guia, técnicas de orientação e mobilidade ou outras soluções assistivas utilizadas pelos usuários.

---

# 5. Tecnologias

## Frontend

| Tecnologia       | Utilização                        |
| ---------------- | --------------------------------- |
| React            | Construção da interface           |
| TypeScript       | Tipagem e organização do código   |
| Vite             | Desenvolvimento e compilação      |
| Tailwind CSS     | Estilização e responsividade      |
| MediaDevices API | Captura de fotografias            |
| Web Speech API   | Reconhecimento de comandos de voz |
| SpeechSynthesis  | Reprodução das descrições         |

## Backend

O backend ainda não possui implementação.

A arquitetura planejada prevê:

| Tecnologia            | Utilização                           |
| --------------------- | ------------------------------------ |
| Node.js               | Execução da lógica do servidor       |
| Gemini API            | Interpretação multimodal de imagens  |
| Variáveis de ambiente | Proteção das credenciais             |
| Endpoint HTTP         | Comunicação entre frontend e backend |

A escolha final da execução e hospedagem do backend será formalizada durante a VIA-05.

## Desenvolvimento e gerenciamento

- Git.
- GitHub.
- GitHub Projects.
- Pull Requests.
- ESLint.
- npm.

---

# 6. Estrutura atual do projeto

O repositório está organizado em diretórios separados para frontend, backend e documentação.

```text
VIA-Web-MVP/
│
├── backend/
│
├── docs/
│   └── contrato-api.md
│
├── frontend/
│   └── web/
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── services/
│       │   ├── types/
│       │   ├── App.tsx
│       │   ├── index.css
│       │   └── main.tsx
│       │
│       ├── package.json
│       ├── package-lock.json
│       ├── tsconfig.json
│       └── vite.config.ts
│
├── .gitignore
└── README.md
```

**Observação:** a árvore representa a organização funcional planejada a partir da estrutura atual. Alguns diretórios ainda podem estar vazios ou pendentes de criação.

### `backend/`

Diretório reservado para a implementação do backend.

**Estado atual:** sem implementação.

Responsabilidades previstas:

- Receber requisições HTTP.
- Validar imagens.
- Gerenciar a comunicação com Gemini.
- Proteger credenciais.
- Tratar erros.
- Aplicar controles contra abuso da API.

### `frontend/`

Diretório destinado à aplicação web.

**Estado atual:** projeto React com TypeScript, Vite e Tailwind CSS configurados.

O frontend deverá implementar:

- Interface do VIA.
- Captura de imagens.
- Interação por voz.
- Reprodução de respostas.
- Comunicação com o backend.
- Mensagens de erro e carregamento.
- Recursos de acessibilidade.

### `docs/`

Contém a documentação técnica.

O arquivo `contrato-api.md` define o formato de comunicação previsto entre frontend e backend.

---

# 7. Instalação

## 7.1 Pré-requisitos

- Node.js.
- npm.
- Git.
- Navegador atualizado.
- VS Code ou editor equivalente.

## 7.2 Clonar o repositório

```bash
git clone https://github.com/IkaroGLT/VIA-Web-MVP.git
```

Entre no diretório:

```bash
cd VIA-Web-MVP
```

O acesso depende de autorização, pois o repositório é privado.

---

# 8. Executando o frontend

Acesse o diretório da aplicação:

```bash
cd frontend/web
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O endereço local normalmente será:

```text
http://localhost:5173/
```

Abra o endereço informado pelo terminal.

### Verificações

Lint:

```bash
npm run lint
```

Build:

```bash
npm run build
```

O build deverá terminar sem erros.

### Observação

Esses comandos executam e verificam o frontend.

Eles **não inicializam o backend** nem habilitam automaticamente a integração com Gemini.

---

# 9. Executando o backend

**Estado atual: não implementado.**

A implementação ocorrerá na VIA-05.

O backend deverá disponibilizar a operação lógica:

```http
POST /api/describe
```

A configuração de execução local, dependências e publicação será documentada após a escolha da estrutura de hospedagem.

A existência da pasta `backend/` não significa que já exista um servidor funcional.

---

# 10. Contrato de comunicação

O contrato técnico está documentado em:

`docs/contrato-api.md`

### Requisição prevista

```json
{
  "imageBase64": "CONTEUDO_BASE64_DA_IMAGEM",
  "mimeType": "image/jpeg"
}
```

### Resposta prevista

```json
{
  "description": "A imagem mostra uma mesa com um notebook e uma garrafa de água."
}
```

O backend será responsável por validar o conteúdo enviado e produzir uma resposta padronizada.

Os detalhes de validação, tratamento de erros e segurança estão descritos no contrato técnico.

---

# 11. Segurança

A segurança é um requisito obrigatório do VIA.

## 11.1 Credenciais

A chave Gemini será utilizada exclusivamente no backend.

Variável prevista:

```env
GEMINI_API_KEY=
```

Regras:

- Não adicionar chaves ao GitHub.
- Não incluir credenciais em arquivos públicos.
- Não utilizar chaves no código React.
- Não utilizar `VITE_GEMINI_API_KEY`.
- Não compartilhar credenciais entre integrantes.
- Não registrar informações sensíveis nos logs.

## 11.2 Privacidade

A implementação deverá garantir que:

- O acesso à câmera seja autorizado pelo usuário.
- Fotografias sejam capturadas somente mediante solicitação.
- As imagens não sejam armazenadas permanentemente pela aplicação.
- Fotografias não sejam incluídas em logs.
- O usuário seja informado sobre o processamento externo das imagens.

## 11.3 Validação de entrada

O backend deverá:

- Validar o formato da imagem.
- Verificar o tamanho permitido.
- Rejeitar requisições inválidas.
- Tratar falhas da API Gemini.
- Impedir exposição de informações internas.
- Implementar controles contra consumo excessivo.

## 11.4 Comunicação

A versão publicada deverá utilizar HTTPS.

A configuração de hospedagem deverá ser avaliada antes da disponibilização da aplicação para testes externos.

---

# 12. Testes de qualidade

## Testes já executados

| Verificação                         | Resultado            |
| ----------------------------------- | -------------------- |
| Inicialização do projeto React      | Aprovado             |
| Instalação de dependências          | Aprovada             |
| ESLint                              | Sem erros reportados |
| Compilação TypeScript               | Aprovada             |
| Build Vite                          | Aprovado             |
| Verificação inicial do `.gitignore` | Aprovada             |

Esses resultados correspondem à infraestrutura inicial do frontend.

Não representam a aprovação das funcionalidades futuras.

## Testes ainda necessários

- [ ] Captura de fotografias.
- [ ] Comunicação com o backend.
- [ ] Análise de imagem pelo Gemini.
- [ ] Descrição textual.
- [ ] Reprodução por voz.
- [ ] Reconhecimento de comandos.
- [ ] Tratamento de erros.
- [ ] Compatibilidade com TalkBack.
- [ ] Testes de segurança da API.
- [ ] Medição de desempenho.
- [ ] Testes com usuários reais.

---

# 13. GitHub Projects

O desenvolvimento é acompanhado pelo GitHub Projects.

### Status

| Status      | Significado                 |
| ----------- | --------------------------- |
| Backlog     | Atividade registrada        |
| Ready       | Pronta para desenvolvimento |
| In Progress | Em desenvolvimento          |
| In Review   | Aguardando revisão          |
| Done        | Concluída e aprovada        |

### Fluxo de trabalho

1. Selecionar a issue.
2. Criar uma branch.
3. Implementar a atividade.
4. Executar as verificações aplicáveis.
5. Criar um Pull Request.
6. Solicitar revisão.
7. Corrigir problemas, se necessário.
8. Integrar as alterações à `main`.
9. Atualizar o GitHub Projects.

Nenhuma issue deverá ser considerada concluída apenas porque seu planejamento foi aprovado.

---

# 14. Responsabilidades

O projeto possui dois integrantes.

## Ikaro Guilherme

| Issue  | Descrição                                  |
| ------ | ------------------------------------------ |
| VIA-01 | Planejamento e requisitos                  |
| VIA-02 | Entrevistas e levantamento de necessidades |
| VIA-03 | Arquitetura e configuração                 |
| VIA-04 | Captura de imagens                         |
| VIA-05 | Integração com Gemini                      |

## Segundo integrante

| Issue  | Descrição                               |
| ------ | --------------------------------------- |
| VIA-06 | Síntese de voz                          |
| VIA-07 | Reconhecimento de comandos              |
| VIA-08 | Integração e acessibilidade             |
| VIA-09 | Testes técnicos, segurança e desempenho |
| VIA-10 | Validação com usuários e apresentação   |

Os integrantes poderão colaborar em revisões e testes sem alterar a responsabilidade principal pelas issues.

---

# 15. Padrão de desenvolvimento

Cada issue deverá possuir uma branch própria.

Exemplos:

```text
VIA-03-setup
VIA-04-camera
VIA-05-gemini
VIA-06-tts
VIA-07-voice
```

### Critérios de revisão

Um Pull Request somente deverá ser aprovado quando:

- Atender ao objetivo da issue.
- Não incluir credenciais.
- Não apresentar alterações indevidas.
- Possuir código compreensível.
- Passar pelo lint.
- Passar pelo build, quando aplicável.
- Atender aos testes pertinentes.
- Possuir documentação atualizada quando necessário.

---

# 16. Testes com usuários

A validação do MVP buscará envolver pessoas do público-alvo, preferencialmente de 5 a 10 participantes.

Serão observados:

1. Conclusão das tarefas.
2. Tempo necessário para executá-las.
3. Dificuldades encontradas.
4. Utilidade percebida, em escala de 1 a 5.

Os resultados deverão ser apresentados de maneira anonimizada, com consentimento dos participantes.

A equipe deverá informar quais alterações foram realizadas no MVP a partir das entrevistas e dos testes.

---

# 17. Cronograma

**Apresentação do MVP e Demo Day:** 23/11/2026.

| Data prevista | Atividade                           |
| ------------- | ----------------------------------- |
| 17/11         | Planejamento e arquitetura inicial  |
| 18/11         | Captura de imagens e síntese de voz |
| 19/11         | Gemini e comandos de voz            |
| 20/11         | Integração                          |
| 21/11         | Testes técnicos                     |
| 22/11         | Validação e ensaio                  |
| 23/11         | Demonstração do MVP                 |

O cronograma é uma previsão e deverá ser atualizado conforme o avanço real das issues.

---

# 18. Situação atual

**Atualização:** 17/11/2026.

### Frontend

- [x] Ambiente Node.js configurado.
- [x] Repositório clonado.
- [x] React inicializado.
- [x] TypeScript configurado.
- [x] Vite configurado.
- [x] Tailwind CSS instalado.
- [x] ESLint validado.
- [x] Build inicial aprovado.
- [ ] Captura de câmera implementada.
- [ ] Integração com API implementada.
- [ ] Funcionalidades de voz implementadas.
- [ ] Interface final implementada.

### Backend

- [x] Diretório reservado na estrutura local.
- [ ] Projeto de backend inicializado.
- [ ] Dependências configuradas.
- [ ] Endpoint `/api/describe` implementado.
- [ ] Gemini integrado.
- [ ] Proteção de credenciais validada.
- [ ] Validações de entrada implementadas.
- [ ] Testes de backend executados.

**O backend ainda não está funcional.**

### Documentação e gerenciamento

- [x] Repositório criado.
- [x] GitHub Projects configurado.
- [x] Issues criadas e aprovadas para execução.
- [x] Contrato inicial da API documentado.
- [ ] Arquitetura validada integralmente.
- [ ] Primeiro Pull Request aprovado.
- [ ] Aplicação integrada.
- [ ] MVP validado com usuários.

---

# 19. Referências

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Gemini API](https://ai.google.dev/gemini-api/docs)
- [MDN Web APIs](https://developer.mozilla.org/)
- [GitHub Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects)

---

# 20. Informações acadêmicas

- **Projeto:** VIA — Assistente Inteligente de Acessibilidade
- **Curso:** Análise e Desenvolvimento de Sistemas
- **Instituição:** UNINASSAU
- **Disciplina:** Laboratório de Empreendimentos Inovadores
- **Professor:** Rafael Rodrigues

Este projeto possui caráter acadêmico e experimental.

Seu objetivo é demonstrar a viabilidade de uma proposta de tecnologia assistiva e reunir evidências para orientar seu desenvolvimento futuro.

---

## VIA — Tecnologia para ampliar o acesso à informação

**Mais informação. Mais acessibilidade. Mais possibilidades de autonomia.**
