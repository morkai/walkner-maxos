// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function(app, module, done)
{
  step(
    function()
    {
      module.test.generateSerialNumber(this.parallel());

      module.message('GENERATING_SERIAL_NUMBER', {severity: 'warning'}, this.parallel());
    },
    function(err, changes)
    {
      if (err)
      {
        module.message('FAILURE', {
          severity: 'danger',
          reason: 'GENERATING_SERIAL_NUMBER_FAILURE',
          error: err.message
        });

        module.tags.set('program.state', 'failure', done);
      }
      else
      {
        module.message('GENERATED_SERIAL_NUMBER', {
          severity: 'warning',
          serialNumber: changes.serialNumber
        });

        module.tags.set('program.state', 'labels', done);
      }
    }
  );
};
