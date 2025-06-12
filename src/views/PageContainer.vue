<template>
  <div class="pageContainer">
    <video-widgets class="video-widgets" :params="queryParams"
      :evaluateInfo="evaluateInfo"></video-widgets>
  
  </div>
</template>
<script>
import VideoWidgets from "@/components/VideoWidgets";
import VideoUtil from "@/common/util/videoUtil";
import EventUtil from "@/common/util/eventUtil";

export default {
  name: "PageContainer",
  components: {
    VideoWidgets,
  },
  data() {
    return {
      context: {},
      queryParams: {},
      evaluateInfo: {},
      events: {
        OpenPage: undefined,
        holdOn: undefined, //会话保持 视频、语音关闭
        pickUp: undefined, //会话恢复
        onNetworkQuality: undefined, //网络质量的实时统计回调
        Exit: undefined,
      },
    };
  },
  mounted() {
    // let data = {"COMPRATE":"50","PAGENO":"*","RequestTime":"111048","FILEINDXNO":"","OPERPAGE":"ReadHandlerIdNo","MMDATE":"20230809","AGENTFLAG":"0","AGENTID":"82000207","FLOWID":"CreditCardInterview","NODEID":"InformationConfirm","AGENTNAME":"江**","NODENAME":"信息确认","FLOWNAME":"信用卡面签（勿动）测试修改","TASKID":"20230809000000012442","RequestDate":"20230809","ConsumerId":"ycgt","BUSISTEP":"InformationConfirm_1","NOTICESERNO":"0014019499","MMID":"2023080900026435"}
    // this.OpenPageHandler(data)
    this.evaluateInfo = VideoUtil.evaluateInfo;
    this.evaluateInfo.RESERVETYPE = VideoUtil.RESERVETYPE;
    this.queryParams = this.$route.params.params;
    console.log(this.queryParams, "this.queryParams ");
    this.addEventHandlers();
  },
  destroyed() {
    this.removeEventHandlers();
  },
  methods: {
    addEventHandlers() {
      Object.keys(this.events).map((eventName) => {
        this.events[eventName] = this[`${eventName}Handler`].bind(this);
        EventUtil.on(eventName, this.events[eventName]);
      });
      // EventUtil.on("OpenPage", this.OpenPageHandler.bind(this));
      // EventUtil.on("Close", this.CloseHandler.bind(this));
      // EventUtil.on("ShowPercent", this.ShowPercentHandler.bind(this));
      // EventUtil.on("TradeEnd", this.TradeEndHandler.bind(this));
    },
    removeEventHandlers() {
      Object.keys(this.events).map((eventName) => {
        EventUtil.off(eventName, this.events[eventName]);
      });
      // EventUtil.off("OpenPage", this.OpenPageHandler);
      // EventUtil.off("Close", this.CloseHandler);
      // EventUtil.off("ShowPercent", this.ShowPercentHandler);
      // EventUtil.off("TradeEnd", this.TradeEndHandler);
    },
    async holdOnHandler(data) {
      console.log(data, "holdOn");
      document.getElementById("waitMusic").play();
    },
    async pickUpHandler(data) {
      console.log(data, "pickUp");
      document.getElementById("waitMusic").pause();
    },
    async OpenPageHandler(data) {
      this.context = data;
      this.$nextTick(() => {
        this.$refs.transWidgets.openPage();
      });
    },
    async ExitHandler(data) {
      try {
        this.evaluateInfo = data;
      } catch (error) {
        console.log(error);
      }
    },
    async onNetworkQualityHandler(data) {
      console.log(data, "onNetworkQualityHandlerw网络质量");
     },
    async CloseHandler(data) {
      console.log("CloseHandler", data);
      const { ExcpFlag } = data;
      const specialRoutesMap = {
        通用面签: "TransferAcc",
      };
      const RoutesMap = {
        0: specialRoutesMap[this.context.FLOWNAME] || "Evaluate", //正常结束 跳转评价页面
        1: "/", //异常结束 直接挂断
        2: "VideoConnect", //视频转接 跳转转接等待页面
      };
      //转接场景不用终止视频服务
      // ExcpFlag != "2" && VideoUtil.terminate();
      data.AGENTID = this.context.AGENTID;
      data.AGENTNAME = this.context.AGENTNAME;
    },
 
   
  },
};
</script>
<style scoped>
</style>
