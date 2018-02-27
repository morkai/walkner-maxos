'use strict';

const {inherits} = require('util');
const {EventEmitter} = require('events');
const step = require('h5.step');
const glp2 = require('glp2');

module.exports = Glp2Manager;

const SAMPLE_TIME = 250;
const REQUEST_DELAY = 200;

/**
 * @constructor
 * @extends {EventEmitter}
 * @param {Object} options
 * @param {string} options.comPort
 * @param {number} [options.comAddress]
 * @param {number} [options.cancelDelay]
 * @param {boolean} [options.readDeviceOptions]
 */
function Glp2Manager(options)
{
  EventEmitter.call(this);

  /**
   * @type {boolean}
   */
  this.fake = options.comPort === '0.0.0.0:0000';

  /**
   * @type {function}
   */
  this.log = options.log || function() {};

  /**
   * @private
   * @type {object}
   */
  this.options = options;

  /**
   * @private
   * @type {Master|null}
   */
  this.master = null;

  /**
   * @private
   * @type {Glp2Manager.ReadyState}
   */
  this.readyState = Glp2Manager.ReadyState.STOPPED;

  /**
   * @private
   * @type {object|null}
   */
  this.closeAfterErrorTimer = null;

  /**
   * @private
   * @type {object}
   */
  this.readyStateInterval = setInterval(this.checkReadyState.bind(this), 10000);

  /**
   * @private
   * @type {Array.<string>}
   */
  this.deviceOptions = [];

  /**
   * @private
   * @type {Number}
   */
  this.softwareVersion = NaN;

  this.monitorActualValues = this.monitorActualValues.bind(this);
  this.onReady = this.onReady.bind(this);
  this.onMasterOpen = this.onMasterOpen.bind(this);
  this.onMasterError = this.onMasterError.bind(this);
  this.onMasterClose = this.onMasterClose.bind(this);
  this.onMasterTx = this.onMasterTx.bind(this);
  this.onMasterRx = this.onMasterRx.bind(this);

  this.on('error', function() {});
}

inherits(Glp2Manager, EventEmitter);

/**
 * @enum {number}
 */
Glp2Manager.ReadyState = {
  STOPPED: 0,
  DISCONNECTED: 1,
  CONNECTING: 2,
  RESETTING: 3,
  READY: 4
};

/**
 * @returns {number}
 */
Glp2Manager.prototype.getSoftwareVersion = function()
{
  return this.softwareVersion;
};

/**
 * @returns {boolean}
 */
Glp2Manager.prototype.isReady = function()
{
  return this.readyState === Glp2Manager.ReadyState.READY;
};

Glp2Manager.prototype.start = function()
{
  if (this.readyState > Glp2Manager.ReadyState.DISCONNECTED)
  {
    return;
  }

  this.readyState = Glp2Manager.ReadyState.CONNECTING;

  const manager = this;

  if (manager.fake)
  {
    return setImmediate(manager.onMasterOpen);
  }

  step(
    function createMasterStep()
    {
      manager.master = new glp2.Master({
        comPort: manager.options.comPort,
        comAddress: manager.options.comAddress,
        requestDelay: REQUEST_DELAY,
        createSerialPort: function(comPort, options, autoOpen)
        {
          return comPort.indexOf(':') === -1
            ? new (require('serialport'))(comPort, options, autoOpen)
            : new (require('./TcpSerialPort'))(comPort);
        }
      });
    },
    function openSerialConnectionStep()
    {
      manager.master.on('open', manager.onMasterOpen);
      manager.master.on('error', manager.onMasterError);
      manager.master.on('close', manager.onMasterClose);
      manager.master.on('tx', manager.onMasterTx);
      manager.master.on('rx', manager.onMasterRx);
      manager.master.open();
    }
  );
};

Glp2Manager.prototype.destroy = function(done)
{
  clearInterval(this.readyStateInterval);

  this.stop(done);
};

/**
 * @param {function((Error|null)): void} done
 */
Glp2Manager.prototype.stop = function(done)
{
  const oldReadyState = this.readyState;

  this.readyState = Glp2Manager.ReadyState.STOPPED;

  if (oldReadyState === Glp2Manager.ReadyState.STOPPED
    || oldReadyState === Glp2Manager.ReadyState.DISCONNECTED)
  {
    done(null);

    return;
  }

  this.master.once('close', done);
  this.master.close();
};

/**
 * @param {number} [cancelDelay]
 * @param {function((Error|null)): void} done
 */
