// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function setUpSafeGuards(app, module)
{
  const {getTagValue, setTagValue} = app[module.config.modbusId];

  app.broker.subscribe('beforeWriteTagValue.L.*.*.control', state =>
  {
    state.allowWrite = state.allowWrite && (!state.newValue || !getTagValue('estop'));
  });

  app.broker.subscribe('beforeWriteTagValue.S.*.control', state =>
  {
    state.allowWrite = state.allowWrite && (!state.newValue || !getTagValue('estop'));
  });

  app.broker.subscribe('beforeWriteTagValue.program.order', state =>
  {
    state.allowWrite = state.allowWrite && getTagValue('program.state') === 'idle';
  });

  app.broker.subscribe('tagValueChanged.estop', state =>
  {
    if (!state.newValue)
    {
      return;
    }

    step(
      function()
      {
        const tagsToOff = ['S.1.control', 'S.2.control'];
        const powerConnector1 = getTagValue('powerConnector.1');
        const powerConnector2 = getTagValue('powerConnector.2');

        if (powerConnector1)
        {
          for (let core = 1; core <= 7; ++core)
          {
            tagsToOff.push(`L.${powerConnector1}.${core}.control`);
          }
        }

        if (powerConnector2)
        {
          for (let core = 1; core <= 7; ++core)
          {
            tagsToOff.push(`L.${powerConnector2}.${core}.control`);
          }
        }

        tagsToOff.forEach(tag => setTagValue(tag, false, this.group()));
      },
      function(err)
      {
        if (err)
        {
          module.error(`Failed to turn off control after e-stop: ${err.message}`);
        }
      }
    );
  });

  app.broker.subscribe('tagValueChanged.program.order', state =>
  {
    step(
      function()
      {
        const order = state.newValue || {
          cables: 0,
          connectors: 0,
          cores: 0
        };

        setTagValue('program.cables', order.cables, this.group());
        setTagValue('program.connectors', order.connectors, this.group());
        setTagValue('program.cores', order.cores, this.group());
      },
      function(err)
      {
        if (err)
        {
          module.error(`Failed to change program config: ${err.message}`);
        }
      }
    );
  });

  app.broker.subscribe('tagValueChanged.program.state', state =>
  {
    module.debug(`Entered [${state.newValue}] from [${state.oldValue}].`);
  });

  app.broker.subscribe('tagValueChanged.safetyTest.blackbox', state =>
  {
    if (state.newValue === true)
    {
      module.glp2.stop(() => {});
    }
    else if (state.newValue === false)
    {
      module.glp2.start();
    }
  });
};
