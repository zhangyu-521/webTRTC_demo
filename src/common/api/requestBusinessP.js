import axios from "axios";
import { MessageBox, Message } from "element-ui";
import moment from "moment";
// import { AG } from "@/common/sdk/IOSTRTC/AGMediaVideoBridge";
import EventUtil from "@/common/util/eventUtil";


console.log(process.env.VUE_APP_BUSINESS_P_URL,' VUE_APP_BUSINESS_P_URL');
const service = axios.create({
  baseURL: process.env.VUE_APP_BUSINESS_P_URL,
  timeout: 30000,
});

service.interceptors.request.use(
  (config) => {
    config.method = "POST";
    config.headers["Content-Type"] = "application/json; charset=UTF-8";
    let RequestDate = moment().format("YYYYMMDD");
    let RequestTime = moment().format("HHmmss");
    let ConsumerSeqNo = "GSUTE" + RequestDate + RequestTime + getRandom();
    config.data = {
      Head: {
        ConsumerId: "C004", //暂定的渠道号
        TransServiceCode: config.TransServiceCode,
        RequestDate,
        RequestTime,
        ConsumerSeqNo,
        ServerIP: process.env.VUE_APP_BUSINESS_P_URL,
        ChannelCode: "02",
      },
      Body: config.data,
    };
    console.log(
      `<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<上送报文>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`
    );
    console.log(config.data);
    console.log(JSON.stringify(config.data));
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response) => {
    console.log(
      `<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<接收报文>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`
    );
    console.log(response.data);
    if (
      response &&
      response.data &&
      response.data.Head &&
      response.data.Head.ReturnCode == "000000"
    ) {
      return response.data.Body;
    } else {
      if (response.data.Head.ReturnCode == "NQUE_ERRO002") {
        MessageBox({
          title: "提示",
          message:
            response &&
            response.data &&
            response.data.Head &&
            response.data.Head.ReturnMessage,
          type: "error",
          confirmButtonText: "我知道了",
          center: true,
          showClose: false,
          closeOnClickModal: false,
          cancelButtonClass: "cancelButtonClass",
          confirmButtonClass: "confirmButtonClass",
        }).then(() => {});
      } else {
        Message({
          message:
            response &&
            response.data &&
            response.data.Head &&
            response.data.Head.ReturnMessage,
          type: "error",
        });
      }
      return response.data.Body;
    }
  },
  (error) => {
    console.error(error);
    Message({
      message: JSON.stringify(error),
      type: "error",
    });
  }
);

function getRandom() {
  let res = "";
  for (let index = 0; index < 13; index++) {
    res += Math.floor(Math.random() * 10);
  }
  return res;
}

export default service;
