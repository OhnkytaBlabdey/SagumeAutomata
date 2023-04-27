import { initializer } from "./Initializer";
import logger from "./Logger";

initializer()
    .then(() => {
        logger.info("初始化完成");
    })
    .catch((e) => {
        logger.error("发生错误");
        logger.error(e);
    });
