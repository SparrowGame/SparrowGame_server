'use strict';

const Room = require('./room.js').Room;
const actions = require('./actions.js').actions;
const createReceiver = require('./createReceiver.js').createReceiver;

const name = Room.prototype.name;
const prompt = '一夜狼人';

export {
  Room,
  actions,
  name,
  prompt,
  createReceiver,
}
