declare type EventName = keyof EventPayloads;

declare interface EventPayloads {
    remoteUserLeft: {
        userId: string;
    };
    remoteUserJoined: {
        userId: string;
    };
    remoteUserPublished: {
        userId: string;
        streamType: "sub" | "main";
        isPublished: boolean;
    };
    trtcNetworkQuality: any;
    showVideoEvent: ShowVideo;
    stopVideoEvent: StopVideo;
    putScreenEvent: PutScreen;
    stopPutScreenEvent: stopPutScreen;
    connectionClosed: any;
    connectionOpened: any;
    connectionError: any;
    onEnterRoomEvent: {
        result: Boolean;
    };
    trtcError: any;
    trtcAudioVolume: {
        userId: string;
        volume: number;
    }[];
    businessEvent?: any;
}

declare interface EventUtil {
    on<T extends EventName>(eventName: T, callback: (payload: EventPayloads[T]) => void): void;
    off<T extends EventName>(eventName: T, callback?: (payload: EventPayloads[T]) => void): void;
    once<T extends EventName>(eventName: T, callback: (payload: EventPayloads[T]) => void): void;
    emit<T extends EventName>(eventName: T, payload?: EventPayloads[T]): void;
}

export declare const getTRTCWebSDK: TRTCWebSDKInterface;

declare interface localMediaConfig {
    view: string;
    fillMode?: 'contain' | 'cover' | 'fill';
    publish?: boolean;
    mute?: boolean | string;
    mirror?: 'view' | 'publish' | 'both' | boolean;
    qosPreference?: 'clear' | 'smooth';
}

declare interface MediaControlInterface {
    createSDK: (data: VideoConfiguration_2) => Promise<boolean>;
    enterRoom: (roomId: number) => Promise<unknown>;
    playLocalMedia: (data: localMediaConfig) => Promise<unknown>;
    stopLocalMedia: () => Promise<unknown>;
    playRemoteVideo: (data: remoteMediaConfig) => Promise<unknown>;
    stopRemoteVideo: (data?: StopRemoteVideoConfig) => Promise<unknown>;
    playScreenVideo: (data: remoteMediaConfig) => Promise<unknown>;
    stopPlayScreenVideo: (data: {
        userId: string;
    }) => Promise<unknown>;
    muteLocalAudio: (flag: boolean) => Promise<unknown>;
    muteLocalVideo: (flag: boolean) => Promise<unknown>;
    switchCamera: (facingMode: "user" | "environment") => Promise<unknown>;
    checkCameraDevice: () => Promise<boolean>;
    getVideoSnapshot: (videoFrameInfo: VideoFrameConfig) => Promise<string | unknown>;
    startRecordAudioFrame: () => Promise<unknown>;
    removeRecordAudioFrame: () => Promise<string | unknown>;
    mixAudioStreams: (videoElementID: string) => Promise<unknown>;
    stopMixAudioStreams: (videoElementID: string) => Promise<unknown>;
    isSupportedWebRTC: () => Promise<Boolean>;
    leaveRoom: () => unknown;
    destroySDK: () => unknown;
}

declare type PutScreen = {
    commandType: 'putScreen';
    conferserno: string;
};

declare interface remoteMediaConfig {
    view: string;
    userId: string | number;
    fillMode?: 'contain' | 'cover' | 'fill';
    mirror?: boolean;
    streamType?: 'main' | 'sub';
}

declare type ShowVideo = {
    commandType: 'show_video';
    sceneno: string;
    useridlist: string;
    cameraparam: string;
    sharedeskparam: string;
    recordflag: string;
    singleaudioflag: string;
    cameraname: string;
    audioinputname: string;
    audiooutputname: string;
    windowparam: string;
    reservejson: string;
    picstructure: string;
    pictureproportion: string;
    pinpflag: string;
    styleparam: string;
    userid: string;
    showvideoparam: string;
    pushstreamparam: string;
    roomid: string;
    RECORDMODE: string;
    conferserno: string;
    agentMode?: '0' | '1';
    agentSex?: '0' | '1' | '';
    token: string;
};

declare type stopPutScreen = {
    commandType: 'stopPutScreen';
    conferserno: string;
};

declare interface StopRemoteVideoConfig {
    userId: string;
    streamType?: 'main' | 'sub';
}

declare interface StopRemoteVideoConfig {
    userId: string;
    streamType?: 'main' | 'sub';
}

declare type StopVideo = {
    commandType: 'stop_video';
    conferserno: string;
};

declare interface TRTCWebSDKInterface extends MediaControlInterface, WebSocketInterface, EventUtil {
}

declare interface VideoConfiguration_2 {
    sdkAppId: number;
    userId: string;
    secretKey: string;
    proxy?: string;
}

declare interface VideoFrameConfig {
    userId?: string;
    streamType?: 'main' | 'sub';
}

declare interface WebsocketConfiguration {
    ip: string;
    userId: string;
}

declare interface WebSocketInterface {
    initABMessage: (data: WebsocketConfiguration) => void;
    closeABMessage: () => void;
    sendMessage: (msg: any) => void;
}

export { }

/**
 * @description: 用于封装 TRTC Web SDK
 * @link https://web.sdk.qcloud.com/trtc/webrtc/v5/doc/zh-cn/index.html
 */
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}
