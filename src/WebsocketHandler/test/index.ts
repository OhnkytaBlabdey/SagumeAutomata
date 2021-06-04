import WebSocket from "ws";
import WebsocketHandler from "../index";
import EventEmitter from "events";
import set = Reflect.set;

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

let client = new WebsocketHandler("ws://localhost", 11451, e, "nmd");
setTimeout(() => {
    client.sendMessage("wdnmd");
}, 1000);


