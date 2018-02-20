// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const glp2 = require('glp2');

module.exports = function(app, module, done)
{
  step(
    function()
    {
      const {reason, error} = module.tags.get('program.message');

      module.test.fail(reason, error, this.group());
    },
    function(err)
    {
      if (err)
      {
        module.error(`[failure] Failed to fail test: ${err.message || err}`);
      }

      const next = _.once(this.next());

      monitorContinue(next);

      this.interval = setInterval(() =>
      {
        if (module.tags.get('program.cancelled'))
        {
          next();
        }
      }, 50);

      this.timer = setTimeout(next, module.tags.get('failureTimeout', 1337));
    },
    function()
    {
      clearInterval(this.interval);
      clearTimeout(this.timer);

      module.test = new (module.test.constructor)();

      app.broker.publish('maxos.test.updated', module.test.toJSON());

      module.tags.set('program.state', 'idle', done);
    }
  );

  function monitorContinue(next)
  {
    if (module.tags.get('program.state') !== 'failure')
    {
      return;
    }

    module.glp2.getActualValues((err, res) => // eslint-disable-line handle-callback-err
    {
      if (res && res.faultStatus === glp2.FaultStatus.NO_TEST_STEP_DEFINED)
      {
        return next();
      }

      setTimeout(monitorContinue, 100, next);
    });
  }
};
