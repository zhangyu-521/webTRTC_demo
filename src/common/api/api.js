import requestBusinessP from "./requestBusinessP";

const RequestApplyUser = (data) => {
  return requestBusinessP({
    data,
    TransServiceCode: "que012_esb",
  });
};
//查询userflag
// const QueryUserData = (data) => {
//   return requestBusinessP({
//     data,
//     TransServiceCode: "esb.userdata02.01",
//   });
// };

const RequestCreateVideo = (data) => {
  return requestBusinessP({
    data,
    TransServiceCode: "createvideo_esb",
  });
};

const RequestQueueQuery = (data) => {
  return requestBusinessP({
    data,
    TransServiceCode: "que006_esb",
  });
};

const RequestCancelVideo = (data) => {
  return requestBusinessP({
    data,
    TransServiceCode: "esb.cancelvideo",
  });
};

const RequestNoticeMsg = (data) => {
  return requestBusinessP({
    data,
    TransServiceCode: "esb.noticemsg",
  });
};

const RequestFileUploadNotice = (data) => {
  return requestBusinessP({
    data,
    TransServiceCode: "esb.fileuploadnotice",
  });
};

const RequestSubmitTask = (data) => {
  return requestBusinessP({
    data,
    TransServiceCode: "esb.submittask",
  });
};

const RequestPushMessage = (data) => {
  return requestBusinessP({
    data,
    TransServiceCode: "esb.pushmessage02",
  });
};
const RequestTokenValidity = (data) => {
  return requestBusinessP({
    data,
    TransServiceCode: "arb.pcva.a077.01",
  });
};

export {
  RequestApplyUser,
  RequestCreateVideo,
  RequestQueueQuery,
  RequestCancelVideo,
  RequestNoticeMsg,
  RequestFileUploadNotice,
  RequestSubmitTask,
  RequestPushMessage,
  RequestTokenValidity,
};
