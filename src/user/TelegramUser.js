'use strict';

const VirtualUser = require('./VirtualUser.js').VirtualUser;
const TelegramBot = require('./TelegramBot.js').bot;

const users = {};
const packet = require('../packet.js');

const common = require('../game').common;
const createCommonReceiver = common.createReceiver;
const commonActions = common.actions;

class TelegramUser extends VirtualUser {
  static onTelegramConnection(msg){
    if (msg.chat.type != 'private'){
      // TODO, group user
      return;
    }
    let user = users[msg.from.id];
    if (!user){
      user = new TelegramUser(msg.from.id, msg.from.username)
    }
    user.send_msg(msg.text);
  }

  constructor(id, name) {
    if (!super(name)) return;
    this.telegram = {};
    this.telegram.uid = id;
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
    users[id] = this;
  }

  send_msg(msg) {
    let argv = msg.split(' ');
    let cmd = argv.shift();
    let act = this.actions[cmd];
    let func = null;
    if (typeof act == 'function'){
      func = (...rest) => {
        return act.apply(vu, rest);
      }
    }else if (act instanceof packet.Packet){
      func = (...rest) => {
        return act.end.apply(act, rest);
      }
    }
    if (func){
      this.process(JSON.stringify(func(...argv)))
    }
  }

  addActions(actions){
    actions.each((act) => {
      this.actions[act.command] = act;
    })
  }

  log(...rest) {
    TelegramBot.sendMessage(this.telegram.uid, rest.join(' '))
  }
}

TelegramBot.on('text', TelegramUser.onTelegramConnection);

export {
  TelegramUser,
}
