'use strict';

const packet = require('../../packet.js');
const code = require('./code.js');

const actionBase = packet.need('role', 'action');
const wolfBase = actionBase.solve(code.actionRole.wolf);
const seerBase = actionBase.solve(code.actionRole.seer);
const hunterBase = actionBase.solve(code.actionRole.hunter);
const cupidBase = actionBase.solve(code.actionRole.cupid);
const orcBase = actionBase.solve(code.actionRole.orc);
const commonBase = actionBase.solve(code.actionRole.common);

const actions = [
  {
    command: "wolf_watch",
    action: wolfBase.solve(code.action.wolf.watch).need('index'),
    comment: "查看一张未使用的身份牌",
    args: [
      {
        name: 'index',
        comment: '0->2 看三张牌中的任意一张牌',
      }
    ]
  },
  {
    command: "seer_check",
    action: seerBase.solve(code.action.seer.check).need('user'),
    comment: "查看一个人的身份牌",
    args: [
      {
        name: 'user',
        comment: '所看人的用户名',
      }
    ]
  },
  {
    command: "hunter_shoot",
    action: hunterBase.solve(code.action.hunter.shoot).need('user'),
    comment: "在自身死亡时杀死一个人",
    args: [
      {
        name: 'user',
        comment: '所杀人的用户名',
      }
    ]
  },
  {
    command: "cupid_swap",
    action: cupidBase.solve(code.action.cupid.swap).need('user'),
    comment: "交换两个除自己以外的人的身份牌",
    args: [
      {
        name: 'user',
        comment: 'string数组，要交换的两个人的名字，["name1", "name2"]',
      }
    ]
  },
  {
    command: "orc_change",
    action: orcBase.solve(code.action.orc.change).need('user'),
    comment: "将自己的身份牌和另一个人进行交换",
    args: [
      {
        name: 'user',
        comment: '所换身份人的用户名',
      }
    ]
  },
  {
    command: "common_vote",
    action: commonBase.solve(code.action.common.vote).need('user'),
    comment: "进行投票，票数高的会挂掉",
    args: [
      {
        name: 'user',
        comment: '所投票人的用户名',
      }
    ]
  },
]

export {
  actions
}
