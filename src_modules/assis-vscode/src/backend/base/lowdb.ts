import { PathLike } from 'fs'
import { JSONFilePreset } from 'cjs-lowdb/node'

/**
 * 使用lowdb，对于已存在的文件，并不会写入默认value
 * @param url 存储绝对路径
 * @param defaultValue 默认值
 * @returns
 */
export const useLowDB = async <T>(url: PathLike, defaultValue: T) => {
  // const JSONFilePreset = (await import('lowdb/node')).JSONFilePreset
  // console.log('JSONFilePreset', JSONFilePreset)
  return await JSONFilePreset(url, defaultValue)
}
