// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function(app, module, done)
{
  step(
    function()
    {
      module.message('PRINTING_LABEL', {severity: 'warning', kind: 'inside'}, this.group());

      const insideZpl = module.labels.build('inside', module.test);

      module.labels.print('inside', insideZpl, this.group());
    },
    function(err)
    {
      if (err)
      {
        module.message('PRINTING_LABEL_FAILURE', {
          severity: 'danger',
          error: err.message,
          kind: 'inside'
        });

        return setTimeout(this.next(), 3000);
      }
    },
    function()
    {
      const pce = +module.test.serialNumber.split('.')[2];
      const {quantityInBox} = module.tags.get('program.order');

      if (quantityInBox > 1 && (pce % quantityInBox) !== 0)
      {
        return this.skip();
      }

      module.message('PRINTING_LABEL', {severity: 'warning', kind: 'outside'}, this.group());

      const outsideZpl = module.labels.build('outside', module.test);

      module.labels.print('outside', outsideZpl, this.group());
    },
    function(err)
    {
      if (err)
      {
        module.message('PRINTING_LABEL_FAILURE', {
          severity: 'danger',
          error: err.message,
          kind: 'outside'
        });

        return setTimeout(this.next(), 3000);
      }
    },
    function()
    {
      module.tags.set('program.state', 'success', done);
    }
  );
};
