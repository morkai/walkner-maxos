// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  './broker',
  './router',
  './changelog/routes',
  './events/routes',
  './users/routes',
  './alarms/routes',
  './diagnostics/routes',
  './maxos/routes'
], function(
  broker,
  router
) {
  'use strict';

  router.map('/', function()
  {
    broker.publish('router.navigate', {
      url: '/maxos',
      trigger: true,
      replace: true
    });
  });
});
