/**
 * VIA — Registro de pedidos no Google Sheets (VIA-09).
 *
 * Este código NÃO roda no app nem na Vercel. Ele roda DENTRO da planilha,
 * no Google Apps Script (Extensões → Apps Script). Passo a passo de instalação
 * em docs/ROTEIRO-DE-TESTES.md, seção 3.
 *
 * O app manda, a cada pedido, uma linha com tempos e resultado.
 * NUNCA chega foto nem dado pessoal: só números, códigos e um apelido anônimo
 * do participante (ex.: P01).
 */

/** Ordem das colunas na aba "Registros". */
var COLUNAS = [
  'recebidoEm',     // quando a planilha recebeu (horário do Google)
  'dataHora',       // quando a pessoa tocou (horário do celular, UTC)
  'participante',   // apelido anônimo vindo do link (?participante=P01)
  'sessao',         // id aleatório da aba do navegador (agrupa pedidos da mesma sessão)
  'origem',         // 'toque' ou 'voz'
  'resultado',      // 'sucesso' ou código do erro
  'msAteVoz',       // do toque até a voz da descrição começar (meta: 15000)
  'msIA',           // tempo do backend + IA
  'faladaAteOFim',  // a descrição foi falada até o fim? (definição de sucesso)
  'simulado',       // true = backend simulado (não conta para o relatório)
  'versao'          // versão do app (muda entre rodadas de teste)
];

var NOME_ABA = 'Registros';

function doPost(e) {
  try {
    var dados = JSON.parse(e.postData.contents);
    var aba = obterAba();
    var linha = [new Date()];

    for (var i = 1; i < COLUNAS.length; i++) {
      linha.push(limpar(dados[COLUNAS[i]]));
    }

    aba.appendRow(linha);
    return ContentService.createTextOutput('ok');
  } catch (erro) {
    // Não devolvemos detalhes do erro para quem chamou (segurança).
    return ContentService.createTextOutput('erro');
  }
}

/** Pega a aba "Registros"; se não existir, cria com o cabeçalho. */
function obterAba() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(NOME_ABA);
  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA);
    aba.appendRow(COLUNAS);
    aba.setFrozenRows(1);
  }
  return aba;
}

/**
 * Limpa cada valor antes de gravar:
 * - números e true/false passam direto;
 * - textos são cortados em 60 caracteres;
 * - textos que começam com = + - @ ganham um apóstrofo na frente, para a planilha
 *   não executar como fórmula (proteção contra "injeção de fórmula", já que o link
 *   do script é público).
 */
function limpar(valor) {
  if (valor === null || valor === undefined) return '';
  if (typeof valor === 'number' || typeof valor === 'boolean') return valor;
  var texto = String(valor).slice(0, 60);
  if (/^[=+\-@]/.test(texto)) texto = "'" + texto;
  return texto;
}
