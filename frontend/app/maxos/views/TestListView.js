// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable is-colored',

    remoteTopics: {},

    columns: [
      {id: 'orderNo', className: 'is-min is-number'},
      {id: 'itemNumber', className: 'is-min is-number'},
      {id: 'startedAt', className: 'is-min'},
      {id: 'elapsedTime', className: 'is-min'},
      'reason'
    ],

    serializeActions: function()
    {
      return [];
    }

  });
});
