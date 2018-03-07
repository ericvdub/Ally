//**********************************************************************************************************************************************************************
// finds all accounts in designers name
//**********************************************************************************************************************************************************************
function assign(filterSettings) {
  Logger.log("Assign" + filterSettings[0]);
  
  var ss = SpreadsheetApp.openById("119oMBUEAWTQe7h6dhY-GQB0sSwpC1vRT6qUdlfisGPs").getSheetByName("Report");
  var data = ss.getRange("D2:W").getValues().filter(function(value) { return value[15].toLowerCase() == designer || value[15].toLowerCase() == designer });
  Logger.log("In My Name: " + data);
  
  return JSON.stringify(data);
}
