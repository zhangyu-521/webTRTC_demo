<template>
  <div>
    <div class="videoContainer">
      <!-- 本地视频窗口 -->
      <div class="container cid_1 my-view" id="my-view" v-drag></div>
      <!--远程坐席视频窗口 -->
      <div
        class="container cid_2 remote-view1"
        id="remote-view1"
        :data-component-userid="remoteUserID"
        @click.stop="remoteView1Action"
      ></div>
      <!--坐席端投屏视频显示窗口 -->
      <div
        class="container cid_4 screen-view"
        v-show="screenViews"
        id="screenView"
        @click.stop="screenViewAction"
      ></div>

      <!-- 音视频开关切换按钮窗口 -->
      <button-page
        v-if="showButtonFlag"
        class="button-page"
        @closeVideo="closeVideo"
      ></button-page>
      <!-- <div style="position: absolute; top: 0">
        <el-button type="primary" size="mini" @click="getVideoSnapshot"
          >截取视频流</el-button
        >

        <el-button type="primary" @click="startPlayScreen"
          >开始播放桌面流</el-button
        >
        <el-button type="primary" @click="stopPlayScreen"
          >停止播放桌面流</el-button
        >
        <el-button @click="changeCamera">循环切换摄像头</el-button>
        <el-select
          v-model="value"
          placeholder="请选择"
          @change="changeFillMode"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <div>
          <ASR></ASR>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
import VideoUtil from "@/common/util/videoUtil";
import EventUtil from "@/common/util/eventUtil";
import ButtonPage from "@/components/ButtonPage";

