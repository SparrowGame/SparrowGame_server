'use strict';

const code = require('./code.js');
const role = {}

const wolfWin = "狼人存活";
const godWin = "有狼杀狼，无狼保证全部存活";
const madmanWin = "自杀即可";
role[code.role.wolf] = {
  name: "狼人",
  skill: "在夜晚查看未分配的三个身份中的一个，可与小女孩互相确认",
  win: wolfWin,
}
role[code.role.girl] = {
  name: "小女孩",
  skill: "在小女孩阶段与狼人互相认识",
  win: wolfWin,
}
role[code.role.seer] = {
  name: "预言家",
  skill: "查看除自己外一个玩家的身份",
  win: godWin,
}
role[code.role.witch] = {
  name: "女巫",
  skill: "在夜晚的最后查看自己的身份",
  win: godWin,
}
role[code.role.hunter] = {
  name: "猎人",
  skill: "在死亡时指定杀死一个人",
  win: godWin,
}
role[code.role.madman] = {
  name: "疯子",
  skill: "…………",
  win: madmanWin,
}
role[code.role.cupid] = {
  name: "丘比特",
  skill: "在自己阶段交换除自己外两个人的身份",
  win: godWin,
}
role[code.role.orc] = {
  name: "兽人",
  skill: "在自己的阶段将自己的身份和其他人互换",
  win: godWin,
}


