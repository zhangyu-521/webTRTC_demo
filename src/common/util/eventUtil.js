const EventUtil = {
  events: {},
  //订阅事件
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [callback];
    } else {
      this.events[eventName].push(callback);
    }
  },
  //取消订阅
  off(eventName, callBack) {
    if (!this.events[eventName]) return;
    if (callBack) {
      this.events[eventName] = this.events[eventName].filter((item) => {
        return item !== callBack;
      });
    } else {
      this.events[eventName] = [];
    }
  },
  // 只执行一次订阅事件
  once(eventName, callBack) {
    function fn(rest) {
      callBack(rest);
      this.off(eventName, fn);
    }
    this.on(eventName, fn);
  },
  // 触发事件
  emit(eventName, ...rest) {
    this.events[eventName] &&
      this.events[eventName].forEach((fn) => fn.apply(this, rest));
  },
};

export default EventUtil;
