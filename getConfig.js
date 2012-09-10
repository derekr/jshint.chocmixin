//
// Locate the appropriate .jshintrc to use when running JSHint.
//
// Borrows search logic from: http://github.com/jshint/node-jshint/
//

var path = require('path'),
    fs = require('fs');

function removeJsComments(str) {
    str = str || '';
    str = str.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\//g, '');
    str = str.replace(/\/\/[^\n\r]*/g, ''); //everything after "//"
    return str;
}

function findNearestConfig(fileName, dirName) {
    dirName = dirName || process.cwd();

    var targetFileName = path.normalize(path.join(dirName, fileName));
    if (fs.existsSync(targetFileName)) {
        return targetFileName;
    }

    var parentDirName = path.resolve(dirName, '..');
    if (dirName === parentDirName) {
        return null;
    } else {
        return findNearestConfig(fileName, parentDirName);
    }
}

function getConfig(startingDir) {
    var projectConfigPath = findNearestConfig('.jshintrc', startingDir),
        homeConfigPath = path.normalize(path.join(process.env.HOME,
            '.jshintrc'));
    if (!fs.existsSync(homeConfigPath)) { homeConfigPath = null; }

    var configPath = projectConfigPath || homeConfigPath;

    if (configPath) {
         return JSON.parse(removeJsComments(fs.readFileSync(configPath,
             'utf-8')));
    } else {
        return {};
    }
}

module.exports = getConfig;
