/* eslint-env node */

module.exports = function(deployTarget) {
  var ENV = {
    build: {},
    exclude: ['.DS_Store', '*-test.js']
  };

  ENV.s3 = {
    acl: 'public-read',
    region: 'us-west-2',
    bucket: 'ilios-frontend-assets'
  };

  ENV['s3-index'] = {
    region: 'us-west-2',
    filePattern: 'index.json',
    bucket: 'frontend-json-config',
  };

  ENV.gzip = {
    //dont gzip JSON files
    filePattern: '**/*.{js,css,ico,map,xml,txt,svg,eot,ttf,woff,woff2}'
  };

  if (deployTarget === 'staging') {
    ENV.build.environment = 'production';
    ENV['s3-index'].prefix = 'stage-v1.2';
  }

  if (deployTarget === 'production') {
    ENV.build.environment = 'production';
    ENV['s3-index'].prefix = 'prod-v1.2';
  }

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV;
};
