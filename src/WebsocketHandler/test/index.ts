import WebSocket from "ws";
import WebsocketHandler from "../index";
import EventEmitter from "events";

let e = new EventEmitter();
e.on("nmd", (e) => {
    console.log(e);
});

const wss = new WebSocket.Server({
    port: 11451,
});

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    ws.send('something');
});

async function main() {
    let client = new WebsocketHandler("localhost", 11451, e, "nmd");
    try {
        await client.connect();
    } catch (e) {
        console.log(e);
    }
    setTimeout(() => {
        client.sendMessage("wdnmd");
    }, 1000);
}

main();
