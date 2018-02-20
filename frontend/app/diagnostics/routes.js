// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'app/router',
  'app/viewport',
  'app/user',
  'app/data/controller',
  'app/diagnostics/pages/TagsPage',
  'i18n!app/nls/diagnostics'
], function(
  router,
  viewport,
  user,
  controller,
  TagsPage
) {
  'use strict';

  var canView = user.auth('DIAGNOSTICS:VIEW');

  router.map('/diagnostics/tags', canView, function()
  {
    viewport.showPage(new TagsPage({
      model: controller
    }));
  });
});
