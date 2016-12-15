'use strict';

const room = require('../common/room.js');
const packet = require('../../packet.js');
const code = require('./code.js');

const stepBase = packet.need('step');
const step = {
  begin: stepBase.solve(code.step.begin),
  night: stepBase.solve(code.step.night).need('role'),
  morning: stepBase.solve(code.step.morning),
  afterVote: stepBase.solve(code.step.afterVote).need('role', 'user'),
  over: stepBase.solve(code.step.over).need('success', 'origin', 'current', 'vote'),
}

const resultBase = packet.need('result', 'action', 'code');
const resultWolfBase = resultBase.solve(code.actionRole.wolf);
const resultSeerBase = resultBase.solve(code.actionRole.seer);
const resultHunterBase = resultBase.solve(code.actionRole.hunter);
const resultCupidBase = resultBase.solve(code.actionRole.cupid);
const resultOrcBase = resultBase.solve(code.actionRole.orc);
const resultCommonBase = resultBase.solve(code.actionRole.common);

const result = {
  wolf: {
    0: resultWolfBase.solve(code.action.wolf.watch).need('role'),
  },
  seer: {
    0: resultSeerBase.solve(code.action.seer.check).need('user', 'role'),
  },
  hunter: {
    0: resultHunterBase.solve(code.action.hunter.shoot),
  },
  cupid: {
    0: resultCupidBase.solve(code.action.cupid.swap),
  },
  orc: {
    0: resultOrcBase.solve(code.action.orc.change).need('role'),
  },
  common: {
    0: resultCommonBase.solve(code.action.common.vote),
  },
}

