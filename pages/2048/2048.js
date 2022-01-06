Page({
  groundSize: [4, 4],
  isDead: false,
  bgAudioContext: {},
  deadAudioContext: {},
  groundList: [],
  direction: '',
  randomValues: [2, 2, 2, 2, 2, 4, 4, 4, 4, 8, 8, 8, 16, 16, 32],
  data: {
    score: 0,
    renderGroundList: [],
  },
  onLoad() {
    this.init();
    this.initAudio();
  },
  init() {
    this.initGround();
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
    let groundList = [];
    for (let i = 0; i < this.groundSize[0]; i++) {
      let row = [];
      for (let j = 0; j < this.groundSize[1]; j++) {
        // 随机是否显示值
        const showValue = Math.random() >= 0.5;
        // 随机显示值的大小
        const valueIndex = ~~(Math.random() * (this.randomValues.length + 1));
        row.push({
          value: showValue ? this.randomValues[valueIndex] : 0,
          position: [j, i]
        });
      }
      groundList.push(row);
    }
    this.setData({
      renderGroundList: groundList
    });
  },
  randomGround(renderGroundList, max = 1) {
    let num = 0;
    for (let row of renderGroundList) {
      for (let col of row) {
        if (num < max) {
          if (!col.value) {
            // 随机是否显示值
            const showValue = Math.random() >= 0.5;
            if (showValue) {
              num += 1;
              // 随机显示值的大小
              const valueIndex = ~~(Math.random() * (this.randomValues.length + 1));
              col.value = this.randomValues[valueIndex];
            }
          }
        } else {
          return renderGroundList;
        }
      }
    }
    return renderGroundList;
  },
  changeDirection(e) {
    const { direction } = e.target.dataset;
    if (this.isDead) return;

    this.changeGroundByDirection(direction);
    this.direction = direction;
  },
  changeGroundByDirection(direction) {
    switch (direction) {
      case 'top':
        this.handleTop();
        break;
      case 'right':
        this.handleLeft('right');
        break;
      case 'bottom':
        this.handleTop('bottom');
        break;
      case 'left':
        this.handleLeft();
        break;
    }
    if (this.checkDead()) {
      wx.showToast({
        icon: 'error',
        title: '请重新开始',
      });
    }
  },
  handleTop(direction) {
    let groundList = this.data.renderGroundList;
    let newGroundList = [];
    for (let i = 0; i < this.groundSize[0]; i++) {
      for (let j = 0; j < this.groundSize[1]; j++) {
        if (!newGroundList[j]) {
          newGroundList[j] = [groundList[i][j]];
        } else {
          newGroundList[j].push(groundList[i][j]);
        }
      }
    }
    if (direction) {
      this.addValueRightBottom(newGroundList);
    } else {
      this.addValueLeftTop(newGroundList);
    }

    let renderGroundList = [];
    for (let i in newGroundList) {
      let temp = [];
      newGroundList.forEach(col => {
        temp.push({
          value: col[i].value,
          position: col[i].position
        });
      });
      renderGroundList.push(temp);
    }
    this.setData({
      renderGroundList: this.randomGround(renderGroundList)
    });
  },
  handleLeft(direction) {
    const renderGroundList = this.data.renderGroundList;
    if (direction) {
      this.addValueRightBottom(renderGroundList);
    } else {
      this.addValueLeftTop(renderGroundList);
    }
    renderGroundList.forEach(row => {
      row.forEach(col => col.isChange = false);
    });
    this.setData({
      renderGroundList: this.randomGround(renderGroundList)
    });
  },
  addValueLeftTop(newGroundList) {
    for (let rowIndex in newGroundList) {
      let row = [...newGroundList[rowIndex]];
      let hasValueList = row.filter(item => item.value);
      let noValueList = row.filter(item => !item.value);
      row = [...hasValueList, ...noValueList];
      for (let i = row.length - 1; i >= 1; i--) {
        if (row[i].value && !row[i].isChange && row[i - 1].value && !row[i - 1].isChange) {
          if (row[i].value === row[i - 1].value) {
            row[i - 1].isChange = true;
            row[i - 1].value += row[i].value;
            row[i].isChange = true;
            row[i].value = 0;
          }
        }
      }
      hasValueList = row.filter(item => item.value);
      noValueList = row.filter(item => !item.value);
      newGroundList[rowIndex] = [...hasValueList, ...noValueList];
    }
  },
  addValueRightBottom(newGroundList) {
    for (let rowIndex in newGroundList) {
      let row = [...newGroundList[rowIndex]];
      let hasValueList = row.filter(item => item.value);
      let noValueList = row.filter(item => !item.value);
      row = [...hasValueList, ...noValueList];
      for (let i = 0; i < row.length - 1; i++) {
        if (row[i].value && !row[i].isChange && row[i + 1].value && !row[i + 1].isChange) {
          if (row[i].value === row[i + 1].value) {
            row[i + 1].isChange = true;
            row[i + 1].value += row[i].value;
            row[i].isChange = true;
            row[i].value = 0;
          }
        }
      }
      hasValueList = row.filter(item => item.value);
      noValueList = row.filter(item => !item.value);
      newGroundList[rowIndex] = [...noValueList, ...hasValueList];
    }
  },
  addScore() {
    let score = this.data.score;
    score += 1;
    this.setData({
      score
    });
  },
  restart() {
    this.isDead = false;
    this.init();
    this.clearScore();
    this.bgAudioContext.play();
  },
  clearScore() {
    this.setData({
      score: 0
    });
  },
  checkDead() {
    let groundList = this.data.renderGroundList;
    for (let i = 0; i < this.groundSize[0]; i++) {
      for (let j = 0; j < this.groundSize[1]; j++) {
        let nowValue = groundList[i][j].value;
        let topValue = groundList[i][j - 1] ? groundList[i][j - 1].value : -1;
        let leftValue = groundList[i - 1] ? groundList[i - 1][j].value : -1;
        let rightValue = groundList[i + 1] ? groundList[i + 1][j].value : -1;
        let bottomValue = groundList[i][j + 1] ? groundList[i][j + 1].value : -1;
        if (nowValue === topValue ||
          nowValue === leftValue ||
          nowValue === rightValue ||
          nowValue === bottomValue ||
          !nowValue || !topValue || !leftValue || !rightValue || !rightValue) {
          return false;
        }
      }
    }
    return true;
  },
});