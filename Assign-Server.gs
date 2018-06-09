//**********************************************************************************************************************************************************************
// finds next account in-line, assigns designer to account, returns account designer is assigned to
//**********************************************************************************************************************************************************************
function getAssignment(designer) {  
  console.log("Assign: " + JSON.stringify(designer));
  
  // Get accounts in personal Queue
  var que = myQueue(designer);
  console.log("In Que: " + que + " *****Designer***** " + JSON.stringify(designer));
  if(que.length < 1)
    return 0;
  
  // count how many times account is not set due to report running 
  var reportRunningCount = 0;
  
  // loop through each account until we assign one successfully
  for(var b in que) {
    if(que[b][1].indexOf("S-") == -1)
      continue;
    
    // attempt assigning account in chrono
    var pass = assign(que[b], designer);
    console.log("Que Assigning Pass: " + pass + " ACCOUNT: " + que[b] + " *****Designer***** " + JSON.stringify(designer));
    // check fail/pass for assigning account
    if(pass == -1) {
      // add count of report running on this account
      reportRunningCount++;
      // If reach over 5 accounts caught during running report return -1
      if(reportRunningCount > 5)
        return -1;
      continue;
    }
    else if(pass == 0)
      continue;
    else if(pass == 1)
      break;
  }
  
  if(pass !== 1) {
    console.log("Last Attempt Account Assigned: " + pass + " *****Designer***** " + JSON.stringify(designer));
    return -1;
  }
  
  console.log("Return Account Assigned: " + que[b] + " *****Designer***** " + JSON.stringify(designer));
  var accountInfo = {
    'serviceNumber': que[b][1],
    'spNumber': que[b][2],
    'office': que[b][4],
    'unitType': que[b][9],
    'contractType': que[b][7],
    'dueIn': getDueIn(que[b][6]),
    'notes': que[b][13]
  };
  if(designer.dept === "PP") {
    var accountInfo = {
      'serviceNumber': que[b][1],
      'spNumber': que[b][2],
      'office': que[b][3],
      'unitType': que[b][8],
      'contractType': que[b][6],
      'dueIn': getDueIn(que[b][5]),
      'notes': que[b][12]
    };
  }
  // Send account to time tracker
  timeTracker(accountInfo, designer);
  //"<a href='"+que[b][2].match(/=hyperlink\("([^"]+)"/i)[1]+"'/schedule' target='_blank' >"+que[b][2].match(/=hyperlink\("([^"]+)"/i)[0]+"</a>",
  return accountInfo;
}


//**********************************************************************************************************************************************************************
// find account in chrono and assign to designer
//**********************************************************************************************************************************************************************
function assign(accountInfo, designer) {
  var keyId, CHRONO_REPORT, pass;
  // get Chrono Id for account
  keyId = getChronoId(accountInfo[0], designer.dept)[1];
  CHRONO_REPORT = SpreadsheetApp.openById(keyId).getSheetByName("Report");
  
  if(designer.sfName === "")
    var name = designer.name;
  else
    var name = designer.sfName;
  
  // If chrono is running report return -1
  if(check_ChronoUpdating(CHRONO_REPORT)) {
    return -1;
  }
  
  //***********************************************************************************************************************
  //Finds the Service Number and marks the designers name on the Chrono Report if there is no value in the assigned column
  //***********************************************************************************************************************
  var header = CHRONO_REPORT.getRange('2:2').getValues();
  var serviceCol = header[0].lastIndexOf('SERVICE');
  var assignedCol = header[0].indexOf('ASSIGNED');
  var statusCol = header[0].indexOf('STATUS');
  var lastUpdateCol = header[0].indexOf('LAST UPDATE');
  var initialAssignCol = header[0].indexOf('INITIAL DATE');
  var notesCol = header[0].indexOf('NOTES');
  var data = CHRONO_REPORT.getRange(3, serviceCol+1, CHRONO_REPORT.getLastRow(), 1).getValues().filter(function(value) { return value[0] !== ""});
  for (var j in data)
  {
    if (accountInfo[1] == data[j][0])
    {
      j = parseInt(j) + 3;
      var assignRange = CHRONO_REPORT.getRange(j,(assignedCol+1));
      SpreadsheetApp.flush();
      var check = assignRange.getValue();
      if (assignRange.getValue() !== "")
      {
        //        console.log("The attempted account has already been assigned, try again: " + accountInfo + " *****Designer***** " + JSON.stringify(designer));
        return 0;
      }
      
      assignRange.setValue(name);  //Column of Assigned
      SpreadsheetApp.flush();
      Utilities.sleep(800);
      var test = assignRange.getValue();
      if (test === name)
      {
        CHRONO_REPORT.getRange(j, (statusCol+1)).setValue("In Progress");  //Column of Status
        CHRONO_REPORT.getRange(j, (lastUpdateCol+1)).setValue(new Date());
        if(initialAssignCol !== -1)
          CHRONO_REPORT.getRange(j, (initialAssignCol+1)).setValue(new Date());
        SpreadsheetApp.flush();
        return 1;
      }
      else
      {
        //          console.log('The attempted account has already been assigned, try again!!');
        return 0;
      }
    }
  }
  
  
  
  
  
}

