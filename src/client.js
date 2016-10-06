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

class VirtualUser extends user.User {
  constructor() {
    if (!super()) return;

    let self = this;

    let cli = repl.start({
      prompt: '> ',
      ignoreUndefined: true,
    });
    let client = null;
    cli.addActions = (actions) => {
      actions.forEach((action) => {
        let act = action.action;
        cli.context[action.command] = (...rest) => {
          self.send(act.end.apply(act, rest));
        }
      })
    }
    cli.addActions(commonActions);
    cli.defineCommand("game", {
      help: '载入游戏的指令',
      action: (name) => {
        let actions = []
        if (game.module[name]) {
          actions = game.module[name].actions || [];
        }
        cli.addActions(actions);
        cli.displayPrompt();
      }
    })
    cli.defineCommand("connect", {
      help: "连接到目标服务器，未指定url则连接本地",
      action: (url) => {
        if (!url) url = 'localhost:3000/user';
        if (!url.startsWith('ws://')) url = 'ws://' + url;
        if (self.client) self.client.close();
        let ws = new WebSocket(url);
        ws.on('open', () => {
          console.log(`successully connect to ${url}`);
          client = ws;
          self.client = client;
        })
        ws.on('close', () => {
          super.close();
          self.client = null;
          client = null;
          console.log("Remove link closed");
        })
        ws.on('message', (msg) => {
          console.log("recv", msg);
          cli.displayPrompt();
        })
        ws.on('message', self.process.bind(this));
        ws.on('error', (e) => {
          console.log(e);
        })
      }
    })
    cli.defineCommand("disconnect", {
      help: "断开当前连接",
      action: () => {
        if (self.client) {
          self.client.close();
          client = null;
          self.client = null;
        }
      }
    })
    cli.defineCommand("show", {
      help: "查看游戏指令，未指定则显示共有指令",
      action: (name) => {
        let actions = [];
        if (game.module[name]) {
          actions = game.module[name].actions || [];
        }else{
          actions = commonActions;
          name = '共有';
        }

        console.log(`${name}指令`)
        actions.forEach((action) => {
          let args = action.args || [];
          let argNames = args.map((arg) => {
            return arg.name;
          })
          console.log(`${action.command}(${argNames.join()}) ${action.comment}`);
        })
        cli.displayPrompt();
      }
    })
    cli.on('exit', () => super.close());
    this.cli = cli;
    this.client = client;
  }

  send_msg(msg) {
    if (!this.client){
      console.log('Client is not connected to server');
      this.cli.displayPrompt();
      return;
    }
    console.log("send", msg);
    this.cli.displayPrompt();
    this.client.send(msg);
  }

  close(){
    super.close();
    process.exit();
  }
}

const vu = new VirtualUser();
