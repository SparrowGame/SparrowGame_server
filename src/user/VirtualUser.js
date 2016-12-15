'use strict';

const game = require('../game');
const user = require('./User.js');

class VirtualUser extends user.User {
  constructor(name) {
    if (!super(name)) return;
    this.info = {};
    this.receiver = {};
  }

  addReceiver(receiver){
    if (this.receiver){
      let old = this.receiver;
      old.object && this.removeListener('message_obj', old.object);
      old.message && this.removeListener('message', old.message);
    }
    this.receiver = receiver;
    receiver.object && this.on('message_obj', receiver.object);
    receiver.message && this.on('message', receiver.message);
  }

  send_msg(msg) {
    // 向服务端发送信息
    console.assert(false, "Not Implemented Function VirtualUser.send_msg");
  }

  addActions(actions){
    console.assert(false, "Not Implemented Function VirtualUser.addActions");
  }

  log(...rest) {
    // 展示消息
    console.assert(false, "Not Implemented Function VirtualUser.log");
  }

  showActions(name) {
    let actions = [];
    let gameModule = game.module[name];
    if (gameModule) {
      actions = gameModule.actions || [];
      if (gameModule.prompt){
        name += ' ' + gameModule.prompt
      }
    }else{
      actions = commonActions;
      name = '共有';
    }

    this.log(`${name} 指令`)
    actions.forEach((action) => {
      let args = action.args || [];
      let argNames = args.map((arg) => {
        return arg.name;
      })
      this.log(`${action.command}(${argNames.join()})\t${action.comment}`);
    })
  }

  loadGame(name) {
    let actions = [];
    let createReceiver = null;
    let gameModule = game.module[name];
    if (!name || !gameModule){
      return false;
    }
    actions = gameModule.actions || [];
    createReceiver = gameModule.createReceiver;

    this.addActions(actions);
    this.showActions(name);
    if (createReceiver){
      this.addReceiver(createReceiver(this));
    }
    return true;
  }
}

export {
  VirtualUser,
}
