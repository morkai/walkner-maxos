// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/pages/DetailsPage',
  '../controller',
  '../views/TestDetailsView'
], function(
  t,
  user,
  DetailsPage,
  controller,
  TestDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    DetailsView: TestDetailsView,

    actions: function()
    {
      var actions = [];

      return actions;

      if (this.model.get('status') === 'success' && controller.auth.printLabels())
      {
        actions.push({
          icon: 'print',
          label: t('maxos', 'PAGE_ACTIONS:printLabels'),
          callback: function()
          {

          }
        });
      }

      return actions;
    }

  });
});
