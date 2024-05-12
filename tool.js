//实现唯一id
const { v4: uuidv4 } = require('uuid');
function generateUniqueId() {
    return uuidv4();
}
//对象转化为json
function objectToJson(obj) {
    try {
        return JSON.stringify(obj);
    } catch (error) {
        console.error('Error converting object to JSON:', error);
        return null;
    }
}
//json转化为对象
function jsonToObject(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error converting JSON to object:', error);
        return null;
    }
}
module.exports={generateUniqueId, objectToJson, jsonToObject}