function createReceiver(vu){
  let stepSolvers = {};
  stepSolvers[code.step.begin] = (user, act) => {
    let self = role[act.role];
    vu.log(
      '\n' +
      `游戏开始，您的身份是 ${self.name}\n` +
      `特殊能力：\t${self.skill}\n` +
      `获胜条件：\t${self.win}`
    )
    vu.info.origin = act.role;
    vu.info.step = act.step;
  }
  stepSolvers[code.step.night] = (user, act) => {
    let actor = role[act.role];
    let message = [];
    if (vu.info.step == code.step.begin){
      message.push("天黑了～");
      vu.info.step = act.step;
    }
    message.push(`现在轮到 ${actor.name} 行动`);
    if (vu.info.origin == act.role) {
      switch (act.role){
        case code.role.wolf:
          message.push('您是狼人，请使用 wolf_watch 查看未使用的身份');
          break;
        case code.role.girl:
          if (!act.wolf) act.wolf = "没有人";
          message.push(`您是小女孩，${act.wolf}是狼人`);
          break;
        case code.role.seer:
          message.push('您是预言家，请使用 seer_check 查看玩家的身份');
          break;
        case code.role.orc:
          message.push('您是兽人，请使用 orc_change 与其他玩家互换身份');
          break;
        case code.role.cupid:
          message.push('您是丘比特，请使用 cupid_swap 与交换两个玩家身份');
          break;
        case code.role.witch:
          message.push(`您是女巫，您现在的身份是 ${role[act.selfRole].name}`);
          break;
      }
    }
    if (vu.info.origin == code.role.wolf && act.role == code.role.girl){
      if (!act.girl) act.girl = "没有人";
      message.push(`您是狼人，${act.girl}是小女孩`);
    }
    vu.log(message.join('\n'));
  }
  stepSolvers[code.step.morning] = (user, act) => {
    vu.log(
      '天亮了，请尽情讨论，为了胜利！\n' +
      '使用 common_vote 进行投票，当所有人都投票了之后，本轮结束'
    )
  }
  stepSolvers[code.step.afterVote] = (user, act) => {
    let message = `猎人死亡，等待猎人玩家 ${act.user} 进行行动\n`;
    if (vu.info.user.name == act.user) {
      message += "您是猎人，请使用 hunter_shoot 杀死一个玩家\n";
    }
    vu.log(message);
  }
  stepSolvers[code.step.over] = (user, act) => {
    function flate(each) {
      return `${each.name}\t: ${role[each.role].name}`;
    }
    let originRole = act.origin.map(flate);
    let currentRole = act.current.map(flate);
    let vote = act.vote.map((each) => `${each.name}\t: ${each.target}`);
    let winner = '无人胜利';
    if (act.success.length) winner = act.success.join();
    vu.log(
      `游戏结束，胜利者是 ${winner}\n` +
      `原身份：\n${originRole.join('\n')}\n` +
      `现身份：\n${currentRole.join('\n')}\n` +
      `投票：\n${vote.join('\n')}\n`
    )
  }

  let resultSolvers = {};
  let wolfSolver = {};
  wolfSolver[code.action.wolf.watch] = (user, act) => {
    if (act.code == -1){
      return vu.log('小心隐藏，别乱动');
    }
    if (act.code == -2){
      return vu.log('看过了就别再看啦');
    }
    if (act.code == -3){
      return vu.log('你想看啥');
    }
    vu.log(`你惊喜的发现了一张 ${role[act.role].name} 身份牌`);
  }
  resultSolvers[code.actionRole.wolf] = wolfSolver;

  let seerSolver = {}
  seerSolver[code.action.seer.check] = (user, act) => {
    if (act.code == -1){
      return vu.log('积蓄法术能量中');
    }
    if (act.code == -2){
      return vu.log('你的技能正在冷却中');
    }
    if (act.code == -3){
      return vu.log('预言家也看不到不存在的用户哦');
    }
    if (act.code == -4){
      return vu.log('啊，您是预言家啊');
    }
    vu.log(`在法术能量的帮助下，你偷偷的看到了一张 ${role[act.role].name} 身份牌`);
  }
  resultSolvers[code.actionRole.seer] = seerSolver;

  let hunterSolver = {};
  hunterSolver[code.action.hunter.shoot] = (user, act) => {
    if (act.code == -1){
      return vu.log('还没轮到你诶');
    }
    if (act.code == -2){
      return vu.log('你已经钦点过了');
    }
    if (act.code == -3){
      return vu.log('你钦点的人不存在呀');
    }
    if (act.code == -4){
      return vu.log('您已经死了呀');
    }
    vu.log('杀人成功');
  }
  resultSolvers[code.actionRole.hunter] = hunterSolver;

  let cupidSolver = {};
  cupidSolver[code.action.cupid.swap] = (user, act) => {
    if (act.code == -1){
      return vu.log('还没轮到你哦');
    }
    if (act.code == -2){
      return vu.log('你已经交换过了');
    }
    if (act.code == -3){
      return vu.log('不能交换不存在的东西啊');
    }
    if (act.code == -4){
      return vu.log('自己的身份换不了哦');
    }
    vu.log("交换成功");
  }
  resultSolvers[code.actionRole.cupid] = cupidSolver;

  let orcSolver = {};
  orcSolver[code.action.orc.change] = (user, act) => {
    if (act.code == -1){
      return vu.log('还没轮到你呐');
    }
    if (act.code == -2){
      return vu.log('你的身份已经改变');
    }
    if (act.code == -3){
      return vu.log('换不了找不到的用户哦');
    }
    if (act.code == -4){
      return vu.log('你为啥要跟自己换身份啊');
    }
    vu.log(`交换成功，当前身份为 ${role[act.role].name}`);
  }
  resultSolvers[code.actionRole.orc] = orcSolver;

  let commonSolver = {};
  commonSolver[code.action.common.vote] = (user, act) => {
    if (act.code == -1){
      return vu.log('现在不是白天呐，没办法投票');
    }
    if (act.code == -2){
      return vu.log('你投过票了哦');
    }
    if (act.code == -3){
      return vu.log('找不到你要票死的用户啊');
    }
    vu.log("投票成功");
  }
  resultSolvers[code.actionRole.common] = commonSolver;

  return {
    object: (user, act) => {
      let func = null;
      if (act.hasOwnProperty('step')){
        func = stepSolvers[act.step];
      }else if (act.hasOwnProperty('result')){
        let roleSolvers = resultSolvers[act.result];
        func = roleSolvers[act.action];
      }
      if (func){
        func(user, act);
      }
    },
  }
}

export {
  createReceiver,
}
