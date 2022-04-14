Page({
  groundSize: [16, 16],
  fruit: [],
  snake: [],
  animationInterval: 0,
  direction: '',
  isDead: false,
  bgAudioContext: {},
  deadAudioContext: {},
  groundList: [],
  data: {
    score: 0,
    speed: 700, // 初始速度
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
    // 随机生成初始方向
    const directionList = ['left', 'top', 'right', 'bottom'];
    this.direction = directionList[~~(Math.random() * 4)];
    console.log('初始方向：', this.direction);
    this.initGround();
    const snake = this.initSnake(this.direction);
    this.renderSnake(snake);
    this.initFruit(snake);
    this.startGameInterval(this.direction);
    this.setData({
      isStop: false,
      renderGroundList: this.groundList,
    });
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
  initSnake(direction) {
    const snake = [];
    // 初始长度
    const length = 3;
    // 初始蛇的头部位置
    const rowM = this.groundSize[0] - length;
    const colM = this.groundSize[1] - length;
    const position = [
      ~~(Math.random() * (rowM - length + 1) + length),
      ~~(Math.random() * (colM - length + 1) + length),
    ];
    console.log(position);
    // 上下方向可以随机分配头部位置
    const random = Math.random() >= 0.5;
    if (direction === 'top' || direction === 'bottom') {
      direction = random ? 'left' : 'right';
    }
    for (let i = 0; i < length; i++) {
      const temp = {
        isHeader: direction === 'left' ? i === 0 : i === length - 1,
        position: [position[0], position[1] + i],
      };
      snake.push(temp);
    }
    return snake;
  },
  initGround() {
    const groundList = [];
    for (let i = 0; i < this.groundSize[0]; i++) {
      const row = [];
      for (let j = 0; j < this.groundSize[1]; j++) {
        row.push({
          position: [i, j],
        });
      }
      groundList.push(row);
    }
    this.groundList = groundList;
  },
  renderSnake(snake) {
    const snakePositions = snake.map(item => item.position.join());
    const snakeHeader = snake.find(item => item.isHeader);
    this.groundList.forEach(row => {
      row.forEach(col => {
        const snakeIndex = snakePositions.indexOf(col.position.join());
        col.isSnake = snakeIndex > -1;
        col.isSnakeHeader = snakeHeader.position.join() === col.position.join();
      });
    });
    this.snake = snake;
  },
  initFruit(snake) {
    // 随机生成果实坐标
    const fruit = [~~(this.groundSize[0] * Math.random()), ~~(this.groundSize[1] * Math.random())];
    // 如果与果实坐标位置与蛇重合则重新生成
    if (snake.find(item => item.position.join() === fruit.join())) {
      return this.initFruit(snake);
    }
    this.groundList.forEach(row => {
      row.forEach(col => {
        col.isFruit = false;
        if (fruit.join() === col.position.join()) {
          col.isFruit = true;
        }
      });
    });
    this.fruit = fruit;
  },
  renderGround() {
    this.setData({
      renderGroundList: this.groundList,
    });
  },
  changeDirection(e) {
    const { direction } = e.target.dataset;
    if (this.isDead) return;
    // 不能走相反方向
    const directionMap = {
      left: 1,
      right: -1,
      top: 2,
      bottom: -2,
    };
    if (directionMap[direction] + directionMap[this.direction] === 0) return;

    this.clearGameInterval();
    this.startGameInterval(direction);
    this.direction = direction;
  },
  changeSnakeByDirection(direction) {
    console.log('direction: ', direction);
    const snake = this.snake;
    const directionMap = {
      left: [0, -1],
      bottom: [1, 0],
      right: [0, 1],
      top: [-1, 0],
    };

    // 判断蛇的头部位置
    const headerIndex = snake.findIndex(item => item.isHeader);
    const newPosition = [...snake[headerIndex].position];
    newPosition[0] += directionMap[direction][0];
    newPosition[1] += directionMap[direction][1];

    if (this.checkDead(newPosition)) return;

    snake.forEach(item => {
      item.isHeader = false;
    });
    if (headerIndex) {
      snake.push({
        isHeader: true,
        position: newPosition,
      });
      if (!this.checkFruit(newPosition, snake)) {
        snake.shift();
      }
    } else {
      snake.unshift({
        isHeader: true,
        position: newPosition,
      });
      if (!this.checkFruit(newPosition, snake)) {
        snake.pop();
      }
    }
    this.renderSnake(snake);
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
    // 碰到蛇自身也死亡
    if (this.snake.map(item => item.position.join()).indexOf(newPosition.join()) > -1) {
      this.isDead = true;
    }
    if (this.isDead) {
      console.log('死亡');
      this.deadAudioContext.play();
      this.clearGameInterval();
      wx.showToast({
        title: '已死亡',
        icon: 'error',
        duration: 2000,
      });
    }
    return this.isDead;
  },
  checkFruit(newPosition, snake) {
    const isTouch = newPosition.join() === this.fruit.join();
    if (isTouch) {
      this.addScore();
      this.initFruit(snake);
    }
    return isTouch;
  },
  clearGameInterval() {
    clearInterval(this.animationInterval);
  },
  startGameInterval(direction) {
    this.animationInterval = setInterval(() => {
      this.changeSnakeByDirection(direction);
      this.renderGround();
    }, this.data.speed);
  },
  restart() {
    this.isDead = false;
    this.clearGameInterval();
    this.init();
    this.clearScore();
    this.bgAudioContext.play();
  },
  stopGame() {
    if (this.isDead) return;
    this.clearGameInterval();
    this.setData({
      isStop: true,
    });
    this.bgAudioContext.pause();
  },
  restoreGame() {
    if (this.isDead) return;
    this.startGameInterval(this.direction);
    this.setData({
      isStop: false,
    });
    this.bgAudioContext.play();
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
    if (!this.data.isStop) {
      this.clearGameInterval();
      this.startGameInterval(this.direction);
    }
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
    if (!this.data.isStop) {
      this.clearGameInterval();
      this.startGameInterval(this.direction);
    }
  },
  addScore() {
    let score = this.data.score;
    score += 1;
    this.setData({
      score,
    });
  },
  clearScore() {
    this.setData({
      score: 0,
    });
  },
});
