import sender from "..";
import log from "../../Logger";

let Sender = new sender();

setTimeout(() => {
    Sender.sendToGroup(715787173, "奥利给");
}, 1000);
