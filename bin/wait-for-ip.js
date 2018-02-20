'use strict';

const {networkInterfaces} = require('os');
const {execSync} = require('child_process');

const requiredIface = process.argv[2];
const requiredAddress = process.argv[3];

check();

function check()
{
  const iface = networkInterfaces()[requiredIface];

  if (iface && iface.length && iface[0].address === requiredAddress)
  {
    return process.exit(0);
  }

  try
  {
    execSync(`ifdown ${requiredIface}`);
    execSync(`ifup ${requiredIface}`);
  }
  catch (err)
  {
    console.error(err.message);
  }

  setTimeout(check, 333);
}
