import Logger from "../../Logger";
import qq from "../../QQMessage";
import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";

interface node24p {
    val: number;
    expr: string;
}
interface op {
    apply: (op1: node24p | number, op2: node24p | number) => node24p;
}
const add: op = {
    apply: (a: node24p | number, b: node24p | number): node24p => {
        return {
            val:
                ((a as node24p).val || (a as number)) +
                ((b as node24p).val || (b as number)),
            expr: `${(a as node24p).expr || (a as number)}+${
                (b as node24p).expr || (b as number)
            }`,
        };
    },
};
const sub: op = {
    apply: (a: node24p | number, b: node24p | number): node24p => {
        return {
            val:
                ((a as node24p).val || (a as number)) -
                ((b as node24p).val || (b as number)),
            expr: `${(a as node24p).expr || (a as number)}-${
                (b as node24p).expr || (b as number)
            }`,
        };
    },
};
const mul: op = {
    apply: (a: node24p | number, b: node24p | number): node24p => {
        return {
            val:
                ((a as node24p).val || (a as number)) *
                ((b as node24p).val || (b as number)),
            expr:
                ((a as node24p).expr
                    ? `(${(a as node24p).expr})`
                    : `${a as number}`) +
                "*" +
                ((b as node24p).expr
                    ? `(${(b as node24p).expr})`
                    : `${b as number}`),
        };
    },
};
const div: op = {
    apply: (a: node24p | number, b: node24p | number): node24p => {
        if ((b as node24p).val === 0 || (b as number) === 0) {
            return {
                val: NaN,
                expr: "",
            };
        }
        return {
            val:
                ((a as node24p).val || (a as number)) /
                ((b as node24p).val || (b as number)),
            expr:
                ((a as node24p).expr
                    ? `(${(a as node24p).expr})`
                    : `${a as number}`) +
                "/" +
                ((b as node24p).expr
                    ? `(${(b as node24p).expr})`
                    : `${b as number}`),
        };
    },
};
const ops = [add, sub, mul, div];
const generate = (SET: node24p[], oprand: number): node24p[] => {
    const result: node24p[] = [];
    (<node24p[]>SET).forEach((node) => {
        ops.forEach((operator) => {
            result.push(operator.apply(node, oprand));
        });
    });
    return result;
};
const solve24pOnePerm = (nums: number[], target: number): string | null => {
    const init = nums[0];
    const result = nums
        .slice(1, 4)
        .reduce(generate, <node24p[]>[
            { val: init, expr: (init as number).toString() },
        ]);
    for (const node of result) {
        if (node.val == target) {
            return node.expr;
        }
    }
    return null;
};
const perms = [
    [0, 1, 2, 3],
    [0, 1, 3, 2],
    [0, 3, 1, 2],
    [0, 3, 2, 1],
    [0, 2, 1, 3],
    [0, 2, 3, 1],
    [1, 0, 2, 3],
    [1, 0, 3, 2],
    [1, 3, 0, 2],
    [1, 3, 2, 0],
    [1, 2, 0, 3],
    [1, 2, 3, 0],
    [2, 1, 0, 3],
    [2, 1, 3, 0],
    [2, 3, 1, 0],
    [2, 3, 0, 1],
    [2, 0, 1, 3],
    [2, 0, 3, 1],
    [3, 1, 2, 0],
    [3, 1, 0, 2],
    [3, 0, 1, 2],
    [3, 0, 2, 1],
    [3, 2, 1, 0],
    [3, 2, 0, 1],
];
const applyIndex = (index: number[], array: number[]): number[] => {
    return [array[index[0]], array[index[1]], array[index[2]], array[index[3]]];
};
const solve24p = (nums: number[], target: number): string | null => {
    let res: string | null = null;
    perms.forEach((perm) => {
        const tmp = solve24pOnePerm(applyIndex(perm, nums), target);
        if (tmp) {
            if (!res) res = tmp;
            if (res.length > tmp.length) {
                res = tmp;
            }
        }
    });
    return res;
};

const patt = /(\d+),(\d+),(\d+),(\d+)[\u4e00-\u9af5a-zA-Z：:，\]]+(\d+)/;
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
        const target = parseInt(params[5]);
        Logger.info("[24p]", nums, target);
        const solution = solve24p(nums, target);
        Logger.info(groupId, solution || "not found");
        qq.sendToGroup(groupId, solution as string);
    },
};
export default game24p;