//**********************************************************************************************************************************************************************
// finds all accounts in que
//**********************************************************************************************************************************************************************
function myQueue(designer) {
  //  console.log("Settings: "+ designer.settings);
  var backlog = [], redesigns = [], happyHourBacklog = [], dealerBacklog = [], happyHour = false, keyId, settings = designer.settings, filterRegions = designer.filterRegions, regions = designer.regions;
  
  // If not Outsource, and no accounts are left over from Outsource que projection
  // Set OTS unit types to zero so they don't get assigned out
  if(designer.dept === "CP" && designer.team.toUpperCase() !== "OUTSOURCE" && check_Throttle_CP()) {
    settings['OTS GSR'] = 0;
    //    settings['OTS AURORA'] = 0;
  }
  else if(designer.dept === "PP" && designer.team.toUpperCase() !== "OUTSOURCE" && check_Throttle_PP(designer)) {
    settings['OUTSOURCE'] = 0;
  }
  
  // HAPPY HOUR for CP team
  if(designer.dept === "CP") {
    happyHour = check_Happy_Hour(designer);
  }
  
  
  // Loop through all chrono's in settings. 
  for (var r in regions) {
    keyId = getChronoId(regions[r], designer.dept);
    if(regions[r] == "" || keyId == undefined || keyId.length < 1) {
      continue;
    }
    
    // get spreadsheet from id
    var ss = SpreadsheetApp.openById(keyId[1]).getSheetByName("Report");
    // Sets the index number of each entry into it's own individual/unique variable.
    var header = ss.getRange("2:2").getValues()[0]; // Header array is first row and all columns of D2:W range in backlog report sheets. "D2:X2"
    var dueInCol = header.indexOf('DUE IN: (hh:mm)'); //=> header
    var dueStatusCol = header.indexOf('DUE STATUS') - dueInCol; //=> header
    var officeCol = header.indexOf('OFFICE') - dueInCol; //=> header
    var backlogDateCol = header.indexOf('BACKLOG DATE') - dueInCol; //=> header
    var dueDateCol = header.indexOf('DUE DATE') - dueInCol; //=> header
    var regionCol = header.indexOf('REGION') - dueInCol; //=> header
    var utilityCol = header.indexOf('UTILITY COMPANY') - dueInCol; //=> header
    var unitTypeCol = header.indexOf('UNIT TYPE') - dueInCol; //=> header
    var priorityCol = header.indexOf('PRIORITY') - dueInCol; //=> header
    var serviceCol = header.indexOf('SERVICE') - dueInCol; //=> header
    var spCol = header.indexOf('SOLAR PROJECT') - dueInCol; //=> header
    var redesignCol = header.indexOf('REDESIGN ASSIGNMENT') - dueInCol; //=> header
    var assignedCol = header.indexOf('ASSIGNED') - dueInCol; //=> header
    var notesCol = header.indexOf('NOTES') - dueInCol; //=> header
    var statusCol = header.indexOf('STATUS') - dueInCol; //=> header
    var lastUpdateCol = header.indexOf('LAST UPDATE') - dueInCol; //=> header
    
    
    
    // Get Redesigns originally designed by designer for PERMIT
    if(designer.dept === "PP" && designer.team.toUpperCase() !== "OUTSOURCE") {
      
      ss.getRange(3, dueInCol+1, ss.getLastRow(), lastUpdateCol+1).getValues().filter(function(value) {  // "D3:X"
        var check1 = value[serviceCol];
        var check2 = value[assignedCol];
        var check3 = value[notesCol];
        var check4 = value[redesignCol];
        if(check4 != "")
          var x = 0;
        if(value[serviceCol] !== "" && value[assignedCol] === "" && (value[redesignCol].indexOf(designer.name) > -1 || value[redesignCol].indexOf(designer.sfName) > -1)) {
          value.splice(0, regionCol);
          redesigns.push(value);
        }
      });
    }
    
    
    // Get backlog and filter accounts that pass
    ss.getRange(3, dueInCol+1, ss.getLastRow(), lastUpdateCol+1).getValues().filter(function(value, index) {
      
      // if the service number exists and...
      // if the service number isn't assigned and...
      // if settings unitType is not 0 and...
      // if name of designer is not in status column as Unassigned
      if(value[serviceCol] !== "" && value[assignedCol] === "" && settings[value[unitTypeCol]] && value[statusCol].indexOf(designer.name) === -1) {
        var containsOffice = false, checkHappyOffice = false; 
        // Filter in or out the filterRegions.include = 1:included 0:excluded
        // if filterRegions.include = 1 AND filterRegions doesn't contain office then don't add to que
        // else filterRegions.include =0 AND filterRegions contains office then don't add to que
        
        if(filterRegions.exclude || filterRegions.include) {
          var inculdedBool = filterRegions.includeOffices.some(function(office, index) { return value[officeCol].toLowerCase().indexOf(office.toString().toLowerCase()) >-1 || value[utilityCol].toLowerCase().indexOf(office.toString().toLowerCase()) >-1 });
          var excludedBool = filterRegions.excludeOffices.some(function(office, index) { return value[officeCol].toLowerCase().indexOf(office.toString().toLowerCase()) >-1 || value[utilityCol].toLowerCase().indexOf(office.toString().toLowerCase()) >-1 });
          if(filterRegions.include) {
            if(!inculdedBool) {
              return false;
            }
            else if(excludedBool) {
              return false;
            }
          }
          else if(excludedBool) {
            return false;
          }
        }
        // If CP Outsource team and account overdue or priority
        if(designer.team !== "" && designer.team.toUpperCase() === "OUTSOURCE" && designer.dept === "CP" && (value[dueStatusCol].toUpperCase() === "OVERDUE" || value[priorityCol] !== ""))
          return false;
        // If PP Outsource team and account SR NEEDED or priority
        if(designer.team !== "" && designer.team.toUpperCase() === "OUTSOURCE" && designer.dept === "PP" && value[priorityCol] !== "")
          return false;
        // PERMIT Redesign ownership
        // If name is no longer assigned to orignal designer or set as priority add to que
        if(designer.dept == "PP" && designer.team.toUpperCase() !== "OUTSOURCE" &&  value[unitTypeCol].toUpperCase() === "PERMIT RD" && !(value[redesignCol] === "" || value[redesignCol] === "-" || value[priorityCol].toLowerCase().indexOf("priority") > -1))
          return false;
        
        // Get SP link
        //        var SPNum = ss.getRange(index+3, spCol+4).getFormula();
        //        if(SPNum.match(/=hyperlink\("([^"]+)"/i))
        //          value[spCol] = SPNum;
        
        //If Happy Hour check if office is in Happy Hour List
        if(happyHour && filterRegions.happyHour !== undefined)
          checkHappyOffice = filterRegions.happyHour.some(function(office, index) { return value[officeCol].toLowerCase().indexOf(office.toString().toLowerCase()) >-1 });
        //Happy Hour check pass, add to happy hour backlog
        if(happyHour && ((value[dueStatusCol].match(/DUE TODAY/i) && !checkHappyOffice && !(regions[r].match(/dealer/i))) || value[priorityCol] !== "")) {
          happyHourBacklog.push(value);
        }
        // Add to Dealer backlog if dealer account
        if(regions[r].match(/dealer/i)) {
          dealerBacklog.push(value);
        }
        //remove unneeded/repeated columns
        // From the start of the array up to the region column
        value.splice(0, regionCol);
        backlog.push(value);
        
      }
    });
  }
  var stuff = 0;
  // sort to by priority first then unit type then oldest account
  backlog = sortBacklog(backlog, priorityCol-regionCol, backlogDateCol-regionCol, dueDateCol-regionCol, unitTypeCol-regionCol, settings);
  
  // If happy hour and happy hour backlog length
  if(happyHour && happyHourBacklog.length > 0) {
    // sort to by priority first then unit type then oldest account
    happyHourBacklog = sortBacklog(happyHourBacklog, priorityCol-regionCol, backlogDateCol-regionCol, dueDateCol-regionCol, unitTypeCol-regionCol, settings);
    for(var row = happyHourBacklog.length -1; row >= 0; row--) {
      backlog.unshift(happyHourBacklog[row]);
    }
  }
  //check dealer is empty
  if(dealerBacklog.length > 0) {
    // sort to by priority first then unit type then oldest account
    dealerBacklog = sortBacklog(dealerBacklog, priorityCol-regionCol, backlogDateCol-regionCol, dueDateCol-regionCol, unitTypeCol-regionCol, settings);
    for(var row = dealerBacklog.length -1; row >= 0; row--) {
      backlog.unshift(dealerBacklog[row]);
    }
  }
  //check redesigns are empty
  if(redesigns !== undefined && redesigns !== null && redesigns.length > 0) {
    // sort to by priority first then unit type then oldest account
    redesigns = sortBacklog(redesigns, priorityCol-regionCol, backlogDateCol-regionCol, dueDateCol-regionCol, unitTypeCol-regionCol, settings);
    for(var row = redesigns.length -1; row >= 0; row--) {
      backlog.unshift(redesigns[row]);
    }
  }
  
  //  console.log("My Que: " + backlog);
  return backlog;
  
}


