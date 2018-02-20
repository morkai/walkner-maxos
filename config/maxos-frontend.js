// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const mongodb = require('./maxos-mongodb');
const ports = require('./maxos-ports');
const later = require('later');

later.date.localTime();

try
{
  require('pmx').init({
    ignore_routes: [/socket\.io/, /sio/] // eslint-disable-line camelcase
  });
}
catch (err) {} // eslint-disable-line no-empty

exports.id = 'maxos-frontend';

exports.modules = [
  'updater',
  'mongoose',
  'settings',
  'events',
  'pubsub',
  'user',
  'express',
  'users',
  'controller',
  'alarms/frontend',
  'maxos',
  'mail/sender',
  'messenger/server',
  {id: 'messenger/client', name: 'messenger/client:maxos-controller'},
  {id: 'messenger/client', name: 'messenger/client:maxos-alarms'},
  {id: 'messenger/client', name: 'messenger/client:maxos-watchdog'},
  'httpServer',
  'sio'
];

exports.mainJsFile = '/maxos-main.js';
exports.mainCssFile = '/assets/maxos-main.css';
exports.faviconFile = 'assets/maxos-favicon.ico';

exports.frontendAppData = {

};

exports.dictionaryModules = {

};

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [
      'users.login', 'users.logout',
      '*.added', '*.edited',
      'maxos.labels.printing'
    ],
    info: [
      'events.**',
      'controller.settingChanged'
    ],
    warning: [
      'users.loginFailure',
      '*.deleted',
      'controller.tagValueSet'
    ],
    error: [
      '*.syncFailed',
      'app.started'
    ]
  },
  blacklist: [

  ]
};

exports.httpServer = {
  host: '0.0.0.0',
  port: 80
};

exports.sio = {
  httpServerIds: ['httpServer'],
  socketIo: {
    pingInterval: 10000,
    pingTimeout: 5000
  }
};

exports.pubsub = {
  statsPublishInterval: 60000,
  republishTopics: [
    'events.saved',
    '*.added', '*.edited', '*.deleted', '*.synced',
    'updater.newVersion',
    'settings.updated.**',
    'alarms.**',
    'controller.tagsChanged', 'controller.tagValuesChanged',
    'maxos.test.updated',
    'maxos.labels.printed'
  ]
};

exports.mongoose = {
  uri: mongodb.uri,
  options: mongodb,
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  models: [
    'setting', 'event', 'user', 'passwordResetRequest',
    'alarm',
    'maxosTest'
  ]
};
exports.mongoose.options.server.poolSize = 5;

exports.express = {
  staticPath: __dirname + '/../frontend',
  staticBuildPath: __dirname + '/../frontend-build',
  sessionCookieKey: 'maxos.sid',
  sessionCookie: {
    httpOnly: true,
    path: '/',
    maxAge: null
  },
  sessionStore: {
    touchChance: 0.20
  },
  cookieSecret: '1ee7|_|7!|_!0',
  ejsAmdHelpers: {
    t: 'app/i18n'
  },
  textBody: {limit: '1mb'},
  jsonBody: {limit: '1mb'}
};

exports.user = {
  localAddresses: [/^192\.168\./],
  privileges: [
    'EVENTS:VIEW',
    'USERS:VIEW', 'USERS:MANAGE',
    'SETTINGS:VIEW', 'SETTINGS:MANAGE',
    'ALARMS:VIEW', 'ALARMS:MANAGE',
    'MAXOS:MANAGE:CHANGE_ORDER', 'MAXOS:MANAGE:CHANGE_CONFIG', 'MAXOS:MANAGE:PRINT_LABELS'
  ]
};

exports.users = {

};

exports['messenger/server'] = {
  pubHost: ports.frontend.pubHost,
  pubPort: ports.frontend.pubPort,
  repHost: ports.frontend.repHost,
  repPort: ports.frontend.repPort,
  responseTimeout: 5000,
  broadcastTopics: [

  ]
};

exports['messenger/client:maxos-watchdog'] = {
  pubHost: ports.watchdog.pubHost,
  pubPort: ports.watchdog.pubPort,
  repHost: ports.watchdog.repHost,
  repPort: ports.watchdog.repPort,
  responseTimeout: 5000
};

exports['messenger/client:maxos-controller'] = {
  pubHost: ports.controller.pubHost,
  pubPort: ports.controller.pubPort,
  repHost: ports.controller.repHost,
  repPort: ports.controller.repPort,
  responseTimeout: 5000
};

exports['messenger/client:maxos-alarms'] = {
  pubHost: ports.alarms.pubHost,
  pubPort: ports.alarms.pubPort,
  repHost: ports.alarms.repHost,
  repPort: ports.alarms.repPort,
  responseTimeout: 5000
};

exports.updater = {
  manifestPath: __dirname + '/maxos-manifest.appcache',
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 5000,
  pull: {
    exe: 'git.exe',
    cwd: __dirname + '/../',
    timeout: 30000
  },
  versionsKey: 'maxos',
  manifests: [
    {
      path: '/manifest.appcache',
      mainJsFile: exports.mainJsFile,
      mainCssFile: exports.mainCssFile
    }
  ]
};

exports['mail/sender'] = {
  from: 'MAXOS Bot <maxos@localhost>'
};

exports.controller = {
  messengerClientId: 'messenger/client:maxos-controller'
};

exports['alarms/frontend'] = {
  messengerClientId: 'messenger/client:maxos-alarms'
};

exports.maxos = {
  modbusId: null,
  messengerClientId: 'messenger/client:maxos-controller',
  messengerServerId: null
};
