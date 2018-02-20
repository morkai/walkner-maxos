// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/DetailsView',
  'app/maxos/templates/details'
], function(
  _,
  DetailsView,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    remoteTopics: {},

    afterRender: function()
    {
      DetailsView.prototype.afterRender.call(this);


    }

  });
});
