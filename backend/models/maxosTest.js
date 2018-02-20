// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function setUpMaxosTestModel(app, mongoose)
{
  const maxosTestSchema = new mongoose.Schema({
    status: {
      type: String,
      enum: ['idle', 'running', 'failure', 'success'],
      default: 'idle'
    },
    reason: {
      type: String,
      default: ''
    },
    error: {
      type: String,
      default: ''
    },
    updatedAt: {
      type: Date,
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    finishedAt: {
      type: Date,
      default: null
    },
    messages: [{}],
    order: {},
    safetyTest: {},
    throughWireTest: {},
    serialNumber: String,
    itemNumber: Number
  }, {
    id: false,
    minimize: false,
    retainKeyOrder: true
  });

  maxosTestSchema.statics.TOPIC_PREFIX = 'maxos.tests';

  maxosTestSchema.index({status: 1, startedAt: -1});
  maxosTestSchema.index({reason: 1, startedAt: -1});
  maxosTestSchema.index({startedAt: -1});
  maxosTestSchema.index({serialNumber: 1, status: 1});
  maxosTestSchema.index({'order._id': 1, status: 1, itemNumber: -1});

  maxosTestSchema.pre('save', function(next)
  {
    next();
  });

  maxosTestSchema.statics.findLastSerialNumber = function(orderNo, done)
  {
    const conditions = {
      'order._id': orderNo,
      status: 'success'
    };
    const fields = {
      _id: 0,
      serialNumber: 1
    };
    const sort = {
      'order._id': 1,
      status: 1,
      itemNumber: -1
    };

    this.find(conditions, fields).sort(sort).limit(1).lean().exec((err, tests) =>
    {
      if (err)
      {
        return done(err);
      }

      const serialNumber = tests.length ? tests[0].serialNumber : null;

      done(null, serialNumber || '0000.000000000.0000');
    });
  };

  maxosTestSchema.statics.findQuantityDone = function(orderNo, done)
  {
    const pipeline = [
      {$match: {
        'order._id': orderNo,
        status: 'success'
      }},
      {$group: {
        _id: null,
        quantityDone: {$sum: 1}
      }}
    ];

    this.aggregate(pipeline, (err, results) =>
    {
      if (err)
      {
        return done(err, 0);
      }

      done(null, results.length ? results[0].quantityDone : 0);
    });
  };

  maxosTestSchema.methods.isRunning = function()
  {
    return this.status === 'running';
  };

  maxosTestSchema.methods.update = function(changes, done)
  {
    changes.updatedAt = new Date();

    this.set(changes);

    if (done)
    {
      this.save(function(err)
      {
        app.broker.publish('maxos.test.updated', changes);

        done(err, changes);
      });
    }
    else
    {
      app.broker.publish('maxos.test.updated', changes);
    }

    return this;
  };

  maxosTestSchema.methods.fail = function(reason, error, done)
  {
    return this.update({
      status: 'failure',
      reason: reason || '',
      error: error || '',
      finishedAt: new Date()
    }, done);
  };

  maxosTestSchema.methods.finish = function(done)
  {
    return this.update({
      status: 'success',
      finishedAt: new Date()
    }, done);
  };

  maxosTestSchema.methods.run = function(order, done)
  {
    return this.update({
      status: 'running',
      startedAt: new Date(),
      order
    }, done);
  };

  maxosTestSchema.methods.copySafetyTest = function(tag)
  {
    const safetyTest = {
      config: _.cloneDeep(tag('safetyTest.config')),
      pe2: tag('safetyTest.pe2'),
      results: [
        tag('program.safetyTest.1.pe1'),
        tag('program.safetyTest.1.iso'),
        tag('program.safetyTest.1.pe2'),
        tag('program.safetyTest.2.pe1'),
        tag('program.safetyTest.2.iso'),
        tag('program.safetyTest.2.pe2')
      ]
    };

    this.update({safetyTest});
  };

  maxosTestSchema.methods.copyThroughWireTest = function(tag)
  {
    const throughWireTest = {
      checkAllCores: tag('throughWireTest.checkAllCores'),
      checkDelay: tag('throughWireTest.checkDelay'),
      results: [null, [], []],
      aside: [null],
      status: [null]
    };

    for (let cable = 1; cable <= 2; ++cable)
    {
      for (let core = 1; core <= 7; ++core)
      {
        throughWireTest.results[cable].push(tag(`program.throughWireTest.${cable}.${core}`));
      }
    }

    const powerConnector1 = tag('powerConnector.1');
    const powerConnector2 = tag('powerConnector.2');

    for (let connector = 1; connector <= 10; ++connector)
    {
      throughWireTest.aside.push(tag(`L.${connector}.aside`));

      const tagSuffix = connector === powerConnector1 || connector === powerConnector2 ? 'control' : 'status';
      const statuses = [null];

      for (let core = 1; core <= 7; ++core)
      {
        statuses.push(tag(`L.${connector}.${core}.${tagSuffix}`));
      }

      throughWireTest.status.push(statuses);
    }

    this.update({throughWireTest});
  };

  maxosTestSchema.methods.generateSerialNumber = function(done)
  {
    const orderNo = this.order._id;

    this.constructor.findLastSerialNumber(orderNo, (err, oldSerialNumber) =>
    {
      if (err)
      {
        return done(err);
      }

      const lastPce = /\.[0-9]+\.[0-9]+$/.test(oldSerialNumber)
        ? +oldSerialNumber.split('.')[2].replace(/^0+/, '')
        : 0;
      const nextPce = (lastPce + 1).toString();
      const factoryCode = this.order.factoryCode || '????';
      const newSerialNumber = `${factoryCode}.${orderNo}.${nextPce.padStart(4, '0')}`;

      this.update({serialNumber: newSerialNumber, itemNumber: nextPce}, done);
    });
  };

  maxosTestSchema.methods.findQuantityDone = function(done)
  {
    if (!this.order)
    {
      return done(null, 0);
    }

    this.constructor.findQuantityDone(this.order._id, done);
  };

  mongoose.model('MaxosTest', maxosTestSchema);
};
