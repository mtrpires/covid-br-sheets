/* 

@mtrpires 
github.com/mtrpires
twitter.com/mtrpires

Planilha do Google Sheets que raspa os dados de covid.saude.gov.br e disponibiliza
em formato legível por máquina. As atualizações são feitas automaticamente usando
o sistema de tarefas agendadas do Google. Aprenda como usar esse script em: 

github.com/mtrpires/covid-br-sheets/

Sugestões, críticas & pull requests são bem-vindos; abra uma issue no Github!

*/ 

// Guarda um pedaço da URL de requisição na variável base_url
var base_url = "https://xx9p7hp1p7.execute-api.us-east-1.amazonaws.com/prod/";

// Guarda o nome de cada pasta na planilha
var sheet_dias = "Dias";
var sheet_acumulo = "Acumulo";
var sheet_semana = "Semana";
var sheet_regiao = "Regiao";
var sheet_geral = "Geral";
var sheet_mapa = "Mapa";

// Guarda parâmetros da requisição na variável fetch_payload
var fetch_payload = {
  "credentials":"omit","headers":{
    "accept":"application/json, text/plain, */*",
    "accept-language":"pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    "sec-fetch-dest":"empty",
    "sec-fetch-mode":"cors",
    "sec-fetch-site":"cross-site",
    "x-parse-application-id":"unAFkcaNDeXajurGB7LChj8SgQYS2ptm"
  },
  "referrer":"https://covid.saude.gov.br/",
  "referrerPolicy":"no-referrer-when-downgrade",
  "body":null,
  "method":"GET",
  "mode":"cors"
}

/* 
 Cria função para verificar se os dados foram atualizados no site
 Caso os dados não tenham sido atualizados, nada é feito
 Caso os dados tenham sido atualizados, executa a função 'main'
*/
function isUpdated() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet_geral);
  var request = UrlFetchApp.fetch(base_url + "Portal" + sheet_geral, fetch_payload).getContentText();
  var json = JSON.parse(request);
  var dt_live = json.results[0]['dt_atualizacao'];
  var dt_current = sheet.getRange('E2').getValue();
  if (dt_live == dt_current) {
    Logger.log('Spreadsheet data is already up to date.'); 
  }
    else {
      main();
    }
  }

