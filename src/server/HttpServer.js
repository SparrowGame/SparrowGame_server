'use strict';

let server = null, app = null;

if (!isClient){
  const glob = require('glob');
  const http = require('http');

  const express = require('express');
  app = express();
  server = http.createServer(app);
  const expressWs = require('express-ws')(app, server);

  const env = process.env.NODE_ENV || 'development';
  const port = process.env.PORT || 3000;

  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = (env === 'development');

  // 开始监听
  server.listen(port, () => {
    console.log('HttpServer.js:', `监听端口 ${server.address().port}`);
  });
}

export {
  app,
  server,
}
