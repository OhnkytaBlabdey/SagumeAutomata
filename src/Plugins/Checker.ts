// TODO: 优化if-else实用性有待商榷
import {RequesterResponseType} from "../Requester/interface";

export declare namespace Bili {
    enum StatusCode {
        PASS,
        RESULT_OR_RESULT_DATA_ERROR,
        JSON_DATA_ERROR,
        GET_LIVE_ROOM_STATUS_FAILED,
        GET_LATEST_VIDEO_FAILED,
        INVALID_VIDEO_FORMAT,
        GET_DYNAMIC_FAILED,
        EMPTY_DYNAMIC
    }

    enum LogInfo {
        GET_LIVE_ROOM_STATUS_FAILED = "获取直播间状态失败",
        INVALID_LIVE_ROOM_FORMAT = "直播间返回格式错误",
        INVALID_LIVE_ROOM_RESPONSE = "直播间响应错误",
        INVALID_VIDEO_FORMAT = "格式错误",
        GET_LATEST_VIDEO_FAILED = "获取最新视频失败",
        INVALID_VIDEO_RESPONSE_FORMAT = "视频返回格式错误",
        GET_DYNAMIC_FAILED = "获取动态失败",
        EMPTY_DYNAMIC = "获取的动态没有数据"
    }

    type biliValidator = (r: RequesterResponseType) => StatusCode

    interface BiliValidatorDispatcher {
        basic: biliValidator,
        checkLiveRoom: biliValidator,
        checkVideoInfo: biliValidator,
        checkDynamicData: biliValidator
    }

    interface ValidatorReturnType {
        res: StatusCode,
        info: string
    }

    type validateHandler = (result: RequesterResponseType, ...args: any) => ValidatorReturnType
}

const biliValidatorDispatcher: Bili.BiliValidatorDispatcher = {
    basic: (result: RequesterResponseType) => {
        if (result && result.data) {
            if (result.data.data) {
                return Bili.StatusCode.PASS;
            }
            return Bili.StatusCode.JSON_DATA_ERROR;
        }
        return Bili.StatusCode.RESULT_OR_RESULT_DATA_ERROR;
    },
    checkLiveRoom: (result: RequesterResponseType) => {
        if (result.data.data.live_room) {
            return Bili.StatusCode.PASS;
        }
        return Bili.StatusCode.GET_LIVE_ROOM_STATUS_FAILED;
    },
    checkVideoInfo: (result: RequesterResponseType) => {
        const data = result.data.data;
        if (data.list && data.list.vlist) {
            if (data.list.vlist[0]) {
                return Bili.StatusCode.PASS;
            } else {
                return Bili.StatusCode.GET_LATEST_VIDEO_FAILED;
            }
        } else {
            return Bili.StatusCode.INVALID_VIDEO_FORMAT;
        }
    },
    checkDynamicData: (result: RequesterResponseType) => {
        if (!(result && result.data && result.data.data)) {
            return Bili.StatusCode.GET_DYNAMIC_FAILED;
        }
        const cards = result.data.data.cards;
        if (!(cards && cards[0])) {
            return Bili.StatusCode.EMPTY_DYNAMIC;
        }
        return Bili.StatusCode.PASS;
    }
};

/**
 *
 * @param result
 */
export const validateBiliLive: Bili.validateHandler = (result: RequesterResponseType): Bili.ValidatorReturnType => {
    let res = biliValidatorDispatcher.basic(result);
    if (res === Bili.StatusCode.PASS) {
        res = biliValidatorDispatcher.checkLiveRoom(result);
    }
    let info = "";
    switch (res) {
    case Bili.StatusCode.RESULT_OR_RESULT_DATA_ERROR:
        info = Bili.LogInfo.INVALID_LIVE_ROOM_RESPONSE;
        break;
    case Bili.StatusCode.JSON_DATA_ERROR:
        info = Bili.LogInfo.INVALID_LIVE_ROOM_FORMAT;
        break;
    case Bili.StatusCode.GET_LIVE_ROOM_STATUS_FAILED:
        info = Bili.LogInfo.GET_LIVE_ROOM_STATUS_FAILED;
        break;
    }
    return {
        res,
        info
    };
};

/**
 *
 * @param result
 */
export const validateBiliVideo: Bili.validateHandler = (result: RequesterResponseType): Bili.ValidatorReturnType => {
    let res = biliValidatorDispatcher.basic(result);
    if (res === Bili.StatusCode.PASS) {
        res = biliValidatorDispatcher.checkVideoInfo(result);
    }
    let info = "";
    switch (res) {
    case Bili.StatusCode.RESULT_OR_RESULT_DATA_ERROR:
    case Bili.StatusCode.JSON_DATA_ERROR:
        info = Bili.LogInfo.INVALID_VIDEO_RESPONSE_FORMAT;
        break;
    case Bili.StatusCode.INVALID_VIDEO_FORMAT:
        info = Bili.LogInfo.INVALID_VIDEO_FORMAT;
        break;
    case Bili.StatusCode.GET_LATEST_VIDEO_FAILED:
        info = Bili.LogInfo.GET_LATEST_VIDEO_FAILED;
        break;
    }
    return {
        res, info
    };
};

/**
 *
 * @param result
 * @param uid
 */
export const validateBiliDynamic: Bili.validateHandler = (result: RequesterResponseType, uid: number): Bili.ValidatorReturnType => {
    let res = biliValidatorDispatcher.checkDynamicData(result);
    let info = "";
    switch (res) {
    case Bili.StatusCode.GET_DYNAMIC_FAILED:
        info = `${Bili.LogInfo.GET_DYNAMIC_FAILED}, uid=${uid}`;
        break;
    case Bili.StatusCode.EMPTY_DYNAMIC:
        info = `${Bili.LogInfo.EMPTY_DYNAMIC}, uid=${uid}`;
        break;
    }
    return {
        info, res
    };
};
