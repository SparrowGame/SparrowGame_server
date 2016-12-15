'use strict';

const User = require('./User.js').User;

class TelegramUser extends User {
  constructor(name, telegramVu){
    if (!super(name)) return;
    this.telegram = {}
    this.telegram.vu = telegramVu;
    User.joinMain(user)
  }

  send_msg(msg){
    this.telegram.vu.process(msg);
  }

  close(msg){
    super.close();
    this.telegram.vu.close();
  }
}

export {
  TelegramUser,
}
