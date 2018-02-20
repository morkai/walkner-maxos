// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const glp2 = require('glp2');
const safetyTest = require('../safetyTest');

module.exports = function(app, module, done)
{
  let actualValuesNulls = 0;
  let actualValuesResponses = 0;
  let actualValuesErrors = 0;

  handleGetActualValuesResponse(module.glp2.lastResponse);

  function getSafetyTestTag(stepNumber)
  {
    const cable = module.tags.get('program.cable');
    const tags = [
      `program.safetyTest.${cable}.pe1`,
      `program.safetyTest.${cable}.iso`,
      `program.safetyTest.${cable}.pe2`
    ];

    if (stepNumber >= 1)
    {
      return tags[stepNumber - 1];
    }

    return _.find(tags, tag => module.tags.get(tag) === 'progress');
  }

  function handleGetActualValuesResponse(res)
  {
    if (failed())
    {
      return;
    }

    if (res.type === glp2.ResponseType.INTERIM_ACTUAL_VALUES)
    {
      return handleInterimActualValuesResponse(res);
    }

    if (res.type === glp2.ResponseType.ACTUAL_VALUES)
    {
      return handleActualValuesResponse(res);
    }

    return fail('UNEXPECTED_PE_TESTER_RESPONSE', {response: res});
  }

  function handleInterimActualValuesResponse(res)
  {
    const cable = module.tags.get('program.cable');

    switch (res.stepNumber)
    {
      case 1:
        module.tags.set(`program.safetyTest.${cable}.pe1`, 'progress');
        break;

      case 2:
        module.tags.set(`program.safetyTest.${cable}.pe1`, 'success');
        module.tags.set(`program.safetyTest.${cable}.iso`, 'progress');
        break;

      case 3:
        module.tags.set(`program.safetyTest.${cable}.pe1`, 'success');
        module.tags.set(`program.safetyTest.${cable}.iso`, 'success');
        module.tags.set(`program.safetyTest.${cable}.pe2`, 'progress');
        break;
    }

    setImmediate(monitorActualValues);
  }

  function handleActualValuesResponse(res)
  {
    if (res.faultStatus)
    {
      return fail('GLP2:FAULT:' + res.faultStatus);
    }

    const testResult = res.steps[0];

    if (!testResult)
    {
      if (res.completed)
      {
        module.tags.set(getSafetyTestTag(), 'failure');

        return fail('GLP2:FAULT:' + glp2.FaultStatus.CANCELLED);
      }

      module.tags.set(getSafetyTestTag(), 'success');

      return success();
    }

    if (testResult.evaluation)
    {
      module.tags.set(getSafetyTestTag(testResult.stepNumber), 'success');

      if (testResult.stepNumber === 2)
      {
        if (module.tags.get('safetyTest.pe2'))
        {
          return module.message('RESTART_SAFETY_TEST_PROBE', {severity: 'info'}, monitorActualValues);
        }

        return success();
      }

      if (testResult.stepNumber === 3)
      {
        return success();
      }

      return setImmediate(monitorActualValues);
    }

    module.tags.set(getSafetyTestTag(testResult.stepNumber), 'failure');

    fail('GLP2:TEST_STEP_FAILURE', {
      setValue: testResult.setValue,
      actualValue: testResult.actualValue,
      setValue2: testResult.setValue2,
      actualValue2: testResult.actualValue2
    });
  }

  function autoStartSafetyTest()
  {
    module.message('RUNNING_SAFETY_TEST', {severity: 'warning', cable: 2});

    actualValuesNulls = 0;
    actualValuesResponses = -1;
    actualValuesErrors = 0;

    module.glp2.startTest(err =>
    {
      if (err)
      {
        module.error(`[safetyTest] Failed to auto-start: ${err.message || err}`);
      }

      setImmediate(monitorActualValues);
    });
  }

  function success()
  {
    const cables = module.tags.get('program.cables');
    const cable = module.tags.get('program.cable');

    if (cable < cables)
    {
      startNextSafetyTest();
    }
    else
    {
      startThroughWireTest();
    }
  }

  function startNextSafetyTest()
  {
    step(
      function()
      {
        module.message('SETTING_SAFETY_TEST', {severity: 'warning'}, this.group());

        module.tags.set('S.1.control', false, this.group());
        module.tags.set('S.2.control', false, this.group());
        module.tags.set('program.cable', 2, this.group());
      },
      function(err)
      {
        if (failed(false))
        {
          return this.done();
        }

        if (err)
        {
          return this.skip(err);
        }

        module.tags.set('S.1.control', false, this.group());
        module.tags.set('S.2.control', true, this.group());

        module.glp2.reset(1, this.group());
      },
      function(err)
      {
        if (failed())
        {
          return this.done();
        }

        if (err)
        {
          return this.skip(err);
        }

        module.glp2.setTestProgram(
          'MAXOS 2',
          safetyTest.create(
            module.tags.get('safetyTest.config'),
            module.tags.get('safetyTest.pe2')
          ),
          this.group()
        );
      },
      function(err)
      {
        if (failed())
        {
          return this.done();
        }

        if (err)
        {
          return fail('SETTING_SAFETY_TEST_FAILURE', {error: err.message || err});
        }

        autoStartSafetyTest();
      }
    );
  }

  function startThroughWireTest()
  {
    step(
      function()
      {
        module.message('FINISHING_SAFETY_TEST', {severity: 'warning'}, this.group());

        module.test.copySafetyTest(module.tags.get);

        module.tags.set('program.state', 'throughWireTest', this.group());
        module.tags.set('program.cable', 1, this.group());
        module.tags.set('S.1.control', false, this.group());
        module.tags.set('S.2.control', false, this.group());

        module.glp2.reset(1, this.group());
      },
      done
    );
  }

  function monitorActualValues()
  {
    if (failed())
    {
      return;
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

        if (actualValuesErrors > 10)
        {
          return fail('GLP2:TESTER_NOT_READY');
        }

        return setTimeout(monitorActualValues, 100);
      }

      if (res && res.faultStatus === glp2.FaultStatus.NO_TEST_STEP_DEFINED)
      {
        return setImmediate(monitorActualValues);
      }

      actualValuesErrors = 0;

      if (res)
      {
        ++actualValuesResponses;

        if (actualValuesResponses === 0)
        {
          module.glp2.lastResponse = res;
        }

        handleGetActualValuesResponse(res);
      }
      else
      {
        ++actualValuesNulls;

        if (actualValuesNulls > 5
          && actualValuesResponses === 0
          && module.glp2.lastResponse.type === glp2.ResponseType.INTERIM_ACTUAL_VALUES)
        {
          module.tags.set(getSafetyTestTag(), 'failure');

          return fail('GLP2:TEST_STEP_FAILURE', {
            setValue: -1,
            actualValue: -1,
            setValue2: -1,
            actualValue2: -1
          });
        }

        setImmediate(monitorActualValues);
      }
    });
  }

  function failed(checkContactors)
  {
    if (module.tags.get('program.cancelled'))
    {
      return fail('CANCELLED');
    }

    if (!module.tags.get('masters.controlProcess', false))
    {
      return fail('NO_PLC_CONNECTION');
    }

    if (module.tags.get('estop', true))
    {
      return fail('ESTOP');
    }

    if (!module.glp2.isReady())
    {
      return fail('PE_TESTER_NOT_READY');
    }

    const cable = module.tags.get('program.cable');

    if (checkContactors !== false && cable)
    {
      const onContactor = cable === 1 ? 'S.1.status' : 'S.2.status';
      const offContactor = cable === 1 ? 'S.2.status' : 'S.1.status';

      if (!module.tags.get(onContactor) || module.tags.get(offContactor))
      {
        return fail('CONTACTORS_FAILURE');
      }
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

    if (Date.now() - module.tags.time('program.state') > module.tags.get('safetyTest.maxDuration', 30000))
    {
      return fail('SAFETY_TEST_TOO_LONG');
    }

    return false;
  }

  function fail(messageKey, messageData)
  {
    step(
      function()
      {
        module.message('FAILURE', Object.assign(messageData || {}, {severity: 'danger', reason: messageKey}));

        module.test.copySafetyTest(module.tags.get);

        module.tags.set('program.state', 'failure', this.group());
        module.tags.set('program.cable', 1, this.group());
        module.tags.set('S.1.control', false, this.group());
        module.tags.set('S.2.control', false, this.group());

        module.glp2.reset(1, this.group());
      },
      done
    );

    return true;
  }
};
