<!-- 场景路由首页 -->
<template>
  <div class="home">
    <div class="introduce">
      <img src="../assets/card@2x.png" width="100%" />
      <button
        button
        class="buttonStyle"
        @click="chooseFlowID"
        :disabled="!tokenValidity"
      >
        点击呼叫远程坐席
      </button>
    </div>
    <!-- <el-row>
      <el-col :span="6">房间号</el-col>
      <el-col :span="16">
        <el-input v-model="userData.roomid" placeholder="房间号"></el-input>
      </el-col>
      <el-col :span="6">坐席号</el-col>
      <el-col :span="16">
        <el-input v-model="userData.AGENTID" placeholder="坐席号"></el-input>
      </el-col>
    </el-row> -->

    <el-dialog
      slot="title"
      top="30vh"
      :visible.sync="dialogVisible"
      :center="true"
    >
      <span slot="title" class="dialog_header">
        <img
          src="../assets/icon-tipmsg1.png"
          style="width: 67px; height: 25px"
        />
        <div>
          <span>温馨提示</span>
        </div>
      </span>
      <div>
        <div class="dialog-text">
          <span
            >目前仅提供列表范围中的业务办理，业务咨询类服务请联系您的专属客户经理联委或致电021-61683366！</span
          >
        </div>
        <el-row>
          <el-col :span="3">
            <el-checkbox v-model="protocolAgreed"> </el-checkbox>
          </el-col>
          <el-col :span="21">
            <span style="font-size: 12px; text-align: left; margin-left: -20px">
              我已阅读并同意
              <a href="">《云网点服务须知》</a>和
              <a href="">《人脸识别服务授权书》</a>
            </span>
          </el-col>
        </el-row>
      </div>
      <span class="dialog-footer">
        <el-button
          class="buttonStyle"
          :disabled="!protocolAgreed || !tokenValidity"
          @click="chooseFlowID('')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { RequestTokenValidity } from "@/common/api/api";
import { sm4Decrypt } from "@/common/util/crypto";
import VideoUtil from "@/common/util/videoUtil";

export default {
  name: "Home",
  data() {
    return {
      tokenValidity: false,
      dialogVisible: false,
      protocolAgreed: false,
      userData: {},
    };
  },
  async mounted() {
    const result = await this.getQueryParams();
    console.log("result", result);
  },
  methods: {
    /**
     * 获取当前页面URL的查询参数并解析为对象
     * @returns {Object} 查询参数对象
     */
    async getQueryParams() {
 
      const hash = window.location.hash; 
      const questionMarkIndex = hash.indexOf("?");

      if (questionMarkIndex === -1) {
        this.$message.error("URL中没有查询参数。");
        console.warn("URL中没有查询参数。");
        return;
      }

      const queryString = hash.substring(questionMarkIndex + 1);

      // 使用URLSearchParams解析查询参数
      const params = new URLSearchParams(queryString);

      // 转换为普通对象
      let queryParams = {};
      for (const [key, value] of params.entries()) {
        queryParams[key] = value;
      }
      console.log("queryParams", queryParams);
      queryParams = sm4Decrypt(queryParams.message)
      queryParams = JSON.parse(queryParams)
      console.log("查询参数：", queryParams);
      const { PHONENO } = queryParams;
      if (!PHONENO) {
        this.$message.error("随录数据缺少手机号");
        return;
      }
      this.userData = queryParams;
      VideoUtil.queryParams = queryParams;
      await this.queryToken(queryParams);
    },
    /**
     * 检查Token的时效性
     */
    async queryToken({ token }) {
      if (!token) {
        this.$message.error("没有提供Token进行验证。");

        console.warn("没有提供Token进行验证。");
        return false;
      }
      try {
        const response = await RequestTokenValidity({
          token,
        });
        console.log("验证token的时效性返回结果：", response);
        if (response&&response.status=="0") {
          this.tokenValidity = true;
          return true;
        } else {
          this.tokenValidity = false;
          this.$message.error(response.retMessage);
          console.warn(response.retMessage);
          return false;
        }
      } catch (error) {
        console.error("验证token的时效性返回结果失败了，报错：", error);
      }
    },
    goBack() {
      this.$router.back();
    },
    chooseFlowID(flowId) {
      console.log("=====", this.$route.query);
      console.log(this.userData)
      this.$router.push({
        name: "VideoConnect",
        params: this.userData,
        query: { ...this.$route.query },
      });
      // }
    },
  },
};
</script>
<style scoped>
.home {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  background: #fff;
}

.home-title > img {
  position: relative;
  top: 5px;
  right: 33%;
}

.introduce {
  margin-top: 30px;
  margin-bottom: 300px;
  /* width: 343px; */
  height: 167px;
  /* background: linear-gradient(320deg, #A7F5F3 0%, #FFFFFF 100%); */
  /* box-shadow: 0px 3px 6px 1px rgba(0,0,0,0.16); */
  /* border-radius: 8px 8px 8px 8px; */
  /* opacity: 1; */
}

.buttonStyle {
  margin-top: 180px;
  /* margin-top: 30px; */
  /* position: relative; */
  /* bottom: 50px; */
  /* line-height: 52px; */
  /* background: #ffffff; */
  border-radius: 4px 4px 4px 4px;
  opacity: 1;
  color: #fff;
  border: 0;
  height: 48px;
  background: #e1b77e;
  color: #fff;
  border-radius: 24px;
  width: 90%;
}
.buttonStyle:disabled {
  background: #ecd7b9;
  cursor: not-allowed;
  opacity: 0.7;
}
/* 禁用按钮悬停时显示禁用图标 */

/* 启用按钮的悬停效果 */

.el-row {
  margin-left: 0;
}

.el-col {
  margin-bottom: 1vh;
}

.home /deep/.el-dialog {
  width: 355px;
  height: 343px;
  background: #ffffff;
  border-radius: 16px 16px 16px 16px;
  opacity: 1;
}

.dialog-text {
  width: 323px;
  height: 116px;
  background: #f6f7fa;
  border-radius: 8px 8px 8px 8px;
  opacity: 1;
  padding: 26px 29px 28px;
  margin-bottom: 20px;
}

.dialog-text > span {
  width: 266px;
  height: 64px;
  font-size: 14px;
  font-weight: 400;
  color: #666666;
  line-height: 24px;
}

a {
  color: #e84a55;
  text-decoration: none;
}

.home /deep/.el-dialog--center .el-dialog__body {
  padding: 16px;
}

.dialog_header {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
}

.dialog-footer .el-button {
  width: 323px;
  height: 45px;
  /* background: linear-gradient(90deg, #69dfdd 0%, #00b6bf 100%);
  border-radius: 23px 23px 23px 23px; */
  background: #e84a55;
  border-radius: 4px 4px 4px 4px;
  opacity: 1;
  margin: 30px 0;
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
}

.dialog-footer .is-disabled {
  /* width: 323px;
  height: 45px; */
  background: #ffffff;
  border-radius: 23px 23px 23px 23px;
  opacity: 1;
  margin: 30px 0;
  font-size: 18px;
  font-weight: 500;
  color: #c0c4cc;
}
</style>
<style>
.el-message {
  min-width: 80vw !important;
}
</style>
