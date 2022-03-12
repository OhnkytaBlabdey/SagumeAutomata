export function msgFilter(msg: string): string {
    return msg.replace(/(^\s*)/g, '').split(" ").filter(i => i.length > 0)[0];
}
