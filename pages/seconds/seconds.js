Page({
  /**
   * 页面的初始数据
   */
  interval: 0,
  second: 0,
  successSecond: 1000,
  isStop: true,
  data: {
    secondText: '00.00',
  },
  start() {
    this.second = 0;
    this.isStop = false;
    this.setData({
      secondText: '00.00',
    });
    this.interval = setInterval(() => {
      this.second += 1;
      const secondText = `0000${this.second}`.slice(-4);
      this.setData({
        secondText: `${secondText.slice(0, 2)}.${secondText.slice(-2)}`,
      });
      if (this.second >= this.successSecond + 100) {
        clearInterval(this.interval);
      }
    }, 10);
  },
  stop() {
    if (this.isStop) {
      return;
    }

    this.isStop = true;
    clearInterval(this.interval);
    if (this.second === this.successSecond) {
      wx.showModal({
        showCancel: false,
        content: '恭喜挑战成功！',
      });
    } else {
      wx.showModal({
        showCancel: false,
        content: '抱歉，还得再努力一下呢！',
      });
    }
  },
});