Glp2Manager.prototype.reset = function(cancelDelay, done)
{
  const manager = this;

  if (typeof cancelDelay === 'function')
  {
    done = /** @type {function} */cancelDelay;
    cancelDelay = manager.options.cancelDelay || 2000;
  }

  if (manager.readyState !== Glp2Manager.ReadyState.CONNECTING
    && manager.readyState !== Glp2Manager.ReadyState.READY)
  {
    setImmediate(done, null);

    return;
  }

  manager.readyState = Glp2Manager.ReadyState.RESETTING;

  if (manager.fake)
  {
    setImmediate(manager.onReady, null, done);

    return;
  }

  step(
    function cancelTestStep()
    {
      if (!manager.master)
      {
        return this.skip();
      }

      manager.master.cancelTest(this.next());
    },
    function delayNextStep(err)
    {
      if (err)
      {
        manager.log('[glp2] Failed to cancel test: %s', err.message);

        return this.skip(err);
      }

      if (!manager.master)
      {
        return this.skip();
      }

      setTimeout(this.next(), cancelDelay);
    },
    function removeTestResultsStep()
    {
      if (!manager.master)
      {
        return this.skip();
      }

      manager.master.removeTestResults(this.next());
    },
    function removeTestProgramsStep(err)
    {
      if (err)
      {
        manager.log('[glp2] Failed to remove test results: %s', err.message);

        return this.skip(err);
      }

      if (!manager.master)
      {
        return this.skip();
      }

      manager.master.removeTestPrograms(this.next());
    },
    function setParametersStep(err)
    {
      if (err)
      {
        manager.log('[glp2] Failed to remove test programs: %s', err.message);

        return this.skip(err);
      }

      if (!manager.master)
      {
        return this.skip();
      }

      const params = {
        transmittingMode: glp2.TransmittingMode.SINGLE_TESTS,
        remoteControl: glp2.RemoteControl.FULL,
        sampleTime: SAMPLE_TIME,
        actualValueData: glp2.ActualValueData.EXTRA_RESULTS
      };

      manager.master.setParameters(params, this.next());
    },
    function handleResponseStep(err)
    {
      if (err)
      {
        manager.log('[glp2] Failed to set parameters: %s', err.message);

        return this.skip(err);
      }
    },
    function emptyActualValuesStep(err)
    {
      if (err)
      {
        return setImmediate(manager.onReady, err, done);
      }

      let counter = 0;

      emptyActualValues();

      function emptyActualValues(err, res)
      {
        /* eslint no-shadow:0 */

        if (!manager.master)
        {
          return setImmediate(manager.onReady, null, done);
        }

        if (err)
        {
          return setImmediate(manager.onReady, err, done);
        }

        if (res === null)
        {
          return setImmediate(manager.onReady, null, done);
        }

        if (counter > 10 && res && res.faultStatus > 0)
        {
          return setImmediate(
            manager.onReady,
            new Error('Failed to empty actual values buffer, because of tester being faulty: ' + res.faultStatus),
            done
          );
        }

        ++counter;

        manager.master.getActualValues(emptyActualValues);
      }
    }
  );
};

/**
 * @returns {boolean}
 */
Glp2Manager.prototype.isInProgress = function()
{
  return false;
};

Glp2Manager.prototype.requestStart = function()
{
  if (this.readyState === Glp2Manager.ReadyState.READY && !this.isInProgress())
  {
    this.emit('startRequested');
  }
};

/**
 * @param {string} programName
 * @param {ProgramStep|Array.<ProgramStep>} programSteps
 * @param {function((Error|string|null), (Response|null)): void} done
 */
Glp2Manager.prototype.setTestProgram = function(programName, programSteps, done)
{
  if (this.readyState !== Glp2Manager.ReadyState.READY)
  {
    done('GLP2:TESTER_NOT_READY', null);

    return;
  }

  if (!Array.isArray(programSteps))
  {
    programSteps = [programSteps];
  }

  this.master.setTestProgram(programName, programSteps, done);
};

/**
 * @param {function((Error|string|null), (Response|null)): void} done
 */
Glp2Manager.prototype.startTest = function(done)
{
  if (this.readyState !== Glp2Manager.ReadyState.READY)
  {
    done('GLP2:TESTER_NOT_READY', null);

    return;
  }

  this.master.startTest(done);
};

/**
 * @param {function((Error|string|null), (Response|null)): void} done
 */
Glp2Manager.prototype.getActualValues = function(done)
{
  if (this.readyState !== Glp2Manager.ReadyState.READY)
  {
    done('GLP2:TESTER_NOT_READY', null);

    return;
  }

  if (this.fake)
  {
    setImmediate(done, null);

    return;
  }

  this.master.getActualValues(done);
};

/**
 * @param {boolean} evaluation
 * @param {function((Error|string|null), (Response|null)): void} done
 */
Glp2Manager.prototype.ackVisTest = function(evaluation, done)
{
  if (this.readyState !== Glp2Manager.ReadyState.READY)
  {
    done('GLP2:TESTER_NOT_READY', null);

    return;
  }

  this.master.ackVisTest(evaluation, done);
};

