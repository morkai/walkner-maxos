// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpMaxosCommands(app, module)
{
  const sio = app[module.config.sioId];

  sio.sockets.on('connection', socket =>
  {

  });
};