// Função guarda-chuva
function main(){
  
  // Verifica se as pastas foram criadas manualmente, caso contrário, cria-as
  function sheetCheck() {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var dias = spreadsheet.getSheetByName(sheet_dias);
    var acumulo = spreadsheet.getSheetByName(sheet_acumulo);
    var semana = spreadsheet.getSheetByName(sheet_semana);
    var regiao = spreadsheet.getSheetByName(sheet_regiao);
    var geral = spreadsheet.getSheetByName(sheet_geral);
    var mapa = spreadsheet.getSheetByName(sheet_mapa);

    if (dias == null) {
      dias = spreadsheet.insertSheet();
      dias.setName(sheet_dias);
      var rowData = ['data', 'created_at', 'updated_at', 'qtd_confirmado', 'qtd_obito'];
      dias.insertRowBefore(1).getRange(1, 1, 1, rowData.length).setValues([rowData]);
    }
    if (acumulo == null) {
      acumulo = spreadsheet.insertSheet();
      acumulo.setName(sheet_acumulo);
      var rowData = ['data', 'created_at', 'updated_at', 'qtd_confirmado', 'qtd_obito', 'taxa_letalidade'];
      acumulo.insertRowBefore(1).getRange(1, 1, 1, rowData.length).setValues([rowData]);
    }
    if (semana == null) {
      semana = spreadsheet.insertSheet();
      semana.setName(sheet_semana); 
      var rowData = ['semana_epidemiologica', 'created_at', 'updated_at', 'qtd_confirmado', 'qtd_obito'];
      semana.insertRowBefore(1).getRange(1, 1, 1, rowData.length).setValues([rowData]);
    }
    if (regiao == null) {
      regiao = spreadsheet.insertSheet();
      regiao.setName(sheet_regiao);
      var rowData = ['regiao', 'percent', 'qtd', 'createdAt', 'updatedAt'];
      regiao.insertRowBefore(1).getRange(1, 1, 1, rowData.length).setValues([rowData]);
    }
    if (geral == null) {
      geral = spreadsheet.insertSheet();
      geral.setName(sheet_geral);
      var rowData = ['total_confirmado', 'created_at', 'updated_at', 'total_obitos', 'dt_atualização', 'total_letalidade'];
      geral.insertRowBefore(1).getRange(1, 1, 1, rowData.length).setValues([rowData]);
    }
    if (mapa == null) {
      mapa = spreadsheet.insertSheet();
      mapa.setName(sheet_mapa);
      var rowData = ['estado', 'qtd', 'latitude', 'longitude', 'createdAt', 'updatedAte'];
      mapa.insertRowBefore(1).getRange(1, 1, 1, rowData.length).setValues([rowData]);
    }
}
  // Cria função que remove linhas duplicadas
  function removeDuplicates(sheet) {
    var table = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = table.getSheetByName(sheet);
    var data = sheet.getDataRange().getValues();
    var newData = [];
    for (var i in data) {
      var row = data[i];
      var duplicate = false;
      for (var j in newData) {
        if (row.join() == newData[j].join()) {
          duplicate = true;
        }
      }
      if (!duplicate) {
        newData.push(row);
      }
    }
    sheet.clearContents();
    sheet.getRange(1, 1, newData.length, newData[0].length).setValues(newData);
  }
  // Função que raspa os dados da requisição PortalDias
  function scrapeDias() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet_dias);
    var request = UrlFetchApp.fetch(base_url + "Portal" + sheet_dias, fetch_payload).getContentText();
    var json = JSON.parse(request);
    var rows = [],
        data;
    for (i = 0; i < json.results.length; i++) {
      data = json.results[i];
      rows.push([data['label'], data['createdAt'], data['updatedAt'], data['qtd_confirmado'], data['qtd_obito']]);
    }
    var dataRange = sheet.getRange(2, 1, rows.length, 5);
    dataRange.setValues(rows);
  }
  // Função que raspa os dados da requisição PortalAcumulo
  function scrapeAcumulo() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet_acumulo);
    var request = UrlFetchApp.fetch(base_url + "Portal" + sheet_acumulo, fetch_payload).getContentText();
    var json = JSON.parse(request);
    var rows = [],
        data;
    for (i = 0; i < json.results.length; i++) {
      data = json.results[i];
      var taxa_letalidade = parseFloat(data['qtd_obito'])/parseFloat(data['qtd_confirmado']);
      rows.push([data['label'], data['createdAt'], data['updatedAt'], data['qtd_confirmado'], data['qtd_obito'], taxa_letalidade]);
    }
    var dataRange = sheet.getRange(2, 1, rows.length, 6);
    dataRange.setValues(rows);    
  }
  // Função que raspa os dados da requisição PortalSemana
  function scrapeSemana() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet_semana);
    var request = UrlFetchApp.fetch(base_url + "Portal" + sheet_semana, fetch_payload).getContentText();
    var json = JSON.parse(request);
    var rows = [],
        data;
    for (i = 0; i < json.results.length; i++) {
      data = json.results[i];
      rows.push([data['label'], data['createdAt'], data['updatedAt'], data['qtd_confirmado'], data['qtd_obito']]);
    }
    var dataRange = sheet.getRange(2, 1, rows.length, 5);
    dataRange.setValues(rows); 
  }
  // Função que raspa os dados da requisição PortalRegiao
  function scrapeRegiao() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet_regiao);
    var request = UrlFetchApp.fetch(base_url + "Portal" + sheet_regiao, fetch_payload).getContentText();
    var json = JSON.parse(request);
    var rows = [],
        data;
    var lastRow = sheet.getLastRow();
    for (i = 0; i < json.results.length; i++) {
      data = json.results[i];
      rows.push([data['nome'], data['percent'].slice(0,-1), data['qtd'], data['createdAt'], data['updatedAt']]);
    }
    var dataRange = sheet.getRange(lastRow+1, 1, rows.length, 5);
    dataRange.setValues(rows);  
  };
  // Função que raspa os dados da requisição PortalGeral
  function scrapeGeral() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet_geral);
    var request = UrlFetchApp.fetch(base_url + "Portal" + sheet_geral, fetch_payload).getContentText();
    var json = JSON.parse(request);
    var rows = [],
        data;
    for (i = 0; i < json.results.length; i++) {
      data = json.results[i];
      rows.push([data['total_confirmado'], data['createdAt'], data['updatedAt'], data['total_obitos'], data['dt_atualizacao'], data['total_letalidade'].slice(0,-1)]);
    }
    var dataRange = sheet.getRange(2, 1, rows.length, 6);
    dataRange.setValues(rows);  
  }
   // Função que raspa os dados da requisição PortalMapa     
   function scrapeMapa() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet_mapa);
    var request = UrlFetchApp.fetch(base_url + "Portal" + sheet_mapa, fetch_payload).getContentText();
    var json = JSON.parse(request);
    var rows = [],
        data;
    var lastRow = sheet.getLastRow();
    for (i = 0; i < json.results.length; i++) {
      data = json.results[i];
      rows.push([data['nome'], data['qtd_confirmado'], data['latitude'], data['longitude'], data['createdAt'], data['updatedAt']]);
    }
    var dataRange = sheet.getRange(lastRow+1, 1, rows.length, 6);
    dataRange.setValues(rows);  
  }
  // Executa as funções, uma a uma
  sheetCheck();
  scrapeDias();
  scrapeAcumulo();
  scrapeSemana();
  scrapeRegiao();
  scrapeGeral();
  scrapeMapa();
  removeDuplicates(sheet_mapa);
  removeDuplicates(sheet_regiao);
  // Guarda a confirmação da execução no log
  Logger.log('Data updated successfully');
}
