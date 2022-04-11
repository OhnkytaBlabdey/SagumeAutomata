import Logger from "../../Logger";
import qq from "../../QQMessage";
import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";

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
    if (SET.length == 1) {
        const v = SET[0].val;
        ops.forEach((operator) => {
            result.push(operator.apply(v, oprand));
        });
        return result;
    }
    SET.forEach((node) => {
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
        .reduce(generate, <node24p[]>[{ val: init, expr: init.toString() }]);
    for (const node of result) {
        if (node.val == target) {
            return node.expr;
        }
    }
    const res1 = generate(
        <node24p[]>[{ val: init, expr: init.toString() }],
        nums[1]
    );
    const res2 = generate(
        <node24p[]>[{ val: nums[2], expr: nums[2].toString() }],
        nums[3]
    );
    const res: node24p[] = [];
    res1.forEach((n1) => {
        res2.forEach((n2) => {
            ops.forEach((operator) => {
                res.push(operator.apply(n1, n2));
            });
        });
    });
    for (const node of res) {
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

const patt = /(\d+),(\d+),(\d+),(\d+)&#93;[^\u00-\uff]+(\d+)/;
const game24p: CmdType.Cmd = {
    pattern: patt,
    exec: async (ev: messageEvent) => {
        const groupId = ev.group_id;
        const params = patt.exec(ev.message);
        if (!params) {
            Logger.error("[24p]解析失败", ev.message);
            return;
        }
        Logger.debug("[24p]", JSON.stringify(params));
        const nums = [
            parseInt(params[1]),
            parseInt(params[2]),
            parseInt(params[3]),
            parseInt(params[4]),
        ];
        const target = parseInt(params[5]);
        Logger.debug("[24p]", nums, target);
        const solution = solve24p(nums, target);
        Logger.debug(groupId, solution || "not found");
        if (solution) qq.sendToGroup(groupId, solution as string);
        else {
            Logger.warn("[24p]", nums, target, "未找到解答");
        }
    },
    cmdName: "game24p",
};
export default game24p;
