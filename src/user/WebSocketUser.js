'use strict';

const User = require('./User.js').User;

class WebSocketUser extends User {
  static onWSConnection(ws, req) {
    let user = new WebSocketUser(ws);
    User.joinMain(user);
  }

  static listen(channel){
    channel.app.ws('/user', WebSocketUser.onWSConnection);
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

export {
  WebSocketUser,
}
