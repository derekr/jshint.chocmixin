var jshint = require('jshint'),
    path = require('path'),
    getConfig = require('./getConfig.js');

var window;

function run() {
  
  if (Document.current()) {
    var doc = Document.current(),
        docPath = doc.path(),
        scope = doc.rootScope(),
        configDir = docPath ? path.dirname(docPath) : process.env.HOME;
        
    var config = getConfig(configDir),
        result = jshint.JSHINT(doc.text, config);
   
    
    var refreshWindow = function() {
      doc = Document.current();
      result = jshint.JSHINT(doc.text, config);
      var data = jshint.JSHINT.data();
      var errors = data.errors;
  
      
      if (errors !== undefined && errors.length > 0) {
        window.title = errors.length + ' errors in ' + Document.current().filename();
        
        window.applyFunction(function(data) {
          
            var errLi,
                errFragment = document.createDocumentFragment(),
                errList = document.getElementById('errors');
            
            // clear exising content first
            errList.innerHTML = '';
            
            // Send a message to chocolat whenever the line number link is clicked.
            errList.addEventListener('click', function (e) {
              if (e.target && e.target.nodeName == 'A') {
                chocolat.sendMessage('goToLine', [e.target.dataset.line]);
              }
            });
            
            data.errors.forEach(function (err) {
              errLi = document.createElement('li');
              errLi.innerHTML = '<a href="#" class="line-num" title="' + err.evidence + '" data-line="' + err.line + '">line ' + err.line + '</a> <span class="reason">' + err.reason + '</span>';
              errFragment.appendChild(errLi);
            });
            
            errList.appendChild(errFragment);
          
        }, [data]);
        
      }
      else {
        window.title = '0 errors in ' + doc.filename();
        
        window.applyFunction(function() {
          
          var noErrLi,
              noErrFragment = document.createDocumentFragment(),
              noErrList = document.getElementById('errors');
          
          noErrList.innerHTML = '';
          
          noErrLi = document.createElement('li');
          noErrLi.classList.add('no-errors');
          noErrLi.textContent = 'No errors.';
          noErrFragment.appendChild(noErrLi);
          noErrList.appendChild(noErrFragment);
        }, []);
        
        
      }
    };
    
    
    var showWindow = function(data) {
      
      if (window === undefined) {
        window = new Window();
        window.htmlPath = 'index.html';
        window.buttons = ['Close', 'Refresh'];
        window.size = {width: 250, height: 300};
        
        window.onLoad = function() {
          refreshWindow();
        };
        
        // Unbind window when closing:
        window.onUnload = function() {
          window = undefined;
        };
        
        window.onButtonClick = function(button) {
          
          if (button === 'Refresh') {
            refreshWindow();
          }
          else if (button === 'Close') {
            window.close();
          }
          
        };
        
        window.onMessage = function (name, args) {
          if (name === 'goToLine') {
            var lineNum = args[0];
            
            Recipe.run(function (recipe) {
              // Line number is 0 indexed in chocolat.
              // Don't need to verify if lineNum is 0 since it should never be.
              var range = recipe.characterRangeForLineIndexes(new Range(lineNum - 1,0));
              recipe.selection = range;
            });
          }
        };
        
        window.run();
      }
      else {
        refreshWindow();
        window.show();
      }
      
    };
    
    // check scope
    if (scope === 'js.source') {
      if (!result) {
        showWindow();
      }
      else {
        if (window !== undefined && !(window.isKeyWindow())) {
          window.close();
        }
        Alert.show('No errors', 'Awesome work!', ['OK']);
      }
    }
    else {
      var filename;
      if (doc.filename()) {
        filename = doc.filename();
      } else {
        filename = 'Document';
      }
      
      Alert.show('JSHint Error:', filename + ' does not appear to be Javascript.');
    }
    
  }
  
  
}



Hooks.addMenuItem('Actions/JavaScript/JSHint document', 'cmd-ctrl-h', function() {
  run();
});
