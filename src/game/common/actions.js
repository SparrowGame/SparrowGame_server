'use strict';

const packet = require('../../packet.js');
const code = require('./code.js');

const controlBase = packet.need('type', 'status').solve(1);

const actions = [
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
  {
    command: 'send_info',
    action: function() {
      return {info: this.info}
    },
    comment: "将本地的vu.info发送给服务器，只是为了示范function类型的action",
  }
]

export {
  actions
}
