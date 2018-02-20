// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-hydro project <http://lukasz.walukiewicz.eu/p/walkner-hydro>

define(["app/i18n","app/core/pages/ListPage","../views/ChangesView"],function(e,n,a){"use strict";return n.extend({ListView:a,breadcrumbs:[e.bound("analytics","BREADCRUMBS:base"),e.bound("analytics","BREADCRUMBS:changes")],actions:[],load:function(e){return e(this.collection.load())}})});