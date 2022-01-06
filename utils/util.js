// 生成 yyyy-mm-dd hh:mm:ss 的时间格式
function formatTime(time) {
  return new Date(time).toLocaleString('zh', {
    year: 'numeric',
    month: '2-digit', // 2-digit 表示用两位数表示
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).replace(/\//g, '-');
}

module.exports = {
  formatTime
};
