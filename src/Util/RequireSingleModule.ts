import {Util} from "./interface";

export const requireSingle = (fullPath: string): Promise<Util.RequireModuleType> => {
    return new Promise((resolve, reject) => {
        import(fullPath)
            .then(data => resolve(data))
            .catch(error => reject(error));
    });
}
