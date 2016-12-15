'use strict';
// 使用 Bluebird Promise 库
global.Promise = require('bluebird');
global.ROOT = __dirname;

const glob = require('glob');
const http = require('http');

const express = require('express');
const app = express();
const server = http.createServer(app);
const expressWs = require('express-ws')(app, server);

const env = process.env.NODE_ENV || 'development';
global.isProduction = (env === 'production');
const port = process.env.PORT || 3000;

app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = (env === 'development');

const user = require("./user.js")

app.ws('/user', user.WebSocketUser.onWSConnection);

app.use(express.static(`${ROOT}/public`));

// 开始监听
server.listen(port, () => {
  console.log(`监听端口 ${server.address().port}`);
});
