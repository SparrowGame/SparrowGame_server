'use strict';

const room = require('../../room.js');
const packet = require('../../packet.js');

class Room extends room.Room {
  constructor(user, id){
    super(user, id);
  }
}
Room.prototype.name = 'one_night';

export {
  Room,
}
