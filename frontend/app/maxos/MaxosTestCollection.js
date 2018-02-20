// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './MaxosTest'
], function(
  Collection,
  MaxosTest
) {
  'use strict';

  return Collection.extend({

    model: MaxosTest,

    rqlQuery: 'sort(-startedAt)&limit(20)'

  });
});
