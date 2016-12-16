'use strict';

const server = require('../server');

const User = require('./User.js').User;
const WebSocketUser = require('./WebSocketUser.js').WebSocketUser;
const CommandLineUser = require('./CommandLineUser').CommandLineUser;
const TelegramUser = require('./TelegramUser').TelegramUser;
const TelegramVirtualUser = require('./TelegramVirtualUser').TelegramVirtualUser;

WebSocketUser.listen(server.HttpServer);
TelegramVirtualUser.listen(server.TelegramBot);

export {
  User,
  WebSocketUser,
  CommandLineUser,
  TelegramUser,
  TelegramVirtualUser,
}
