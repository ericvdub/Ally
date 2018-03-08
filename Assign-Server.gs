//**********************************************************************************************************************************************************************
// finds next account in-line, assigns designer to account, returns account designer is assigned to
//**********************************************************************************************************************************************************************
function getAssignment(designer) {
  Logger.log("Assign: " + designer.sfName);  

  // Get accounts in personal Queue
  var que = myQueue(designer.regions, designer.filterRegions, designer.settings);
  // loop through each account until we assign one successfully
  for(var b in que) {
    if(que[b][1].indexOf("S-") == -1)
      continue;
    var pass = assign(que[b], designer.name);
    if(pass == -1)
      return -1;
    else if(pass == 0)
      continue;
    else if(pass == 1)
      break;
  }
  
  Logger.log("Account: " + que[b]);
  return JSON.stringify(que[b]);
}


//**********************************************************************************************************************************************************************
// find account in chrono and assign to designer
//**********************************************************************************************************************************************************************
function assign(accountInfo, designerName) {
   var keyId, CHRONO_REPORT, pass;
  // get Chrono Id for account
  keyId = getChronoId(accountInfo[0])[1];
  CHRONO_REPORT = SpreadsheetApp.openById(keyId).getSheetByName("Report");
  
  // If chrono is running report return -1
  if(check_ChronoUpdating(CHRONO_REPORT)) {
    return -1;
  }
  
  //***********************************************************************************************************************
  //Finds the Service Number and marks the designers name on the Chrono Report if there is no value in the assigned column
  //***********************************************************************************************************************
  var header = CHRONO_REPORT.getRange('2:2').getValues();
  var assignedCol = header[0].indexOf('ASSIGNED');
  var statusCol = header[0].indexOf('STATUS');
  var lastUpdateCol = header[0].indexOf('LAST UPDATE');
  var notesCol = header[0].indexOf('NOTES');
  var data = CHRONO_REPORT.getRange("K3:K").getValues();
  for (var j in data)
  {
    if (accountInfo[1] == data[j][0])
    {
      j = parseInt(j) + 3;
      SpreadsheetApp.flush();
      if (CHRONO_REPORT.getRange(j,(assignedCol+1)).getValue() !== "")
      {
//        Browser.msgBox('The attempted account has already been assigned, try again!');
        return 0;
      }
      else
      {
        CHRONO_REPORT.getRange(j,(assignedCol+1)).setValue(designerName);  //Column of Assigned
        SpreadsheetApp.flush();
        Utilities.sleep(800);
        var teste = CHRONO_REPORT.getRange(j,(assignedCol+1)).getValue();
        if (CHRONO_REPORT.getRange(j,(assignedCol+1)).getValue().toLowerCase() == designerName.toLowerCase())
        {
          CHRONO_REPORT.getRange(j, (statusCol+1)).setValue("In Progress");  //Column of Status
          CHRONO_REPORT.getRange(j, (lastUpdateCol+1)).setValue(new Date());
          SpreadsheetApp.flush();
          return 1;
        }
        else
        {
//          Browser.msgBox('The attempted account has already been assigned, try again!!');
          return 0;
        }
      }
    }
  }
  
  
  
  
  
}

//**********************************************************************************************************************************************************************
// finds all accounts in que
//**********************************************************************************************************************************************************************
function myQueue(regions, filterRegions, settings) {
  Logger.log("In Queue: "+ filterRegions[0]);
  var backlog = [], keyId;
  // Loop through all chrono's in settings. 
  for(var r in regions) {
    keyId = getChronoId(regions[r]);
    if(regions[r] == "" || keyId.length < 0) {
      continue;
    }

    // get spreadsheet from id
    var ss = SpreadsheetApp.openById(keyId[1]).getSheetByName("Report");
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
        
        index++;
        backlog.push(value);
      }
    });   
  }
  
  // sort to by priority first then oldest account
  backlog = sortBacklog(backlog);
  // Add header to backlog
  backlog.unshift(header);
  Logger.log("Backlog: " + backlog)
  return backlog;
  
}


//**********************************************************************************************************************************************************************
// find account in chrono and assign to designer
//**********************************************************************************************************************************************************************
function sortBacklog(backlog) {
  
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
  
  return backlog;
}

//**********************************************************************************************************************************************************************
// find account in chrono and assign to designer
//**********************************************************************************************************************************************************************
function getChronoId(chrono) {
  var keyId = chronoIds.filter(function(office) { return office[0] == chrono; });
  
  return keyId[0];
}


//**********************************************************************************************************************************************************************
// find account in chrono and assign to designer
//**********************************************************************************************************************************************************************
function check_ChronoUpdating(CHRONO_REPORT) {
	if (CHRONO_REPORT.getRange('H1').getValue() !== "") {
//        alert('The Chrono Report is currently being updated, try again in a minute!');
		return -1;
	}
}