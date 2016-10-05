'use strict';

const crypto = require('crypto');

const packet = require('./packet.js');
const code = require('./code.js');

const serverBase = packet.need('type', 'status');
const feedbackBase = serverBase.solve(code.type.feedback).need('code');
const infoBase = serverBase.solve(code.type.info);
const feedback = {
  create_room: feedbackBase.solve(code.feedback.create_room).need('roomId'),
  enter_room: feedbackBase.solve(code.feedback.enter_room).need('roomInfo'),
  exit_room: feedbackBase.solve(code.feedback.exit_room),
  start_game: feedbackBase.solve(code.feedback.start_game),
}
const info = {
  enter_room: infoBase.solve(code.info.enter_room).need('user'),
  exit_room: infoBase.solve(code.info.exit_room).need('user'),
  start_game: infoBase.solve(code.info.start_game).need('gameInfo'),
}

let roomSet = {};

class Room {
  constructor(user, id) {
    if (!!roomSet[id]) return;

    this.id = id;
    roomSet[id] = this;
    this.users = {};
    this.bindedFunc = null;
    this.funcMap = {};

    let controlFunc = {};
    controlFunc[code.control.exit_room] = this.control_exit_room.bind(this);

    this.funcMap[code.type.control] = controlFunc;

    this.admin = user;


    if (user) this.join(user);
  }

  broadcast(obj, exclude={}, addition={}) {
    if (exclude instanceof Array){
      let res = {}
      exclude.forEach((ex) => res[ex] = true);
      exclude = res;
    }
    for (let name in this.users){
      if (!!exclude[name]) continue;
      let res = obj;
      let add = addition[name];
      if (add) {
        res = Object.assign(res, add);
      }
      this.users[name].send(res);
    }
  }

  // return false to reject
  join(user, params) {
    if (!!this.users[user.name]){
      return false;
    }
    if (!this.bindedFunc){
      let bind = {};
      bind.onmessage = this.onmessage.bind(this);
      bind.leave = this.leave.bind(this);
      this.bindedFunc = bind;
    }
    this.users[user.name] = user;
    user.on('message_obj', this.bindedFunc.onmessage);
    user.on('close', this.bindedFunc.leave);
    return true;
  }

  leave(user) {
    user.removeListener('close', this.leave);
    user.removeListener('message_obj', this.onmessage);
    delete this.users[user.name];
  }

  exchange(target, user, params) {
    console.log("exchange");
    if (target.join(user)){
      this.leave(user)
      return true;
    }
    return false;
  }

  onmessage(user, act){
    console.log('onmessage');
    let funcSet = this.funcMap[act.type] || {};
    let func = funcSet[act.status];
    if (func){
      console.log("find");
      func(user, act);
    }
  }

  control_exit_room(user, act) {
    this.exchange(main, user);
    user.send(feedback.exit_room.end(0));
    this.broadcast(info.exit_room.end(user.name));
  }
}

const MainRoomId = 'MainRoom';

class MainRoom extends Room{
  static getNewRoomId(){
    let md5 = crypto.createHash('md5');
    md5.update(String(+new Date()));
    md5.update(String(Math.random()));
    let roomId = md5.digest('hex');
    return roomId;
  }

  constructor(){
    if (roomSet[MainRoomId]) return roomSet[MainRoomId];
    super(null, MainRoomId);
    let controlFunc = this.funcMap[code.type.control];
    controlFunc[code.control.enter_room] = this.control_enter_room.bind(this);
    controlFunc[code.control.create_room] = this.control_create_room.bind(this);
    controlFunc[code.control.exit_room] = this.control_exit_room.bind(this);
  }

  control_enter_room(user, act){
    let roomId = act.roomId || -1;
    let room = roomSet[roomId];
    if (!room){
      user.send(feedback.enter_room.end(-1));
    }
    let result = this.exchange(room, user, act.params);
    if (!result){
      user.send(feedback.enter_room.end(-2));
    }
    let users = [];
    for (let name in room.users) users.push(name);
    user.send(feedback.enter_room.end(0, {
      roomId: roomId,
      users: users,
    }));
    room.broadcast(info.enter_room.end(user.name), [user.name]);
  }

  control_create_room(user, act){
    const game = require("./game");
    let roomId = MainRoom.getNewRoomId();
    let gameModule = game.module[act.name] || game.first;
    let room = new gameModule.Room(user, roomId);
    if (!room){
      user.send(feedback.create_room.end(-1))
    }
    this.control_enter_room(user, {
      roomId: roomId
    });
  }

  control_exit_room(user, act){
    user.send(feedback.exit_room.end(-1));
  }
}

const main = new MainRoom();

export {
  Room,
  main
}