// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function(app, module, done)
{
  step(
    function()
    {
      module.test.messages = [];

      if (safetyTestDisabled())
      {
        module.message('STARTING_THROUGH_WIRE_TEST', {severity: 'warning'}, this.group());
      }
      else
      {
        module.message('RUNNING_SAFETY_TEST', {severity: 'warning', cable: 1}, this.group());

        module.tags.set('program.safetyTest.1.pe1', 'progress', this.group());
      }

      module.test.run(_.cloneDeep(module.tags.get('program.order')), this.group());
    },
    function(err)
    {
      if (err)
      {
        const reason = 'START_FAILURE';
        const error = err.message || err;

        module.error(`[start] Failed to start test: ${error}`);

        module.message('FAILURE', {severity: 'danger', reason, error}, this.group());

        module.tags.set('program.state', 'failure', this.group());
      }
      else if (safetyTestDisabled())
      {
        module.tags.set('program.state', 'throughWireTest', this.next());
      }
      else
      {
        module.tags.set('program.state', 'safetyTest', this.next());
      }
    },
    function(err)
    {
      if (err)
      {
        module.error(`[start] Failed to fail test: ${err.message || err}`);
      }

      done();
    }
  );

  function safetyTestDisabled()
  {
    return module.tags.get('safetyTest.disabled', false);
  }
};
