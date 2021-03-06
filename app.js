'use strict';

var Module = require('meanio').Module;

var Openapi = new Module('express-openapi');
var mean = require('meanio');
var config = mean.getConfig();

var swagger, defaultGetParams;

Openapi.register(function(app, auth, database) {

  import openapi from 'express-openapi';
  //import v1WorldsService from './api-v1/services/worldsService';
  //import v1ApiDoc from './api-v1/api-doc';

//openapi.initialize({
//  app,
//  apiDoc: v1ApiDoc,
//  dependencies: {
//    worldsService: v1WorldsService
//  },
//  paths: './api-v1/paths'
//});



// Serve up swagger ui at /docs via static route
  swagger = require('swagger-node-express').createNew(app);

  var paramTypes = swagger.paramTypes;

  var sortParm = paramTypes.query('sort', 'Comma seperated list of params to sort by.  (e.g "-created,name") ', 'string');
  var limitParm = paramTypes.query('limit', 'Number of items to return', 'number');
  var skipParm = paramTypes.query('skip', 'Number of items to skip', 'number');

  defaultGetParams = [
    sortParm,
    limitParm,
    skipParm
  ];

  Swagger.add = function(path) {
    var model = require(path + '/docs/models');
    swagger.addModels(model);

    console.log('loading docs for: ' + path);

    require(path + '/docs/services')
      .load(swagger, {
        searchableOptions: defaultGetParams
      });

    swagger.configureSwaggerPaths('', 'api/swagger/docs', '');
    swagger.configure('/api', '1.0.0');
  };

  config.swagger = config.swagger || {};

  swagger.configureDeclaration(config.app.name, {
    description: config.swagger.description || 'MEAN App API',
    authorizations: ['oauth2'],
    produces: ['application/json']
  });


  swagger.setApiInfo({
    title: config.swagger.title || config.app.name,
    description: config.swagger.description || 'MEAN App API',
    termsOfServiceUrl: config.swagger.tos || 'http://mean.io',
    contact: config.swagger.contact || 'support@example.com',
    licenseUrl: config.swagger.license || 'http://en.wikipedia.org/wiki/MIT_License'
  });

  swagger.setAuthorizations({
    apiKey: {
      type: 'apiKey',
      passAs: 'header'
    }
  });

  swagger.configureSwaggerPaths('', 'api/swagger/docs', '');
  swagger.configure('/api', '1.0.0');

  app.get('/api/docs', function(req, res, next) {
    Swagger.render('index', {endpoint:'/api/swagger/docs'}, function (err, html) {
      //Rendering a view from the Package server/views
      if (err) return res.send(500,err);
       res.send(html);
    });

  });

  return Swagger;
});
