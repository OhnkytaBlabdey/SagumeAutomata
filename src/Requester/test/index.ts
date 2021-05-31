import Requester from "../index";
import * as RequesterInterface from "../interface";
// import axios from "axios";
// import AxiosConfig from "../axios.config";

async function testGet() {
    try {
        const res: RequesterInterface.RequesterResponseType = <RequesterInterface.RequesterResponseType>await Requester.get({
            url: "https://api.live.bilibili.com/room/v1/Room/room_init",
            params: {
                id: 528210
            }
        });
        console.log(res);
    } catch (e) {
        console.log(e);
    }
}

testGet();
