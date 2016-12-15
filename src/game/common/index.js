'use strict';

const room = require('./room.js');
const actions = require('./actions.js').actions;
const createReceiver = require('./createReceiver.js').createReceiver;

const name = room.Room.prototype.name;
const prompt = '普通房间';

export {
  room,
  actions,
  name,
  prompt,
  createReceiver,
}
