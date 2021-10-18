import Logger from "../../Logger";
import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";

const patt = /(\d+),(\d+),(\d+),(\d+)\S+/;
interface node24p {
    val: number;
    expr: string;
}
interface op {
    apply: (op1: node24p, op2: node24p) => node24p;
}
const add: op = {
    apply: (a: node24p, b: node24p): node24p => {
        return {
            val: a.val + b.val,
            expr: `(${a.expr})+(${b.expr})`,
        };
    },
};
const sub: op = {
    apply: (a: node24p, b: node24p): node24p => {
        return {
            val: a.val - b.val,
            expr: `(${a.expr})-(${b.expr})`,
        };
    },
};
const mul: op = {
    apply: (a: node24p, b: node24p): node24p => {
        return {
            val: a.val * b.val,
            expr: `(${a.expr})*(${b.expr})`,
        };
    },
};
const div: op = {
    apply: (a: node24p, b: node24p): node24p => {
        if (b.val === 0) {
            return {
                val: NaN,
                expr: "",
            };
        }
        return {
            val: a.val / b.val,
            expr: `(${a.expr})/(${b.expr})`,
        };
    },
};
const ops = [add, sub, mul, div];
const generate = (SET: node24p[] | number, oprand: number): node24p[] => {
    if (!(SET as node24p[]).length) {
        SET = [{ val: SET as number, expr: (SET as number).toString() }];
    }
    const result: node24p[] = [];
    (<node24p[]>SET).forEach((node) => {
        ops.forEach((operator) => {
            result.push(
                operator.apply(node, { val: oprand, expr: oprand.toString() })
            );
        });
    });
    return result;
};
const solve24p = (nums: number[]): string => {
    const result = nums.reduce(generate);
};
const game24p: cmd = {
    pattern: patt,
    exec: async (ev: messageEvent) => {
        const groupId = ev.group_id;
        const params = patt.exec(ev.message);
        if (!params) {
            Logger.warn("[24p]解析失败");
            return;
        }
        Logger.debug(JSON.stringify(params));
        const nums = [
            parseInt(params[1]),
            parseInt(params[2]),
            parseInt(params[3]),
            parseInt(params[4]),
        ];
        Logger.info("[24p]", nums);
        Logger.info(groupId, solve24p(nums));
    },
};
export default game24p;