export default {
  name: "video-widgets",
  components: { ButtonPage },
  props: ["params"],
  // 自定义指令 —— 拖动div
  directives: {
    drag(el) {
      let oDiv = el; // 当前元素
      // let self = this // 上下文
      // 禁止选择网页上的文字
      document.onselectstart = function () {
        return false;
      };
      oDiv.ontouchstart = function (e) {
        // 鼠标按下，计算当前元素距离可视区的距离
        let disX = e.changedTouches[0].clientX - oDiv.offsetLeft;
        let disY = e.changedTouches[0].clientY - oDiv.offsetTop;
        document.ontouchmove = function (e) {
          // 通过事件委托，计算移动的距离
          let l = e.changedTouches[0].clientX - disX;
          let t = e.changedTouches[0].clientY - disY;
          // 移动当前元素
          oDiv.style.left = l + "px";
          oDiv.style.top = t + "px";
        };
        document.ontouchend = function (e) {
          document.ontouchmove = null;
          document.ontouchend = null;
        };
        // return false不加的话可能导致黏连，就是拖到一个地方时div粘在鼠标上不下来，相当于onmouseup失效
        return false;
      };
    },
  },
  destroyed() {
    VideoUtil.terminate();
  },
  data() {
    return {
      options: [
        {
          value: "contain",
          label: "contain",
        },
        {
          value: "cover",
          label: "cover",
        },
        {
          value: "fill",
          label: "fill",
        },
      ],
      value: "",
      remoteUserID: "",
      screenViews: false,
      showButtonFlag: true,
      events: {
        showVideoEvent: undefined,
        putScreenEvent: undefined,
        stopPutScreenEvent: undefined,
        trtcNetworkQuality: undefined, //网络质量的实时统计回调
        stopVideoEvent: undefined,
        remoteUserPublished: undefined,
      },
      removeUserID: "",
      addUserID: "",
      remoteEvent: undefined,
      activeFlag: false,
      videoEle: null,
      isCancel: false,
      currentStream: null,
      audioContext: null,
    };
  },
  async mounted() {
    this.remoteUserID = JSON.parse(VideoUtil.videoParams.useridlist).filter(
      (val) => val != VideoUtil.userId
    )[0];
    console.log(this.remoteUserID, "坐席ID");
    VideoUtil.startVideoAsync("container");
    this.addEventHandlers();
  },
  watch: {},
  destroyed() {
    this.remoteUserID = "";
    this.addUserID = "";
    this.removeEventHandlers();
    if (!this.isCancel) VideoUtil.terminate();
    this.isCancel = false;
    this.activeFlag = false;
  },
  methods: {
    getVideoSnapshot() {
      VideoUtil.getVideoSnapshot(this.remoteUserID);
    },
    async startPlayScreen() {
      const data = {
        view: "screenView",
        userId: this.remoteUserID,
      };
      this.screenViews = true;
      EventUtil.emit("playScreenStream", data);
    },
    async stopPlayScreen() {
      EventUtil.emit("stopPutScreenEvent", { userId: this.remoteUserID });
      this.screenViews = false;
    },
    async changeCamera() {
      await VideoUtil.changeAllCamera();
    },
    async changeFillMode(val) {
      console.log(val);
      if (val) await VideoUtil.changeFillMode(val);
      if (val) this.$forceUpdate();
    },
    //旋转方法    旋转图片 src 为路径 edg 是旋转度数
    rotateBase64Img(src, edg) {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let imgW; // 图片宽度
        let imgH; // 图片高度
        let size; // canvas初始大小
        if (edg % 90 !== 0) {
          console.error("旋转角度必须是90的倍数!");
          reject("旋转角度必须是90的倍数!");
        }
        edg < 0 && (edg = (edg % 360) + 360);
        const quadrant = (edg / 90) % 4; // 旋转象限
        const cutCoor = { sx: 0, sy: 0, ex: 0, ey: 0 }; // 裁剪坐标
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = src;
        image.onload = function () {
          console.log("加载了");
          imgW = image.width;
          imgH = image.height;
          size = imgW > imgH ? imgW : imgH;
          canvas.width = size * 2;
          canvas.height = size * 2;
          switch (quadrant) {
            case 0:
              cutCoor.sx = size;
              cutCoor.sy = size;
              cutCoor.ex = size + imgW;
              cutCoor.ey = size + imgH;
              break;
            case 1:
              cutCoor.sx = size - imgH;
              cutCoor.sy = size;
              cutCoor.ex = size;
              cutCoor.ey = size + imgW;
              break;
            case 2:
              cutCoor.sx = size - imgW;
              cutCoor.sy = size - imgH;
              cutCoor.ex = size;
              cutCoor.ey = size;
              break;
            case 3:
              cutCoor.sx = size;
              cutCoor.sy = size - imgW;
              cutCoor.ex = size + imgH;
              cutCoor.ey = size + imgW;
              break;
          }
          ctx?.translate(size, size);
          ctx?.rotate((edg * Math.PI) / 180);
          // drawImage向画布上绘制图片
          ctx?.drawImage(image, 0, 0);
          // getImageData() 复制画布上指定矩形的像素数据
          const imgData = ctx?.getImageData(
            cutCoor.sx,
            cutCoor.sy,
            cutCoor.ex,
            cutCoor.ey
          );
          if (quadrant % 2 == 0) {
            canvas.width = imgW;
            canvas.height = imgH;
          } else {
            canvas.width = imgH;
            canvas.height = imgW;
          }
          // putImageData() 将图像数据放回画布
          ctx?.putImageData(imgData, 0, 0);
          const newBase64Str = canvas.toDataURL("image/jpeg", 1.0);
          // console.log('newBase64Str----', newBase64Str)
          resolve(newBase64Str);
        };
      });
    },
    stopVideoEventHandler(data) {
      this.isCancel = true;
      VideoUtil.terminate();
      this.$router
        .push({
          name: "Home",
          query: { ...this.$route.query }, // 复制当前的查询参数
        })
        .catch((err) => {
          console.log(err);
        });
    },
    addEventHandlers() {
      Object.keys(this.events).map((eventName) => {
        this.events[eventName] = this[`${eventName}Handler`].bind(this);
        EventUtil.on(eventName, this.events[eventName]);
      });
    },
    removeEventHandlers() {
      Object.keys(this.events).map((eventName) => {
        EventUtil.off(eventName, this.events[eventName]);
      });
    },
    //监听show_video指令推送，如：三方专家等
    async showVideoEventHandler(data) {
      let params = eval("(" + data + ")");
      if (params.useridlist.length == "3") {
      } else {
      }
    },
    remoteUserPublishedHandler(data) {
      if (
        data.isPublish == true &&
        data.userId != this.remoteUserID &&
        data.userId != VideoUtil.userId
      ) {
        this.isShowMCC && (this.addUserID = data.userId); //多人会议场景
      }
      if (
        data.isPublish == false &&
        data.userId != this.remoteUserID &&
        data.userId != VideoUtil.userId
      ) {
        this.isShowMCC && (this.removeUserID = data.userId); //多人会议场景
      }
      if (data.userId == this.remoteUserID && data.streamType == "main") {
        VideoUtil.insertNativeComponents("remote-view1", data.userId);
      }
    },

    async putScreenEventHandler() {
      this.screenViews = true;
      EventUtil.emit("playScreenStream");
      await VideoUtil.insertNativeComponents("screenView", "auxiliary");
    },
    stopPutScreenEventHandler() {
      this.screenViews = false;
    },
    trtcNetworkQualityHandler(data) {
      console.log("网络质量trtcNetworkQualityHandler", data)
      // downlinkNetworkQuality 上传本地流的网络情况
      // uplinkNetworkQuality 下载所有流的平均网络情况
      // uplinkRTT，uplinkLoss 为上行 RTT(ms)及上行丢包率。
      // downlinkRTT，downlinkLoss 为所有下行连接的平均 RTT(ms)及平均丢包率
      if (data.downlinkNetworkQuality > 4 || data.downlinkNetworkQuality == 0) {
        console.log('进来了downlinkNetworkQuality')
        const qualityDesc = this.getNetworkQualityDescription(data.downlinkNetworkQuality);
        this.showMessage('坐席', qualityDesc);
      }

      if (data.uplinkNetworkQuality > 4 || data.uplinkNetworkQuality == 0) {
        console.log('进来了uplinkNetworkQuality')
        const qualityDesc = this.getNetworkQualityDescription(data.uplinkNetworkQuality);
        this.showMessage('您的', qualityDesc);
      }
    },
    // stream_subscribedHandler(event) {
    //   const { stream: remoteStream } = event;
    //   let remoteViewID = "";
    //   const remoteUserId = remoteStream.getUserId();
    //   remoteViewID =
    //     remoteUserId == this.remoteUserID ? "remote-view1" : remoteUserId;
    //   console.log(remoteUserId, "remoteUserId");
    //   const data = { remoteViewID, event };
    //   const shouldEmitEvent = remoteUserId === this.remoteUserID;
    //   if (shouldEmitEvent) {
    //     EventUtil.emit("remotePlay", data);
    //   }
    // },
    getUserType(userId) {
      if (userId == VideoUtil.userId) {
        return "客户";
      } else if (userId == this.remoteUserID) {
        return "坐席";
      }
    },
    getNetworkQualityDescription(quality) {
      console.log('quality11111', quality)
      const networkQualityMap = {
        0: "网络状况未知，表示当前 client 实例还没有建立上行/下行连接",
        1: "非常好",
        2: "比较好",
        3: "一般",
        4: "较差",
        5: "很差",
        6: "不满足视频要求",
        7: "断开",
      };
      return networkQualityMap[quality];
    },
    showMessage(user, qualityDesc) {
      console.log('showMessage', user, qualityDesc)
      this.$message.error(`当前${user}网络质量${qualityDesc}`);
    },
    //点击投屏窗口触发
    screenViewAction(e) {
      this.showButtonFlag = !this.showButtonFlag;
    },
    //点击远程视频窗口1触发
    remoteView1Action(e) {
      this.showButtonFlag = !this.showButtonFlag;
    },
    //客户主动挂断=退出房间+断开长🔗
    closeVideo() {
      this.activeFlag = true;
      this.isCancel = true;
      EventUtil.emit("stopVideoEvent");
      VideoUtil.terminate();
      this.$router
        .push({
          path: "/",
          query: { ...this.$route.query }, // 复制当前的查询参数
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>

<style scoped>
.videoContainer {
  height: 100vh;
  width: 100vw;
  padding: 0;
}

.container {
  /* insert WKChildView in WKWebView */
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
}

.my-view {
  position: absolute;
  top: 1px;
  right: 6px;
  width: 135px;
  height: 180px;
  z-index: 3;
  /* width: 90px;
  height: 157px; */
  border-radius: 8px 8px 8px 8px;
  opacity: 1;
  border: 1px solid #ffffff;
}

.remote-view1 {
  /* position: absolute; */
  width: 100vw;
  height: 100vh;
  background-color: #898282;
  /* background-image: url(../assets/readyface.gif);
  background-repeat: no-repeat; */
}

.screen-view {
  position: absolute;
  top: 0;
  /* left: 30px; */
  width: 100%;
  height: 100%;
  z-index: 0;
}

.button-page {
  position: absolute;
  bottom: 130px;
  left: 5px;
  right: 5px;
  height: 36px;
  z-index: 6;
  background: transparent;
}

.btn {
  position: absolute;
  bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  z-index: 9999;
}
</style>
