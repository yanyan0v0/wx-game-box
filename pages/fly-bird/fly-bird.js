const PIPE_INTERVAL = 4;
const BIRD_POSITION = [8, 8];

Page({
  groundSize: [16, 16],
  animationInterval: 0,
  pipeInterval: PIPE_INTERVAL,
  direction: 'right',
  isDead: false,
  bird: BIRD_POSITION,
  bgAudioContext: {},
  deadAudioContext: {},
  scoreInterval: 0,
  groundList: [],
  data: {
    score: 0,
    speed: 500, // 初始速度
    isStop: false,
    renderGroundList: [],
  },
  onLoad() {
    this.init();
    this.initAudio();
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });
  },
  init() {
    this.initGround();
    this.initBird();
    this.startGameInterval();
    this.renderGround();
    this.addScore();
  },
  initAudio() {
    this.bgAudioContext = wx.createInnerAudioContext();
    this.bgAudioContext.src = '/static/audio/snake-bg.mp3';
    this.bgAudioContext.autoplay = true;
    this.bgAudioContext.loop = true;
    this.bgAudioContext.onPlay(() => {
      console.log('开始播放 背景 音效');
    });

    this.deadAudioContext = wx.createInnerAudioContext();
    this.deadAudioContext.src = '/static/audio/snake-dead.mp3';
    this.deadAudioContext.onPlay(() => {
      console.log('开始播放 死亡 音效');
      // 暂停背景音效
      this.bgAudioContext.stop();
    });
  },
  initGround() {
    const groundList = [];
    for (let i = 0; i < this.groundSize[0]; i++) {
      const row = [];
      for (let j = 0; j < this.groundSize[1]; j++) {
        row.push({
          position: [j, i],
        });
      }
      groundList.push(row);
    }
    this.groundList = groundList;
  },
  initBird() {
    this.groundList.forEach(row => {
      row.forEach(col => {
        col.isBird = this.bird.join() === col.position.join();
      });
    });
    this.renderGround();
  },
  initPipeline() {
    // 随机生成上下管道中间空隙的坐标
    const gaps = [];
    // 随机生成空隙长度
    const length = ~~(Math.random() * (this.groundSize[1] - 4 - 2 + 1) + 2);
    // 横坐标
    const x = this.groundSize[0] - 1;
    // 随机生成空隙第一格的纵坐标
    const colM = this.groundSize[1] - length;
    const y = ~~(Math.random() * (colM + 1) + 2);
    for (let i = 0; i < length; i++) {
      gaps.push([x, y + i]);
    }

    this.groundList.forEach(row => {
      row[0].isPipe = false;
      row.push(row.shift());
    });
    // 更新position
    this.groundList.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        col.position = [colIndex, rowIndex];
      });
    });
    const gapPositions = gaps.map(item => item.join());
    if (this.pipeInterval === 0) {
      this.groundList.forEach(row => {
        row.forEach(col => {
          if (!col.isPipe) {
            col.isPipe = x === col.position[0] && gapPositions.indexOf(col.position.join()) === -1;
          }
        });
      });
      this.pipeInterval = PIPE_INTERVAL;
    } else {
      this.pipeInterval -= 1;
    }
    console.log('initPipeline');
  },
  renderGround() {
    this.setData({
      renderGroundList: this.groundList,
    });
  },
  changeDirection(e) {
    const { direction } = e.target.dataset;
    if (this.isDead) return;

    this.changeBirdByDirection(direction);
    this.direction = direction;
  },
  changeBirdByDirection(direction) {
    const directionMap = {
      left: [-1, 0],
      bottom: [0, 1],
      right: [1, 0],
      top: [0, -1],
    };
    this.bird[0] += directionMap[direction][0];
    this.bird[1] += directionMap[direction][1];
    if (this.checkDead(this.bird)) return;

    this.initBird();
  },
  checkDead(newPosition) {
    this.isDead = false;
    // 超出边界死亡
    if (newPosition[0] < 0 || newPosition[0] >= this.groundSize[0]) {
      this.isDead = true;
    }
    if (newPosition[1] < 0 || newPosition[1] >= this.groundSize[1]) {
      this.isDead = true;
    }
    // 触碰管道死亡
    if (this.groundList.find(row => row.find(col => col.isPipe && col.position.join() === newPosition.join()))) {
      this.isDead = true;
    }

    if (this.isDead) {
      this.clearGameInterval();
      this.deadAudioContext.play();
      wx.showToast({
        title: '已死亡',
        icon: 'error',
        duration: 2000,
      });
    }
    return this.isDead;
  },
  startGameInterval() {
    this.animationInterval = setInterval(() => {
      this.initPipeline();
      this.changeBirdByDirection('bottom');
      this.renderGround();
    }, this.data.speed);
  },
  clearGameInterval() {
    clearInterval(this.animationInterval);
    clearInterval(this.scoreInterval);
  },
  restart() {
    this.isDead = false;
    this.bird = BIRD_POSITION;
    this.init();
    this.clearScore();
    this.bgAudioContext.play();
  },
  stopGame() {
    if (this.isDead) return;
    this.bgAudioContext.pause();
    this.setData({
      isStop: true,
    });
    this.clearGameInterval();
  },
  restoreGame() {
    if (this.isDead) return;
    this.bgAudioContext.play();
    this.setData({
      isStop: false,
    });
    this.startGameInterval();
  },
  reduceSpeed() {
    if (this.isDead) return;
    let speed = this.data.speed;
    speed += 100;
    if (speed >= 800) {
      speed = 800;
    }
    console.log('speed:', speed);
    this.setData({
      speed,
    });
  },
  addSpeed() {
    if (this.isDead) return;
    let speed = this.data.speed;
    speed -= 100;
    if (speed <= 200) {
      speed = 200;
    }
    console.log('speed:', speed);
    this.setData({
      speed,
    });
  },
  addScore() {
    this.scoreInterval = setInterval(() => {
      let score = this.data.score;
      score += 1;
      this.setData({
        score,
      });
    }, 1000);
  },
  clearScore() {
    this.setData({
      score: 0,
    });
  },
});
