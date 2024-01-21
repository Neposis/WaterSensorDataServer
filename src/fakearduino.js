import { WebSocket } from 'ws';

const websocketServerUrl = 'ws://localhost:433';

const ws = new WebSocket(websocketServerUrl);

let connection_finished = false;


let testMsg;


let ttemp = 19.00;
let long = -0.594589;
let lat = 51.246210;
let tpH = 7.0;
let tTurb = 0.5;
let tTDS = 370.0;

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
                ttemp += (Math.random() / 2) - 0.25;
                tpH += (Math.random()/10.0) - 0.05;
                tTurb += (Math.random() / 10.0) - 0.05;
                tTDS += (Math.random() * 2.0) - 1.0;
                long += (Math.random() /20000.0)-0.000025;
                lat += (Math.random() /20000.0)-0.000025;
                testMsg = {
                    "celsius": ttemp,
                    "fahrenheit": ((((ttemp*1.8)+32)* 100) / 100).toFixed(2),
                    "longitude": long,
                    "latitude": lat,
                    "tds": tTDS,
                    "ph": tpH,
                    "turbidity": tTurb
                }

                ws.send(JSON.stringify(testMsg));
            }, 1000);
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