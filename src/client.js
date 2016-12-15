'use strict';

require('./init.js');

const user = require('./user');
const CommandLineUser = user.CommandLineUser;

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

const vu = new CommandLineUser();
