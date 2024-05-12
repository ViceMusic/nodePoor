
const { spawn } = require('child_process');

// 启动 Python 脚本
const pythonProcess = spawn('python', ['./foot.py'], {
  stdio: ['pipe', 'pipe', 'pipe'] // 使用管道与子进程进行标准输入输出交互
});

// 向 Python 脚本发送数据
const sendDataToPython = (data) => {
    pythonProcess.stdin.write(data + '\n'); // 在每条消息末尾加上换行符
};

sendDataToPython('输入点东西1');
sendDataToPython('输入点东西2');
sendDataToPython('exit');

// 监听 Python 脚本的输出
pythonProcess.stdout.on('data', (data) => {
  console.log(`${data}`);
});

// 监听子进程退出事件
pythonProcess.on('exit', (code, signal) => {
  console.log(`Python process exited with code ${code}\n`);
});
