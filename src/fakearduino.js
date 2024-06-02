import { WebSocket } from 'ws';

const websocketServerUrl = 'ws://localhost:8085';

const ws = new WebSocket(websocketServerUrl);

let connection_finished = false;


let testMsg;


let TENG1 = 10.0;
let TENG2 = 7.0;
let TENG3 = 0.5;
let TENG4 = 10.0;

ws.on('open', () => {
    console.log('Connected to WebSocket server');
});

ws.on('message', (data) => {
    if (!connection_finished) {
        data = data.toString();
        console.info(`Server: ${data}`);

        if (data === "State your business!") {
            ws.send("I'm an Arduino hehe");
            console.info("Me: I'm an Arduino hehe");
            connection_finished = true;
            const interval = setInterval(() => {
                TENG1 += (Math.random() / 2) - 0.25;
                TENG2 += (Math.random()/ 10.0) - 0.05;
                TENG3 += (Math.random() / 10.0) - 0.05;
                TENG4 += (Math.random() * 2.0) - 1.0;
                testMsg = {
                    "TENG1": TENG1,
                    "TENG2": TENG2,
                    "TENG3": TENG3,
                    "TENG4": TENG4
                }

                ws.send(JSON.stringify(testMsg));
            }, 100);
        } else if (data === "Go away, I don't know who you are!") {
            console.error("Something went wrong, I got denied...");
            ws.close();
        }
    } else {

    }
});

ws.on('close', () => {
    console.log('Connection closed');
});

ws.on('error', (error) => {
    console.error(`WebSocket error: ${error.message}`);
});