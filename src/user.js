'use strict';

const events = require("events");

const nameBucket = require("./nameBucket.js");
const room = require("./room.js");
const packet = require("./packet.js");
const code = require("./code.js");
const loginInfo = packet.need('type', 'status', 'name')
                        .solve(code.type.info, code.info.user_login);

class User extends events.EventEmitter {
  static onmessage(user, act){
    console.log(act);
  }

  static joinMain(user){
    if (!room.main.join(user)){
      return user.close();
    }
    user.send(loginInfo.end(user.name));
  }

  constructor() {
    super();

    this.name = nameBucket.getUnused();
    if (!this.name.length) return;
  }

  process(msg) {
    let event = 'message';
    let obj = msg;
    try{
      obj = JSON.parse(msg);
      event = 'message_obj';
    }catch (e){}
    try{
      this.emit(event, this, obj);
    }catch (e){
      console.log(`error when processing ${msg}`);
      if (!global.isProduction)
        throw e;
    }
  }

  send(obj) {
    if (typeof obj == 'string')
      return this.send_msg(obj);
    this.send_msg(JSON.stringify(obj));
  }

  send_msg(msg) {
    console.assert(false, "Not Implemented Function User.send_msg");
  }

  close() {
    this.emit("close", this);
  }
}

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

export {
  User,
  WebSocketUser
}
