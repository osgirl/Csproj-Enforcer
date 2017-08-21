var fs = require('fs');
var xmldoc = require('xmldoc');
var glob = require('glob');
var path = require('path');

function enforcer(projPath, options) {

  var document = new xmldoc.XmlDocument(fs.readFileSync(projPath));
  var projectBase = path.dirname(projPath);
  var contentNodes = document.childrenNamed('ItemGroup').map(function(ig) {
    return ig.childrenNamed('Content');
  }).reduce(function(nodes, contentNodes) {
    return contentNodes.map(cn => {
      return cn.attr.Include.replace(/\\/g, '/')
    }).concat(nodes);
  }, []);


  function enforceFileSystem() {
    return new Promise((resolve, reject) => {
      glob(options.fileSystem, { ignore: options.ignore, cwd: projectBase }, (err, files) => {
        if(err) {
          console.error(err);
          reject(err);
        }
        let hasError = false;
        files.forEach((file) => {
          if(contentNodes.indexOf(file) === -1) {
            console.log(`Error: File (${file}) found but is not referenced inside ${projPath}`);
            hasError = true;
          }
        });
        resolve(hasError);
      });
    });
  }

  function enforceCsproj() {
    return new Promise((resolve, reject) => {
      Promise.all(contentNodes.map((contentNode) => {
        return new Promise((resolve, reject) => {
          fs.access(path.join(projectBase, contentNode), (err) => {
            if(err) {
              console.log(`ERROR: Csproj (${projPath}) references ${contentNode} but it could not be found`);
            }
            resolve(err != null);
          });
        });
      }))
      .then((values) => {
        resolve(values.some(v => v));
      });
    });
  }

  return Promise.all([enforceFileSystem(), enforceCsproj()]).then((values) => {
    return values.some(v => v);
  });
}

module.exports = function(path, options) {
  return enforcer(path, options);
}