class Room extends room.Room {
  constructor(user, id){
    if (!super(user, id)){
      return;
    }

    this.intervalTime = 20000;
    this.roleMap = {};

    let wolfFunc = {};
    this.roleMap[code.actionRole.wolf] = wolfFunc;
    wolfFunc[code.action.wolf.watch] = this.wolf_watch.bind(this);

    let seerFunc = {};
    this.roleMap[code.actionRole.seer] = seerFunc;
    seerFunc[code.action.seer.check] = this.seer_check.bind(this);

    let hunterFunc = {};
    this.roleMap[code.actionRole.hunter] = hunterFunc;
    hunterFunc[code.action.hunter.shoot] = this.hunter_shoot.bind(this);

    let cupidFunc = {};
    this.roleMap[code.actionRole.cupid] = cupidFunc;
    cupidFunc[code.action.cupid.swap] = this.cupid_swap.bind(this);

    let orcFunc = {};
    this.roleMap[code.actionRole.orc] = orcFunc;
    orcFunc[code.action.orc.change] = this.orc_change.bind(this);

    let commonFunc = {};
    this.roleMap[code.actionRole.common] = commonFunc;
    commonFunc[code.action.common.vote] = this.common_vote.bind(this);
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

  hasUser(user) {
    return user && this.users[user];
  }

  wolf_watch(user, act){
    let sender = result.wolf[code.action.wolf.watch];
    if (this.step != code.step.night || this.role != code.role.wolf || this.role != this.origin[user.name]){
      return user.send(sender.end(-1));
    }
    if (this.wolf_watched){
      return user.send(sender.end(-2));
    }
    if (!act.hasOwnProperty('index') || typeof act.index != 'number' || act.index >= 3 || act.index < 0){
      return user.send(sender.end(-3));
    }
    this.wolf_watched = true;

    let index = act.index;
    user.send(sender.end(0, this.unused[index].role));
  }

  seer_check(user, act){
    let sender = result.seer[code.action.seer.check];
    if (this.step != code.step.night || this.role != code.role.seer || this.role != this.origin[user.name]){
      return user.send(sender.end(-1));
    }
    if (this.seer_checked){
      return user.send(sender.end(-2));
    }
    if (!this.hasUser(act.user)){
      return user.send(sender.end(-3));
    }
    if (act.user == user.name){
      return user.send(sender.end(-4));
    }
    this.seer_checked = true;
    user.send(sender.end(0, act.user, this.current[act.user]));
  }

  hunter_shoot(user, act){
    let sender = result.hunter[code.action.hunter.shoot];
    if (this.step != code.step.afterVote || this.role != code.role.hunter || this.role != this.origin[user.name]){
      return user.send(sender.end(-1));
    }
    if (this.hunter_shooted){
      return user.send(sender.end(-2));
    }
    if (!this.hasUser(act.user)){
      return user.send(sender.end(-3));
    }
    if (act.user == user.name){
      return user.send(sender.end(-4));
    }
    this.hunter_shooted = true;
    this.die[act.user] = true;
    user.send(sender.end(0));
  }

  cupid_swap(user, act){
    let sender = result.cupid[code.action.cupid.swap];
    let users = act.user || [];
    let user1 = users[0];
    let user2 = users[1];
    if (this.step != code.step.night || this.role != code.role.cupid || this.role != this.origin[user.name]){
      return user.send(sender.end(-1));
    }
    if (this.cupid_swaped){
      return user.send(sender.end(-2));
    }
    if (!this.hasUser(user1) || !this.hasUser(user2)){
      return user.send(sender.end(-3));
    }
    if (user1 == user.name || user2 == user.name){
      return user.send(sender.end(-4));
    }
    this.cupid_swaped = true;
    let role = this.current[user1];
    this.current[user1] = this.current[user2];
    this.current[user2] = role;
    user.send(sender.end(0));
  }

  orc_change(user, act){
    let sender = result.orc[code.action.orc.change];
    if (this.step != code.step.night || this.role != code.role.orc || this.role != this.origin[user.name]){
      return user.send(sender.end(-1));
    }
    if (this.orc_changed){
      return user.send(sender.end(-2));
    }
    if (!this.hasUser(act.user)){
      return user.send(sender.end(-3));
    }
    if (act.user == user.name){
      return user.send(sender.end(-4));
    }
    this.orc_changed = true;
    let role = this.current[act.user];
    this.current[act.user] = this.current[user.name];
    this.current[user.name] = role;
    user.send(sender.end(0, role));
  }

  common_vote(user, act){
    let sender = result.common[code.action.common.vote];
    if (this.step != code.step.morning){
      return user.send(sender.end(-1));
    }
    if (this.vote[user.name]){
      return user.send(sender.end(-2));
    }
    if (!this.hasUser(act.user)){
      return user.send(sender.end(-3));
    }
    this.vote[user.name] = act.user;
    user.send(sender.end(0));

    let count = 0;
    for (let name in this.vote){
      count++;
    }
    if (count == 5){
      setImmediate(() => {
        this.afterVote();
      })
    }
  }

  start_check(params) {
    let count = 0;
    for (let name in this.users){
      count++;
    }
    if (count != 5) return false;
    if (this.inGame) return false;
    return true;
  }

  start() {
    let origin = {};
    let originMap = {};
    let send = {};
    let roles = [];
    for (let role in code.role){
      roles.push({
        role: code.role[role],
        name: role,
      });
    }
    for (let name in this.users){
      let index = Math.floor(Math.random() * roles.length);
      let role = roles[index].role;
      origin[name] = role;
      originMap[role] = name;
      send[name] = {
        role: role,
        name: roles[index].name,
      };
      roles.splice(index, 1);
    }

    let unused = [];
    while (roles.length > 0){
      let index = Math.floor(Math.random() * roles.length);
      let role = roles[index];
      unused.push(role);
      roles.splice(index, 1);
    }

    this.broadcast(step.begin.end(), send);

    this.inGame = true;
    this.vote = {};
    this.die = {};
    this.unused = unused;
    this.origin = origin;
    this.originMap = originMap;
    this.current = Object.assign({}, origin);
    this.step = code.step.begin;
    this.nextTimeout = 0;

    this.nextTimeout = setTimeout(() => {
      this.night();
    }, this.intervalTime);
  }

  night() {
    this.step = code.step.night;
    this.night_wolf();
  }

  night_wolf() {
    this.role = code.role.wolf;
    this.broadcast(step.night.end(this.role));

    this.nextTimeout = setTimeout(() => {
      this.night_girl();
    }, this.intervalTime);
  }

  night_girl() {
    // 小女孩
    let send = {};
    this.role = code.role.girl;
    send = {};
    let wolfName = this.originMap[code.role.wolf] || null;
    let girlName = this.originMap[code.role.girl] || null;
    if (wolfName) {
      send[wolfName] = {
        girl: girlName,
      }
    }
    if (girlName) {
      send[girlName] = {
        wolf: wolfName,
      }
    }
    this.broadcast(step.night.end(this.role), send);

    this.nextTimeout = setTimeout(() => {
      this.night_seer();
    }, this.intervalTime);
  }

  night_seer() {
    // 预言家
    this.role = code.role.seer;
    this.broadcast(step.night.end(this.role));

    setTimeout(() => {
      this.night_orc();
    }, this.intervalTime);
  }

  night_orc() {
    // 兽人
    this.role = code.role.orc;
    this.broadcast(step.night.end(this.role));

    this.nextTimeout = setTimeout(() => {
      this.night_cupid();
    }, this.intervalTime);
  }

  night_cupid() {
    // 丘比特
    this.role = code.role.cupid;
    this.broadcast(step.night.end(this.role));

    this.nextTimeout = setTimeout(() => {
      this.night_witch();
    }, this.intervalTime);
  }

  night_witch() {
    // 女巫
    let send = {};
    this.role = code.role.witch;
    let witchName = this.originMap[code.role.witch];
    if (witchName){
      send[witchName] = {
        selfRole: this.current[witchName],
      }
    }
    this.broadcast(step.night.end(this.role), send);

    this.nextTimeout = setTimeout(() => {
      this.morning();
    }, this.intervalTime);
  }

  morning(){
    this.step = code.step.morning;
    this.broadcast(step.morning.end());
  }

  afterVote(){
    let voteCount = {};
    let most = 0;
    let mostUser = [];
    let hunterDie = false;
    let hunterName = null;
    let deadMan = null;

    for (let name in this.vote){
      let vote = this.vote[name];
      if (!voteCount[vote]){
        voteCount[vote] = 0;
      }
      voteCount[vote]++;
      if (voteCount[vote] > most){
        most = voteCount[vote];
        mostUser = [vote];
      }else if (voteCount[vote] == most){
        mostUser.push(vote);
      }
    }
    if (mostUser.length == 1){
      deadMan = mostUser[0];
      this.die[deadMan] = true;
      this.voted = deadMan;
      if (this.current[deadMan] == code.role.hunter){
        hunterDie = true;
        hunterName = deadMan;
      }
    }else{
      this.voted = null;
    }
    if (hunterDie){
      this.step = code.step.afterVote;
      this.role = code.role.hunter;
      this.broadcast(step.afterVote.end(code.role.hunter, hunterName));

      this.nextTimeout = setTimeout(() => {
        this.over();
      }, this.intervalTime);
    }else{
      setImmediate(() => {
        this.over();
      })
    }
  }

  over(){
    this.step = code.step.over;
    let success = [];
    let currentMap = {};
    for (let name in this.current){
      currentMap[this.current[name]] = name;
    }

    // 疯子挂了  那么疯子赢了
    if (this.die[currentMap[code.role.madman]]){
      success.push(currentMap[code.role.madman]);
    }else if (this.originMap[code.role.wolf]){
      // 如果有狼
      let wolfWin = !this.die[currentMap[code.role.wolf]];
      let isWolfCamp = (role) => {
        return role == code.role.wolf || role == code.role.girl;
      }

      for (let name in this.current){
        let role = this.current[name];
        let isWolf = isWolfCamp(role);
        if (isWolf && wolfWin || !isWolf && !wolfWin){
          success.push(name);
        }
      }
    }else{
      // 死的不是疯子，还没有狼，则所有人的胜利条件是没有死人
      if (!this.voted){
        for (let name in this.current){
          success.push(name);
        }
      }
    }

    let origin = [];
    for (let name in this.origin){
      origin.push({
        name: name,
        role: this.origin[name],
      })
    }

    let current = [];
    for (let name in this.current){
      current.push({
        name: name,
        role: this.current[name],
      })
    }

    let vote = [];
    for (let name in this.vote){
      vote.push({
        name: name,
        target: this.vote[name],
      })
    }

    this.broadcast(step.over.end(success, origin, current, vote));

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
Room.prototype.name = 'one_night';

export {
  Room,
}
