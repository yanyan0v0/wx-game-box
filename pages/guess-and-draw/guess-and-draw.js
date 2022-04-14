// pages/guess-and-draw/guess-and-draw.js
Page({

  /**
   * 页面的初始数据
   */
  // 是否开始绘图
  startDraw: false,
  // canvas Dom对象
  canvasDom: null,
  // canvas 图形实例对象
  ctx: null,
  // canvas 位置宽高信息
  canvasRect: {},
  // 绘图原点
  drawOrigin: [0, 0],
  // 记录绘制步骤
  step: 0,
  // 当前绘制步骤
  curStep: 0,
  // 保存绘制步骤数据
  canvasHistory: [],
  data: {
    // 画笔颜色
    penColor: '#000000',
    // 画笔粗细
    penWidth: 3
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {
    wx.createSelectorQuery().select('#canvasId').boundingClientRect((res) => {
      console.log(res)
      this.canvasRect = res
    })
    wx.createSelectorQuery().select('#canvasId').fields({ node: true, size: true }).exec((res) => {
      this.ctx = res[0].node.getContext('2d')
    })
  },
  touchStart (event) {
    this.step++
    // 设置原点坐标
    this.drawOrigin = [
      event.touches[0].x - this.canvasRect.left,
      event.touches[0].y - this.canvasRect.top
    ]
    console.log(this.drawOrigin)
    // 开始绘制
    this.ctx.strokeStyle = this.data.penColor
    this.ctx.beginPath()
    this.ctx.moveTo(this.drawOrigin[0], this.drawOrigin[1])
    this.startDraw = true
  },
  touchMove (event) {
    if (this.startDraw) {
      console.log(this.ctx)
      const curPoint = [
        event.touches[0].x - this.canvasRect.left,
        event.touches[0].y - this.canvasRect.top
      ]
      console.log(curPoint)
      this.ctx.lineTo(curPoint[0], curPoint[1])
      this.ctx.stroke()
      // 结束绘制
      this.drawOrigin = curPoint
    }
  },
  touchEnd () {
    this.startDraw = false
    // this.canvasHistory[this.step] = this.ctx.toDataURL();
  },
  drawError (error) {
    console.error(error)
  }
})
