const { WebSocketServer } = require('ws')
const wss = new WebSocketServer({ port: 443 });

wss.on('connection', function connection(ws) {
    console.log("Client connected")

    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });


});