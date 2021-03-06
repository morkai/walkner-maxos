// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  '../util/bindLoadingMessage',
  '../View',
  '../views/ActionFormView',
  './createPageBreadcrumbs'
], function(
  _,
  t,
  bindLoadingMessage,
  View,
  ActionFormView,
  createPageBreadcrumbs
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    baseBreadcrumb: false,

    breadcrumbs: function()
    {
      return createPageBreadcrumbs(this, [
        {
          label: this.model.getLabel(),
          href: this.model.genClientUrl()
        },
        ':ACTION_FORM:' + this.options.actionKey
      ]);
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.options.model, this);

      var actionKey = this.options.actionKey;

      this.view = new ActionFormView(_.defaults({model: this.model}, this.options, {
        formActionText: t.bound(this.model.getNlsDomain(), 'ACTION_FORM:BUTTON:' + actionKey),
        messageText: t.bound(this.model.getNlsDomain(), 'ACTION_FORM:MESSAGE:' + actionKey),
        failureText: t.bound(this.model.getNlsDomain(), 'ACTION_FORM:MESSAGE_FAILURE:' + actionKey),
        requestData: {action: actionKey}
      }));
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
