# 身份码

    狼人 1000

    小女孩 1001

    预言家 1002

    女巫 1003

    猎人 1004

    疯子 1005

    丘比特 1006

    兽人 1007

# step 0 游戏开始

    role 身份码 表示身份

    服务器计时10秒 到晚上

# step 1 天黑

    在所有阶段广播

    role 每个阶段的主导者

        1000 狼人

            girl 在小女孩阶段的时候能够知道小女孩的名字

        1001 小女孩

            wolf 在小女孩阶段的时候能够知道狼人的名字

        1003 女巫

            selfRole 开始的时候知道自己的身份

    每个阶段的主导者根据下方的role的操作进行动作

# step 2 天亮了

    撕逼，甩锅，投票

    所有人投票了之后表示该阶段结束

# step 3 游戏预结束

    role 身份码 表示身份

    user 身份码所对应用户

    暂时只有猎人在此阶段行动

# step 4 游戏结束，所有人明原身份以及现身份

    success string数组，表示获胜人的名字

    origin object数组，用户原身份

        每个obj：

        user 用户名

        role 用户身份

    current object数组，用户现身份

        obj格式参照origin

    vote object数组，用户的投票

        name 用户名

        target 所投用户

# role 每个身份的动作以及可能的共有动作

    1000 狼人

        action 0

            看一张牌

            index 所看的牌的索引

    1001 小女孩

    1002 预言家

        action 0

            看某个人的身份牌

            user 所看的用户名

    1003 女巫

    1004 猎人

        action 0 在死的时候干掉一个人

            user 干掉的用户名

    1005 疯子

    1006 丘比特

        action 0 互换两个人的身份

            user string数组，0和1两个位置分别表示互换人的身份

    1007 兽人

        action 0 到阶段的时候把一个人的身份和自己的互换

            user 互换的人的用户名

    2000 公共动作

        action 0 投票

            user 所投人的用户名


# result

    对应上面某个操作的结果

    1000 狼人

        action 0

            看牌的结果

            role 所看牌的role

    1002 预言家

        action 0

            user 用户名

            role 身份码

    1007 兽人

        action 0

            role 身份码
