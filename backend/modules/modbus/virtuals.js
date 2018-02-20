// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function setUpVirtualTags(app, modbus)
{
  setUpMasterStatusTag();

  function setUpMasterStatusTag()
  {
    const controlProcessTag = modbus.tags['masters.controlProcess'];

    if (_.isUndefined(controlProcessTag))
    {
      return modbus.warn('masters.controlProcess tag is not defined!');
    }

    const statusTags = [];

    _.forEach(modbus.config.controlMasters, function(controlMaster)
    {
      const master = modbus.masters[controlMaster];

      if (_.isObject(master))
      {
        statusTags.push(`masters.${controlMaster}`);
      }
    });

    const doCheckMasterControlStatus = checkControlProcessMastersStatus.bind(null, statusTags, controlProcessTag);

    statusTags.forEach(masterStatusTag =>
    {
      app.broker.subscribe(`tagValueChanged.${masterStatusTag}`, doCheckMasterControlStatus);
    });
  }

  function checkControlProcessMastersStatus(statusTags, controlProcessTag)
  {
    let newState = true;

    for (let i = 0, l = statusTags.length; i < l; ++i)
    {
      if (!modbus.values[statusTags[i]])
      {
        newState = false;

        break;
      }
    }

    controlProcessTag.setValue(newState);
  }
};
