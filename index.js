var glob = require('glob');
var enforcer = require('./src/enforcer');

var defaults = {
    path: '**/*.csproj',
    fileSystem: '**/{*.js,*.png,*.jpg,*.gif,*.jpeg}',
    ignore: 'node_modules/**'
}

//TODO options
var options = defaults;

glob(defaults.path, {}, (err, files) => {
   if(err) {
     console.error(err);
     return;
   }
   Promise.all(files.map(file => enforcer(file, options)))
    .then((results) => {
       var success = results.some(r => r) | 0;
       console.log('Exiting with ' + success + ' status code');
       process.exit(success);
     })
    .catch((err) => {
      console.log(err);
    })
});
