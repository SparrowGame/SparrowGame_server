'use strict';

const room = require('../../room.js');

for (let key in room){
  console.log(key);
}

class Room extends room.Room {
  constructor(user, id){
    super(user, id);
  }
}

export {
  Room,
}
