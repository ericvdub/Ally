function doGet(e) {

  Logger.log(Utilities.jsonStringify(e));
  if (!e.parameter.page) {
    // When no specific page requested, return "home page"
    return HtmlService.createTemplateFromFile("index").evaluate();
  }
  // else, use page parameter to pick an html file from the script
  return HtmlService.createTemplateFromFile(e.parameter["page"]).evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}


/**
 * Get the URL for the Google Apps Script running as a WebApp.
 */
function getScriptUrl() {
  var url = ScriptApp.getService().getUrl();
  return url;
}

function getContent(filename) {

  var return1 = HtmlService.createTemplateFromFile(filename).getRawContent();
  return return1;
}


function test() {

  var accountInfo = {
    "region": "ONE",
    "serviceNumber": "S-5911052",
    "designer": "Eric Van Wagoner",
    "notes": "Test",
    "unitType": "OTS GSR",
    "status": "Reject"
  }
  var para = {
    "dept": "PP",
    "name": "Eric Van Wagoner",
    "sfName": "Eric Van Wagoner (114607)",
    "email": "eric.vanwagoner@vivintsolar.com",
    "team": "Test",
    "includeOwnRegion": "",
    "regions": ["Test PP"],
    //    "regions": ["West","East", "New England", "Grit Empire"],
    "settings": {
      "GSR": 1,
      "AURORA": 0,
      "SNOW PROP": 0,
      "PART 1": 1,
      "CP RD": 0,
      "OTS GSR": 1,
      "OTS AURORA": 0,
      "PERMIT": 3,
      "CP MATCH": 1,
      "PERMIT RD": 2,
      "OUTSOURCE": 4
    },
    "filterRegions": {
      "exclude": false,
      "include": false,
      "offices": []
    }
  }
  try {
    var designer = getFilterSettings("eric.vanwagoner@vivintsolar.com");
    var check = getAssignment(designer);
    //    statusUpdate(accountInfo);
    var backlog = getMyAccounts(designer)
  } catch (e) {
    Logger.log("ERROR:", e);
  }
  var end = 0;
}


// Create chrono Id"s array
var cpChronoIds = [
  ["NIS", "1_qXC4VFhTth_SIaBMs8RGuGvvZVUjWPLmRKH_jxgVYQ"],
  ["Dealer", "1YIfEfnpL-aWqKQtDM5Pc2n8gzajkq_hudXOxZUBQS6k"],
  ["ONE", "1lGXtQB23DM9BErKP9Bgk-oOzIOXXirj9fPpOmLnChm8"],
  ["Test", "1u12C1FwVe3_Yy6JiPonUMlrcbMLnts8LOuzOw2sHwCk"]
];

// ["Test", "1u12C1FwVe3_Yy6JiPonUMlrcbMLnts8LOuzOw2sHwCk"]

var ppChronoIds = [
  ["East", "1r82cVI2KRAMGvgOzqJ1lGta_xXQJSJdDFjgHPJD27kQ"],
  ["West", "11P_RjuFahwmWj9rHxT1QHJrfGfIezFzl-cqUlcCsi_g"]
];

//  ["Test PP", "1s-zAS0yhupakwcHms0qHb-A_qOTYlWbsNFVlnP1JV3o"]

// For testing
//var chronoIds = [
//  ["Grit Movement", "1wMbpZ8Enm_ATgkv2JQ0Nu4GG0d6Juz6xeDwxktGmV_M"],
//  ["New England", "1Rxl9n_kxBZxghPJgHO8P5k1qiKFR48cNJH6ucZujzj8"],
//  ["Legion", "16kDxFpm3QcEGEr_8OSyVRvlBzpZXsoycaQZtXSaC5sM"],
//  ["NorCal", "1pK5wwlXkEM9BkDl_0sRKMU6kEed8ivdyL9sg3UPABns"],
//  ["SoCal", "1AAc1IXIi4jIEwkFOIEeHGjO_XlXbpj3k6Jv9ZY7RQbw"],
//  ["Southwest", "1uwIrt34qsNnXqX0Mxh941vOh7_le3kzoHylS7KXq_w8"],
//  ["NIS", "1ITtsDxcp8hnYVTlBk2YpzfoDMd-mqbO_U9gXqh6BMuQ"],
//  ["Dealer", "1SnsymujZI0dTpBkI67vS6BDxNjiNE4JKG4Y2ApDJqgM"],
//  ["Test", "1jPCyngmgcuDAyd9ieMzuY7wWYgkjX5dnilwO2dSBfGw"]
//]
// Merge comment