// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const {exec, execFile} = require('child_process');
const _ = require('lodash');
const step = require('h5.step');

const KINDS = {
  INSIDE: 'inside',
  OUTSIDE: 'outside'
};

const TEMPLATES = {
  [KINDS.INSIDE]: fs.readFileSync(`${__dirname}/labels/inside.zpl`, 'utf8'),
  [KINDS.OUTSIDE]: fs.readFileSync(`${__dirname}/labels/outside.zpl`, 'utf8')
};

const LOGOS = {
  [KINDS.INSIDE]: require(`${__dirname}/labels/inside.logos.json`),
  [KINDS.OUTSIDE]: require(`${__dirname}/labels/outside.logos.json`)
};

const LOGO_COUNTS = {
  [KINDS.INSIDE]: 3,
  [KINDS.OUTSIDE]: 6
};

exports.KINDS = KINDS;

exports.build = (tag, kind, test) =>
{
  const template = TEMPLATES[kind];
  const logos = LOGOS[kind];
  const logoCount = LOGO_COUNTS[kind];
  const {order} = test;
  const serialNumber = test.serialNumber || '0000.000000000.0000';
  const pce = +serialNumber.split('.')[2];
  const offsetX = tag(`labels.${kind}.offsetX`);
  const offsetY = tag(`labels.${kind}.offsetY`);
  const nc12 = order.materialNumber || '000000000000';
  const eocCode = order.eocCode || '';
  const ean1 = order.ean1 || '';
  const specialDesignation = order.specialDesignation || '';
  let specialDesignation1 = specialDesignation;
  let specialDesignation2 = '';

  if (specialDesignation.length > 23)
  {
    specialDesignation1 = specialDesignation.substr(0, 22).trim() + '-';
    specialDesignation2 = '-' + specialDesignation.substr(22).trim();
  }

  let serialNumber1 = '';
  let serialNumber2 = '';

  if (kind === KINDS.INSIDE)
  {
    serialNumber1 = serialNumber;
  }
  else
  {
    const parts = serialNumber.split('.');

    serialNumber1 = `${parts[0]}.${parts[1]}.${(parseInt(parts[2], 10) - 1).toString().padStart(4, '0')}`;
    serialNumber2 = serialNumber;
  }

  let quantityInBox = order.quantityInBox || 0;

  if (quantityInBox && pce === order.quantityInOrder && (pce % quantityInBox) !== 0)
  {
    quantityInBox = pce % order.quantityInBox;
  }

  const templateData = {
    DLE: '\u0010',
    OFFSET_X: offsetX || 0,
    OFFSET_Y: offsetY || 0,
    ORDER_NUMBER: e(order._id),
    MATERIAL_NUMBER: e(nc12.substr(0, 4) + ' ' + nc12.substr(4, 3) + ' ' + nc12.substr(7)),
    SERIAL_NUMBER_1: serialNumber1,
    SERIAL_NUMBER_2: serialNumber2,
    PRODUCT_FAMILY: e(order.productFamily),
    PRODUCT_NAME: e(order.productName),
    SPECIAL_DESIGNATION: e(specialDesignation),
    SPECIAL_DESIGNATION_1: e(specialDesignation1),
    SPECIAL_DESIGNATION_2: e(specialDesignation2),
    COMMERCIAL_DESIGNATION: e(order.commercialDesignation),
    ADDITIONAL_INFORMATION: e(order.additionalInformation),
    VOLTAGE: e(order.voltage),
    IP_FACTOR_VALUE: e(order.ipFactorValue),
    DATE_CODE: e(order.dateCode),
    FACTORY_CODE: e(order.factoryCode),
    NON_PHILIPS_CODE: e(order.nonPhilipsCode),
    EOC_CODE: e(eocCode),
    EOC_CODE_PREFIX: e(eocCode.substr(0, eocCode.length - 2)).substr(0, 6),
    EOC_CODE_SUFFIX: eocCode.length > 2 ? e(eocCode.substr(-2)) : '',
    EAN1_12: e(ean1.substr(0, ean1.length - 1)),
    EAN1_13: e(ean1),
    EAN1_BOX: e(order.ean1Box),
    QUANTITY_IN_BOX: quantityInBox,
    QUANTITY_IN_ORDER: order.quantityInOrder || 0,
    DG: '',
    XG: '',
    ID: ''
  };

  order.logoCodes.slice(0, logoCount).forEach((logoCode, i) =>
  {
    const logo = logos[logoCode];

    if (!logo)
    {
      return;
    }

    const id = `LOGO_${i}`;

    templateData.DG += `~DG${id}.GRF,${logo.c}\r\n`;
    templateData.XG += `^FT${logo.x[i]},${logo.y[i]}^XG${id}.GRF,1,1^FS\r\n`;
    templateData.ID += `^XA^ID${id}.GRF^FS^XZ\r\n`;
  });

  let labelZpl = template;

  Object.keys(templateData).forEach(key =>
  {
    labelZpl = labelZpl.replace(new RegExp('\\$\\{' + key + '\\}', 'g'), templateData[key]);
  });

  return labelZpl;
};

