import { RequestApplyUser, RequestCreateVideo } from "@/common/api/api";
import EventUtil from "./eventUtil";
// import { getTRTCWebSDK } from "@/common/sdk/webrtc";
import { getTRTCWebSDK } from "@/common/sdk/v4/webtrc.esm";
import { sm2Encrypt } from "@/common/util/crypto";

const webTRTC = {
  initializeComplete: false,
  eventMap: {
    showVideoEvent: ["开始进入房间的视频通知"],
    stopVideoEvent: ["开始退出房间的视频通知"],
    putScreenEvent: ["收到拉取座席端视频共享流通知"],
    stopPutScreenEvent: ["收到结束拉取座席端视频共享流通知"],
    businessEvent: ["收到业务P推送的交易信息通知"],
    connectionOpened: ["客户端跟信令服务建立连接成功的事件通知"],
    connectionClosed: ["客户端跟信令服务连接断开的事件通知"],
    connectionError: ["客户端跟信令服务连接发生异常的时候的事件通知"],
    onEnterRoomEvent: ["当前用户进入房间成功与否的事件回调"],
    trtcError: ["错误事件，当出现不可恢复错误后，会抛出此事件"],
    trtcNetworkQuality: ["网络质量的实时统计回调"],
    remoteUserPublished: ["某远端用户发布/取消了主路视频画面"],
    remoteUserLeft: ["用户离开当前房间的事件监听"],
    remoteUserJoined: ["有用户加入当前房间"],
    trtcAudioVolume: ["音频音量的实时统计回调"],
  },
  videoParams: {},
  userFlag: undefined,
  userId: undefined,
  JUDGEFLAG: undefined,
  IP: undefined,
  queryParams: null,
  evaluateInfo: {},
  onOpenWithOidTriggered: false,
  // 初始化 eventCallbacks
  eventCallbacks: new Map(),
  async initialize() {
    console.log("初始化");
    if (this.initializeComplete) return;
    this.addNativeVideoEventListener();
    this.addCustomVideoEventHandler();
    this.initializeComplete = true;
  },
  async terminate() {
    if (!this.initializeComplete) return;
    this.removeNativeVideoEventListener();
    this.removeCustomVideoEventListener();
    await getTRTCWebSDK.closeABMessage();
    // await getTRTCWebSDK.destroySDK();
    this.videoParams = {};
    this.userFlag = undefined;
    this.userId = undefined;
    this.initializeComplete = false;
    this.JUDGEFLAG = undefined;
    this.IP = undefined;
    this.queryParams = null;
  },
  async checkCameraDevice() {
    let checkCameraResult = await getTRTCWebSDK.checkCameraDevice();
    console.log("checkCameraResult", checkCameraResult);
    return checkCameraResult;
  },
  async enterRoomNotice(info) {
    console.log("enterRoomNotice", info);
    return new Promise((resolve) => {
      let data = {
        data: JSON.stringify({
          useridlist: JSON.stringify([this.userId, info.AGENTID]),
          roomid: info.roomid,
        }),
      };
      EventUtil.emit("showVideoEvent", data, resolve);
    });
  },
  async getDevice() {
    let getResult = getTRTCWebSDK.deviceDialogInit();
    return getResult;
  },
  //呼叫柜员
  async callTellerAsync(USERDATA) {
    console.log("随录数据", USERDATA);
    let checkCameraResult = await getTRTCWebSDK.checkCameraDevice();
    console.log("硬件检测结果", checkCameraResult);
    const res = await getTRTCWebSDK.isSupportedWebRTC();
    console.log("TRTC检测结果", res);
    if (!res) {
      this.$message.error("当前浏览器不支持webrtc，请尝试更换浏览器。");
      return;
    }
    try {
      const { PHONENO } = USERDATA;
      this.userFlag = PHONENO;
      //初始化SDK事件
      await this.initialize();
      //申请用户que012
      const {
        IP,
        USERID,
        VIDEOAPPID: appid,
        access_ip,
        skey,
        JUDGEFLAG,
        MMID,
        MMDATE,
      } = await RequestApplyUser({
        DeviceType: "online",
        DeviceNum: this.userFlag,
        APPLYCHANNELCODE: "C004",
        APPID: "APP001",
        BUSINESSID: this.userFlag,
        ANOTHERNAME: "",
        USERFLAG: this.userFlag,
      });
      const oidPayloadPromise = this.waitOidRegister();

      // let appid = 1400719737; //申请用户接口返回
      // let skey =
      //   "c8f3753fc1e0e7ee9249a1ac94e9396501691ec9b9c751607b0c357b2ba0c9a1"; //申请用户接口返回
      // let USERID = "USER_6688";
      this.userId = USERID; //userId是申请用户返回，这边为了测试
      // this.JUDGEFLAG = JUDGEFLAG;
      // this.IP = "wss://adev.agree.com.cn/71/136/websocket148"; //申请用户接口返回
      // this.IP = "wss://agreetech.cn:18443/websocket"; //申请用户接口返回
      // this.IP = ""; //申请用户接口返回
      let proxyIP = this.convertToWebSocketURL(access_ip); //需跟媒体p确定
      console.log("私有化代理地址是：", proxyIP);
      //TRTC初始化
      let trtcResult = await getTRTCWebSDK.createSDK({
        sdkAppId: Number(appid),
        secretKey: skey,
        userId: USERID,
        proxy: proxyIP, //设置代理的IP
      });
      console.log("trtc检测结果", trtcResult);
      // ABMessage初始化
      await getTRTCWebSDK.initABMessage({
        ip: IP,
        userId: USERID,
      });
      // 等待 'onOpenWithOid' 事件被触发
      const oidPayload = await oidPayloadPromise;
      console.log("收到 onOpenWithOid 事件，数据为:", oidPayload);
      // const { roomid, AGENTID } = USERDATA;
      // await this.enterRoomNotice({ roomid, AGENTID }); //模拟abmessage推送show_video进房通知
      //视频进线
      let USERDATA_SM2 = sm2Encrypt(JSON.stringify(USERDATA));
      const { QUEUESTATUS, QUEDATE, QUEUENO } = await RequestCreateVideo({
        APPID: "APP001",
        DeviceType: "online",
        DeviceNum: this.userFlag,
        QUEUETYPE: "1",
        USERFLAG: this.userFlag,
        CONFERID: "",
        USERDATA: USERDATA_SM2,
        JUDGEFLAG,
        MMID,
        MMDATE,
      });
      return { QUEUESTATUS, QUEDATE, QUEUENO, MMDATE, MMID };
    } catch (error) {
      // throw error;
      console.error(`呼叫柜员报错${error}`);
    }
  },
  convertToWebSocketURL(access_ip) {
    try {
      const url = new URL(access_ip);
      const hostname = url.hostname;
      return `wss://${hostname}:89/ycyh1/`;
    } catch (error) {
      console.error("Invalid access_ip URL:", error);
      return null;
    }
  },
  //开始播放视频
  async startVideoAsync() {
    setTimeout(async () => {
      await getTRTCWebSDK.enterRoom(
        // userId: this.userId,
        Number(this.videoParams.roomid)
        // cameraparam: this.videoParams.cameraparam,
        // localViewID: "my-view",
        // facingMode:"user"
      );

      await getTRTCWebSDK.playLocalMedia({
        view: "my-view",
      });
      console.log("播放远端视频");
    }, 500);
  },
  // sendMessage() {
  //   getTRTCWebSDK.sendMessage(
  //     JSON.stringify({
  //       type: "test",
  //       msg: "Hello, this is a test message;",
  //     })
  //   );
  // },
  insertNativeComponents(className, userId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        getTRTCWebSDK.playRemoteVideo({
          view: className,
          userId,
        }); // eslint-disable-line
        resolve();
      }, 500);
    });
  },
  async changeFillMode(flag) {
    await getTRTCWebSDK.changeFillMode(flag);
  },
  addNativeVideoEventListener() {
    console.log("建立监听");

    Object.keys(this.eventMap).forEach((eventName) => {
      // 检查是否已经绑定了回调，避免重复绑定
      if (this.eventCallbacks.has(eventName)) {
        // console.warn(`事件 ${eventName} 已经绑定过回调，跳过`);
        return;
      }

      // 创建回调函数
      const callback = (payload) => {
        const standardEvent = eventName;
        EventUtil.emit(standardEvent, payload);
        // console.log(`事件 ${standardEvent} 已触发，数据为:`, payload);
      };

      // 绑定事件到 TRTCWebSDK
      getTRTCWebSDK.on(eventName, callback);
      // console.log(`事件 ${eventName} 已绑定到 EventUtil.emit`);

      // 将回调函数存储到 eventCallbacks 中，以便后续移除
      this.eventCallbacks.set(eventName, callback);
    });
  },
  documentEventHandler(eventName, { data }) {
    EventUtil.emit(eventName, data);
  },
  async getVideoSnapshot(remoteUserId) {
    const res = await getTRTCWebSDK.getVideoSnapshot({
      userId: remoteUserId,
      streamType: "main",
    });
    console.log(res);
    const img = document.createElement("img");
    img.width = 640;
    img.height = 480;
    img.src = res;
    document.body.appendChild(img);
  },
  addCustomVideoEventHandler() {
    //表示 SDK 抛出的不可恢复的错误，比如进入房间失败或设备开启失败等
    EventUtil.on("trtcError", (data) => {
      console.error("报错了", data);
    });
    //监听到show_video后进入视频房间
    EventUtil.on("showVideoEvent", (data) => {
      console.log("showVideoEvent消息推送", data);
      this.videoParams = data;
    });
    //开始退出房间的视频通知
    EventUtil.on("stopVideoEvent", () => {
      console.log("stopVideoEvent");
      getTRTCWebSDK.leaveRoom();
    });
    //
    EventUtil.on("trtcAudioVolume", (data) => {
      console.log("trtcAudioVolume", data);
    });
    //收到交易相关信息通知
    EventUtil.on("businessEvent", (data) => {
      console.log(data, "---");
      console.log("businessEvent", JSON.parse(data), "---");
      const { commandType, commandParameters, type } = JSON.parse(data);
      this.evaluateInfo = commandType == "Exit" ? commandParameters : {};
      type == "oidRegister"
        ? EventUtil.emit("oidRegister")
        : EventUtil.emit(
            commandType == "stopPutScreen" ? "stopPutScreenEvent" : commandType,
            commandParameters
          );
    });
    //收到开始视频共享通知
    // EventUtil.on("request_deskEvent", () => {
    //   getTRTCWebSDK.startScreenCaptureByReplaykitWithAppGroup({
    //     appGroup: "group.abmessage.TRTC.cn",
    //   });
    // });
    // //收到视频流增加的消息
    // EventUtil.on("remoteSubscribe", (event) => {
    //   getTRTCWebSDK.remoteStreamSubscribe(event);
    // });
    //收到视频流订阅
    EventUtil.on("remotePlay", ({ remoteViewID, event }) => {
      console.log("*******************remotePlay*************");
      getTRTCWebSDK.playRemoteStream(remoteViewID, event);
    });
    //移除视频流订阅
    // EventUtil.on("removeStream", (event) => {
    //   // getTRTCWebSDK.playRemoteStream(event);
    // });
    //收到结束视频共享通知
    EventUtil.on("close_deskEvent", () => {
      getTRTCWebSDK.stopScreenCapture();
    });
    //收到拉取座席端视频共享流通知
    EventUtil.on("playScreenStream", (data) => {
      console.log(data);
      try {
        getTRTCWebSDK.playScreenVideo({
          view: data.view,
          userId: data.userId,
        });
      } catch (error) {
        console.log(error);
      }
      // console.log("_++++++++++++++++++++++++++++++playScreenStream");
    });
    //收到结束拉取座席端视频共享流通知
    EventUtil.on("stopPutScreenEvent", (data) => {
      try {
        getTRTCWebSDK.stopPlayScreenVideo({
          userId: data.userId,
        });
      } catch (error) {
        console.log(error);
      }
    });
    //收到打开本地录音通知
    EventUtil.on("muteLocalAudio", (flag) => {
      getTRTCWebSDK.muteLocalAudio(!flag);
    });
    //收到关闭本地录音通知
    // EventUtil.on("stopLocalAudio", () => {
    //   getTRTCWebSDK.stopLocalAudio();
    // });
    //收到切换摄像头通知
    EventUtil.on("switchCamera", (flag) => {
      let mode = flag == false ? "environment" : "user";
      getTRTCWebSDK.switchCamera(mode);
    });
    //收到关闭摄像头通知
    EventUtil.on("stopLocalPreview", () => {
      console.log("收到关闭摄像头通知");
      getTRTCWebSDK.muteLocalVideo(true);
    });
    //收到开启摄像头通知
    EventUtil.on("startLocalPreview", () => {
      console.log("收到打开本地摄像头的通知");
      getTRTCWebSDK.muteLocalVideo(false);
    });
    //收到当前用户进入房间成功与否的事件回调
    EventUtil.on("onEnterRoomEvent", async (data) => {
      console.log("进入房间成功了吗", data);
    });
  },

  // async waitOidRegister(FLOWID, roomInfo) {
  //   console.log('waitOidRegister')
  //   return new Promise((resolve) => {
  //     // console.log(getTRTCWebSDK.on)
  //     console.log('-------------------------')
  //     getTRTCWebSDK.on("onOpenWithOid",  () => {
  //       console.log('waitOidRegister ------onOpenWithOid')
  //       resolve();
  //     });
  //   });
  // },
  /**
   * 等待 onOpenWithOid 事件
   */
  async waitOidRegister() {
    console.log("waitOidRegister: 初始化监听 connectionOpened");

    return new Promise((resolve, reject) => {
      // 设置超时机制，例如 10 秒
      const timeout = setTimeout(() => {
        reject(new Error("等待 connectionOpened 事件超时"));
      }, 10000); // 10 秒

      // 使用 `once` 监听事件，只处理一次
      getTRTCWebSDK.on("connectionOpened", (payload) => {
        console.log("waitOidRegister: 收到 connectionOpened 事件");
        clearTimeout(timeout); // 事件触发后清除超时
        resolve(payload);
      });
    });
  },
  async startRecordAudioFrame() {
    await getTRTCWebSDK.startRecordAudioFrame();
  },
  async removeRecordAudioFrame() {
    let res = await getTRTCWebSDK.removeRecordAudioFrame();
    console.log(res);
    return res;
  },
  async mixAudioStreams(viewId) {
    await getTRTCWebSDK.mixAudioStreams(viewId);
  },
  async stopMixVideoStreams(viewId) {
    await getTRTCWebSDK.stopMixVideoStreams(viewId);
  },
  async changeAllCamera() {
    await getTRTCWebSDK.switchAllCamera();
  },
  removeNativeVideoEventListener() {
    console.log("移除所有事件监听");

    // 检查 eventCallbacks 是否初始化
    if (!this.eventCallbacks) {
      console.warn("eventCallbacks 未初始化");
      return;
    }

    Object.keys(this.eventMap).forEach((eventName) => {
      // 获取存储的回调函数
      const callback = this.eventCallbacks.get(eventName);

      if (callback) {
        // 从 TRTCWebSDK 移除事件监听
        getTRTCWebSDK.off(eventName, callback);
        // console.log(`事件 ${eventName} 已从 SDK 移除`);

        // 从 eventCallbacks 中删除回调引用
        this.eventCallbacks.delete(eventName);
      } else {
        // console.warn(`没有找到事件 ${eventName} 的回调函数`);
      }

      // 获取标准事件名称
      const standardEvent = eventName;

      // 从 EventUtil 中移除事件监听
      EventUtil.off(standardEvent);
      // console.log(`事件 ${standardEvent} 已从 EventUtil 移除`);
    });
  },

  removeCustomVideoEventListener() {
    Object.keys(this.eventMap).map((eventName) => {
      EventUtil.off(eventName);
    });
  },
  //根据ABMessage的http地址
  getABMessageHTTPUrl(wsUrl) {
    // 匹配IP地址和端口号的正则表达式
    const pattern = /(wss?|ws):\/\/([\w.-]+)(?::(\d+))?.*/;
    const matches = wsUrl.match(pattern);

    // 提取IP地址和端口号，并组合成字符串
    const ipAddress = matches[2];
    const port = matches[3];
    const ipAddressWithPort = ipAddress + ":" + port;
    return ipAddressWithPort;
  },
  //控制是否播放远端音频流
  muteRemoteAudio(userID, flag) {
    console.log(userID, flag, "控制是否播放远端音频流");
    getTRTCWebSDK.muteRemoteAudio({
      userId: userID,
      mute: flag,
    });
  },
  snapshotVideo() {
    let imgSrc = getTRTCWebSDK.snapshotVideo();
    return imgSrc;
  },
};

const VideoUtil = webTRTC;
export default VideoUtil;
// 测试代码
// VideoUtil.addNativeVideoEventListener();

// // 模拟触发事件
// document.dispatchEvent(new Event('showVideoEvent'));
// document.dispatchEvent(new Event('stopVideoEvent'));

// // 移除监听器
// VideoUtil.removeNativeVideoEventListener();

// // 再次模拟触发事件，应该不会有任何输出
// document.dispatchEvent(new Event('showVideoEvent'));
// document.dispatchEvent(new Event('stopVideoEvent'));
