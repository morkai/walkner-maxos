// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

let nextPort = 60210;

module.exports = {

  frontend: {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },

  watchdog: {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },

  controller: {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },

  alarms: {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  }

};
