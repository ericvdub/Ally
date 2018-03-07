function getFilterSettings(email){
  Logger.log('Filter Settings');
  var ss = SpreadsheetApp.openById("119oMBUEAWTQe7h6dhY-GQB0sSwpC1vRT6qUdlfisGPs").getSheetByName("Filter Settings");
  var lastRow = ss.getLastRow();
  var row = ss.getRange("B4:V"+lastRow).getValues().filter(function(value) { return value[1] == email });

  if(!row)
  {
    Logger.log("Can't find your name in the Chrono \"Filter Settings\" tab. Make sure your name is spelled the exact same on both ends.");
    return false;
  }
  Logger.log(row);
  return row[0]; 
}