'use strict';

require('./init.js');

const game = require("./game");
const room = game.common.room;
const user = require("./user");
user.User.linkToMainRoom(room.main);
