// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const path = require('path');

exports.DEFAULT_CONFIG = {
  path: './',
  delay: 2500,
  maxDelay: 10000
};

exports.start = function startDirectoryWatcherModule(app, module)
{
  const FILE_NAME_RE = /^(?:([0-9]{10,})@)?(.*?)$/;
  let timer = null;
  let timerStartedAt = -1;
  let readingDir = false;
  let readDirAgain = false;

  app.broker.subscribe('app.started', onAppStart).setLimit(1);

  function onAppStart()
  {
    watchDir();
    readDir();
  }

  function watchDir()
  {
    try
    {
      fs.watch(module.config.path, onChange);
    }
    catch (err)
    {
      module.error('Failed to watch dir: %s', err.message);
    }
  }

  function onChange(event, fileName)
  {
    if (fileName === null)
    {
      return;
    }

    if (readingDir)
    {
      readDirAgain = true;

      return;
    }

    if (timerStartedAt === -1)
    {
      timerStartedAt = Date.now();
    }

    clearTimeout(timer);

    if (Date.now() - timerStartedAt >= module.config.maxDelay)
    {
      return setImmediate(readDir);
    }

    timer = setTimeout(readDir, module.config.delay);
  }

  function readDir()
  {
    readDirAgain = false;
    readingDir = true;

    fs.readdir(module.config.path, function(err, fileNames)
    {
      timer = null;
      timerStartedAt = -1;
      readingDir = false;

      if (err)
      {
        module.error('Failed to read dir: %s', err.message);
      }
      else
      {
        fileNames
          .map(createFileInfo)
          .sort(function(a, b) { return a.timestamp - b.timestamp; })
          .forEach(function(fileInfo) { app.broker.publish('directoryWatcher.changed', fileInfo); });
      }

      if (readDirAgain)
      {
        setImmediate(readDir);
      }
    });
  }

  function createFileInfo(fileName)
  {
    const fileInfo = {
      moduleId: module.name,
      timestamp: -1,
      fileName: fileName,
      filePath: path.resolve(module.config.path, fileName)
    };

    const matches = fileName.match(FILE_NAME_RE);

    if (matches !== null)
    {
      fileInfo.timestamp = parseInt(matches[1], 10) * 1000;
      fileInfo.fileName = matches[2];
    }

    return fileInfo;
  }
};
