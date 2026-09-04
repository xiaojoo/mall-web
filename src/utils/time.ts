// 获取时间
export const getTime = () => {
  let message = ''
  let hours = new Date().getHours()
  if (hours <= 9) {
    message = '早上好'
  } else if (hours > 9 && hours <= 11) {
    message = '上午好'
  } else if (hours > 11 && hours <= 13) {
    message = '中午好'
  } else if (hours > 13 && hours <= 18) {
    message = '下午好'
  } else {
    message = '晚上好'
  }
  return message
}

// 获取uuid
export const getUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const randomValue = (Math.random() * 16) | 0
    const replacement = c === 'x' ? randomValue : (randomValue & 0x3) | 0x8 // 修正这个地方，确保生成正确的 UUID
    return replacement.toString(16)
  })
}
