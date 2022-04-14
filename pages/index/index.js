Page({
  data: {
    gameList: [
      [
        {
          path: 'snake',
          name: '贪吃蛇',
        },
        {
          path: 'fly-bird',
          name: 'Fly Bird',
        },
      ],
      [
        {
          path: '2048',
          name: '2048',
        },
        {
          path: 'seconds',
          name: '争分夺秒',
        },
      ],
      [
        {
          path: 'mine-sweeping',
          name: '扫雷(简易版)',
        },
      ],
    ],
  },
  toPage(e) {
    const {
      currentTarget: {
        dataset: { path },
      },
    } = e;
    wx.navigateTo({
      url: `/pages/${path}/${path}`,
    });
  },
});
