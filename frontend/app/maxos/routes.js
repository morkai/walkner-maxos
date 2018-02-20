// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'app/router',
  'app/viewport',
  './MaxosTest',
  './MaxosTestCollection',
  './pages/DashboardPage',
  './pages/TestListPage',
  './pages/TestDetailsPage',
  'i18n!app/nls/maxos'
], function(
  router,
  viewport,
  MaxosTest,
  MaxosTestCollection,
  DashboardPage,
  TestListPage,
  TestDetailsPage
) {
  'use strict';

  router.map('/maxos', function()
  {
    viewport.showPage(new DashboardPage());
  });

  router.map('/maxos/tests', function(req)
  {
    viewport.showPage(new TestListPage({
      collection: new MaxosTestCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map('/maxos/tests/:id', function(req)
  {
    viewport.showPage(new TestDetailsPage({
      model: new MaxosTest({_id: req.params.id})
    }));
  });
});
