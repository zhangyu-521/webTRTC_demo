<template>
  <div>
    <van-grid :border="false" :column-num="3">
      <van-grid-item v-if="muteIsShow" @click="muteManage('open')">
        <img src="../assets/icon-mute.png" alt="" />
        <span class="iconText">静音</span>
      </van-grid-item>
      <van-grid-item v-else @click="muteManage('close')">
        <img src="../assets/icon-microphone.png" alt="" />
        <span class="iconText">麦克风开启</span>
      </van-grid-item>
      <van-grid-item @click="closeVideo">
        <img src="../assets/icon-stop-mini.png" alt="" />
        <span class="iconText">挂断</span>
      </van-grid-item>
      <van-grid-item @click="showMore">
        <img src="../assets/icon-more.png" alt="" />
        <span class="iconText">更多</span>
      </van-grid-item>
      <!-- <van-grid-item  v-if="cameraIsShow">
    <img  src="../assets/icon-openCamera.png"  @click="manageCamera('close')" alt=""/>
    <span class="iconText">摄像头已开</span>
  </van-grid-item>
  <van-grid-item v-else>
    <img  src="../assets/icon-openCamera.png"  @click="manageCamera('open')" alt=""/>
    <span class="iconText">摄像头已关</span>
  </van-grid-item>
</van-grid>
<van-grid  :border="false" :column-num="2">
  <van-grid-item  v-if="allShow" >
    <img  src="../assets/icon-start.png"  @click="manageAll('close')" alt=""/>
    <span class="iconText">暂停</span>
  </van-grid-item>
  <van-grid-item v-else >
    <img  src="../assets/icon-pause.png"  @click="manageAll('open')" alt=""/>
    <span class="iconText">开启</span>
  </van-grid-item>
  <van-grid-item  @click="switchCamera">
    <img src="../assets/icon-switchCamera.png" alt=""/>
    <span class="iconText">切换镜头</span>
  </van-grid-item> -->
    </van-grid>

    <van-popup
      v-model="showAllButton"
      position="bottom"
      :style="{ height: '33%', background: 'rgba(0,0,0,0.7)' }"
    >
      <van-grid
        style="margin-top: 10px; width: 100vw"
        :border="false"
        :column-num="4"
      >
        <van-grid-item v-if="cameraIsShow">
          <img
            src="../assets/icon-openCamera.png"
            @click="manageCamera('close')"
            alt=""
          />
          <span class="iconText">开启摄像头</span>
        </van-grid-item>
        <van-grid-item v-else>
          <img
            src="../assets/icon-closeCamera.png"
            @click="manageCamera('open')"
            alt=""
          />
          <span class="iconText">关闭摄像头</span>
        </van-grid-item>
        <van-grid-item v-if="allShow">
          <img
            src="../assets/icon-start.png"
            @click="manageAll('close')"
            alt=""
          />
          <span class="iconText">暂停</span>
        </van-grid-item>
        <van-grid-item v-else>
          <img
            src="../assets/icon-pause.png"
            @click="manageAll('open')"
            alt=""
          />
          <span class="iconText">开启</span>
        </van-grid-item>
        <van-grid-item @click="switchCamera">
          <img src="../assets/icon-switchCamera.png" alt="" />
          <span class="iconText">转换镜头</span>
        </van-grid-item>
      </van-grid>
      <div class="buttons" style="width: 100vw">
        <el-button @click="closePopup">取 消</el-button>
      </div>
    </van-popup>
  </div>
</template>
<script>
import EventUtil from "@/common/util/eventUtil";

export default {
  data() {
    return {
      showAllButton: false,
      allShow: true,
      cameraIsShow: true,
      muteIsShow: false,
      // cameraIshow: "font",
      isFrontCamera: true,
      audioTitle: "麦克风已开启",
      videoTitle: "关闭摄像头",
      cameraTitle: "后置摄像头",
    };
  },
  destroyed() {
    console.log(this.isFrontCamera, "this.isFrontCamera");
    this.isFrontCamera = true;
  },
  methods: {
    closePopup() {
      this.showAllButton = false;
    },
    showMore() {
      this.showAllButton = true;
    },
    manageAll(flag) {
      if (flag == "open") {
        EventUtil.emit("startLocalPreview");
        EventUtil.emit("muteLocalAudio", true);
        this.allShow = true;
      } else {
        EventUtil.emit("stopLocalPreview");
        EventUtil.emit("muteLocalAudio", false);
        this.allShow = false;
      }
    },
    manageCamera(flag) {
      if (flag == "open") {
        EventUtil.emit("startLocalPreview");
        this.cameraIsShow = true;
      } else {
        EventUtil.emit("stopLocalPreview");
        this.cameraIsShow = false;
      }
    },
    muteManage(flag) {
      if (flag == "open") {
        EventUtil.emit("muteLocalAudio", true);
        this.muteIsShow = false;
      } else {
        EventUtil.emit("muteLocalAudio", false);
        this.muteIsShow = true;
      }
    },
    closeVideo() {
      this.$emit("closeVideo");
    },
    switchCamera() {
      console.log("switchCamera----------", this.isFrontCamera);
      EventUtil.emit("switchCamera", !this.isFrontCamera);
      if (this.isFrontCamera) {
        this.cameraTitle = "后置摄像头";
      } else {
        this.cameraTitle = "前置摄像头";
      }
      this.isFrontCamera = !this.isFrontCamera;
      console.log(this.cameraTitle, "this.cameraTitle ");
    },
  },
};
</script>
<style>
.button-page .van-grid-item__content {
  background: transparent;
}
</style>
<style scoped>
.iconText {
  font-size: 14px;
  color: #fff;
}

.buttons .el-button {
  margin-top: 3vh;
  /* width: 323px;
  height: 45px;
  background: linear-gradient(90deg, #69dfdd 0%, #00b6bf 100%);
  border-radius: 23px 23px 23px 23px;
  font-size: 18px;
  font-weight: 500;
  color: #ffffff; */
  font-size: 18px;
  border: 0;
  height: 48px;
  background: #e1b77e;
  color: #fff;
  border-radius: 24px;
  width: 90%;
}
</style>
