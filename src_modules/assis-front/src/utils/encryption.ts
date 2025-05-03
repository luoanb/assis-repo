import { aesKey } from '@/config'
import CryptoJS from 'crypto-js'
// 配置加密选项
const options = {
  mode: CryptoJS.mode.ECB, // 加密模式，这里使用ECB模式
  padding: CryptoJS.pad.Pkcs7, // 填充方式，这里使用PKCS7填充
  keySize: 128, // 密钥长度，这里使用256位密钥
  blockSize: 128 // 块大小，对于AES通常是固定的128位
}
// 加密KEY
const key = CryptoJS.enc.Utf8.parse(aesKey)
export const encryption = {
  /**
   * 加密数据
   * @param text 加密的文本
   * @returns 加密后的base64
   */
  encrypt: (text: string) => {
    return CryptoJS.AES.encrypt(text, key, options).toString()
  },
  /**
   * 解密数据
   * @param text 加密的文本
   * @returns 加密后的base64
   */
  decrypted: (text: string) => {
    return CryptoJS.AES.decrypt(text, key, options).toString(CryptoJS.enc.Utf8)
  }
}
