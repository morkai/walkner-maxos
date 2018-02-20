// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  '../data/loadedModules',
  '../core/Model',
  './util/decorateUser'
], function(
  loadedModules,
  Model,
  decorateUser
) {
  'use strict';

  return Model.extend({

    urlRoot: '/users',

    clientUrlRoot: '#users',

    topicPrefix: 'users',

    privilegePrefix: 'USERS',

    nlsDomain: 'users',

    labelAttribute: 'login',

    initialize: function()
    {
      if (!Array.isArray(this.get('privileges')))
      {
        this.set('privileges', []);
      }
    },

    getLabel: function()
    {
      var lastName = this.get('lastName') || '';
      var firstName = this.get('firstName') || '';

      return lastName.length && firstName.length ? (lastName + ' ' + firstName) : this.get('login');
    },

    url: function()
    {
      var url = Model.prototype.url.apply(this, arguments);

      if (this.isNew() || !loadedModules.isLoaded('vendors'))
      {
        return url;
      }

      return url + '?populate(vendor)';
    },

    serialize: function()
    {
      return decorateUser(this);
    }

  });
});
