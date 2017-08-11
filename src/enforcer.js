var fs = require('fs');
var xmldoc = require('xmldoc');
var glob = require('glob');
var path = require('path');

function enforcer(projPath, options) {
  function enforceFileSystem() {
    return new Promise((resolve, reject) => {

      resolve();
    });
  }

  function enforceCsproj() {
    return new Promise((resolve, reject) => {
      fs.readFile(projPath, (err, data) => {
        if(err) {
          reject(err);
        }
        var document = new xmldoc.XmlDocument(data);
        var projectBase = path.dirname(projPath);

        var contentNodes = document.childrenNamed('ItemGroup').map(function(ig) {
          return ig.childrenNamed('Content');
        }).reduce(function(nodes, contentNodes) {
          return nodes.concat(contentNodes);
        }, []);

        Promise.all(contentNodes.map((contentNode) => {
          return new Promise((resolve, reject) => {
            fs.access(path.join(projectBase, contentNode.attr.Include), (err) => {
              resolve(err != null);
            });
          });
        })).then((values) => {
          resolve(values.some(v => v));
        });
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