/**
 * @private
 */
Glp2Manager.prototype.getDeviceOptions = function()
{
  if (!this.master)
  {
    return;
  }

  const manager = this;

  this.master.getDeviceOptions(function(err, res)
  {
    if (err)
    {
      return manager.log('[glp2] Failed to get device options: %s', err.message);
    }

    manager.deviceOptions = res.deviceOptions;
    manager.softwareVersion = res.getSoftwareVersion();

    manager.log('[glp2] Device options:', manager.deviceOptions);
  });
};

/**
 * @private
 */
Glp2Manager.prototype.checkReadyState = function()
{
  if (this.readyState === Glp2Manager.ReadyState.DISCONNECTED)
  {
    this.start();
  }
};

/**
 * @private
 * @param {number} [timeouts]
 */
Glp2Manager.prototype.monitorActualValues = function(timeouts)
{
  const manager = this;

  if (manager.readyState !== Glp2Manager.ReadyState.READY || manager.isInProgress())
  {
    return;
  }

  if (!timeouts)
  {
    timeouts = 0;
  }

  this.master.getActualValues(function(err, res)
  {
    if (manager.readyState !== Glp2Manager.ReadyState.READY || manager.isInProgress())
    {
      return;
    }

    if (err)
    {
      if (err instanceof glp2.ResponseTimeoutError)
      {
        ++timeouts;
      }
      else
      {
        timeouts = 0;
      }

      if (timeouts < 5)
      {
        manager.log('[glp2] Failed to monitor actual values: %s', err.message);
      }

      return setTimeout(manager.monitorActualValues, 1337, timeouts);
    }

    if (res && res.faultStatus === glp2.FaultStatus.NO_TEST_STEP_DEFINED)
    {
      manager.requestStart();
    }

    setImmediate(manager.monitorActualValues, 0);
  });
};

/**
 * @private
 */
Glp2Manager.prototype.onMasterOpen = function()
{
  this.stopCloseAfterErrorTimer();

  this.emit('open');

  const manager = this;

  this.reset(function(err)
  {
    if (err)
    {
      manager.log('[glp2] Failed to reset the tester after connecting: %s', err.message);
    }
    else if (manager.options.readDeviceOptions)
    {
      manager.getDeviceOptions();
    }
  });
};

/**
 * @private
 */
Glp2Manager.prototype.startCloseAfterErrorTimer = function()
{
  if (this.closeAfterErrorTimer === null)
  {
    this.closeAfterErrorTimer = setTimeout(this.onMasterClose.bind(this), 1000);
  }
};

/**
 * @private
 */
Glp2Manager.prototype.stopCloseAfterErrorTimer = function()
{
  if (this.closeAfterErrorTimer !== null)
  {
    clearTimeout(this.closeAfterErrorTimer);
    this.closeAfterErrorTimer = null;
  }
};

/**
 * @private
 * @param {Error} err
 */
Glp2Manager.prototype.onMasterError = function(err)
{
  this.stopCloseAfterErrorTimer();
  this.startCloseAfterErrorTimer();

  this.emit('error', err);
};

/**
 * @private
 */
Glp2Manager.prototype.onMasterClose = function()
{
  this.stopCloseAfterErrorTimer();

  if (this.readyState !== Glp2Manager.ReadyState.STOPPED)
  {
    this.readyState = Glp2Manager.ReadyState.DISCONNECTED;
  }

  if (this.master)
  {
    this.master.removeListener('open', this.onMasterOpen);
    this.master.removeListener('error', this.onMasterError);
    this.master.removeListener('close', this.onMasterClose);
    this.master.removeListener('tx', this.onMasterTx);
    this.master.removeListener('rx', this.onMasterRx);
    this.master.on('error', function() {});
    this.master.close();
    this.master = null;
  }

  this.emit('close');
};

/**
 * @private
 * @param {Buffer} buffer
 */
Glp2Manager.prototype.onMasterTx = function(buffer)
{
  this.emit('tx', buffer);
};

/**
 * @private
 * @param {Buffer} buffer
 */
Glp2Manager.prototype.onMasterRx = function(buffer)
{
  this.emit('rx', buffer);
};

/**
 * @private
 * @param {(Error|null)} err
 * @param {function((Error|null)): void} done
 */
Glp2Manager.prototype.onReady = function(err, done)
{
  if (!this.fake && !this.master)
  {
    if (this.readyState === Glp2Manager.ReadyState.RESETTING)
    {
      this.readyState = Glp2Manager.ReadyState.DISCONNECTED;
    }

    done(new Error('No connection.'));

    return;
  }

  if (err)
  {
    done(err);

    this.master.close();

    return;
  }

  this.readyState = Glp2Manager.ReadyState.READY;

  setImmediate(done);

  this.monitorActualValues();

  this.emit('ready');
};
