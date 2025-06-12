<!--
 * @Author: 陈均 chenjun8@yusys.com.cn
 * @Date: 2024-12-16 10:26:34
 * @LastEditors: 陈均 chenjun8@yusys.com.cn
 * @LastEditTime: 2024-12-21 12:19:19
 * @FilePath: /yumc-credit-applet/src/pages//index.vue
 * @Description:视频双录-排队等待页面
-->
<template>
  <div class="doubleRecord-waiting-page">
    <!-- 顶部title -->
    <div class="doubleRecord-waiting-page-accept-title">等待坐席接听</div>
    <!-- 倒计时排队 -->
    <div class="doubleRecord-waiting-page-middleClass">
      <div class="doubleRecord-waiting-page-middleClass-loading">
        <img
          class="doubleRecord-waiting-page-middleClass-loading-img"
          src="@/assets/time.png"
          alt=""
        />
        <div class="doubleRecord-waiting-page-middleClass-loading-time">
          {{ timeToMS(time) }}
        </div>
      </div>
      <div
        class="doubleRecord-waiting-page-middleClass-loading-tips"
        v-if="queueNum !== undefined"
      >
        您前面还有<span
          class="doubleRecord-waiting-page-middleClass-loading-num"
          >{{ queueNum }}</span
        >位客户，预计需要等待<span class="num-time">{{ queueNum }}</span
        >分钟
      </div>
      <!-- 温馨提示 -->
      <div class="doubleRecord-waiting-page-middleClass-warningStyle">
        <div class="doubleRecord-waiting-page-middleClass-warningStyle-tips">
          <img src="@/assets/icon-tipmsgRed.png" alt="" />
          <span>温馨提示：</span>
        </div>
        <div><span>1.</span>请确保业务由您本人办理;</div>
        <div>
          <span>2.</span>请尽量确保您的网络信息良好,若通话中断,请您重新呼叫;
        </div>
        <div>
          <span>3.</span>注意环境安全;防止他人偷窥;不要将短信验证码告知他人;
        </div>
        <div>
          <span>4.</span
          ><span>为保证您的服务质量,整个服务过程可能会被录像,请知悉。</span>
        </div>
      </div>
    </div>
    <!-- 底部挂断按钮 -->
    <div class="doubleRecord-waiting-page-footer" v-if="queueNum !== undefined">
      <el-button
        class="doubleRecord-waiting-page-footer-buttonStyle"
        @click="cancelVideo"
      >
        取消排队
      </el-button>
    </div>
  </div>
