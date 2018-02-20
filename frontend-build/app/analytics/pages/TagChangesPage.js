// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-hydro project <http://lukasz.walukiewicz.eu/p/walkner-hydro>

define(["app/viewport","app/i18n","app/data/controller","app/core/pages/FilteredListPage","../views/TagChangesFilterView","../views/TagChangesListView"],function(e,t,a,i,n,s){"use strict";return i.extend({FilterView:n,ListView:s,breadcrumbs:function(){var e=a.get(this.collection.tag);return[t.bound("analytics","BREADCRUMBS:base"),{label:t.bound("analytics","BREADCRUMBS:changes"),href:"#analytics/changes"},e?e.getLabel():this.collection.tag]},actions:[],load:function(e){return e(this.collection.fetch({reset:!0}),a.load())}})});