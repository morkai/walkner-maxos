// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  'app/diagnostics/views/TagsView'
], function(
  t,
  bindLoadingMessage,
  View,
  TagsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        t.bound('diagnostics', 'BREADCRUMBS:base'),
        t.bound('diagnostics', 'BREADCRUMBS:tags')
      ];
    },

    initialize: function()
    {
      bindLoadingMessage(this.model.tags, this);

      this.view = new TagsView({
        model: this.model.tags
      });
    },

    load: function(when)
    {
      return when(this.model.load());
    }

  });
});
