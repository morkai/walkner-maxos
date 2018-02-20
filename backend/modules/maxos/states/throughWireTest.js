// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const glp2 = require('glp2');

module.exports = function(app, module, done)
{
  let actualValuesErrors = 0;

  monitorThroughWireStart();

  function invalidConnectorsPluggedIn(bail)
  {
    if (!module.tags.get('checkAsideConnectors'))
    {
      return false;
    }

    const {plugged, aside} = getConnectors();
    const toPlug = [];
    const toAside = [];

    plugged.forEach(c =>
    {
      if (module.tags.get(`L.${c}.aside`))
      {
        toPlug.push(c);
      }
    });

    aside.forEach(c =>
    {
      if (!module.tags.get(`L.${c}.aside`))
      {
        toAside.push(c);
      }
    });

    if (toAside.length)
    {
      if (bail)
      {
        setImmediate(fail, 'INVALID_CONNECTORS_PLUGGED_IN', {connectors: toAside.join(', ')});
      }
      else
      {
        module.message('PUT_CONNECTORS_ASIDE', {severity: 'info', connectors: toAside.join(', ')});

        setImmediate(done);
      }

      return true;
    }

    if (toPlug.length)
    {
      if (bail)
      {
        setImmediate(fail, 'INVALID_CONNECTORS_PUT_ASIDE', {connectors: toPlug.join(', ')});
      }
      else
      {
        module.message('PLUG_CONNECTORS_IN', {severity: 'info', connectors: toPlug.join(', ')});

        setImmediate(done);
      }

      return true;
    }

    return false;
  }

  function getConnectors()
  {
    const cableCount = module.tags.get('program.cables');
    const connectorCount = module.tags.get('program.connectors') + 1;
    const plugged = [];
    const aside = [];

    [1, 2, 3, 4].forEach(c => (c <= connectorCount ? plugged : aside).push(c));
    [6, 7, 8, 9].forEach(c => (cableCount === 2 && c - 5 <= connectorCount ? plugged : aside).push(c));

    return {plugged, aside};
  }

  function monitorThroughWireStart()
  {
    if (failed())
    {
      return;
    }

    if (invalidConnectorsPluggedIn())
    {
      return;
    }

    module.message('STARTING_THROUGH_WIRE_TEST', {severity: 'warning'});

    emptyActualValues();
  }

  function emptyActualValues()
  {
    module.glp2.getActualValues((err, res) =>
    {
      if (failed())
      {
        return;
      }

      if (invalidConnectorsPluggedIn())
      {
        return;
      }

      if (err)
      {
        ++actualValuesErrors;

        if (actualValuesErrors > 5)
        {
          return fail('GLP2:TESTER_NOT_READY');
        }

        return setTimeout(emptyActualValues, 100);
      }

      actualValuesErrors = 0;

      if (res)
      {
        setImmediate(emptyActualValues);
      }
      else
      {
        setImmediate(startThroughWireTest);
      }
    });
  }

  function startThroughWireTest()
  {
    module.message('START_THROUGH_WIRE_TEST', {severity: 'info'});

    module.glp2.getActualValues((err, res) =>
    {
      if (failed() || invalidConnectorsPluggedIn())
      {
        return;
      }

      if (err)
      {
        ++actualValuesErrors;

        if (actualValuesErrors > 5)
        {
          return fail('GLP2:TESTER_NOT_READY');
        }

        return setTimeout(startThroughWireTest, 100);
      }

      actualValuesErrors = 0;

      if (module.tags.get('throughWireTest.autoStart')
        || (res && res.faultStatus === glp2.FaultStatus.NO_TEST_STEP_DEFINED))
      {
        return setImmediate(initialCheck);
      }

      setImmediate(startThroughWireTest);
    });
  }

  function initialCheck()
  {
    let invalidTag = null;

    for (let cableN = 1; cableN <= 2; ++cableN)
    {
      if (invalidTag)
      {
        break;
      }

      const powerConnector = module.tags.get(`powerConnector.${cableN}`);

      for (let coreN = 1; coreN <= 7; ++coreN)
      {
        const tagName = `L.${powerConnector}.${coreN}.control`;

        if (module.tags.get(tagName))
        {
          invalidTag = tagName;

          break;
        }
      }

      if (invalidTag)
      {
        break;
      }

      for (let connectorN = 1; connectorN <= 10; ++connectorN)
      {
        for (let coreN = 1; coreN <= 7; ++coreN)
        {
          const tagName = `L.${connectorN}.${coreN}.status`;

          if (module.tags.get(tagName))
          {
            invalidTag = tagName;

            break;
          }
        }
      }
    }

    if (invalidTag)
    {
      return fail('INITIAL_THROUGH_WIRE_CHECK_FAILURE', {tag: invalidTag});
    }

    setImmediate(checkCore, 1, 1);
  }

  function checkCore(cable, core)
  {
    if (failed())
    {
      return;
    }

    if (invalidConnectorsPluggedIn(true))
    {
      return;
    }

    const cableCount = module.tags.get('program.cables');
    const coreCount = module.tags.get('program.cores');

    if (core > coreCount)
    {
      cable += 1;
      core = 1;
    }

    if (cable > cableCount)
    {
      return success();
    }

    module.message('RUNNING_THROUGH_WIRE_TEST', {
      severity: 'warning',
      cable: `${cable}/${cableCount}`,
      core: `${core}/${coreCount}`
    });

    const checkAllCores = module.tags.get('throughWireTest.checkAllCores', false);

    step(
      function()
      {
        module.tags.set(`program.throughWireTest.${cable}.${core}`, 'progress', this.group());

        if (checkAllCores)
        {
          enableCoreAll(cable, core, this.group());
        }
        else
        {
          enableCoreNext(cable, core, this.group());
        }
      },
      function(err)
      {
        if (err)
        {
          return this.done(fail, 'ENABLE_CORE_FAILURE', {error: err.message, cable, core});
        }

        const next = _.once(this.next());

        this.interval = setInterval(() =>
        {
          if (failed() || invalidConnectorsPluggedIn(true))
          {
            next(null, true);
          }
          else
          {
            const result = checkAllCores ? checkCoreAll(cable, core) : checkCoreNext(cable, core);

            if (!result)
            {
              next(null, false);
            }
          }
        }, 100);

        this.timer = setTimeout(next, module.tags.get('throughWireTest.checkDelay', 300), null, false);
      },
      function(err_, failure)
      {
        clearInterval(this.interval);
        clearTimeout(this.timer);

        if (failure || failed() || invalidConnectorsPluggedIn(true))
        {
          return this.done();
        }

        const result = checkAllCores ? checkCoreAll(cable, core) : checkCoreNext(cable, core);

        if (result)
        {
          module.tags.set(`program.throughWireTest.${cable}.${core}`, 'failure');

          return this.done(fail, 'THROUGH_WIRE_CHECK_FAILURE', result);
        }
      },
      function()
      {
        module.tags.set(`program.throughWireTest.${cable}.${core}`, 'success');

        setImmediate(checkCore, cable, core + 1);
      }
    );
  }

  function enableCoreAll(cable, core, done)
  {
    step(
      function()
      {
        for (let cableN = 1; cableN <= 2; ++cableN)
        {
          const powerConnector = module.tags.get(`powerConnector.${cableN}`);

          for (let coreN = 1; coreN <= 7; ++coreN)
          {
            module.tags.set(
              `L.${powerConnector}.${coreN}.control`,
              cableN === cable && coreN === core,
              this.group()
            );
          }
        }
      },
      done
    );
  }

  function enableCoreNext(cable, core, done)
  {
    const powerConnector = module.tags.get(`powerConnector.${cable}`);

    module.tags.set(`L.${powerConnector}.${core}.control`, true, done);
  }

  function checkCoreAll(checkedCable, checkedCore)
  {
    const powerConnector1 = module.tags.get('powerConnector.1');
    const powerConnector2 = module.tags.get('powerConnector.2');
    const cableCount = module.tags.get('program.cables');
    const connectorCount = module.tags.get('program.connectors') + 1;
    const checkedConnectors = [1, 6];

    for (let connector = 2; connector <= connectorCount; ++connector)
    {
      checkedConnectors.push(connector, connector + 5);
    }

    for (let connector = 1; connector <= 10; ++connector)
    {
      if (connector === powerConnector1 || connector === powerConnector2)
      {
        continue;
      }

      const cable = connector <= 5 ? 1 : 2;
      const checkedConnector = checkedConnectors.includes(connector);

      for (let core = 1; core <= 7; ++core)
      {
        const actualStatus = module.tags.get(`L.${connector}.${core}.status`, false);
        const requiredStatus = checkedConnector
          && ((cable === checkedCable && core === checkedCore)
            || (checkedCore === 4 && core === 4 && cableCount === 2));

        if (actualStatus !== requiredStatus)
        {
          return {
            cable: cable,
            connector: connector,
            core: core,
            checkedCable,
            checkedConnectors,
            checkedCore,
            requiredStatus,
            actualStatus
          };
        }
      }
    }

    return null;
  }

  function checkCoreNext(checkedCable, checkedCore)
  {
    const powerConnector1 = module.tags.get('powerConnector.1');
    const powerConnector2 = module.tags.get('powerConnector.2');
    const cableCount = module.tags.get('program.cables');
    const connectorCount = module.tags.get('program.connectors') + 1;
    const checkedConnectors = [1, 6];

    for (let connector = 2; connector <= connectorCount; ++connector)
    {
      checkedConnectors.push(connector, connector + 5);
    }

    for (let connector = 1; connector <= 10; ++connector)
    {
      if (connector === powerConnector1 || connector === powerConnector2)
      {
        continue;
      }

      const cable = connector <= 5 ? 1 : 2;

      if (cable < checkedCable)
      {
        continue;
      }

      const checkedConnector = checkedConnectors.includes(connector);

      for (let core = 1; core <= 7; ++core)
      {
        if (cable === checkedCable && core < checkedCore)
        {
          continue;
        }

        const actualStatus = module.tags.get(`L.${connector}.${core}.status`, false);
        const requiredStatus = checkedConnector
          && ((cable === checkedCable && core === checkedCore)
            || (checkedCore >= 4 && core === 4 && cableCount === 2)
            || (checkedCable === 2 && core === 4));

        if (actualStatus !== requiredStatus)
        {
          return {
            cable: cable,
            connector: connector,
            core: core,
            checkedCable,
            checkedConnectors,
            checkedCore,
            requiredStatus,
            actualStatus
          };
        }
      }
    }

    return null;
  }

  function failed()
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

    if (module.tags.get('S.1.status') || module.tags.get('S.2.status'))
    {
      return fail('CONTACTORS_FAILURE');
    }

    return false;
  }

  function reset(done)
  {
    step(
      function()
      {
        module.test.copyThroughWireTest(module.tags.get);

        module.tags.set('S.1.control', false, this.group());
        module.tags.set('S.2.control', false, this.group());

        const powerConnector1 = module.tags.get('powerConnector.1');
        const powerConnector2 = module.tags.get('powerConnector.2');

        for (let core = 1; core <= 7; ++core)
        {
          module.tags.set(`L.${powerConnector1}.${core}.control`, false, this.group());
          module.tags.set(`L.${powerConnector2}.${core}.control`, false, this.group());
        }

        module.glp2.reset(1, this.group());
      },
      done
    );
  }

  function fail(messageKey, messageData)
  {
    step(
      function()
      {
        module.message(
          'FAILURE',
          Object.assign(messageData || {}, {severity: 'danger', reason: messageKey}),
          this.group()
        );

        module.tags.set('program.state', 'failure', this.group());

        reset(this.group());
      },
      done
    );

    return true;
  }

  function success()
  {
    step(
      function()
      {
        module.message('FINISHING_THROUGH_WIRE_TEST', {severity: 'warning'}, this.group());

        module.tags.set('program.state', 'serialNumber', this.group());

        reset(this.group());
      },
      done
    );
  }
};