</template>
<script>
import VideoUtil from "@/common/util/videoUtil";
import EventUtil from "@/common/util/eventUtil";
import { RequestQueueQuery, RequestCancelVideo } from "@/common/api/api";
// import { Toast } from "vant";
export default {
  data() {
    return {
      queueNum: undefined, //当前前面有多少人排队
      countUpInterval: null,
      intervalId: null,
      queueData: {
        QUEDATE: "",
        QUEUENO: "",
        QUEUESTATUS: "",
      },
      time: 0,
      isCancel: false,
      params: null,
    };
  },
  async created() {
    this.params = this.$route.params;
  },
  async mounted() {
    // 初始化TRTC
    await this.queuePolling();
    await this.callTellerAsync(this.$route.params);

    this.countUpInterval = setInterval(() => {
      this.time += 1;
    }, 1000);
  },
  destroyed() {
    clearInterval(this.countUpInterval);
    if (!this.isCancel) VideoUtil.terminate();
    this.isCancel = false;
  },
  methods: {
    // 监听事件
    startEventListener() {
      console.log("-------------开启监听事件-------------------");

      EventUtil.on("showVideoEvent", (data) => {
        console.log("show_video------->", data);
        this.isCancel = true;
        clearInterval(this.intervalId);
        this.$router.replace({
          name: "PageContainer",
          params: this.$route.params,
          query: { ...this.$route.query },
        });
      });
      
      EventUtil.once("cancel_video", async (data) => {
        await this.cancelVideo();
      });
    },
    // 查询队列轮询
    async queuePolling() {
      // 设置定时器，每隔5秒 查询当前队列
      this.intervalId = setInterval(async () => {
        console.log("定时器");
        if (this.queueNum > 0) {
          console.log("正在轮询");
          await this.queryQueue();
        }
      }, 5000);
    },


    // 排队查询

    async queryQueue() {
      const { QUERYNUM, QUEUESTATUS } = await RequestQueueQuery({
        DeviceType: "online",
        DeviceNum: this.$route.params.PHONENO,
        ASS_AGENTID: this.$route.params.ASS_AGENTID,
        QUEDATE: this.queueData.QUEDATE, // 排队日期
        QUEUENO: this.queueData.QUEUENO, // 排队号
      });
      console.log("QUERYNUM====>", QUERYNUM);
      this.queueNum = QUERYNUM;
      if (QUEUESTATUS == undefined) {
        setTimeout(async () => {
          await this.cancelVideo();
        }, 2000);
        console.log("指定坐席不在线:------->", QUERYNUM, QUEUESTATUS);
      }
      if (QUEUESTATUS === "4") {
        setTimeout(async () => {
          await this.cancelVideo();
        }, 2000);
        this.$message.error("暂无客服接入,请稍后再试");
      }
      console.log("查询排队信息:------->", QUERYNUM, QUEUESTATUS);
    },
    //呼叫柜员
    async callTellerAsync(data) {
      try {
        //开启事件监听
        this.startEventListener();
        //初始化sdk
        this.queueData = await VideoUtil.callTellerAsync(data);
        console.log("视频进线返回：", this.queueData);
        // 排队信息轮询
        await this.queryQueue();
      } catch (error) {
        console.error("呼叫失败", error);
      }
    },

    async cancelVideo() {
      if (this.intervalId !== null) {
        clearInterval(this.intervalId);
      }

      this.queueData.QUEUENO &&
        (await RequestCancelVideo({
          APPID: "APP001",
          DeviceType: "online",
          QUEDATE: this.queueData.QUEDATE,
          QUEUENO: this.queueData.QUEUENO,
          DeviceNum: VideoUtil.userFlag,
        }));

      this.$router.back();
      VideoUtil.terminate();
      this.$router.back();
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
.doubleRecord-waiting-page {
  height: 100vh;
  width: 100vw;
  background-size: 100% 100%;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.doubleRecord-waiting-page-accept-title {
  width: 100%;
  height: 64px;
  background-color: #e1b77e;
  color: white;
  text-align: center;
  line-height: 64px;
  font-weight: 500;
  font-size: 16px;
}

.doubleRecord-waiting-page-middleClass {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 4px;
  opacity: 1;
  margin: 0 auto;
  display: inline-block;
}

.doubleRecord-waiting-page-middleClass-warningStyle {
  /* background-color: rgba(170, 204, 204, 0.5); */
  /* padding: 10px; */
  height: 128px;
  margin: 20px;
  text-align: left;
  font-size: 12px;
  line-height: 22px;
}

.doubleRecord-waiting-page-middleClass-warningStyle-tips {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  color: #e84a55;
}

.doubleRecord-waiting-page-middleClass-warningStyle-tips span {
  margin-left: 3px;
}

.doubleRecord-waiting-page-middleClass-loading {
  height: 162px;
  margin-top: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.doubleRecord-waiting-page-middleClass-loading-img {
  display: flex;
  justify-content: center;
  align-items: center;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.doubleRecord-waiting-page-middleClass-loading-time {
  position: absolute;
  bottom: 66px;
  /* width: 80px; */
  height: 30px;
  font-size: 30px;
  font-weight: bold;
  color: #000000;
}

.doubleRecord-waiting-page-middleClass-loading-tips {
  font-size: 18px;
  font-weight: 500;
  color: #000000;
  margin: 10px 20px;
}

.doubleRecord-waiting-page-middleClass-loading-tips span {
  color: #e84a55;
  font-size: 28px;
  margin: 0 6px;
}

.doubleRecord-waiting-page-middleClass-loading-tips .num-time {
  color: #333333;
  margin: 0 6px;
}

.doubleRecord-waiting-page-footer {
  background-color: white;
  height: 89px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 30px;
}

.doubleRecord-waiting-page-footer-buttonStyle {
  height: 48px;
  background: #e1b77e;
  color: #fff;
  border-radius: 24px;
  width: 100%;
  /* line-height: 48px; */
}
</style>