//**********************************************************************************************************************************************************************
// find account in chrono and assign to designer
//**********************************************************************************************************************************************************************
function sortBacklog(backlog, priorityCol, backlogDateCol, dueDateCol, unitTypeCol, settings) {
  
  // sort to by priority first then oldest account
  backlog.sort(function(a, b) {
    var check1 = a[dueDateCol];
    var check2 = b[dueDateCol];
    var test = a[dueDateCol] - b[dueDateCol];
    
    if((a[priorityCol] != '' || b[priorityCol] != '') && a[priorityCol] !== b[priorityCol]) 
    {
      var x = a[priorityCol].toLowerCase(), y = b[priorityCol].toLowerCase();
      var test = x > y;
      if(a[priorityCol] !== '' && b[priorityCol] !== '')
        return y < x ? 1 : y > x ? -1 : 0;
      return x < y ? 1 : x > y ? -1 : 0;
    }
    if(a[unitTypeCol] !== b[unitTypeCol] && settings[a[unitTypeCol]] !== settings[b[unitTypeCol]])
      return settings[b[unitTypeCol]] - settings[a[unitTypeCol]];
    
    if(a[dueDateCol] !== b[dueDateCol])
      return a[dueDateCol] - b[dueDateCol]
      
      return b[backlogDateCol] - a[backlogDateCol];
    
  });
  
  return backlog;
}