exports.print = (spoolExe, tag, kind, zpl, done) =>
{
  const printer = tag(`labels.${kind}.printer`);

  if (typeof printer !== 'string' || printer.length === 0)
  {
    return done(new Error(`No printer defined for the ${kind} label!`));
  }

  const labelFilePath = path.join(os.tmpdir(), `MAXOS.${Date.now()}.${Math.random()}.zpl`);

  step(
    function()
    {
      fs.writeFile(labelFilePath, zpl, this.next());
    },
    function(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (process.platform === 'win32')
      {
        execFile(spoolExe, [labelFilePath, printer], this.next());
      }
      else
      {
        const parts = printer.split(':');
        const host = parts[0];
        const port = parts[1] || '9100';

        exec(`cat "${labelFilePath}" | netcat -w 1 ${host} ${port}`, this.next());
      }
    },
    function(err)
    {
      fs.unlink(labelFilePath, () => {});

      done(err);
    }
  );
};

exports.bulkPrint = function(app, module, req, done)
{
  let qtyDone = 0;

  step(
    function()
    {
      const MaxosTest = app[module.config.mongooseId].model('MaxosTest');
      const conditions = {
        'order._id': req.orderNo,
        status: 'success',
        itemNumber: {$in: _.uniq(req.items.inside.concat(req.items.outside))}
      };
      const fields = {
        order: 1,
        serialNumber: 1,
        itemNumber: 1
      };

      MaxosTest.find(conditions, fields).sort({itemNumber: -1}).lean().exec(this.next());
    },
    function(err, tests)
    {
      if (err)
      {
        return this.done(done, err);
      }

      if (!tests || !tests.length)
      {
        return this.done(done, app.createError('TESTS_NOT_FOUND'));
      }

      done();

      const itemToTest = {};

      tests.forEach(test => { itemToTest[test.itemNumber] = test; });

      const inside = req.items.inside.map(
        itemNo => exports.build(module.tags.get, 'inside', itemToTest[itemNo])
      );
      const outside = req.items.outside.map(
        itemNo => exports.build(module.tags.get, 'outside', itemToTest[itemNo])
      );

      printNextBatch(inside, outside);
    }
  );

  function printNextBatch(inside, outside)
  {
    if (inside.length === 0 && outside.length === 0)
    {
      return;
    }

    const todoInside = inside.splice(0, 5);
    const todoOutside = outside.splice(0, 5);

    step(
      function()
      {
        if (todoInside.length)
        {
          exports.print(module.config.spoolExe, module.tags.get, 'inside', todoInside.join(''), this.group());
        }

        if (todoOutside.length)
        {
          exports.print(module.config.spoolExe, module.tags.get, 'outside', todoOutside.join(''), this.group());
        }
      },
      function(err)
      {
        if (err)
        {
          module.error(`Failed to reprint: ${err.message}`);
        }

        const batchSize = todoInside.length + todoOutside.length;

        qtyDone += batchSize;

        app.broker.publish('maxos.labels.printed', {
          commId: req.commId,
          todo: req.labelCount,
          done: qtyDone
        });

        setTimeout(printNextBatch, 200 * batchSize, inside, outside);
      }
    );
  }
};

function e(v)
{
  return (v || '').replace('~', '\\7e');
}
