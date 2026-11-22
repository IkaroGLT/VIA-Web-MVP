/**
 * Envio do registro de cada pedido para a planilha (VIA-09).
 *
 * Para onde vai: um Google Apps Script instalado na planilha da equipe
 * (código em ferramentas/planilha/registro.gs). O endereço dele fica na
 * variável de ambiente VITE_URL_PLANILHA:
 *   - no PC: arquivo frontend/web/.env.local (o .gitignore já ignora);
 *   - na Vercel: Settings → Environment Variables.
 *
 * ATENÇÃO: variáveis VITE_ vão para o navegador, ou seja, NÃO são segredo.
 * Tudo bem aqui, porque esse endereço só permite ADICIONAR linhas na planilha.
 * Nunca coloque chaves de API em variáveis VITE_.
 *
 * Se a variável não existir, o registro só aparece no console (não quebra nada).
 */

import { USAR_SIMULADO } from './api'
import type { RegistroPedido } from './fluxo'

/** Mude a cada rodada de teste, para separar os dados no relatório (ex.: 'rodada-1', 'rodada-2'). */
export const VERSAO_APP = 'rodada-1'

const URL_PLANILHA: string | undefined = import.meta.env.VITE_URL_PLANILHA

/**
 * Apelido anônimo do participante, vindo do link. Ex.: .../?participante=P03
 * Aceita só letras, números e hífen (até 10), para ninguém digitar nome ou dado pessoal.
 */
function lerParticipante(): string {
  const valor = new URLSearchParams(window.location.search).get('participante') ?? ''
  return /^[A-Za-z0-9-]{1,10}$/.test(valor) ? valor : 'sem-id'
}

/** Id aleatório desta aba do navegador. Agrupa os pedidos de uma mesma sessão de teste. */
const SESSAO = Math.random().toString(36).slice(2, 10)

/** Envia o registro. Nunca lança erro e não faz o app esperar. */
export function enviarRegistro(registro: RegistroPedido): void {
  const linha = {
    ...registro,
    participante: lerParticipante(),
    sessao: SESSAO,
    simulado: USAR_SIMULADO,
    versao: VERSAO_APP,
  }

  console.info('[VIA] registro do pedido', linha)
  if (!URL_PLANILHA) return

  // Detalhes técnicos (para a banca):
  // - mode 'no-cors' + text/plain: o Apps Script não responde aos cabeçalhos CORS,
  //   e assim o navegador envia mesmo sem poder ler a resposta. Não precisamos dela.
  // - keepalive: o envio continua mesmo se a pessoa fechar a página logo em seguida.
  // - Se estiver sem internet, o registro se perde (limitação aceita no MVP).
  fetch(URL_PLANILHA, {
    method: 'POST',
    mode: 'no-cors',
    keepalive: true,
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(linha),
  }).catch((erro) => console.warn('[VIA] não foi possível enviar o registro', erro))
}
