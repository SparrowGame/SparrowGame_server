'use strict';

const repl = require('repl');
const WebSocket = require('ws');

const game = require('./game');
const code = require('./code.js');
const user = require('./user.js');
const packet = require('./packet.js');

const controlBase = packet.need('type', 'status').solve(1);
const commonActions = {
  create_room: controlBase.solve(code.control.create_room).need('roomType'),
  enter_room: controlBase.solve(code.control.enter_room).need('roomId'),
  exit_room: controlBase.solve(code.control.exit_room),
  start_game: controlBase.solve(code.control.start_game),
}

for (let key in commonActions){
  console.log(commonActions[key].toString());
}

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
      for (let name in actions){
        cli.context[name] = (function(name){
          let act = actions[name];
          return (...rest) => {
            self.send(act.end.apply(act, rest));
          }
        })(name);
      }
    }
    cli.addActions(commonActions);
    cli.defineCommand("game", {
      help: 'load the actions of game',
      action: (name) => {
        let actions = {}
        if (game.module[name]) {
          actions = game.module[name].actions || {};
        }
        cli.addActions(actions);
        this.displayPrompt();
      }
    })
    cli.defineCommand("connect", {
      help: "connect to server",
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
