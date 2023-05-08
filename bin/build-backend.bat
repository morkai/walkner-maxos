@echo off

set NODE_ENV=production

rm -rf backend-build
mkdir backend-build

c:\tools\node8 backend/main.js ../config/production/maxos-frontend.js --cache-require ./backend-build/maxos-frontend.json
c:\tools\node8 backend/main.js ../config/production/maxos-controller.js --cache-require ./backend-build/maxos-controller.json
c:\tools\node8 backend/main.js ../config/production/maxos-alarms.js --cache-require ./backend-build/maxos-alarms.json
c:\tools\node8 backend/main.js ../config/production/maxos-watchdog.js --cache-require ./backend-build/maxos-watchdog.json
c:\tools\node8 backend/main.js ../config/production/maxos-mailer.js --cache-require ./backend-build/maxos-mailer.json

set NODE_ENV=development
