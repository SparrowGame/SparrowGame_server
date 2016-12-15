'use strict';

const code = require('./code.js');

function createReceiver(vu){
  if (!vu.info.user)
    vu.info.user = {};
  if (!vu.info.room)
    vu.info.room = null;

  let solvers = {};
  let feedbackSolvers = {};
  feedbackSolvers[code.feedback.create_room] = (user, act) => {
    if (act.code == -1){
      return vu.log("无法创建房间");
    }
    vu.log(`创建房间成功，房间号为：${act.roomId}`);
  }
  feedbackSolvers[code.feedback.enter_room] = (user, act) => {
    if (act.code == -1){
      return vu.log("无法找到目标房间");
    }
    if (act.code == -2){
      return vu.log("无法加入目标房间");
    }
    vu.info.room = act.roomInfo;
    vu.log(
      "加入房间成功\n" +
      `房间号：\t${act.roomInfo.roomId}\n` +
      `房间类型：\t${act.roomInfo.roomType}\n` +
      `当前玩家：\t${act.roomInfo.users.join()}` +
      ""
    )
    let result = vu.loadGame(act.roomInfo.roomType);
    if (!result){
      vu.log(`无法载入游戏 ${act.roomInfo.roomType}，可能需要手动发送命令\n`);
    }else{
      vu.log(`自动载入游戏 ${act.roomInfo.roomType} 相关命令`);
    }
  }
  feedbackSolvers[code.feedback.exit_room] = (user, act) => {
    if (act.code == -2){
      return vu.log("退出房间失败，无法退出大厅");
    }
    vu.log("退出房间成功");
    vu.info.room = null;
  }
  feedbackSolvers[code.feedback.start_game] = (user, act) => {
    if (act.code == -1){
      return vu.log("条件不满足，无法开始游戏");
    }
    if (act.code == -2){
      return vu.log("无法在大厅开始游戏");
    }
  }
  solvers[code.type.feedback] = feedbackSolvers;

  let infoSolvers = {};
  infoSolvers[code.info.enter_room] = (user, act) => {
    vu.log(`玩家${act.user}加入游戏`);
    vu.info.room.users.push(act.user);
  }
  infoSolvers[code.info.exit_room] = (user, act) => {
    vu.log(`玩家${act.user}离开游戏`);
    let index = vu.info.room.users.indexOf(act.user);
    if (index != -1) vu.info.room.users.splice(index, 1);
  }
  infoSolvers[code.info.user_login] = (user, act) => {
    vu.log(`登入游戏成功，当前游戏名为${act.name}`);
    vu.info.user.name = act.name;
  }
  solvers[code.type.info] = infoSolvers;

  return {
    object: (user, act) => {
      let solverSet = solvers[act.type] || {};
      let solver = solverSet[act.status];
      if (solver){
        solver(user, act);
      }
    },
    message: (user, msg) => {},
  }
}

export {
  createReceiver,
}
