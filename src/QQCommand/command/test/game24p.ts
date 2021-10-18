/* eslint-disable camelcase */
import Logger from "../../../Logger";
import game24p from "../game24p";
const test = (msg: string) => {
    Logger.info(game24p.pattern.test(msg));
    game24p.exec({
        ClassType: "",
        group_id: 114514,
        message: msg,
        message_id: 1,
        message_type: "",
        post_type: "",
        raw_message: "",
        sender: {
            card: "",
            nickname: "",
            role: "",
            user_id: 1,
        },
        sub_type: "",
        time: 1,
        user_id: 1,
    });
};
const main = () => {
    test("[1,2,3,4]abab啊a");
    test("[11,2,11,2]abab啊a");
};
main();
