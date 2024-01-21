import { WebSocket } from 'ws';

const websocketServerUrl = 'ws://localhost:433';

const ws = new WebSocket(websocketServerUrl);

let connection_finished = false;


ws.on('open', () => {
    console.log('Connected to WebSocket server');
});

ws.on('message', (data) => {
    if (!connection_finished) {
        data = data.toString();
        console.info(`Server: ${data}`);
        if (data === "State your business!") {
            ws.send("I'm a WebClient");
            console.info("Me: I'm a WebClient");
        } else if (data === "Ok fine, you can join in...") {
            connection_finished = true;
        } else if (data === "Go away, I don't know who you are!") {
            console.error("Something went wrong, I got denied...");
            ws.close();
        }
    } else {
        console.log(`Received: ${data.toString()}`)
    }
});

ws.on('close', () => {
    console.log('Connection closed');
});

ws.on('error', (error) => {
    console.error(`WebSocket error: ${error.message}`);
});