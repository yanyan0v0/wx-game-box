Page({
  /**
   * 页面的初始数据
   */
  groundSize: [16, 16], // 地图大小
  minePosition: [], // 保存雷的位置
  isLongTap: false, // 判断是否是长按事件
  secondInterval: 0, // 时间定时器
  data: {
    second: 0,
    mineCount: 24, // 雷总数
    markMineCount: 0, // 已标记雷数
    renderGroundList: [], // 坐标列表
  },
  onLoad() {
    this.restart();
  },
  restart() {
    console.log(0);
    this.generateMine();
    console.log(1);
    this.initGround();
    console.log(2);
    this.initSecond();
  },
  initGround() {
    const groundList = [];
    // 当前遍历groundList到第几个元素
    let currentNum = 0;
    // 当前遍历minePosition到第几个元素
    let currentMineIndex = 0;
    for (let i = 0; i < this.groundSize[0]; i++) {
      const row = [];
      for (let j = 0; j < this.groundSize[1]; j++) {
        let isMine = false;
        // 判断是否是雷
        if (currentNum === this.minePosition[currentMineIndex]) {
          isMine = true;
          currentMineIndex += 1;
        }
        row.push({
          isMine,
          mineTag: false, // 手动添加是否是雷的标识
          isBoom: false, // 是否点击到了雷
          mineNum: 0, // 周围雷数
          showNum: false, // 是否显示雷数
          value: currentNum,
          position: [i, j],
        });
        currentNum += 1;
      }
      groundList.push(row);
    }
    this.setData({
      renderGroundList: this.generateMineNum(groundList),
    });
  },
  generateMine() {
    this.minePosition = [];
    // 已设置的雷总数
    let hadSetCount = 0;
    // 随机最大值
    const groundCount = this.groundSize[0] * this.groundSize[1];
    if (this.data.mineCount >= groundCount) {
      return;
    }
    while (hadSetCount < this.data.mineCount) {
      // 生成随机数
      const randomNum = ~~(Math.random() * groundCount);
      // 判断随机数是否存在
      if (!this.minePosition.includes(randomNum)) {
        this.minePosition.push(randomNum);
        hadSetCount += 1;
      }
    }
    // 从小到大排序
    this.minePosition.sort((a, b) => (a > b ? 1 : -1));
    console.log('minePosition', this.minePosition);
  },
  generateMineNum(groundList) {
    groundList.forEach(row => {
      row.forEach(col => {
        // 是雷则跳过
        if (col.isMine) {
          return;
        }
        col.mineNum = this.checkMine(groundList, col.position);
      });
    });
    return groundList;
  },
  initSecond() {
    this.data.second = 0;
    clearInterval(this.secondInterval);
    this.secondInterval = setInterval(() => {
      this.setData({
        second: ++this.data.second,
      });
    }, 1000);
  },
  checkMine(groundList, position) {
    const [i, j] = position;
    let mineNum = 0;
    // 判断8个方位是否有雷
    // 上 [i - 1][j]
    if (groundList[i - 1] && groundList[i - 1][j].isMine) {
      mineNum += 1;
    }
    // 右上 [i - 1][j + 1]
    if (groundList[i - 1] && groundList[i - 1][j + 1] && groundList[i - 1][j + 1].isMine) {
      mineNum += 1;
    }
    // 右 [i][j + 1]
    if (groundList[i][j + 1] && groundList[i][j + 1].isMine) {
      mineNum += 1;
    }
    // 右下 [i + 1][j + 1]
    if (groundList[i + 1] && groundList[i + 1][j + 1] && groundList[i + 1][j + 1].isMine) {
      mineNum += 1;
    }
    // 下 [i + 1][j]
    if (groundList[i + 1] && groundList[i + 1][j].isMine) {
      mineNum += 1;
    }
    // 左下 [i + 1][j - 1]
    if (groundList[i + 1] && groundList[i + 1][j - 1] && groundList[i + 1][j - 1].isMine) {
      mineNum += 1;
    }
    // 左 [i][j - 1]
    if (groundList[i][j - 1] && groundList[i][j - 1].isMine) {
      mineNum += 1;
    }
    // 左上 [i - 1][j - 1]
    if (groundList[i - 1] && groundList[i - 1][j - 1] && groundList[i - 1][j - 1].isMine) {
      mineNum += 1;
    }
    return mineNum;
  },
  setMineTag(e) {
    const {
      currentTarget: {
        dataset: { value },
      },
    } = e;
    const renderGroundList = this.data.renderGroundList;
    let markMineCount = 0;
    for (const row of renderGroundList) {
      for (const col of row) {
        if (col.value === value) {
          col.mineTag = !col.mineTag;
        }
        if (col.mineTag) {
          markMineCount += 1;
        }
      }
    }
    this.setData({
      renderGroundList,
      markMineCount,
    });
  },
  clearBox(e) {
    const {
      currentTarget: {
        dataset: { value },
      },
    } = e;
    let renderGroundList = this.data.renderGroundList;
    out: for (const row of renderGroundList) {
      for (const col of row) {
        if (col.value === value) {
          // 判断是否是雷
          col.isBoom = col.isMine;
          renderGroundList = this.loopClearBox(renderGroundList, col);
          break out;
        }
      }
    }
    this.setData({
      renderGroundList,
    });
  },
  loopClearBox(groundList, col) {
    if (col.isMine || col.showNum) {
      return groundList;
    }
    col.showNum = true;
    if (col.mineNum) {
      return groundList;
    }
    // 判断相邻的4个方位是否为空并递归遍历
    const [i, j] = col.position;
    if (groundList[i - 1]) {
      col = groundList[i - 1][j];
      if (col) {
        if (!col.mineNum) {
          groundList = this.loopClearBox(groundList, col);
        } else {
          col.showNum = !col.isMine;
        }
      }
    }
    if (groundList[i + 1]) {
      col = groundList[i + 1][j];
      if (col) {
        if (!col.mineNum) {
          groundList = this.loopClearBox(groundList, col);
        } else {
          col.showNum = !col.isMine;
        }
      }
    }

    col = groundList[i][j - 1];
    if (col) {
      if (!col.mineNum) {
        groundList = this.loopClearBox(groundList, col);
      } else {
        col.showNum = !col.isMine;
      }
    }
    col = groundList[i][j + 1];
    if (col) {
      if (!col.mineNum) {
        groundList = this.loopClearBox(groundList, col);
      } else {
        col.showNum = !col.isMine;
      }
    }
    return groundList;
  },
});
