# Sparrow Game

Sparrow Game正如其名，麻雀虽小五脏俱全。

# 运行方法

## 服务端

1. npm -i 安装依赖
2. npm start 启动

启动后默认在3000端口。WebSocket连接地址为 http://host/user

## 客户端

1. npm -i 安装依赖
2. npm run client 启动

### 使用说明

1. 命令行下可使用 .help 命令查看相关控制命令

    常用控制命令有

    - .game 载入游戏的指令以及接收器

    - .show 显示某游戏的指令

    - .connect 连接服务器

    - .disconnect 断开链接

    - .showSend 显示发送的数据包

    - .showRecv 显示接受的数据包

2. 使用.connect连接服务器，使用.show命令查看基础指令

3. 有一些开放给REPL环境的变量或函数

    - info 当前状态的信息

    - send() 发送消息给服务器

4. 可以使用 .game gameName 载入游戏已经定义好的操作取代手动发送消息

5. 使用 .disconnect 断开连接
