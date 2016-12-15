'use strict';

const User = require('./User.js').User;

class WebSocketUser extends User {
  static onWSConnection(ws, req) {
    let user = new WebSocketUser(ws);
    User.joinMain(user);
  }

  constructor(ws) {
    if (!super()){
      ws.close();
      return;
    }
    this.ws = ws;
    ws.on('message', this.process.bind(this));
    ws.on('close', () => super.close());
  }

  send_msg(msg) {
    this.ws.send(msg);
  }

  close(){
    super.close();
    this.ws.close();
  }
}

if (!isClient){
  const glob = require('glob');
  const http = require('http');

  const express = require('express');
  const app = express();
  const server = http.createServer(app);
  const expressWs = require('express-ws')(app, server);

  const env = process.env.NODE_ENV || 'development';
  const port = process.env.PORT || 3000;

  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = (env === 'development');

  app.ws('/user', WebSocketUser.onWSConnection);

  // 开始监听
  server.listen(port, () => {
    console.log(`监听端口 ${server.address().port}`);
  });
}
export {
  WebSocketUser,
}
