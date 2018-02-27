// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const util = require('util');
const _ = require('lodash');
const deepEqual = require('deep-equal');
const step = require('h5.step');
const states = require('./states');
const Glp2Manager = require('./Glp2Manager');
const labels = require('./labels');

const HANDLE_PROGRAM_DELAY = 100;

module.exports = function setUpMaxosProgram(app, module)
{
  const messengerServer = app[module.config.messengerServerId];
  const modbus = app[module.config.modbusId];
  const mongoose = app[module.config.mongooseId];
  const MaxosTest = mongoose.model('MaxosTest');

  let handlingProgram = false;
  let handleProgramDelay = HANDLE_PROGRAM_DELAY;
  const handleProgramTimer = {
    handle: null,
    clear: () => {}
  };

  module.initialized = false;

  module.glp2 = new Glp2Manager({
    comPort: module.config.testerAddress,
    comAddress: 0x01,
    cancelDelay: 1,
    readDeviceOptions: false,
    log: function() { module.debug(util.format.apply(util, arguments)); }
  });

  module.glp2.isInProgress = () => true;

  module.glp2.lastResponse = null;

  module.glp2.on('ready', () => setTagValue('masters.tester', true));
  module.glp2.on('close', () => setTagValue('masters.tester', false));

  module.test = new MaxosTest();

  module.tags = {
    get: getTagValue,
    set: setTagValue,
    wait: waitTagValue,
    time: getTagTime
  };

  module.message = setMessageTag;

  module.labels = {
    build: labels.build.bind(labels, getTagValue),
    print: labels.print.bind(labels, module.config.spoolExe, getTagValue)
  };

  messengerServer.handle('maxos.test.get', handleTestGet);

  messengerServer.handle('maxos.labels.print', handleLabelsPrint);

  app.broker.subscribe('app.started', initialize).setLimit(1);

  app.broker.subscribe('tagValueChanged.program.message', onMessageChange);

  app.broker.subscribe('tagValueChanged.program.order', onOrderChange);

  function handleTestGet(req, reply)
  {
    reply(null, module.test.toJSON());
  }

  function handleLabelsPrint(req, reply)
  {
    labels.bulkPrint(app, module, req, reply);
  }

  function getTagTime(tagName)
  {
    const tag = modbus.tags[tagName];

    return tag ? tag.lastChangeTime : 0;
  }

  function getTagValue(tagName, nullValue)
  {
    const value = modbus.values[tagName];

    return value === null
      ? (nullValue === undefined ? null : nullValue)
      : value;
  }

  function setTagValue(tag, value, done, retryCount)
  {
    if (!done)
    {
      done = () => {};
    }

    if (!retryCount)
    {
      retryCount = 0;
    }

    modbus.setTagValue(tag, value, function(err)
    {
      if (err)
      {
        if (retryCount < 3)
        {
          return setTimeout(setTagValue, (1000 * retryCount) + 1, tag, value, done, retryCount + 1);
        }

        return done(err);
      }

      if (deepEqual(getTagValue(tag), value))
      {
        return done();
      }

      setTimeout(waitTagValue, 25, Date.now(), 1000, tag, value, done);
    });
  }

  function waitTagValue(startTime, waitDuration, tag, requiredValue, done)
  {
    if (deepEqual(getTagValue(tag), requiredValue))
    {
      return done();
    }

    if (Date.now() - startTime > waitDuration)
    {
      return done(app.createError(
        `Waiting for [${tag}] to be [${JSON.stringify(requiredValue).substring(0, 30)}] timed out`
      ));
    }

    setTimeout(waitTagValue, 33, startTime, waitDuration, tag, requiredValue, done);
  }

  function setMessageTag(key, data, done)
  {
    if (typeof data === 'function')
    {
      done = data;
      data = {};
    }

    const message = Object.assign({key}, data);

    setTagValue('program.message', message, done);
  }

  function initialize()
  {
    step(
      function()
      {
        MaxosTest.find({status: 'running'}).exec(this.next());
      },
      function(err, interruptedTests)
      {
        if (err)
        {
          return module.error(`Failed to find interrupted tests: ${err.message}`);
        }

        if (interruptedTests.length)
        {
          module.info(`Finishing ${interruptedTests.length} interrupted tests...`);
        }

        interruptedTests.forEach(test => test.fail('INTERRUPTED', null).save(this.group()));
      },
      function(err)
      {
        if (err)
        {
          module.error(`Failed to finish interrupted tests: ${err.message}`);
        }

        app.broker.publish('maxos.test.updated', module.test.toJSON());
      },
      function()
      {
        setTagValue('program.state', 'idle', this.group());
        setTagValue('program.message', null, this.group());
        setTagValue('program.order', null, this.group());
        setTagValue('program.cables', 0, this.group());
        setTagValue('program.connectors', 0, this.group());
        setTagValue('program.cores', 0, this.group());
        setTagValue('program.cable', 1, this.group());
      },
      function()
      {
        this.nextStep = _.once(this.next());

        module.glp2.once('ready', this.nextStep);
        module.glp2.once('error', this.nextStep);
        module.glp2.once('close', this.nextStep);

        if (module.tags.get('safetyTest.blackbox'))
        {
          return setImmediate(this.nextStep);
        }

        module.glp2.start();
      },
      function()
      {
        module.glp2.removeListener('ready', this.nextStep);
        module.glp2.removeListener('error', this.nextStep);
        module.glp2.removeListener('close', this.nextStep);

        module.debug(`[glp2] ${module.glp2.isReady() ? 'Ready' : 'Not ready'}!`);

        app.broker.subscribe('tagValuesChanged', () => handleProgram());

        module.initialized = true;

        setImmediate(handleProgram);
      }
    );
  }

  function handleProgram()
  {
    if (handleProgramTimer.handle)
    {
      handleProgramTimer.clear(handleProgramTimer.handle);
      handleProgramTimer.handle = null;
    }

    if (handlingProgram)
    {
      handleProgramDelay = 0;

      return;
    }

    handleProgramDelay = HANDLE_PROGRAM_DELAY;
    handlingProgram = true;

    states[getTagValue('program.state')](app, module, () =>
    {
      const delay = handleProgramDelay;

      handleProgramDelay = HANDLE_PROGRAM_DELAY;
      handlingProgram = false;

      if (delay)
      {
        handleProgramTimer.clear = clearTimeout;
        handleProgramTimer.handle = setTimeout(handleProgram, delay);
      }
      else
      {
        handleProgramTimer.clear = clearImmediate;
        handleProgramTimer.handle = setImmediate(handleProgram);
      }
    });
  }

  function onMessageChange()
  {
    if (Array.isArray(module.test.messages))
    {
      module.test.messages.push(Object.assign(
        {date: new Date(getTagTime('program.message'))},
        getTagValue('program.message')
      ));
    }
  }

  function onOrderChange()
  {
    const order = getTagValue('program.order');

    if (!order)
    {
      setTagValue('program.lastSerialNumber', '');
      setTagValue('program.quantityDone', 0);

      return;
    }

    step(
      function()
      {
        MaxosTest.findLastSerialNumber(order._id, this.parallel());
        MaxosTest.findQuantityDone(order._id, this.parallel());
      },
      function(err, lastSerialNumber, quantityDone)
      {
        if (err)
        {
          module.error(`Failed to find order info: ${err.message}`);
        }

        if (lastSerialNumber)
        {
          setTagValue('program.lastSerialNumber', lastSerialNumber);
        }

        if (quantityDone)
        {
          setTagValue('program.quantityDone', quantityDone);
        }
      }
    );
  }
};
