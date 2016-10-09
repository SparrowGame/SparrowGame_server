'use strict';

class Packet {
  constructor(dict={}, keys=[]) {
    this.keys = keys;
    this.dict = dict;
  }
  need(...rest) {
    return new Packet(this.dict, this.keys.concat(rest));
  }
  solve(...rest) {
    let res = {};
    let len = Math.min(rest.length, this.keys.length);
    for (let i = 0; i<len; i++){
      res[this.keys[i]] = rest[i];
    }
    return new Packet(Object.assign(res, this.dict), this.keys.slice(len));
  }
  end(...rest) {
    let res = {};
    let len = Math.min(rest.length, this.keys.length);
    for (let i = 0; i<len; i++){
      res[this.keys[i]] = rest[i];
    }
    return Object.assign(res, this.dict);
  }
  toString() {
    return this.keys.toString() + ' ' + JSON.stringify(this.dict);
  }
}

const empty = new Packet();
empty.Packet = Packet;
module.exports = empty;
