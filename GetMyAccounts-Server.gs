//**********************************************************************************************************************************************************************
// finds all accounts in designers name
//**********************************************************************************************************************************************************************
function getMyAccounts(designer) {
  console.log("Get My Accounts " + JSON.stringify(designer));
  var backlog = [];
  // ***keyId = getChronoId(accountInfo[0])[1];
  
  if(designer.dept === "CP")
    var chronoIds = cpChronoIds;
  else
    var chronoIds = ppChronoIds;
  for(var c in chronoIds) {
//    Logger.log("Region " + chronoIds[c]);
    
    var ss = SpreadsheetApp.openById(chronoIds[c][1]).getSheetByName("Report");
    var header = ss.getRange("2:2").getValues()[0]; // Header array is first row and all columns of D2:W range in backlog report sheets. "D2:X2"
    var regionCol = header.indexOf('REGION');
    var dueDateCol = header.indexOf('DUE DATE') - regionCol; 
    var assignedCol = header.indexOf('ASSIGNED') - regionCol; 
    var lastUpdateCol = header.indexOf('LAST UPDATE') - regionCol;
    
    if(designer.master) {
      ss.getRange(3, regionCol+1, ss.getLastRow(), lastUpdateCol+1).getValues().filter(function(value) {
        // Find accounts in designers name
        if(value[assignedCol] !== "" && (designer.allNames.indexOf(value[assignedCol]) > -1 || designer.allsfNames.indexOf(value[assignedCol]) > -1)) {
          value[dueDateCol] = dateFormat(value[dueDateCol]);
          value[lastUpdateCol] = dateFormat(value[lastUpdateCol]);
          if(designer.dept === "CP")
            value.splice(3,1); //Remove CAD Object column
          backlog.push(value);
        }
      });
    }
    else {
      ss.getRange(3, regionCol+1, ss.getLastRow(), lastUpdateCol+1).getValues().filter(function(value) {
        // Find accounts in designers name
        if((value[assignedCol].toString().toLowerCase().indexOf(designer.name.toLowerCase()) > -1 || value[assignedCol].toString().toLowerCase() == designer.sfName.toLowerCase()) && value[assignedCol] !== "") {
          value[dueDateCol] = dateFormat(value[dueDateCol]);
          value[lastUpdateCol] = dateFormat(value[lastUpdateCol]);
          if(designer.dept === "CP")
            value.splice(3,1); //Remove CAD Object column
          backlog.push(value);
        }
      });
    }
    
  }
  
  
  if(backlog.length > 0) {
    // Sort my accounts with backlog sort settings
    backlog = sortBacklog(backlog);
    
    var header = ss.getRange(2, regionCol+1, 1, lastUpdateCol+1).getValues()[0];
    if(designer.dept === "CP")
      header.splice(3,1); //Remove CAD Object column
    backlog.unshift(header);
  }
  
  console.log("Return My Accounts " + JSON.stringify(backlog) + " *****Desinger***** " + JSON.stringify(designer));
  return JSON.stringify(backlog);
}


function dateFormat(date) {
  if(!(date instanceof Date))
    return "";
  var month = ("0" + (date.getMonth()+1)).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);
  var year = date.getYear(); 
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = month + "-" + day + "-" + year + " " + hours + ':' + minutes + " " + ampm;
  return strTime;
}