// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

/* eslint-disable no-process-exit, no-process-env */

'use strict';

const startTime = Date.now();

if (!process.env.NODE_ENV)
{
  process.env.NODE_ENV = 'development';
}

require('./extensions');

const config = require(process.argv[2]);
const requireCache = require('./requireCache');
const _ = require('lodash');
const moment = require('moment');
const main = require('h5.main');
const blocked = process.env.NODE_ENV === 'development' ? require('blocked') : function() {};

moment.locale('pl');

const modules = (config.modules || []).map(function(module)
{
  if (typeof module === 'string')
  {
    module = {id: module};
  }

  if (typeof module !== 'object' || module === null)
  {
    console.error('Invalid module:', module);
    process.exit(1);
  }

  if (typeof module.id !== 'string')
  {
    console.error('Module ID is required:', module);
    process.exit(1);
  }

  if (typeof module.name !== 'string')
  {
    module.name = module.id;
  }

  if (typeof module.path !== 'string')
  {
    module.path = './modules/' + module.id;
  }

  module.config = config[module.name];

  return module;
});

const app = {
  options: _.assign({}, config, {
    id: config.id,
    startTime: startTime,
    env: process.env.NODE_ENV,
    rootPath: __dirname,
    moduleStartTimeout: config.moduleStartTimeout || 3000
  })
};

_.assign(app, require('./helpers'));

blocked(function(ms)
{
  app.debug(`[blocked] ${ms} ms`);
});

main(app, modules);

app.broker.subscribe('app.started').setLimit(1).on('message', () =>
{
  if (requireCache.built)
  {
    requireCache.save();

    app.debug('Require cache built!');

    setTimeout(() => process.exit(), 1000); // eslint-disable-line no-process-exit
  }

  setTimeout(() =>
  {
    requireCache.reset();

    app.debug('Require cache reset!');
  }, 5000);
});
