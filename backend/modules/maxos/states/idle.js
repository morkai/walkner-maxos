// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const glp2 = require('glp2');
const safetyTest = require('../safetyTest');

module.exports = function(app, module, done)
{
  const disabled = module.tags.get('safetyTest.disabled', false);
  const autoStart = module.tags.get('throughWireTest.autoStart', false);
  const pe2 = module.tags.get('safetyTest.pe2', false);
  const configChangeTime = module.tags.time('safetyTest.config');
  const unwired = module.tags.get('program.cables') === -1;
  let checkContactors = false;
  let actualValuesErrors = 0;

  if (failed())
  {
    return;
  }

  step(
    function()
    {
      if (!disabled)
      {
        if (unwired)
        {
          module.message('UNWIRED:PREPARING', {severity: 'warning'}, this.group());
        }
        else
        {
          module.message('SETTING_SAFETY_TEST', {severity: 'warning'}, this.group());
        }
      }

      reset(this.group());

      module.tags.set('S.1.control', !unwired && !disabled, this.group());
      module.tags.set('S.2.control', false, this.group());

      module.glp2.reset(1, this.group());
    },
    function(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (unwired || disabled || module.glp2.fake)
      {
        return;
      }

      module.glp2.setTestProgram(
        'MAXOS 1',
        safetyTest.create(
          module.tags.get('safetyTest.config'),
          module.tags.get('safetyTest.pe2')
        ),
        this.next()
      );
    },
    function(err)
    {
      if (err)
      {
        module.error(`[idle] Failed to set test program: ${err.message || err}`);

        if (unwired || disabled)
        {
          return fail(2500, 'ERROR', {error: err.message || err});
        }

        return fail(2500, 'SETTING_SAFETY_TEST_FAILURE', {error: err.message || err});
      }

      if (unwired || disabled)
      {
        if (module.tags.get('S.1.status') || module.tags.get('S.2.status'))
        {
          return fail(2500, 'CONTACTORS_FAILURE');
        }
      }
      else
      {
        if (!module.tags.get('S.1.status') || module.tags.get('S.2.status'))
        {
          return fail(2500, 'CONTACTORS_FAILURE');
        }

        checkContactors = true;
      }

      if ((unwired || disabled) && module.tags.get('throughWireTest.autoStart'))
      {
        return module.tags.set('program.state', 'start', done);
      }

      setImmediate(monitorTestStart);
    }
  );

  function monitorTestStart()
  {
    if (failed())
    {
      return;
    }

    if (disabled !== module.tags.get('safetyTest.disabled', false)
      || pe2 !== module.tags.get('safetyTest.pe2', false)
      || autoStart !== module.tags.get('throughWireTest.autoStart', false)
      || configChangeTime !== module.tags.time('safetyTest.config'))
    {
      return done();
    }

    module.glp2.getActualValues((err, res) =>
    {
      if (failed())
      {
        return;
      }

      if (err)
      {
        ++actualValuesErrors;

        if (actualValuesErrors > 5)
        {
          return fail('PE_TESTER_NOT_READY');
        }

        return setTimeout(monitorTestStart, 100);
      }

      actualValuesErrors = 0;

      if (res)
      {
        if (res.faultStatus === glp2.FaultStatus.NO_TEST_STEP_DEFINED)
        {
          if (unwired)
          {
            return module.tags.set('program.state', 'start', done);
          }

          if (!disabled)
          {
            return setImmediate(done);
          }
        }

        module.glp2.lastResponse = res;

        module.tags.set('program.state', 'start', done);
      }
      else
      {
        module.message(
          module.tags.get('program.cables') === -1 ? 'UNWIRED:IDLE' : (disabled ? 'IDLE_THROUGH_WIRE' : 'IDLE'),
          monitorTestStart
        );
      }
    });
  }

  function reset(done)
  {
    step(
      function()
      {
        module.tags.set('program.cancelled', false, this.group());
        module.tags.set('program.cable', 1, this.group());

        for (let cable = 1; cable <= 2; ++cable)
        {
          module.tags.set(`program.safetyTest.${cable}.pe1`, 'off', this.group());
          module.tags.set(`program.safetyTest.${cable}.pe2`, 'off', this.group());
          module.tags.set(`program.safetyTest.${cable}.iso`, 'off', this.group());

          const powerConnector = module.tags.get(`powerConnector.${cable}`);

          for (let core = 1; core <= 7; ++core)
          {
            module.tags.set(`L.${powerConnector}.${core}.control`, false, this.group());
            module.tags.set(`program.throughWireTest.${cable}.${core}`, 'off', this.group());
          }
        }
      },
      done
    );
  }

  function failed()
  {
    if (!module.tags.get('masters.controlProcess', false))
    {
      return fail('NO_PLC_CONNECTION');
    }

    if (module.tags.get('estop', true))
    {
      return fail('ESTOP');
    }

    if (!module.tags.get('program.order'))
    {
      return fail('NO_ORDER', {severity: 'info'});
    }

    if (module.tags.get('safetyTest.blackbox'))
    {
      return fail('BLACKBOX');
    }

    if (!module.glp2.isReady())
    {
      return fail('PE_TESTER_NOT_READY');
    }

    if (checkContactors
      && (!module.tags.get('S.1.status') || module.tags.get('S.2.status')))
    {
      return fail('CONTACTORS_FAILURE');
    }

    if (module.tags.get('checkAsideConnectors', true))
    {
      const invalidConnectors = [1, 2, 3, 4, 6, 7, 8, 9].filter(
        connector => !module.tags.get(`L.${connector}.aside`, false)
      );

      if (invalidConnectors.length)
      {
        return fail('PUT_CONNECTORS_ASIDE', {connectors: invalidConnectors.join(', ')});
      }
    }

    return false;
  }

  function fail(delay, messageKey, messageData)
  {
    if (typeof delay === 'string')
    {
      messageData = messageKey;
      messageKey = delay;
      delay = 1;
    }

    step(
      function()
      {
        module.message(messageKey, Object.assign({severity: 'danger'}, messageData), this.group());

        module.tags.set('S.1.control', false, this.group());
        module.tags.set('S.2.control', false, this.group());

        reset(this.group());

        if (!module.tags.get('safetyTest.blackbox', false))
        {
          module.glp2.reset(1, this.group());
        }
      },
      function()
      {
        setTimeout(done, delay);
      }
    );

    return true;
  }
};
