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


//开启问诊状态
const startInquriy=(msg)=>{
    console.log('输入进来图片的地址为',msg)
    pythonProcess = spawn('python', ['./foot.py', msg ], {   
        stdio: ['pipe', 'pipe', 'pipe'] 
    });
    sendDataToPython('图片'+msg);
    pythonProcess.stdout.on('data', (data) => {
        parentPort.postMessage({type:2, id:id, message:data.toString()})
    });
}

// 向 Python 脚本发送数据,
const sendDataToPython = (data) => {
    pythonProcess.stdin.write(data + '\n'); // 在每条消息末尾加上换行符
};

// 对python脚本输出设置一个监听器


// 监听主线程发送的消息
parentPort.on('message', (message) => {
    data=message
    //0指令, 给线程分一个id
    if(data.type===0){
        id = data.id;
    }
    //1指令, 线程停止
    else if(data.type===1){
        if(inquiried){  //如果目前在对话中, 就停止, 如果不再对话中则不管
            //停止python脚本
            sendDataToPython('exit');
            //停止线程
            process.exit()

        }
    }
    //2指令, 发来数据, 传回数据
    else if(data.type===2){
        //输入数据, 这个data.message其实就是前端传入进来的话
       if(inquiried){  //如果目前在对话中, 就停止, 如果不再对话中则不管
            sendDataToPython(data.message);
        }
    }
    //3指令, 开启对话
    else if(data.type===3){
        //输入图片, 并且确认开启python脚本
        inquiried = true
        imgUrl = data.url
        id = data.id
        startInquriy(data.url);
    }
});



