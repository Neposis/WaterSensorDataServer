import { WebSocketServer } from 'ws';
import { JsonDB, Config } from 'node-json-db';
import xlsx from "json-as-xlsx";
import fs from 'fs';


const wss = new WebSocketServer({port: 8085 });
let db = new JsonDB(new Config("./outputData/test.json", true, true, '/'));

let index = 0;
let connected_clients = {};
let arduino_client;


// ================================= Arduino update notifications =================================
let arduinoActionHandler = (data) => {

    let newData = JSON.parse(data.toString())
    const date = new Date(); // Add time data

    newData["time"] = Math.floor(date.getTime()/1000)

    if (newData.longitude === 0 || newData.latitude === 0) {
        newData.longitude = -0.5887466;
        newData.latitude = 51.2427036;
    }

    // Add to database
    db.push(`/${newData.time}`, newData).then()

    // ------------------------- Update all connected clients with new data -------------------------
    if (Object.keys(connected_clients).length === 0) return;

    for (const ws of Object.keys(connected_clients)) {
        connected_clients[ws].send(JSON.stringify(newData))
    }

}

// ================================= Client Actions =================================
let clientActionHandler = async (data, ws)=> {
    let newData = {command: "", args: []}
    newData = JSON.parse(data.toString())

    switch (newData.command) {
        case "delete":
            await db.delete("/")
            break;

        case "export":
            let exportableDataIndexes = await db.getData("/")

            let data = [
                {
                    sheet: "Data",
                    columns: [
                        { label: "Time", value: "time"},
                        { label: "Celsius", value: "celsius"}, // Top level data
                        { label: "Fahrenheit", value: "fahrenheit"},
                        { label: "PH", value: "ph"},
                        { label: "Turbidity", value: "turbidity"},
                        { label: "TDS", value: "tds"}, // Run functions
                    ],
                    content: [],
                },
            ]

            for (const i in exportableDataIndexes) {
                let entry = {...await db.getData(`/${i}`)}
                entry.time = new Date(i * 1000).toLocaleString()
                data[0].content.push(entry)
            }

            let settings = {
                fileName: "C:\\Users\\David\\WebstormProjects\\WaterSensorData\\static\\ExportedData", // Name of the resulting spreadsheet
                extraLength: 3, // A bigger number means that columns will be wider
                writeMode: "writeFile", // The available parameters are 'WriteFile' and 'write'. This setting is optional. Useful in such cases https://docs.sheetjs.com/docs/solutions/output#example-remote-file
                writeOptions: {}, // Style options from https://docs.sheetjs.com/docs/api/write-options
                RTL: false, // Display the columns from right-to-left (the default value is false)
            }

            let finished = function () {
                let delay = setInterval(() => {
                    ws.send(JSON.stringify({command: "exportReady"}))
                    clearInterval(delay)
                }, 8000)
            }

            xlsx(data, settings, finished)
            break;

        case "exportJson":

            fs.copyFile('C:\\Users\\David\\WebstormProjects\\WaterSensorDataServer\\outputData\\test.json', 'C:\\Users\\David\\WebstormProjects\\WaterSensorData\\static\\ExportedData.json' ,() => {
                ws.send(JSON.stringify({command: "exportReady"}))
            })
            break;
    }

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
        if (client_type === "Arduino")
            {arduinoActionHandler(data)}
        else
            {clientActionHandler(data, ws).then()}
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




