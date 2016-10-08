'use strict';

const Room = require('./room.js').Room;
const actions = require('./actions.js').actions;

const name = Room.prototype.name;
const prompt = '一夜狼人';

export {
  Room,
  actions,
  name,
  prompt,
}
