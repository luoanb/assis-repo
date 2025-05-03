import { useAppProps } from 'antd/es/app/context'

/**
 * 用于调用antd实例的方法,需要在App初始化时赋值
 */
export const antdApp: { value: useAppProps | null } = { value: null }
