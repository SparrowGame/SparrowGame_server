'use strict';

const User = require('./User.js').User;
const VirtualUser = require('./VirtualUser.js').VirtualUser;
const TelegramUser = require('./TelegramUser.js').TelegramUser;

const users = {};
const packet = require('../packet.js');

const common = require('../game').common;
const createCommonReceiver = common.createReceiver;
const commonActions = common.actions;

let TelegramBot = null;

class TelegramVirtualUser extends VirtualUser {
  static onTelegramConnection(msg){
    if (msg.chat.type != 'private'){
      // TODO, group user
      return;
    }
    let user = users[msg.from.id];
    if (!user){
      user = new TelegramVirtualUser(msg.from.id, msg.from.username)
    }
    user.receive_msg(msg.text);
  }

  static listen(channel){
    TelegramBot = channel.bot;
    TelegramBot.on('text', TelegramVirtualUser.onTelegramConnection)
  }

  constructor(id, name) {
    if (!super(name)) return;
    this.telegram = {};
    this.telegram.uid = id;
    this.telegram.realUser = new TelegramUser(name, this);
    users[id] = this;

    this.actions = {
      showActions: {
        command: 'showActions',
        action: function(...rest){
          this.showActions.apply(this, rest);
        },
        comment: "查看命令",
      }
    }
    this.addActions(commonActions);
    let receiver = createCommonReceiver(this);
    receiver.object && this.on('message_obj', receiver.object);
    receiver.message && this.on('message', receiver.message);
  }

  receive_msg(msg){
    let argv = msg.split(' ');
    let cmd = argv.shift();
    let action = this.actions[cmd];
    if (!action) return;
    let act = action.action;
    let func = null;
    if (typeof act == 'function'){
      func = (...rest) => {
        return act.apply(this, rest);
      }
    }else if (act instanceof packet.Packet){
      func = (...rest) => {
        return act.end.apply(act, rest);
      }
    }
    if (func){
      this.send_msg(JSON.stringify(func(...argv)))
    }
  }

  send_msg(msg) {
    this.telegram.realUser.process(msg);
  }

  addActions(actions){
    actions.forEach((act) => {
      this.actions[act.command] = act;
    })
  }

  log(...rest) {
    TelegramBot.sendMessage(this.telegram.uid, rest.join(' '))
  }

  close(){
    this.telegram.realUser.close();
  }
}

export {
  TelegramVirtualUser,
}
