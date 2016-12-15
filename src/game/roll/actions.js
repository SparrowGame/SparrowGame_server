'use strict';

const packet = require('../../packet.js');
const code = require('./code.js');

const actionBase = packet.need('role', 'action');
const commonBase = actionBase.solve(code.role.common);

const actions = [
  {
    command: "roll",
    action: commonBase.solve(code.action.common.roll),
    comment: "丢一个骰子",
  }
]

export {
  actions
}
