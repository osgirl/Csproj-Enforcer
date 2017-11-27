var glob = require('glob');
var enforcer = require('./src/enforcer');

var defaults = {
    path: ['**/*.csproj', '!'],
    fileSystem: '**/{*.es,*.scss,*.sass,*.js,*.png,*.jpg,*.gif,*.jpeg,*.md}',
    ignore: ['node_modules/**',
     'umbraco/**',
     'umbraco_client/**',
     'FrontEndSrc/**', 
     'Cwel/**',
     'Dist/**',
     'Assets/{JS,ScssDocsAssets}/**',
     'Src/Test/e2e/vendor/**',
     'Src/Vendor/**']
}

//TODO options
var options = defaults;

glob(defaults.path, { ignore: ['node_modules/**'] }, (err, files) => {
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
