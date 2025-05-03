import * as vscode from "vscode";
import { EventBus, getPromise } from "assis-general";

/**
 * 响应状态
 */
export enum Code {
  /** 正常 */
  success = 200,
  /** 错误 */
  err = 500,
}

export interface SocketProps<T> {
  type: string;
  data: T;
}

/**
 * 服务消息
 */
export interface PluginMsg<T = null> {
  /**
   * 标识流式输出是否完成
   */
  isNotDone?: boolean;
  /**
   * 服务标识
   */
  url: string;
  /**
   * 状态
   */
  code: Code;
  /**
   * 负载
   */
  data: T;
  /**
   * 提示
   */
  msg: string;
}

export const createSuccessMsg = <T>(
  url: string,
  data: T,
  isNotDone = false
) => {
  return {
    url,
    data,
    isNotDone,
    code: Code.success,
    msg: "",
  } as PluginMsg<T>;
};

export const createErrorMsg = (url: string, msg: string) => {
  return {
    url,
    data: null,
    code: Code.err,
    msg,
  } as PluginMsg;
};

export type ISubscription<T> = {
  /** 服务地址 */
  url: string;
  /** 执行逻辑 */
  do: (props: {
    message: PluginMsg<any>;
    target: vscode.WebviewPanel;
    context?: T;
    serve: ServiceCore<T>;
  }) => void;
};

export class ServiceCore<T = undefined> {
  /**
   * 用于快速定义服务
   * @param serves
   * @returns
   */
  static defineSubscription<T = undefined>(...serves: Array<ISubscription<T>>) {
    return serves;
  }

  static createSuccessMsg = createSuccessMsg;

  static createErrorMsg = createErrorMsg;

  /**
   * 服务实例
   */
  service: EventBus<
    (props: {
      message: PluginMsg<any>;
      target: vscode.WebviewPanel;
      context?: T;
      serve: ServiceCore<T>;
    }) => void
  >;
  constructor(public context?: T) {
    this.service = new EventBus();
  }
  /**
   * 正在运行的前台(客户端)实例
   */
  panelInstances: vscode.WebviewPanel[] = [];

  /**
   * 删除指定实例
   * @param inst
   */
  rmpanelInstance = (inst: vscode.WebviewPanel) => {
    this.panelInstances = this.panelInstances.filter((it) => it !== inst);
  };

  /**
   * 挂载消息解析服务
   * @param panelInstance
   */
  mountServer = async (...panelInstances: vscode.WebviewPanel[]) => {
    this.panelInstances.push(...panelInstances);
    let res = await panelInstances.map((p) => {
      const pro = getPromise<void>();
      p.onDidDispose(() => this.rmpanelInstance(p));
      p.webview.onDidReceiveMessage((message) => {
        if (message.url) {
          this.service.trigger(message.url, {
            message,
            target: p,
            context: this.context,
            serve: this,
          });
        }
        if (message.url == "inited") {
          pro.reslove();
        }
      });
      return pro.promise;
    });
    return Promise.all(res);
  };

  /**
   * 添加订阅
   * @param subs
   */
  mountSubscriptions = (subs: ISubscription<T>[]) => {
    subs.forEach((sub) => {
      this.service.addListen(sub.url, sub.do);
    });
  };

  /**
   * 向所有已注册客户端发送通知
   * @param url
   * @param data
   */
  notify = <T>(url: string, data: SocketProps<T>) => {
    this.panelInstances.forEach((item) => {
      item.webview.postMessage(createSuccessMsg(url, data));
    });
  };

  /**
   * 创建正常的返回数据
   * @param url
   * @param data
   * @returns
   */
  createErrorMsg = createErrorMsg;

  /**
   * 创建错误的返回数据
   * @param url
   * @param msg
   * @returns
   */
  createSuccessMsg = createSuccessMsg;
}
