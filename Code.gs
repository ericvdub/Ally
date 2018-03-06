function doGet(e) {

  Logger.log( Utilities.jsonStringify(e) );
  if (!e.parameter.page) {
    // When no specific page requested, return "home page"
    return HtmlService.createTemplateFromFile('index').evaluate();
  }
  // else, use page parameter to pick an html file from the script
  return HtmlService.createTemplateFromFile(e.parameter['page']).evaluate();
}




function getFilterSettings(email){
  
  Logger.log('Filter Settings')
  var ss = SpreadsheetApp.openById("1wMbpZ8Enm_ATgkv2JQ0Nu4GG0d6Juz6xeDwxktGmV_M").getSheetByName("Filter Settings");
  var lastRow = ss.getLastRow();
  var data = ss.getRange("B4:V"+lastRow).getValues();
  Logger.log(data);
  
  var row = filterData(data, email, 1);
  if(!row)
  {
    console.log("Can't find your name in the Chrono \"Filter Settings\" tab. Make sure your name is spelled the exact same on both ends.");
    return false;
  }
  return row; 
}

//**********************************************************************************************************************************************************************
// finds row with matching emails
//**********************************************************************************************************************************************************************
function filterData(data, check, column) {
  for(var i in data)
  {
    if(data[i][column] == check)
      return data[i];
  }
  return false;
}

//**********************************************************************************************************************************************************************
// finds all accounts in designers name
//**********************************************************************************************************************************************************************
function getMyAccounts(designer) {

  var ss = SpreadsheetApp.openById("1wMbpZ8Enm_ATgkv2JQ0Nu4GG0d6Juz6xeDwxktGmV_M").getSheetByName("Report");
  var data = ss.getRange("D2:W").getValues().filter(function(value) { return value[15].toLowerCase() == designer.name || value[15].toLowerCase() == designer.sfName });
  
}

//**********************************************************************************************************************************************************************
// finds all acocunts in designers name
//**********************************************************************************************************************************************************************
function findName(data, check, column) {
  for(var i in data)
  {
    if(data[i][column] == check)
      return data[i];
  }
  return false;
}

/**
 * Get the URL for the Google Apps Script running as a WebApp.
 */
function getScriptUrl() {
 var url = ScriptApp.getService().getUrl();
 return url;
}

function getContent(filename) {
 
  var return1= HtmlService.createTemplateFromFile(filename).getRawContent();
  return return1;
}


