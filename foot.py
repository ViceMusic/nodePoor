# 导入模块
import sys

# 循环接收用户输入并进行对话，直到接收到指令退出
# 模拟的是一个模型的功能
while True:
    # 接收用户输入, 这里是一个组合方法
    user_input = input() 

    # 如果用户输入指令 "exit"，则退出循环
    if user_input.strip() == "exit":
        print("Exiting conversation...")
        break

    # 否则将数据获取, 并交给提问
    # user_input发送给模型

    # python的回答, 也就是我们所需要的诊断内容, 果然是把这一句直接ASCII化了
    print('1 I get you message \n')

