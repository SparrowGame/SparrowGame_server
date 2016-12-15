'use strict';

let TelegramBot = require('node-telegram-bot-api');

let token = '305849587:AAExzGIZ9Nj1W4xhQKoIcDCqBg8NDaTIgWI';

let bot = new TelegramBot(token, { polling: true });

export {
  bot,
}
