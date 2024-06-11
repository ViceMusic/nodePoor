// worker.js
const { parentPort } = require('worker_threads');
const {jsonToObject,objectToJson}=require('./tool');
const { spawn } = require('child_process');

/*
主线程会根据worker.js中的代码创建一个子线程
创建子线程的同时, 启动一个python服务, 该服务在启动的时候, 就把图片数据和第一个prompt传递过去
*/

//问诊状态
let inquiried=false
//图片地址
let imgUrl=''
// python脚本执行对象
let  pythonProcess;
//会议id
let id;


//开启问诊状态，参数为图片的地址
//传递的msg就是图片的地址================================================================
const startInquriy=(msg)=>{
    //启动模型，
    pythonProcess = spawn('python', ['./foot.py', msg, '请你帮我诊断这张图片' ], {   
        stdio: ['pipe', 'pipe', 'pipe'] ,
        encoding: 'utf-8'
    });
    //为模型增加一个输出监听， 从此会开始监听模型的输出
    pythonProcess.stdout.on('data', (data) => {
        if(!inquiried){
            //如果检测到这是第一次输出， 则开启问诊状态
            inquiried=true
            //先进行响应3,告知前端图片地址在什么地方
            parentPort.postMessage({type:3, id:id, url:msg})
        }
        //响应2, 告知前端模型的意见
        // 将Buffer对象转换为十六进制字符串，并使用正则表达式替换掉空格
        const hexString = data.toString('hex').replace(/ /g, '');
        console.log(Buffer.from(hexString, 'hex'))
        // 将十六进制字符串转换为实际的字符串
        const str = Buffer.from(hexString, 'hex').toString('utf-8');
        console.log(str)
        parentPort.postMessage({type:2, id:id, message:str})
    });
}

// 向 Python 脚本发送数据, 参数为发送的数据
const sendDataToPython = (data) => {
    pythonProcess.stdin.write(data + '\n'); // 在每条消息末尾加上换行符
};


// 监听主线程发送的消息
parentPort.on('message', (message) => {
    data=message
    //0指令, 给线程分一个id
    if(data.type===0){
        id = data.id;
    }
    //1指令, 线程停止
    else if(data.type===1){
        if(inquiried){ 
            //退出
            parentPort.postMessage({type:1, id:id})
            //停止python脚本
            sendDataToPython('exit');
            //停止线程
            process.exit()

        }
    }
    //2指令, 发来数据, 传回数据
    else if(data.type===2){
        //输入数据, 这个data.message其实就是前端传入进来的话
       if(inquiried){ 
            sendDataToPython(data.message);
        }
    }
    //3指令, 开启对话
    else if(data.type===3){
        //设置图片的地址, 并且确认开启python脚本
        imgUrl = data.url
        id = data.id
        startInquriy(data.url);
    }
});



