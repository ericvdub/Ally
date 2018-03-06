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


function doSomething(e) {
 return HtmlService.createTemplateFromFile(e).evaluate();
}

function getContent(filename) {
 
  var return1= HtmlService.createTemplateFromFile(filename).getRawContent();
  return return1;
}