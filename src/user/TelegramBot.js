'use strict';

const events = require("events");

let bot = new events.EventEmitter();

if (!global.isClient){
  let TelegramBot = require('node-telegram-bot-api');
  let token = global.config.telegram.bot.token;
  bot = new TelegramBot(token, { polling: true });
}

export {
  bot,
}
