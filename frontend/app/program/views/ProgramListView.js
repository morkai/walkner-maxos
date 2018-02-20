// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable is-colored',

    columns: [
      {id: 'description', className: 'is-min'},
      {id: 'status', className: 'is-min'},
      {id: 'startedAt', className: 'is-min'},
      {id: 'finishedAt', className: 'is-min', noData: '-'},
      {id: 'elapsedTime', className: 'is-min', noData: '-'},
      {id: 'reason', noData: '-'}
    ],

    serializeActions: function()
    {
      return [];
    }

  });
});
