# 导入模块
import sys
import time

# 循环接收用户输入并进行对话，直到接收到指令退出
# 模拟的是一个模型的功能
time.sleep(5)
sys.stdout.buffer.write("你好".encode('utf-8'))
while True:
    # 接收用户输入, 这里是一个组合方法
    user_input = input() 

    # 如果用户输入指令 "exit"，则退出循环
    if user_input.strip() == "exit":
        print("Exiting conversation...")
        break

    # 模拟数据的发送
    time.sleep(5)

    # python的回答, 也就是我们所需要的诊断内容, 果然是把这一句直接ASCII化了
    sys.stdout.buffer.write("模型输出".encode('utf-8'))

# 需要处理的几个问题
# 首先是模型的退出该怎么写, 肯定和这个不一样
# 然后是页面调整
# 其他还有测试什么的