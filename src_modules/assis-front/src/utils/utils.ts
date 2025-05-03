const utils = {
  /**
   * 手机号加密显示
   * @param phone
   * @returns
   */
  phoneToEncryption: (phone: string) => {
    return phone.slice(0, 3) + '******' + phone.slice(-2)
  },
  /**
   * 快速复制文本
   * @param text
   * @returns
   */
  copyText(text: string): boolean {
    // 创建一个临时的 textarea 元素
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'

    // 将 textarea 添加到页面中
    document.body.appendChild(textarea)

    // 选中文本并复制到剪贴板
    textarea.select()
    const success = document.execCommand('copy')

    // 移除临时的 textarea 元素
    document.body.removeChild(textarea)

    return success
  }
}

export default utils
