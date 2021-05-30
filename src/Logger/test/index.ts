import log from "..";

try {
    log.debug("awa");
    log.info({"歪比歪比": ["awa", "qwq", 233]}, 6666, "阿巴阿巴");
    log.warn(1, 2, 3);
    log.error(1);
    log.fatal({"a":[1]});
} catch (error) {
    console.log(error);
}
