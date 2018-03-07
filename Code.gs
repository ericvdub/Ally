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
  Logger.log('Filter Settings');
  var ss = SpreadsheetApp.openById("119oMBUEAWTQe7h6dhY-GQB0sSwpC1vRT6qUdlfisGPs").getSheetByName("Filter Settings");
  var lastRow = ss.getLastRow();
  var data = ss.getRange("B4:V"+lastRow).getValues();

  var row = filterData(data, email, 1);
  if(!row)
  {
    Logger.log("Can't find your name in the Chrono \"Filter Settings\" tab. Make sure your name is spelled the exact same on both ends.");
    return false;
  }
  Logger.log(row);
  return row; 
}

//**********************************************************************************************************************************************************************
// finds row with matching emails
//**********************************************************************************************************************************************************************
function filterData(data, check, column) {
  for(var i in data)
  {
    if(data[i][column] == check) {
      Logger.log(data[i]);
      return data[i];
    }
  }
  Logger.log("FALSE");
  return false;
}

//**********************************************************************************************************************************************************************
// finds all accounts in designers name
//**********************************************************************************************************************************************************************
function getMyAccounts(designer) {
  Logger.log("Get My Accounts " + designer);
  
  var ss = SpreadsheetApp.openById("119oMBUEAWTQe7h6dhY-GQB0sSwpC1vRT6qUdlfisGPs").getSheetByName("Report");
  var data = ss.getRange("D2:W").getValues().filter(function(value) { return value[15].toLowerCase() == designer || value[15].toLowerCase() == designer });
  Logger.log("In My Name: " + data);
  
  return JSON.stringify(data);
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



function test(){
  try{
    Logger.log(getMyAccounts("eric van wagoner"));
  } catch(e) {
    Logger.log("ERROR:", e);
  }
}

