<template>
  <div class="videoConnect">
    <div class="accept_title">等待坐席接听</div>
    <div class="middleClass">
      <div class="loading">
        <img src="../assets/time.png" alt="" />
        <div class="time">{{ timeToMS(time) }}</div>
      </div>
      <div class="tipMsg">
        {{ tipMsg }}
      </div>
      <div class="warningStyle">
        <div style="color: #9d9952">
          <img style="height: 3vw;margin-top: 0.7vh;" src="../assets/icon-tipmsgRed.png" alt="" />
          <span style="color: #de0000; margin-left: 2px">温馨提示：</span>
        </div>
        <div><span>1.</span>请确保业务由您本人办理;</div>
        <div><span>2.</span>请尽量确保您的网络信息良好,若通话中断,请您重新呼叫;</div>
        <div><span>3.</span>注意环境安全;防止他人偷窥;不要将短信验证码告知他人;</div>
        <div><span>4.</span><span>为保证您的服务质量,整个服务过程可能会被录像,请知悉。</span></div>
      </div>
    </div>
    <div class="footer">
      <el-button class="buttonStyle" @click="cancelVideo">
        <i class="icon-cancel"></i>
        取消排队
      </el-button>
    </div>
  </div>
</template>
<script>
//
import VideoUtil from "@/common/util/videoUtil";
import EventUtil from "@/common/util/eventUtil";
export default {
  data() {
    return {
      tipMsg: '会话创建成功，请耐心等待坐席进线',
      countUpInterval: null,
      queueData: {
        QUEDATE: "",
        QUEUENO: "",
        QUEUESTATUS: "",
      },
      time: 0,
      isCancel: false,
    };
  },
  async created() {
    this.confirmScene();
  },
  async mounted() {
    this.countUpInterval = setInterval(() => {
      this.time += 1;
    }, 1000);
  },
  destroyed() {
    clearInterval(this.countUpInterval);
    if (!this.isCancel) VideoUtil.terminate();
    this.isCancel = false
  },
  methods: {
    async confirmScene() {
      EventUtil.once("showVideoEvent", (data) => {
        console.log(data, "VideoConnect");
          this.$route.params.params = {
            DeviceType: "online",
            DeviceNum: VideoUtil.userFlag,
            // QUEDATE: this.queueData.QUEDATE,
            // QUEUENO: this.queueData.QUEUENO,
          };
        this.isCancel = true
        this.$router.replace({
          name:  "PageContainer",
          params: this.$route.params,
        });
      });
      EventUtil.once("cancel_video", (data) => {
        this.cancelVideo();
      });
      if (this.$route.params.ExcpFlag == "2") {
        // //人工转接场景不需进线
        // this.tipMsg = "正在为您转接请稍后";
        // this.queueData.QUEDATE = this.$route.params.QUEDATE;
        // this.queueData.QUEUENO = this.$route.params.QUEUENO;
        // this.handleQueueStatus();
      } else {
        //正常交易进线场景
        this.tipMsg = "会话创建成功，请耐心等待坐席进线";
        await this.callTellerAsync(); //发起视频进线
        // VideoUtil.JUDGEFLAG == "NORMAL"  &&this.handleQueueStatus(); //查询队列状态
      }
    },
    // 呼叫柜员
    async callTellerAsync() {
      try {
        this.queueData = await VideoUtil.callTellerAsync(this.$route.params);
      } catch (error) {
        console.error("呼叫失败", error);
      }
    },
    async cancelVideo() {
      this.isCancel = true
      this.$router.back()
      VideoUtil.terminate();
    },
    timeToMS(time) {
      let M = parseInt(time / 60);
      let S = time % 60 < 10 ? "0" + (time % 60) : time % 60;
      return "0" + M + ":" + S;
    },
  },
};
</script>
<style scoped>
.videoConnect {
  height: 100vh;
  width: 100vw;
  background-size: 100% 100%;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.accept_title {
  width: 100%;
  height: 40px;
  background-color: #e84a55;
  color: white;
  text-align: center;
  line-height: 40px;
  font-size: 14px;
}

.middleClass {
  width: 343px;
  height: 50vh;
  background: #ffffff;
  border-radius: 4px 4px 4px 4px;
  opacity: 1;
  margin: 0 auto;
  display: inline-block;
  /* margin-top: -60px; */
}

.v-title {
  width: 375px;
  height: 44px;
  margin: 0 auto;
  /* background: #FFFFFF; */
}

.v-title .title-text {
  margin: 13px;
  width: 72px;
  height: 18px;
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
  line-height: 44px;
  /* margin:  13px auto; */
}

.icon-cancel {
  /* width: 32px; */
  background: url("../assets/7@2x.png") center no-repeat;
  background-size: cover;
  /* color: #fff; */
  font-size: 16px;
}

.icon-cancel:before {
  /* width: 32px; */
  content: "替";
  font-size: 16px;
  visibility: hidden;
}

.icon-cancel {
  /* width: 32px; */
  font-size: 16px;
}

.icon-cancel:before {
  content: "\e611\e611";
}

.introduce {
  height: 162px;
  margin-top: 5px;
}

.introduce_title p {
  display: flex;
  margin-left: 60px;
  font-size: 18px;
  font-weight: bold;
  color: #11bdc4;
}

.introduce_title span {
  display: flex;
  margin-left: 60px;
  margin-top: 10px;
  font-size: 12px;
  width: 122px;
  height: 54px;
  font-weight: 400;
  color: #000000;
  line-height: 20px;
}

.buttonStyle {
  margin-top: 80px;
  /* position: relative; */
  /* bottom: 50px; */
  width: 343px;
  height: 48px;
  background: #e84a55;
  /* line-height: 52px; */
  /* background: #ffffff; */
  border-radius: 4px 4px 4px 4px;
  opacity: 1;
  border: 0px solid #00b6bf;
  color: #fff;
}

.time {
  position: relative;
  bottom: 110px;
  /* width: 80px; */
  height: 30px;
  font-size: 30px;
  font-weight: bold;
  color: #000000;
  /* border:0; */
}

.tipMsg {
  width: 292px;
  height: 22px;
  font-size: 18px;
  font-weight: 500;
  color: #000000;
  margin: 8px auto;
}

.tipMsgOther {
  width: 200px;
  height: 12px;
  font-size: 12px;
  margin: 0px auto;
  margin-bottom: 60px;
  /* font-weight: 500; */
}

.warningStyle {
  /* background-color: rgba(170, 204, 204, 0.5); */
  /* padding: 10px; */
  height: 128px;
  margin: 16px;
  text-align: left;
  font-size: 12px;
  line-height: 22px;

  /* flex-direction: row; */
}

.warningStyle div {
  display: flex;
}

.warningStyle span {
  display: inline-block;
}



.loading {
  height: 162px;
  margin-top: 24px;
}

.footer {
  margin-top: 12px;
}

.noticeMsg {
  width: 310px;
  height: 100px;
  font-size: 14px;
  font-weight: 400;
  color: #192433;
  line-height: 24px;
  text-align: left;
  padding: 16px;
  background: transparent;
  margin-bottom: 20px;
}

.waitMsg {
  width: 310px;
  height: 100px;
  font-size: 14px;
  font-weight: 400;
  color: #192433;
  line-height: 60px;
  text-align: center;
  padding: 16px;
  background: transparent;
}

.img_status {
  width: 199px;
  /* height: 80px; */
  margin-top: 40px;
}

.trade_status {
  width: 180px;
  height: 20px;
  font-size: 20px;
  font-weight: 500;
  color: #000000;
  line-height: 22px;
  margin-top: 20px;
  margin-bottom: 40px;
}

.trans-index {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
<style>
.van-dialog__header {
  height: 40px;
  padding-top: 0px;
  font-weight: 500;
  line-height: 40px;
  text-align: center;
  border-bottom: 1px solid #bbbbbb;
}

.noticeClass .van-dialog {
  /* height: 400px; */
  /* background: url("../assets/dialog_background.png") no-repeat; */
  background-position: 50% 25%;
  background-size: cover;
}

.van-dialog {
  border-radius: 8px;
}

.van-dialog__footer {
  border: 1px solid #ccc;
}

.van-dialog__cancel {
  background-color: #ffffff;
  color: black;
  border-right: 1px solid #ccc;
}

.van-dialog__confirm {
  background-color: #ffffff;
  color: #e84a55;
}

.el-message-box {
  width: 92% !important;
}

.el-button--small {
  width: 40%;
  padding: 10px;
}

.el-message-box__btns {
  padding: 5px 0;
}

.confirmButtonClass.el-button--primary {
  background-color: #ffffff;
  color: #e84a55;
  border: none;
  width: 100%;
  height: 5vh;
  font-size: 16px;
  line-height: 4vh;
  position: relative;
  top: 3vh;
  border-top: 1px solid #ccc;
}

.cancelButtonClass {
  color: black;
  background-color: #ffffff;
  /* border: 1px solid #e84a55; */
}
</style>
