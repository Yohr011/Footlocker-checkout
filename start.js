const fs = require('fs')
const Task = require('./index.js')

let tasks = Object.create(JSON.parse(fs.readFileSync('./tasks.json', {encoding:'utf8', flag:'r'})))
let x = 1;

for (i in tasks) {
    tasks[i]['generationTime'] = new Date().toISOString()
    let task = new Task(x, tasks[i]['sku'], tasks[i]['cardData']);
    x+=1
    task.start();
}