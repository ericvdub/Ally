function doGet(e) {

  Logger.log( Utilities.jsonStringify(e) );
  if (!e.parameter.page) {
    // When no specific page requested, return "home page"
    return HtmlService.createTemplateFromFile('index').evaluate();
  }
  // else, use page parameter to pick an html file from the script
  return HtmlService.createTemplateFromFile(e.parameter['page']).evaluate();
}


/**
 * Get the URL for the Google Apps Script running as a WebApp.
 */
function getScriptUrl() {
 var url = ScriptApp.getService().getUrl();
 return url;
}

function getContent(filename) {
 
  var return1= HtmlService.createTemplateFromFile(filename).getRawContent();
  return return1;
}


function test(){
  
  var para = {
    'name': "Eric Van Wagoner", 
    'sfName': "eric.vanwagoner@vivintsolar.com", 
    'team': "Southwest", 
    'includeOwnRegion': "Southwest", 
    'regions': ["", "Southwest"],
    'settings': {
      'GSR': 1,
      'AURORA': 1,
      'SNOW PROP': 1,
      'PART 1': 1,
      'CP RD': 1,
      'OTS GSR': 1,
      'OTS AURORA': 1
    },
    'filterRegions': [0,""]
  }
  try{
    Logger.log(assign(para));
  } catch(e) {
    Logger.log("ERROR:", e);
  }
}


// Create chrono Id's array
var chronoIds = [
  ["Grit Movement", "1wMbpZ8Enm_ATgkv2JQ0Nu4GG0d6Juz6xeDwxktGmV_M"],
  ["New England", "1Rxl9n_kxBZxghPJgHO8P5k1qiKFR48cNJH6ucZujzj8"],
  ["Legion", "16kDxFpm3QcEGEr_8OSyVRvlBzpZXsoycaQZtXSaC5sM"],
  ["NorCal", "1pK5wwlXkEM9BkDl_0sRKMU6kEed8ivdyL9sg3UPABns"],
  ["SoCal", "1AAc1IXIi4jIEwkFOIEeHGjO_XlXbpj3k6Jv9ZY7RQbw"],
  ["Southwest", "119oMBUEAWTQe7h6dhY-GQB0sSwpC1vRT6qUdlfisGPs"], // "1uwIrt34qsNnXqX0Mxh941vOh7_le3kzoHylS7KXq_w8"],
  ["NIS", "1ITtsDxcp8hnYVTlBk2YpzfoDMd-mqbO_U9gXqh6BMuQ"],
  ["Dealer", "1SnsymujZI0dTpBkI67vS6BDxNjiNE4JKG4Y2ApDJqgM"],
]
