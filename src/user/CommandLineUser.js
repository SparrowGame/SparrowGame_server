'use strict';

const repl = require('repl');
const WebSocket = require('ws');

const game = require('../game');
const user = require('./User.js');

const common = game.common;
const createCommonReceiver = common.createReceiver;
const commonActions = common.actions;

const packet = require('../packet.js');

function createCLI(vu){
  let cli = repl.start({
    prompt: '> ',
    ignoreUndefined: true,
    useColors: true,
  });
  cli.addActions = (actions) => {
    actions.forEach((action) => {
      let act = action.action;
      let func = null;
      if (typeof act == 'function'){
        func = (...rest) => {
          vu.send(act.apply(vu, rest));
        }
      }else if (act instanceof packet.Packet){
        func = (...rest) => {
          vu.send(act.end.apply(act, rest));
        }
      }
      if (func){
        cli.context[action.command] = func;
      }
    })
  }
  cli.context.send = (msg) => {
    vu.send(msg);
  }
  cli.context.info = vu.info;
  cli.addActions(commonActions);
  let receiver = createCommonReceiver(vu);
  receiver.object && vu.on('message_obj', receiver.object);
  receiver.message && vu.on('message', receiver.message);

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

class CommandLineUser extends user.User {
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

  addReceiver(receiver){
    if (this.receiver){
      let old = this.receiver;
      old.object && this.removeListener('message_obj', old.object);
      old.message && this.removeListener('message', old.message);
    }
    this.receiver = receiver;
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
      this.addReceiver(createReceiver(this));
    }
    return true;
  }
}

export {
  CommandLineUser,
}
