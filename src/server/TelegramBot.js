'use strict';

const events = require("events");

let bot = new events.EventEmitter();

if (!global.isClient){
  let TelegramBot = require('node-telegram-bot-api');
  let token = global.config.telegram.bot.token;
  bot = new TelegramBot(token, { polling: true });
  bot.getMe().then((msg) => {
    console.log('TelegramBot.js', `Bot id: ${msg.id}, Bot username: ${msg.username}`);
  }).catch((err) => {
    console.log('TelegramBot.js', err.message);
    bot.stopPolling();
  })
}

export {
  bot,
}
