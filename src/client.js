'use strict';

const repl = require('repl');
const WebSocket = require('ws');

const game = require('./game');
const code = require('./code.js');
const user = require('./user.js');
const packet = require('./packet.js');

const controlBase = packet.need('type', 'status').solve(1);
const commonActions = [
  {
    command: "create_room",
    action: controlBase.solve(code.control.create_room).need('roomType'),
    comment: "创建一个房间",
    args: [
      {
        name: 'roomType',
        comment: '房间的类型，如果未指定，则由服务器自行决定',
      }
    ]
  },
  {
    command: "enter_room",
    action: controlBase.solve(code.control.enter_room).need('roomId'),
    comment: "进入一个房间",
    args: [
      {
        name: 'roomId',
        comment: '房间的id',
      }
    ]
  },
  {
    command: "exit_room",
    action: controlBase.solve(code.control.exit_room),
    comment: "退出当前房间",
  },
  {
    command: "start_game",
    action: controlBase.solve(code.control.start_game),
    comment: "开始游戏",
  },
]

function createCommonReceiver(vu){
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
    let index = vu.info.room.users.indexof(act.user);
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

function createCLI(vu){
  let cli = repl.start({
    prompt: '> ',
    ignoreUndefined: true,
    useColors: true,
  });
  cli.addActions = (actions) => {
    actions.forEach((action) => {
      let act = action.action;
      cli.context[action.command] = (...rest) => {
        vu.send(act.end.apply(act, rest));
      }
    })
  }
  cli.context.send = (msg) => {
    vu.send(msg);
  }
  cli.context.info = vu.info;
  cli.addActions(commonActions);
  vu.addReceiver('common', createCommonReceiver(vu));

  cli.defineCommand("showSend", {
    help: '显示发送的数据包',
    action: () => {
      vu.config.displaySend = true;
      cli.displayPrompt();
    }
  })
  cli.defineCommand("hideSend", {
    help: '不显示发送的数据包',
    action: () => {
      vu.config.displaySend = false;
      cli.displayPrompt();
    }
  })
  cli.defineCommand("showRecv", {
    help: '显示接收的数据包',
    action: () => {
      vu.config.displayRecv = true;
      cli.displayPrompt();
    }
  })
  cli.defineCommand("hideRecv", {
    help: '不显示接收的数据包',
    action: () => {
      vu.config.displayRecv = false;
      cli.displayPrompt();
    }
  })
  cli.defineCommand("game", {
    help: '载入游戏的指令',
    action: (name) => {
      vu.loadGame(name);
      cli.displayPrompt();
    }
  })
  cli.defineCommand("connect", {
    help: "连接到目标服务器，未指定url则连接本地",
    action: (url) => {
      if (!url) url = 'localhost:3000/user';
      if (!url.startsWith('ws://')) url = 'ws://' + url;
      if (vu.client) vu.client.close();
      let ws = new WebSocket(url);
      ws.on('open', () => {
        vu.log(`连接 ${url} 成功`);
        vu.client = ws;
      })
      ws.on('close', () => {
        vu.close();
        vu.client = null;
        vu.log("远程服务器断开了连接");
      })
      ws.on('message', vu.process.bind(vu));
      ws.on('message', (msg) => {
        if (vu.config.displayRecv){
          vu.log(`Recv: ${msg}`);
        }
      })
      ws.on('error', (e) => {
        vu.log(e);
      })
    }
  })
  cli.defineCommand("disconnect", {
    help: "断开当前连接",
    action: () => {
      if (vu.client) {
        vu.client.close();
        vu.client = null;
      }
    }
  })
  cli.defineCommand("show", {
    help: "查看游戏指令，未指定则显示共有指令",
    action: (name) => {
      vu.showActions(name);
      cli.displayPrompt();
    }
  })
  cli.on('exit', () => vu.close());
  cli.log = (...rest) => {
    console.log.apply(console, rest);
    cli.displayPrompt();
  }
  return cli;
}

class VirtualUser extends user.User {

  constructor() {
    if (!super()) return;
    this.info = {};
    this.config = {
      displaySend: false,
      displayRecv: false,
    };
    this.client = null;
    this.receiver = {};
    this.cli = createCLI(this);
  }

  send_msg(msg) {
    if (!this.client){
      this.log('当前客户端未连接到服务器');
      return;
    }
    if (this.config.displaySend){
      this.log(`Send: ${msg}`);
    }
    this.client.send(msg);
  }

  addReceiver(name, receiver){
    let origin = this.receiver[name];
    if (origin){
      this.removeListener('message_obj', origin.object);
      this.removeListener('message', origin.object);
    }
    this.receiver[name] = receiver;
    receiver.object && this.on('message_obj', receiver.object);
    receiver.message && this.on('message', receiver.message);
  }

  log(...rest) {
    this.cli.log.apply(this.cli, rest);
  }

  showActions(name) {
    let actions = [];
    let gameModule = game.module[name];
    if (gameModule) {
      actions = gameModule.actions || [];
      if (gameModule.prompt){
        name += ' ' + gameModule.prompt
      }
    }else{
      actions = commonActions;
      name = '共有';
    }

    console.log(`${name} 指令`)
    actions.forEach((action) => {
      let args = action.args || [];
      let argNames = args.map((arg) => {
        return arg.name;
      })
      console.log(`${action.command}(${argNames.join()})\t${action.comment}`);
    })
  }

  loadGame(name) {
    let actions = [];
    let createReceiver = null;
    let gameModule = game.module[name];
    if (!name || !gameModule){
      return false;
    }
    actions = gameModule.actions || [];
    createReceiver = gameModule.createReceiver;

    this.cli.addActions(actions);
    this.showActions(name);
    if (createReceiver){
      this.addReceiver(name, createReceiver(vu));
    }
    return true;
  }
}

console.log(
  "\n" +
  "该程序为命令行下的客户端\n" +
  "使用方式：\n" +
  "1. 可以使用 .help 命令查看相关控制命令\n" +
  "2. 开始使用前应使用 .connect [url] 命令连接服务器\n" +
  "3. 连接成功后使用 send() 函数发送消息给服务器\n" +
  "4. 可以使用 .game gameName 载入游戏已经定义好的操作取代手动发送消息\n" +
  "5. 使用 .disconnect 断开连接" +
  ""
)

const vu = new VirtualUser();