//**********************************************************************************************************************************************************************
// find account in chrono and assign to designer
//**********************************************************************************************************************************************************************
function getChronoId(chrono, dept) {
  if(dept === "CP"){
    var chronoIds = cpChronoIds;
  }
  else {
    var chronoIds = ppChronoIds;
  }
  var keyId = chronoIds.filter(function(office) { return office[0].toUpperCase() == chrono.toUpperCase() });
  return keyId[0];
}



//**********************************************************************************************************************************************************************
// find account in chrono and assign to designer
//**********************************************************************************************************************************************************************
function check_ChronoUpdating(CHRONO_REPORT) {
  if (CHRONO_REPORT.getRange('G1').getValue() !== "") {
    //        alert('The Chrono Report is currently being updated, try again in a minute!');
    return -1;
  }
}


//**********************************************************************************************************************************************************************
// See if time now is during happy hour settings
//**********************************************************************************************************************************************************************
function check_Happy_Hour(designer) {
  // Get the left over number of accounts available
  var deptReport = SpreadsheetApp.openById("13NS3RBEC18NZXv-3KLKYE8pW4GCfQKE-vtvsDnrLdO0");
  var off = "ON" !== deptReport.getSheetByName("Analysis").getRange("C20").getValue().toUpperCase();
  var now = new Date();
//  now.setHours(8,00,00);
  // If not between the hours set, return 0 to not filter
  if(off || now.getHours() < 7 || now.getHours() >= 18)
    return false;
  var east = ["NJ-","NY-","PA-","FL-","MD-","SC-","VA-","CT-","MA-","NH-","RI-","VT-"];
  var west = ["CA-","AZ-","CO-","HI-","NM-","NV-","TX-","UT-"];
  var remove = []
  if(designer.team.toUpperCase() === "OUTSOURCE") {
    //2:15
    if(now.getHours() < 12 || now.getHours() > 16 || (now.getHours() === 16 && now.getMinutes() > 15))
      remove = west;
    else
      remove = east;
  }
  else {
    if(now.getHours() < 16 || (now.getHours() === 16 &&  now.getMinutes() <= 15)) 
      remove = west;
    else
      remove = east;
  }
  
  // add regions to exclude on other time zone
  designer.filterRegions.happyHour = remove;
  return true;
}

