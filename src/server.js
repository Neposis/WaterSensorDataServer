const { WebSocketServer } = require('ws')

const wss = new WebSocketServer({ port: 433 });


let index = 0;
let connected_clients = {};
let arduino_client;




// ================================= Arduino update notifications =================================
let arduinoActionHandler = () => {
    // ------------------------- Update all connected clients with new data -------------------------

    for (const key of connected_clients.keys()) {
        console.log(key)
    }
}

// ================================= Client Actions =================================
let clientActionHandler = () => {

}

// ================================= Getting devices connected =================================
wss.on('connection', (ws) => {

    let local_index = index;
    let connection_msg = true;
    let client_type;
    index++;
    ws.send("State your business!")

    // ------------------------------------- OnMessage -------------------------------------
    ws.on('message', (data) => {

        if (connection_msg) {
            data = data.toString()

            // Web Client
            if (data === "I'm a WebClient") {
                console.log("Connected: A WebClient")
                client_type = "WebClient"
                connected_clients[local_index] = ws;
                ws.send("Ok fine, you can join in...")

            // Arduino Client
            } else if (data === "I'm an Arduino hehe") {
                console.log("Connected: An Arduino... we've been expecting you!");
                client_type = "Arduino"
                arduino_client = ws;

            // Unknown
            } else {
                console.log(`Could not figure out who this is, message: "${data}"`)
                ws.send("Go away, I don't know what you are!");
                client_type = "Unknown"
                ws.close();
                return;
            }

            connection_msg--;
            return;
        }

        // Process data based on where the message is from
        if (client_type === "Arduino") {arduinoActionHandler()}
        else {clientActionHandler()}


        console.log(data.toString())
    });

    // ------------------------------------- OnClose -------------------------------------
    ws.on('close', () => {
        if (client_type === "Unknown") {
            console.log(`Forcefully closing connection`);
        }
        console.log(`${client_type} disconnected`);
        delete connected_clients[local_index];
    });


    ws.on('error', (error) => {
        console.error(`${client_type} #${local_index} WebSocket error: ${error.message}`);
    });
});




