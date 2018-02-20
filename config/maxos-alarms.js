// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const mongodb = require('./maxos-mongodb');
const ports = require('./maxos-ports');

exports.id = 'maxos-alarms';

exports.modules = [
  'mongoose',
  'events',
  'messenger/server',
  'mail/sender',
  'sms/sender',
  'twilio',
  {id: 'messenger/client', name: 'messenger/client:maxos-controller'},
  'controller',
  'alarms/backend'
];

exports.events = {
  expressId: null,
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [
      'alarms.actionExecuted'
    ],
    info: [
      'events.**',
      'alarms.run',
      'alarms.activated'
    ],
    success: [
      'alarms.deactivated'
    ],
    warning: [
      'alarms.stopped'
    ],
    error: [
      'app.started',
      'alarms.compileFailed',
      'alarms.conditionCheckFailed',
      'alarms.actions.emailFailed',
      'alarms.actions.smsFailed'
    ]
  }
};

exports.mongoose = {
  uri: mongodb.uri,
  options: mongodb,
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  models: [
    'setting', 'event', 'user',
    'alarm',
    'twilioRequest', 'twilioResponse'
  ]
};
exports.mongoose.options.server.poolSize = 4;

exports['messenger/server'] = {
  pubHost: ports.alarms.pubHost,
  pubPort: ports.alarms.pubPort,
  repHost: ports.alarms.repHost,
  repPort: ports.alarms.repPort,
  broadcastTopics: [
    'events.saved',
    'alarms.**'
  ]
};

exports['messenger/client:maxos-controller'] = {
  pubHost: ports.controller.pubHost,
  pubPort: ports.controller.pubPort,
  repHost: ports.controller.repHost,
  repPort: ports.controller.repPort,
  responseTimeout: 5000
};

exports.controller = {
  messengerClientId: 'messenger/client:maxos-controller',
  pubsub: null,
  expressId: null
};

exports['mail/sender'] = {
  from: 'Maxos Bot <maxos@localhost>'
};

exports['sms/sender'] = {

};

exports.twilio = {

};

exports['health/endpoint'] = {
  messengerClientId: 'messenger/client:maxos-controller'
};
