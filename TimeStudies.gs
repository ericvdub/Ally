

function timeTracker(accountInfo, designer) {
  var ssId = getTimeStudiesId(designer.dept, designer.team);
  var ssTimeStudies = SpreadsheetApp.openById(ssId).getSheetByName("LOG");
  var lastRow = ssTimeStudies.getLastRow() + 1;
  var data = [[designer.sfName, accountInfo.serviceNumber, accountInfo.spNumber, accountInfo.unitType, accountInfo.office, new Date()]]
  ssTimeStudies.getRange(lastRow, 1, 1, data[0].length).setValues(data);
}




// Return ID for time studies 
function getTimeStudiesId(dept, team) {
  var outsource;
  if(team.match(/outsource/i))
    var outsource = true;
  else
    var outsource = false;
  if(dept.match(/cp/i) && !team.match(/outsource/i))
    return "1arO-A6rgeS0lH53L8d26iyKdv4PJ4s0RvYmFrCDpxbc";
  else if(dept.match(/pp/i) && !team.match(/outsource/i))
    return "1p4xpwf0sBVwJlYbh_MAaYy8xMGS2I1VfxipMlCuD2y4";
  else if(dept.match(/cp/i) && team.match(/outsource/i))
    return "1yd9jm4PfdmpbL-7JQ0RpbIlDth-T3elr6KvIUEP45Lk";
  else if(dept.match(/pp/i) && team.match(/outsource/i))
    return "1deZrEALfsug0mvwMBOCYms-NUg2D6FpSjKg4-_k628c";
  else
    throw "Missing Time Studies ID for DEPT: " + dept + " TEAM: " + team;
}

function testTimeStudies() {
  getTimeStudiesId("CP", "outsource");
}