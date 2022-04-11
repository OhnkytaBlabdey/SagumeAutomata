import {initializer} from "./Initializer";

initializer()
    .then(() => {
        console.log("初始化完成");
    }).catch((e) => {
        console.error("发生错误");
        console.error(e);
});
