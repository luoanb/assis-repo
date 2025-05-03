import * as vscode from "vscode";

import {
  AssistantCoreType,
  IMsg,
  InstanceAI,
  Result,
  DecisionPlugin,
} from "../../DecisionCoreTypes";
import path from "path";
import { ChunkRes } from "assis-general";
import { Exception, getConfig } from "../../../vscode";
import { DecisionCore } from "../../DecisionCore";
import { ToastType, useLowDB } from "../../base";

const getDefaultConfig = () => {
  return {
    client_id: "tkLu8Agg6xIcjNRJ0E1N9JPT",
    client_secret: "G0PbNS9AeO1DiPB3ha0kb6U2CQYCJwiA",
    model: "ernie-3.5-8k-0205",
  };
};

export class Qianfan implements InstanceAI {
  readonly coreType = AssistantCoreType.ais;
  id: string = "Qianfan";
  name: string = "千帆";
  token = {
    refresh_token: "",
    expires_in: 0,
    session_key: "",
    access_token: "",
    scope: "",
    session_secret: "",
  };
  // 换默认应用/后续会清除以前的应用（Secret Key在md中暴露过）
  // TODO 加密
  config = getDefaultConfig();

  getDefaultConfig = getDefaultConfig;

  constructor(
    /** 上下文信息 */
    private context: DecisionCore,
    /** 项目文件夹:用于缓存数据时读取目录: workspace/.assis/ */
    private rootFolder: string
  ) {
    this.rootFolder = rootFolder;
    this.init();
  }
  off?: (() => Promise<Result<boolean>>) | undefined;

  private async getDB<T>(defaultValue: T) {
    // let JSONFilePreset = (await import('lowdb/node')).JSONFilePreset
    const fileUrl = path.join(this.rootFolder, "/.qfconfig.json");
    return useLowDB(fileUrl, defaultValue);
  }

  /**
   * 更新配置文件
   */
  async updateConfig() {
    const config = await getConfig();
    this.config = {
      ...this.getDefaultConfig(),
      ...config.ai?.qf,
    };
  }

  init: () => Promise<Result<boolean | null>> = async () => {
    try {
      const config = await getConfig();
      if (config.ai?.qf) {
        this.config = {
          ...this.config,
          ...config.ai?.qf,
        };
      } else {
        throw new Exception(
          "推荐可在.assis.json配置文件更新配置，切换模型等: ai.qf，具体可查看文档",
          { type: ToastType.Info }
        );
      }
      console.log("--------------------config", config);
      await this.getToken();
      return DecisionCore.createSuccessResult(true);
    } catch (error) {
      return DecisionCore.createErrorResult("获取token异常");
    }
  };
  // off?: (() => Promise<Result<boolean>>) | undefined;
  objectToQueryParams(obj: Record<string, any>) {
    const params = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        params.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
      }
    }
    return params.join("&");
  }
  async getToken() {
    const getByNet = async () => {
      // const config = await getConfig();
      // if (!this.config.client_id) {
      //   throw new Error("请在.assis.json配置文件更新配置: ai.qf:");
      // }
      const url = "https://aip.baidubce.com/oauth/2.0/token";
      const headers = {
        "Content-Type": "application/json",
      };
      await this.updateConfig();
      const query = {
        grant_type: "client_credentials",
        client_id: this.config.client_id,
        client_secret: this.config.client_secret,
      };
      let res = await fetch(url + "?" + this.objectToQueryParams(query), {
        headers,
        method: "POST",
      }).then((res) => res.json());
      let data: any = res;
      if (!data.access_token) {
        new Exception(".assis.json:ai.qf:参数配置有误, 请检查");
      }
      let db = await this.getDB({ token: {} } as { token: any });
      db.data.token = {
        ...data,
        validityDate: new Date().getTime() + data.expires_in * 1000,
      };
      db.write();
      return data as any;
    };
    const getByCache = async () => {
      let db = await this.getDB({ token: {} } as { token: any });
      let data = db.data.token;
      if (data?.validityDate > new Date().getTime()) {
        return data;
      }
      return {};
    };
    let token = await getByCache();
    if (token?.access_token) {
      this.token = token;
    } else {
      this.token = await getByNet();
    }
    // console.log("getToken", this.token);
  }
  determine: (msgs: IMsg[]) => Promise<Result<IMsg>> = async (msgs) => {
    const model = this.config.model || "ernie-3.5-4k-0205";
    console.log("-----model:", model);
    const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${model}`;
    const headers = {
      "Content-Type": "application/json",
    };
    if (!this.token.access_token) {
      await this.getToken();
    }
    console.log("determine", this.token);
    const queryStr = {
      access_token: this.token.access_token,
    };
    const messages = msgs.map((it) => ({
      role: it.role,
      content: it.content,
    }));
    let data = {
      messages,
    };
    let res: any = await fetch(url + "?" + this.objectToQueryParams(queryStr), {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    }).then((res) => res.json());
    return DecisionCore.createSuccessResult({
      role: "assistant",
      content: res?.result,
      source: res,
    });
  };

  streamDetermine?: (
    msgs: IMsg[]
  ) => AsyncGenerator<Result<unknown>, void, unknown> = (msgs: IMsg[]) => {
    const that = this;
    return (async function* () {
      if (!that.token.access_token) {
        await that.getToken();
      }
      const model = that.config.model || "ernie-3.5-8k-0205";
      console.log("-----model:", model);
      const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${model}`;
      // this.token;
      const headers = {
        "Content-Type": "application/json",
      };
      console.log("--------------streamDetermine", that.config);

      const queryStr = {
        access_token: that.token.access_token,
      };
      const messages = msgs.map((it) => ({
        role: it.role,
        content: it.content,
      }));

      let data = {
        messages,
        stream: true,
      };
      console.log("------------------------messages", messages);

      let res = await fetch(url + "?" + that.objectToQueryParams(queryStr), {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      const reader = res.body?.getReader();
      const chunkRes = ChunkRes();
      try {
        while (true) {
          const { done, value } = (await reader?.read()) || {
            done: true,
            value: null,
          };
          if (typeof value !== "undefined" && value !== null) {
            let texts = chunkRes.onChunkReceivedReturn(value);
            console.log("----------texts", texts);
            if (texts?.length) {
              // yield DecisionCore.createSuccessResult(JSON.parse(texts[0]), true);
              for (const text of texts) {
                yield DecisionCore.createSuccessResult(JSON.parse(text), true);
              }
            }
          }
          if (done) {
            let texts = chunkRes.onComplateReturn();
            if (texts?.length) {
              for (const text of texts) {
                yield DecisionCore.createSuccessResult(JSON.parse(text), true);
              }
            }
            yield DecisionCore.createSuccessResult(null, false);
            break;
          }
        }
      } finally {
        reader?.releaseLock();
      }
      // for await (const data of res) {
      //   yield DecisionCore.createSuccessResult(data);
      // }
    })();
  };
}
export const QianfanPlugin: DecisionPlugin<InstanceAI> = {
  coreType: AssistantCoreType.ais,
  id: "Qianfan",
  name: "千帆",
  desc: "百度自研的旗舰级大规模⼤语⾔模型，覆盖海量中英文语料，具有强大的通用能力，可满足绝大部分对话问答、创作生成、插件应用场景要求；支持自动对接百度搜索插件，保障问答信息时效。",
  getInstance: (context) => {
    return new Qianfan(
      context.decisionCore,
      vscode.Uri.joinPath(
        vscode.workspace.workspaceFolders?.[0]?.uri as any,
        ".assis"
      ).fsPath
    );
  },
};
