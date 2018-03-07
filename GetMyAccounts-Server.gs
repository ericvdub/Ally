//**********************************************************************************************************************************************************************
// finds all accounts in designers name
//**********************************************************************************************************************************************************************
function getMyAccounts(designer) {
  Logger.log("Get My Accounts " + designer);
  
  var ss = SpreadsheetApp.openById("119oMBUEAWTQe7h6dhY-GQB0sSwpC1vRT6qUdlfisGPs").getSheetByName("Report");
  var data = ss.getRange("J2:W").getValues().filter(function(value) { return value[9].toLowerCase() == designer.name.toLowerCase() || value[9].toLowerCase() == designer.sfName.toLowerCase() });
  Logger.log("In My Name: " + data);
  
  return JSON.stringify(data);
}