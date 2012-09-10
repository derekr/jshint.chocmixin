var jshint = require('jshint');

function buildTitle(documentName, errorCount) {
  return errorCount + ' errors in ' + documentName;
}

var window;

Hooks.addMenuItem("Actions/JavaScript/JSHint document", "cmd-ctrl-h", function () {
    
    var doc = Document.current(),
        docPath = doc.path(),
        configDir = docPath ? path.dirname(docPath) : process.env.HOME;
        
    var config = getConfig(configDir),
        result = jshint.JSHINT(doc.text, config);
    
    // Only show the window if we have errors.
    if (!result) {
      var data = jshint.JSHINT.data();
      var errors = data.errors;
      
      if (typeof window === 'undefined') {
        window = new Window();
        window.htmlPath = 'index.html';
        window.buttons = ["OK"];
        window.onButtonClick = function() { window.close(); }
        window.size = {width: 250, height: 300};
        
        window.onMessage = function (name, arguments) {
          if (name === 'goToLine') {
            var lineNum = arguments[0];
            
            Recipe.run(function (recipe) {
              // Line number is 0 indexed in chocolat.
              // Don't need to verify if lineNum is 0 since it should never be.
              var range = recipe.characterRangeForLineIndexes(new Range(lineNum - 1,0));
              recipe.selection = range;
            });
          }
        };
      }
      
      window.title = buildTitle(doc.filename(), errors.length);
      window.run();
      window.applyFunction('hinted', [data]);
      
    } else {
      Alert.show("No errors", "Awesome work!", ["OK"]);
    }
});