//**********************************************************************************************************************************************************************
// See if OTS acocunts available in CP chrono
//**********************************************************************************************************************************************************************
function check_Throttle_CP() {
  // Get the left over number of accounts available
  var deptReport = SpreadsheetApp.openById("1Y5BOKyCE2DD0UFQWrfki6gOVAc1WKCgICC96jVglKYg");
  var off = deptReport.getSheetByName("Analysis").getRange("B16").getValue().toLowerCase() == "off";
  if(off)
    return 1;
  var projection = deptReport.getSheetByName("Analysis").getRange("C18").getValue();
  
  return projection <= 0;
}


//**********************************************************************************************************************************************************************
// see if OTS accounts available in PP Chrono
//**********************************************************************************************************************************************************************
function check_Throttle_PP(designer) {
  //check if single metric designer
  if(designer.singleMetric) {
    return false;
  }
  // Get the left over number of accounts available
  var deptReport = SpreadsheetApp.openById("1tde_sOJnMHoCWvOSlqJDBt-JpFCXiBZ_JCY4dwU_Oic");
  var off = deptReport.getSheetByName("Analysis").getRange("B15").getValue().toLowerCase() == "off";
  if(off)
    return 1;
  var projection = deptReport.getSheetByName("Analysis").getRange("C17").getValue();
  
  return projection < 0;
}

//**********************************************************************************************************************************************************************
// get the time deifference from now and date in hours : minutes
//**********************************************************************************************************************************************************************
function getDueIn (dueDate) {
  var now = Date.now();
  var dueIn = now - dueDate;
  var diffHrs = Math.floor((dueIn % 86400000) / 3600000); // hours
  var diffMins = Math.round(((dueIn % 86400000) % 3600000) / 60000); // minutes
  return diffHrs + ":" + diffMins;
}

function debugGetAssignment() {
  var designer = {
    sfName: "Nathan Casados",
    settings: {
      "GSR": 0,
      "AURORA": 0,
      "SNOW PROP": 0,
      "PART 1": 0,
      "CP RD": 0,
      "OTS GSR": 1,
      "OTS AURORA": 1,
      "REJECTED": 0
    },
    regions: ["East"],
    name: "Nathan Casados",
    filterRegions: {
      "include": false,
      "offices": [],
      "exclude": false
    },
    dept: "CP",
    team: "OUTSOURCE",
    email: "nathan.casados@vivintsolar.com"
  };
  getAssignment(designer);
}