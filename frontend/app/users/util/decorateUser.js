// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n'
], function(
  t
) {
  'use strict';

  return function(user)
  {
    var obj = user.toJSON();

    return obj;
  };
});
