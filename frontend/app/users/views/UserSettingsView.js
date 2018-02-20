// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'app/settings/views/SettingsView',
  'app/users/templates/settings'
], function(
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#users;settings',

    template: template

  });
});
