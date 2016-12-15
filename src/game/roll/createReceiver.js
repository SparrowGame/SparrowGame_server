'use strict';

const code = require('./code.js');

function createReceiver(vu){
  let stepSolvers = {};
  stepSolvers[code.step.roll] = (user, act) => {
    vu.log(
      '\n' +
      '游戏开始，请使用 roll 投掷骰子\n'
    )
    vu.info.step = act.step;
  }
  stepSolvers[code.step.over] = (user, act) => {
    let winner = act.mostUser.join();
    let most = `丢出了 ${act.most}`;
    if (act.mostUser.length == 0){
      winner = '... 似乎没有人赢了...';
      most = '根本没有人出手'
    }
    vu.log(
      '\n' +
      `获胜者是 ${winner}, ${most}\n`
    )
  }

  let resultSolvers = {};

  let commonSolver = {};
  commonSolver[code.action.common.roll] = (user, act) => {
    if (act.code == -1){
      return vu.log('啊，骰子还没发给你呐');
    }
    if (act.code == -2){
      return vu.log('骰子被你丢飞了哦');
    }
    vu.log(`用户 ${act.user} 丢出了 ${act.rolled}`);
  }
  resultSolvers[code.role.common] = commonSolver;

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
