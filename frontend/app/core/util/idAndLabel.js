// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore'
], function(
  _
) {
  'use strict';

  return function idAndLabel(model, more)
  {
    var result = {
      id: model.id,
      text: model.getLabel()
    };

    if (more)
    {
      _.extend(result, more);
    }

    return result;
  };
});
