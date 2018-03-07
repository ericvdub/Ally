//**********************************************************************************************************************************************************************
// finds next account in-line, assigns designer to account, returns account designer is assigned to
//**********************************************************************************************************************************************************************
function assign(designer) {
  Logger.log("Assign: " + designer.sfName);  
  
  // Get accounts in personal Queue
  var backlog = myQueue(designer.regions, designer.filterRegions, designer.settings);
  return;
  
  Logger.log("Account: " + row);
  return JSON.stringify(row);
}


//**********************************************************************************************************************************************************************
// finds all accounts in que
//**********************************************************************************************************************************************************************
function myQueue(regions, filterRegions, settings) {
  Logger.log("In Queue: "+ filterRegions[0]);
  var backlog = [];
  // Loop through all chrono's in settings. 
  for(var r in regions) {
    var keyId = chronoIds.filter(function(office) { return office[0] == regions[r] });
    if(regions[r] == "" || keyId.length < 0) {
      continue;
    }
    var check1 = keyId.length;
    var check1 = keyId[0][1];
    var ss = SpreadsheetApp.openById(keyId[0][1]).getSheetByName("Report");
    
    // Sets the index number of each entry into it's own individual/unique variable.
    var header = ss.getRange("J2:W2").getValues()[0]; // Header array is first row and all columns of D2:W range in backlog report sheets.
    var dueStatus = header.indexOf('DUE STATUS'); //=> header[0][1] gimmie da 1...
    var officeCol = header.indexOf('OFFICE'); //=> header[0][2] gimmie da 2...
    var regionCol = header.indexOf('REGION'); //=> header[0][3] gimmie da 3...
    var unitTypeCol = header.indexOf('UNIT TYPE'); //=> header[0][4] gimmie da 4...
    var priorityCol = header.indexOf('PRIORITY'); //=> header[0][5] etc...
    var serviceCol = header.indexOf('SERVICE'); //=> header[0][6]
    var assignedCol = header.indexOf('ASSIGNED'); //=> header[0][7]
    var statusCol = header.indexOf('STATUS'); //=> header[0][8]
    var lastUpdateCol = header.indexOf('LAST UPDATE'); //=> header[0][9]
    var notesCol = header.indexOf('NOTES'); //=> header[0][10]
    
    // create index to setup a limit on how many per chrono to grab
    var index = 0;
    var data = ss.getRange("J2:W").getValues().filter(function(value) {
      
      // if the service number exists and...
      // if the service number isn't assigned then...
      // if settings unitType is not 0...
      // if index is greater than 10, Once we have ten unclaimed accounts from this region move on
      if(index <= 10 && value[serviceCol] != "" && value[assignedCol] == "" && settings[value[unitTypeCol]] ) {
        
        // Filter in or out the filterRegions. [0] = 1:included 0:excluded
        // if [0]= 1 AND filterRegions doesn't contain office then don't add to que
        // else [0]=0 AND filterRegions contains office then don't add to que
        var containsOffice = filterRegions.some(function(office, index) { if(index == 0) { return false; } return value[officeCol].toLowerCase().indexOf(office.toLowerCase()) >-1 });
        if(filterRegions[1] != "" && filterRegions[0] && !containsOffice)
          return false;
        else if(filterRegions[1] != "" && !filterRegions[0] && containsOffice) 
          return false;
        
        
        
        
        value[20] = settings[unitTypeCol];
        index++;
        backlog.push(value);
      }
    });   
  }
  
  
  
  
  // sort to by priority first then oldest account
  backlog.sort(function(a, b) {
    var check1 = a[10];
    var check2 = b[10];
    var test = a[10] - b[10];
    
    if(a[10] != '' || b[10] != '')
    {
        var x = a[10].toLowerCase(), y = b[10].toLowerCase();
        
        return x < y ? 1 : x > y ? -1 : 0;
    }
    return a[5] - b[5] || a[4] - b[4];
    
  });
  
  Logger.log(backlog)
  return backlog;
  
}