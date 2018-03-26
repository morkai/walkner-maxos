@echo off

set NODE_ENV=production

rm -rf backend-build
mkdir backend-build

node backend/main.js ../config/production/maxos-frontend.js --cache-require ./backend-build/maxos-frontend.json
node backend/main.js ../config/production/maxos-controller.js --cache-require ./backend-build/maxos-controller.json
node backend/main.js ../config/production/maxos-alarms.js --cache-require ./backend-build/maxos-alarms.json
node backend/main.js ../config/production/maxos-watchdog.js --cache-require ./backend-build/maxos-watchdog.json
node backend/main.js ../config/production/maxos-mailer.js --cache-require ./backend-build/maxos-mailer.json

set NODE_ENV=development
