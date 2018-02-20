// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function setUpMaxosClient(app, module)
{
  const messengerClient = app[module.config.messengerClientId];

  module.test = {};

  app.broker
    .subscribe('messenger.client.connected', sync)
    .setFilter(m => m.socketType === 'req' && m.moduleName === module.config.messengerClientId);

  app.broker.subscribe('maxos.test.updated', changes => Object.assign(module.test, changes));

  if (messengerClient.isConnected())
  {
    setImmediate(sync);
  }

  function sync()
  {
    messengerClient.request('maxos.test.get', {}, function(err, test)
    {
      if (err)
      {
        module.error(`Failed to sync: ${err.message}`);
      }

      if (_.isPlainObject(test))
      {
        module.info(`Synced current test.`);

        app.broker.publish('maxos.test.updated', test);
      }
    });
  }
};
