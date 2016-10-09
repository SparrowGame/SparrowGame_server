# 整体框架

## 服务器

用户初登录进来之后，会自动分配一个名字。这个名字将作为该用户才此次登录过程中的唯一用户名。

对于服务器来说，有两种房间。

第一种房间是类似于游戏大厅的房间，用户登入之后默认进入该房间。

第二种房间是游戏的房间，用户创建了房间之后可以和其他人一起游玩。

## 游戏模块

### Room, name, prompt

而对于游戏而言，必须继承实现的只有 Room 这个类。

该类承载了主要的游戏逻辑，即从游戏开始到结束的所有逻辑均在该类中实现。

推荐继承 src/room.js/Room 这个类以便和服务器契合，并避免重复编写一些东西。

在继承该类时，推荐覆写以下几个方法以控制房间的行为：

- constructor 构造函数，进行一些变量的初始化

- onjoin 在用户加入的时候进行判断，返回false表示不允许加入

- onleave 用户离开之后触发，进行一些收尾工作，如结束正在进行中的游戏等

- start_check 开始游戏前的检查，返回false表示无法开始游戏

- start 开始游戏调用该函数，之后的游戏逻辑就全归 Room 自行调用

- gameMessage 接受到客户端的消息后，会调用该函数

- Room.prototype.name 游戏名

如果还想影响更多房间的行为，参照 src/room.js/MainRoom 的方法进行改写即可

### actions, createReceiver

这两个主要是为了给命令行下客户端所使用的。当然拿来当另类的文档也是不错的选择。

actions是一个action的数组，每个object如下

action字段可以为函数，返回值为所要发送的值

而如果其是 packet.js 中的 Packet类 的实例则直接通过end生成Object

``` js
{
  command: "命令名字",
  action: packet.need('something').solve('somevalue'),
  comment: "命令干啥的",
  args: [
    {
      name: '参数名',
      comment: '参数干啥的',
    }
  ]
}
```

createReceiver为一个接收vu并返回包解析函数的函数。

返回的Object格式为

``` js
{
  object: (user, act) => {}
  message: (user, act) => {}
}
```

每当vu收到消息时会根据收到消息的类型，调用不同函数。

如果是json调用receiver.object，如果是字符串调用receiver.message。

该Receiver的作用为解析收到的包，并进行一些处理，如解析了包内命令后输出包的含义，与用户进行交互等。
