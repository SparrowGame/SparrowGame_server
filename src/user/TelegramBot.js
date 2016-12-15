'use strict';

const events = require("events");

let bot = new events.EventEmitter();

if (!global.isClient){
  let TelegramBot = require('node-telegram-bot-api');
  let token = '305849587:AAExzGIZ9Nj1W4xhQKoIcDCqBg8NDaTIgWI';
  bot = new TelegramBot(token, { polling: true });
}

export {
  bot,
}
