'use strict';
'use strict';

const room = require('../../room.js');
const packet = require('../../packet.js');
const code = require('./code.js');

const stepBase = packet.need('step');
const step = {
  roll: stepBase.solve(code.step.roll),
  over: stepBase.solve(code.step.over).need('most', 'mostUser'),
}

const resultBase = packet.need('result', 'action', 'code');
const resultCommonBase = resultBase.solve(code.role.common);

const result = {
  common: {
    1000: resultCommonBase.solve(code.action.common.roll).need('user', 'rolled'),
  },
}

class Room extends room.Room {
  constructor(user, id){
    if (!super(user, id)){
      return;
    }
    this.roleMap = {};

    let commonFunc = {};
    this.roleMap[code.role.common] = commonFunc;
    commonFunc[code.action.common.roll] = this.roll.bind(this);

    this.endTime = 10000;
  }

  onjoin(user, params) {
    if (this.inGame){
      return false;
    }
    return true;
  }

  onleave(user) {
    if (this.inGame){
      setImmediate(() => {
        clearTimeout(this.nextTimeout);
        this.over();
      })
    }
  }

  roll(user, act) {
    let sender = result.common[code.action.common.roll];
    if (this.step != code.step.roll){
      return user.send(sender.end(-1));
    }
    if (this.roll.hasOwnProperty(user.name)){
      return user.send(sender.end(-2));
    }
    let rolled = Math.floor(Math.random() * 100);
    this.roll[user.name] = rolled;
    this.broadcast(sender.end(0, user.name, rolled));
  }

  start_check(params) {
    if (this.inGame) return false;
    return true;
  }

  start() {
    this.broadcast(step.roll.end());

    this.inGame = true;
    this.roll = {};
    this.step = code.step.roll;
    this.nextTimeout = 0;

    this.nextTimeout = setTimeout(() => {
      this.over();
    }, this.endTime);
  }

  over(){
    this.step = code.step.over;
    let most = -1;
    let mostUser = [];

    for (let name in this.roll){
      let rolled = this.roll[name];
      if (rolled > most){
        most = rolled;
        mostUser = [name];
      }else if (rolled == most){
        mostUser.push(name);
      }
    }

    this.broadcast(step.over.end(most, mostUser));

    this.inGame = false;
  }

  gameMessage(user, act){
    if (this.inGame){
      let funcSet = this.roleMap[act.role] || {};
      let func = funcSet[act.action];
      if (func){
        func(user, act);
      }
    }
  }
}
Room.prototype.name = 'roll';

export {
  Room,
}
