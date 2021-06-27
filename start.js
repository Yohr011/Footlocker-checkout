const Task = require('./index.js')

let numtask = 2;

for (let i = 1; i < numtask + 1; i++) {
    let task = new Task(i, 'X6898010', {
        number : '4767 7183 9736 8103',       // 'xxxx xxxx xxxx xxxx'
        cvc : '588',                 //'xxx'
        holderName : 'Deez Bruh',   // 'John Doe'
        expiryMonth : '06', //'MM'
        expiryYear : '2027',   // 'YYYY'
        generationtime : new Date().toISOString() // new Date().toISOString()
    });
    task.start();
}