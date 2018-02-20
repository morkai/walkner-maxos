// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/FilteredListPage',
  '../views/UserFilterView',
  '../views/UserListView'
], function(
  FilteredListPage,
  TestFilterView,
  TestListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: TestFilterView,
    ListView: TestListView

  });
});
