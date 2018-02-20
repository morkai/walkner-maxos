// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/pages/FilteredListPage',
  '../core/pages/DetailsPage',
  './Program',
  './ProgramCollection',
  './views/ProgramFilterView',
  './views/ProgramListView',
  'app/program/templates/details',
  'i18n!app/nls/program'
], function(
  router,
  viewport,
  user,
  FilteredListPage,
  DetailsPage,
  Program,
  ProgramCollection,
  ProgramFilterView,
  ProgramListView,
  detailsTemplate
) {
  'use strict';

  var canView = user.auth('LOCAL', 'PROGRAM:VIEW');

  router.map('/program', canView, function(req)
  {
    viewport.showPage(new FilteredListPage({
      FilterView: ProgramFilterView,
      ListView: ProgramListView,
      actions: [],
      collection: new ProgramCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map('/program/:id', canView, function(req)
  {
    viewport.showPage(new DetailsPage({
      actions: [],
      detailsTemplate: detailsTemplate,
      model: new Program({_id: req.params.id})
    }));
  });
});
