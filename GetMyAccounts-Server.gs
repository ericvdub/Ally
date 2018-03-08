//**********************************************************************************************************************************************************************
// finds all accounts in designers name
//**********************************************************************************************************************************************************************
function getMyAccounts(designer) {
  Logger.log("Get My Accounts " + designer);
  
  var ss = SpreadsheetApp.openById("119oMBUEAWTQe7h6dhY-GQB0sSwpC1vRT6qUdlfisGPs").getSheetByName("Report");
  var data = ss.getRange("J2:W").getValues().filter(function(value) { return value[9].toLowerCase() == designer.name.toLowerCase() || value[9].toLowerCase() == designer.sfName.toLowerCase() });
  Logger.log("In My Name: " + data);
  
  if(data.length > 0) {
    // Sort my accounts with backlog sort settings
    data = sortBacklog(data);
    
    var header = ss.getRange("J2:W2").getValues()[0];
    data.unshift(header);
  }
  return JSON.stringify(data);
}