// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpRoutes = require('./routes');
const setUpCommands = require('./commands');
const setUpSafeGuards = require('./safeGuards');
const setUpProgram = require('./program');
const setUpClient = require('./client');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  sioId: 'sio',
  userId: 'user',
  modbusId: 'modbus',
  controllerId: 'controller',
  messengerClientId: 'messenger/client',
  messengerServerId: 'messenger/server',
  testerAddress: '127.0.0.1:4001',
  spoolExe: 'spool.exe'
};

exports.start = function startMaxosModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.controllerId,
      module.config.messengerClientId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.userId,
      module.config.sioId,
      module.config.messengerClientId
    ],
    setUpCommands.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.modbusId
    ],
    setUpSafeGuards.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.modbusId,
      module.config.messengerServerId
    ],
    setUpProgram.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.messengerClientId
    ],
    setUpClient.bind(null, app, module)
  );
};
