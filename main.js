const WebSocket = require('ws');
const { Worker } = require('worker_threads');
const {jsonToObject,objectToJson,generateUniqueId}=require('./tool.js')
const fs = require('fs');

// 创建 WebSocket 服务器, 该服务器监听的是3000端口
const wss = new WebSocket.Server({ port: 3000 });

//链接类,id, 和前端的链接ws, 和后端的链接worker
class Connection {
    constructor(id, ws, worker) {
        this.id = id;
        this.ws = ws;
        this.worker = worker;
    }
    getId() {  return this.id;  }
    getWebSocket() {   return this.ws;  }
    getWorker() { return this.worker;}
    setWebSocket(ws) {  this.ws = ws;}
    setWorker(worker) { this.worker = worker;}
}

//进程管理对象队列(映射)
const workers=new Map();


// 监听每次创建一个新的链接, 就会
// 创建一个ws对象并且设置监听器
// 将其加入队列中
wss.on('connection', (ws) => {
    //创建id
    const id=generateUniqueId()
    
    //生成链接对象并且创建监听
    ws.addEventListener('open', () => {
        console.log('WebSocket connection established');
    });
    //监听前端的信息
    ws.addEventListener('message', (event) => { 
        data=jsonToObject(event.data)
        conn=workers.get(data.id)   //先判断该会话是否还存在, 如果不存在就不需要什么反应
        if(conn){                       //如果链接对象已经创建
            work=conn.worker            //获取线程链接

            if(data.type===2) {         //发送到ws的指令为2, 则把数据传下去
                work.postMessage(data)

            }else if(data.type===1){    //接收到1指令
                console.log('会话'+data.id+'已经停止')
                work.postMessage(data)  //向线程发送停止信息
                workers.delete(data.id) //从线程队列中删除会话

            }else if(data.type===3){    
                // 将Base64编码的字符串转换为Buffer
                const imageBuffer = Buffer.from(data.data.split(';base64,').pop(), 'base64');
                // 指定要保存图像的文件路径和文件名
                const imagePath = './imgs/img'+data.id+'.png';
                // 将图像数据写入文件
                fs.writeFile(imagePath, imageBuffer, (err) => {
                    if (err) {console.error('Error saving image:', err); return; }
                });
                // 将图片的保存地址传递给子进程
                work.postMessage({...data,url:imagePath})
            }
        }
    });

    //将id, 链接对象和子线程组合存储, 其中ws代表前端, worker代表后端线程
    ws.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
    });
    ws.addEventListener('close', () => {   //监听到链接关闭以后
        console.log('用户页面已经关闭')     //将ws直接删除掉
        conn=workers.get(id)   
        if(conn){              
            workers.delete(id)
        }
    });

    // 创建子线程
    const worker=new Worker('./worker.js')
    // 监听来自子线程的消息
    worker.on('message', (message) => {
        console.log(message)
        conn=workers.get(message.id)
        if(message.type===2){
            conn.getWebSocket().send(objectToJson(message))
        }else if(message.type===1){
            workers.delete(message.id) //从维护队列中删除
            conn.getWebSocket().send(objectToJson(message)) //将数据发送给前端
        }else if(message.type===3){
            conn.getWebSocket().send(objectToJson(message)) //将数据发送给前端
        }
    })

    //前端链接, 线程链接, 以及id存储起来
    workers.set(id, new Connection(id,ws,worker))

    //发送给前端id信息
    ws.send(objectToJson({type:0,id:id}))
    //发送给子线程id信息
    worker.postMessage(objectToJson({type:0, id:id}))
    
    console.log('新增会话用户, 当前会话数目为', workers.size)

});

