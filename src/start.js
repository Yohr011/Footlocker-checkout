const fs = require('fs');
const Task = require('./index.js');

let tasks = Object.create(JSON.parse(fs.readFileSync('./tasks.json', {
    encoding: 'utf8',
    flag: 'r'
})));
let x = 1;

for (let i in tasks) {
    tasks[i]['generationTime'] = new Date().toISOString();
    let task = new Task(x, tasks[i]['sku'], tasks[i]['cardData'], tasks[i]['personalData']);
    x += 1;
    task.start();
}
