'use strict';

const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const net = require('net');

module.exports = TcpSerialPort;

/**
 * @constructor
 * @param {string} hostAndPort
 */
function TcpSerialPort(hostAndPort)
{
  EventEmitter.call(this);

  const parts = hostAndPort.split(':');

  /**
   * @private
   * @param {string}
   */
  this.host = parts[0];

  /**
   * @private
   * @param {number}
   */
  this.port = parseInt(parts[1], 10) || 5331;

  /**
   * @private
   * @param {boolean}
   */
  this.connected = false;

  /**
   * @private
   * @type {Socket|null}
   */
  this.socket = null;
}

inherits(TcpSerialPort, EventEmitter);

/**
 * @returns {boolean}
 */
TcpSerialPort.prototype.isOpen = function()
{
  return this.connected;
};

TcpSerialPort.prototype.open = function()
{
  if (this.socket)
  {
    return;
  }

  this.socket = net.connect(this.port, this.host);

  this.socket.once('connect', this.onConnect.bind(this));
  this.socket.once('close', this.onClose.bind(this));
  this.socket.on('error', this.onError.bind(this));
  this.socket.on('data', this.onData.bind(this));
};

TcpSerialPort.prototype.close = function()
{
  if (this.socket)
  {
    this.socket.destroy();
  }
};

/**
 * @param {Buffer} data
 */
TcpSerialPort.prototype.write = function(data)
{
  if (this.socket)
  {
    this.socket.write(data);
  }
};

/**
 * @private
 */
TcpSerialPort.prototype.onConnect = function()
{
  this.connected = true;

  this.emit('open');
};

/**
 * @private
 */
TcpSerialPort.prototype.onClose = function()
{
  this.connected = false;

  this.socket.removeAllListeners();
  this.socket.on('error', function() {});
  this.socket = null;

  this.emit('close');
};

/**
 * @private
 * @param {Error} err
 */
TcpSerialPort.prototype.onError = function(err)
{
  this.emit('error', err);
};

/**
 * @private
 * @param {Buffer} data
 */
TcpSerialPort.prototype.onData = function(data)
{
  this.emit('data', data);
};
