// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const mongodb = require('./maxos-mongodb');
const ports = require('./maxos-ports');

exports.id = 'maxos-controller';

exports.modules = [
  'updater',
  'mongoose',
  'events',
  'modbus',
  'collector',
  'messenger/server',
  'maxos'
];

exports.mongoose = {
  uri: mongodb.uri,
  options: mongodb,
  maxConnectTries: 0,
  connectAttemptDelay: 200,
  models: ['event', 'setting', 'maxosTest']
};
exports.mongoose.options.server.poolSize = 5;

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  mongooseId: null,
  userId: null,
  expressId: null,
  insertDelay: 1000,
  topics: {
    debug: [

    ],
    info: [
      'events.**'
    ],
    success: [

    ],
    error: [
      'app.started',
      'collector.saveFailed'
    ]
  },
  print: []
};

exports.updater = {
  expressId: null,
  sioId: null,
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 5000,
  versionsKey: 'maxos',
  backendVersionKey: 'controller',
  frontendVersionKey: null
};

exports['messenger/server'] = {
  pubHost: ports.controller.pubHost,
  pubPort: ports.controller.pubPort,
  repHost: ports.controller.repHost,
  repPort: ports.controller.repPort,
  broadcastTopics: [
    'events.saved',
    'maxos.test.updated',
    'maxos.labels.printed'
  ]
};

exports.modbus = {
  settingsCollection: app => app.mongoose.connection.db.collection('tags.settings'),
  writeAllTheThings: 'sim',
  maxReadQuantity: 40,
  ignoredErrors: [
    'ECONNREFUSED',
    'EHOSTUNREACH',
    'ResponseTimeout'
  ],
  broadcastFilter: ['health'],
  controlMasters: ['sim'],
  masters: {
    sim: {
      defaultTimeout: 100,
      interval: 100,
      suppressTransactionErrors: true,
      transport: {
        type: 'ip'
      },
      connection: {
        type: 'tcp',
        socketOptions: {
          host: '127.0.0.1',
          port: 502
        },
        noActivityTime: 2000
      }
    }
  },
  tagsFile: __dirname + '/tags.csv',
  tags: {}
};

exports.collector = {
  collection: (app, name) => app.mongoose.connection.db.collection(name)
};

exports.maxos = {
  expressId: null,
  sioId: null,
  userId: null,
  messengerClientId: null
};
