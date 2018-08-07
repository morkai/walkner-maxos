// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const {URL} = require('url');
const _ = require('lodash');
const step = require('h5.step');
const request = require('request');
const resolveProductName = require('../util/resolveProductName');

module.exports = function setUpMaxosRoutes(app, module)
{
  const controller = app[module.config.controllerId];
  const messengerClient = app[module.config.messengerClientId];
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const MaxosTest = mongoose.model('MaxosTest');

  express.get('/maxos/test', getCurrentTestRoute);

  express.get('/maxos/tests', express.crud.browseRoute.bind(null, app, MaxosTest));
  express.get('/maxos/tests/:id', express.crud.readRoute.bind(null, app, MaxosTest));

  express.get('/maxos/recentOrders', canChangeOrder, findRecentOrdersRoute);

  express.post('/maxos/printLabels', canPrintLabels, printLabelsRoute);

  express.get('/maxos/order/:id', canChangeOrder, findOrderRoute);

  function isEmbeddedUser(req)
  {
    return req.headers && req.headers['user-agent'] && req.headers['user-agent'].includes('X11; Linux');
  }

  function canChangeOrder(req, res, next)
  {
    if (isEmbeddedUser(req) || userModule.isAllowedTo(req.session.user, [['LOCAL'], ['MAXOS:MANAGE:CHANGE_ORDER']]))
    {
      return next();
    }

    res.sendStatus(403);
  }

  function canPrintLabels(req, res, next)
  {
    if (isEmbeddedUser(req) || userModule.isAllowedTo(req.session.user, [['LOCAL'], ['MAXOS:MANAGE:PRINT_LABELS']]))
    {
      return next();
    }

    res.sendStatus(403);
  }

  function getCurrentTestRoute(req, res)
  {
    res.json(module.test);
  }

  function printLabelsRoute(req, res, next)
  {
    let {orderNo, items, kinds} = req.body; // eslint-disable-line prefer-const

    kinds = !_.isArray(kinds) ? [] : kinds.filter(kind => kind === 'inside' || kind === 'outside');

    if (!kinds.length)
    {
      return next(app.createError('INPUT', 400));
    }

    step(
      function()
      {
        MaxosTest
          .findOne({'order._id': orderNo, status: 'success'}, {order: 1})
          .lean()
          .exec(this.parallel());

        MaxosTest.findLastSerialNumber(orderNo, this.parallel());
      },
      function(err, test, lastSerialNumber)
      {
        if (err)
        {
          return next(err);
        }

        const lastItemNo = +String(lastSerialNumber).split('.')[2];

        if (!test || lastItemNo === 0)
        {
          return next(app.createError('EMPTY_ORDER', 400));
        }

        const itemSet = new Set();

        String(items).split(/[, ]/).forEach(part =>
        {
          part = part.replace(/[^0-9\-]+/g, '');

          if (/^[0-9]{1,4}$/.test(part))
          {
            itemSet.add(+part);
          }
          else if (/^[0-9]{1,4}-[0-9]{1,4}$/.test(part))
          {
            const [from, to] = part.split('-').map(n => +n);

            if (from === to)
            {
              itemSet.add(+from);
            }
            else if (from < to)
            {
              for (let i = from; i <= to; ++i)
              {
                itemSet.add(i);
              }
            }
          }
        });

        const sortedItemList = Array.from(itemSet).sort((a, b) => a - b);

        if (sortedItemList.length > 0 && sortedItemList[0] === 0)
        {
          sortedItemList.shift();
        }

        if (!sortedItemList.length)
        {
          return next(app.createError('EMPTY_ITEMS', 400));
        }

        if (_.last(sortedItemList) > lastItemNo)
        {
          return next(Object.assign(app.createError('INVALID_MAX_ITEM', 400), {
            itemNo: _.last(sortedItemList),
            maxItemNo: lastItemNo
          }));
        }

        const itemsByKind = {
          inside: [],
          outside: []
        };
        const quantityInBox = test.order.quantityInBox || 2;
        let labelCount = 0;

        if (kinds.includes('inside'))
        {
          itemsByKind.inside = sortedItemList;
          labelCount += itemsByKind.inside.length;
        }

        if (kinds.includes('outside'))
        {
          const outside = new Set();

          sortedItemList.forEach(itemNo =>
          {
            const remainder = itemNo % quantityInBox;

            if (remainder === 0)
            {
              outside.add(itemNo);
            }
            else
            {
              outside.add(itemNo + (quantityInBox - (itemNo % quantityInBox)));
            }
          });

          itemsByKind.outside = Array.from(outside).sort((a, b) => a - b);
          labelCount += itemsByKind.outside.length;
        }

        const commId = `${Date.now()}.${Math.random()}`;

        messengerClient.request('maxos.labels.print', {commId, orderNo, items: itemsByKind, labelCount}, (err) =>
        {
          if (err)
          {
            return next(err);
          }

          app.broker.publish('maxos.labels.printing', {
            user: userModule.createUserInfo(req.session.user, req),
            severity: labelCount > 10 ? 'warning' : 'info',
            orderNo,
            items,
            kinds,
            labelCount
          });

          res.json({orderNo, labelCount, commId});
        });
      }
    );
  }

  function findRecentOrdersRoute(req, res, next)
  {
    const prodLines = String(controller.values.prodLines)
      .split(',')
      .map(v => encodeURIComponent(v.trim()))
      .filter(v => !!v);
    const remoteServerUrl = controller.values.remoteServerUrl || 'http://127.0.0.1/';
    const recentOrdersUrl = new URL(
      `/prodShiftOrders?select(orderId)&sort(-startedAt)&limit(50)&prodLine=in=(${prodLines})`,
      remoteServerUrl
    );
    const options = {
      proxy: controller.values.httpProxyUrl,
      json: true,
      timeout: 10000
    };

    request.get(recentOrdersUrl.toString(), options, (err, res_, body) =>
    {
      if (err)
      {
        return next(err);
      }

      if (!_.isPlainObject(body) || !_.isArray(body.collection))
      {
        return res.json([]);
      }

      return res.json(_.take(_.uniq(_.map(body.collection, 'orderId')), 6));
    });
  }

  function findOrderRoute(req, res, next)
  {
    if (req.params.id === '000000000')
    {
      return res.json({
        _id: '000000000',
        productName: 'Test product',
        productFamily: 'TEST FAMILY',
        materialNumber: '000000000000',
        specialDesignation: 'Lorem ipsum dolor sit amet, consectetur!',
        commercialDesignation: 'Test commercial designation 0x0x0',
        additionalInformation: 'Test additional information',
        factoryCode: '0000',
        nonPhilipsCode: '0 set',
        dateCode: '0A',
        eocCode: '12467400',
        voltage: '230/400V',
        ipFactorValue: 'IP65',
        quantityInBox: '2',
        quantityInOrder: '9999',
        ean1: '0123456789000',
        ean1Box: '123456789012',
        logoCodes: ['01', '02', '09', '27', '40', '57', '47'],
        cables: 0,
        connectors: 0,
        cores: 0
      });
    }

    step(
      function()
      {
        const remoteServerUrl = controller.values.remoteServerUrl || 'http://127.0.0.1/';
        const sapOrderUrl = new URL(`/orders/${req.params.id}?select(name,description,bom)`, remoteServerUrl);
        const zlfOrderUrl = new URL(`/orders/zlf1/${req.params.id}`, remoteServerUrl);
        const options = {
          proxy: controller.values.httpProxyUrl,
          json: true,
          timeout: 10000
        };
        const sapDone = this.parallel();
        const zlfDone = this.parallel();

        request.get(sapOrderUrl.toString(), options, (err, res, body) =>
        {
          if (err)
          {
            return sapDone(err);
          }

          if (_.isPlainObject(body) && body._id === req.params.id)
          {
            return sapDone(null, body);
          }

          sapDone(app.createError('SAP_ORDER_NOT_FOUND', 404));
        });

        request.get(zlfOrderUrl.toString(), options, (err, res, body) =>
        {
          if (err)
          {
            return zlfDone(err);
          }

          if (_.isPlainObject(body) && body._id === req.params.id)
          {
            return zlfDone(null, body);
          }

          zlfDone(app.createError('ZLF_ORDER_NOT_FOUND', 404));
        });
      },
      function(err, sapOrder, zlfOrder)
      {
        if (err)
        {
          return next(err);
        }

        const cables = _.filter(sapOrder.bom, c => /WIRE\s*C(OMP|PL)/i.test(c.name)).map(c =>
        {
          const cable = {
            connectors: 0,
            cores: 0
          };

          c.name.trim().split(/\s+/).forEach(part =>
          {
            const connectors = part.match(/^([0-9])(L|ST)$/i);

            if (connectors)
            {
              cable.connectors = +connectors[1];

              return;
            }

            const cores = part.match(/^(?:[0-9]x)?([0-9])x[0-9](?:[,.][0-9])?$/i);

            if (cores)
            {
              cable.cores = +cores[1];
            }
          });

          return cable;
        });

        const logoCodes = [];

        for (let i = 1; i <= 20; ++i)
        {
          const logoCode = zlfOrder[`logo_code_${i}`];

          if (logoCode)
          {
            logoCodes.push(logoCode);
          }
        }

        const productName = resolveProductName(sapOrder);
        const unwired = cables.length === 0
          && (/unwired/i.test(productName) || /unwired/i.test(zlfOrder.commercial_designation));

        res.json({
          _id: sapOrder._id,
          productName,
          productFamily: zlfOrder.product_family_name,
          materialNumber: zlfOrder.material_number.replace(/^0+/, ''),
          specialDesignation: zlfOrder.special_designation,
          commercialDesignation: zlfOrder.commercial_designation,
          additionalInformation: zlfOrder.additional_information,
          factoryCode: zlfOrder.factory_code,
          nonPhilipsCode: zlfOrder.non_philips_code,
          dateCode: zlfOrder.date_code,
          eocCode: zlfOrder.eoc_code,
          voltage: zlfOrder.voltage,
          ipFactorValue: zlfOrder.ip_factor_value,
          quantityInBox: zlfOrder.quantity_of_products_in_box,
          quantityInOrder: zlfOrder.production_order_quantity,
          ean1: zlfOrder.ean1_barcode,
          ean1Box: zlfOrder.ean1_barcode_box,
          logoCodes,
          cables: unwired ? -1 : cables.length,
          connectors: unwired ? -1 : (cables.length ? cables[0].connectors : 0),
          cores: unwired ? -1 : (cables.length ? cables[0].cores : 0)
        });
      }
    );
  }
};
