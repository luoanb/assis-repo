import vscode from "vscode";
import { useChatList } from "../base/lowdb";
import { Exception } from "../base/exception";
import { readFileAsString } from "../base";
import { assisBackend, assisVscode } from "assis-vscode";
import * as general from "assis-general";

export interface IAITask {
  id: string;
  name: string;
  process: any[];
  isRunning: boolean;
}
export class AITask implements IAITask {
  id: string;
  name: string;
  process: any[];
  isRunning: boolean;
  constructor(name: string) {
    this.id = general.createUniqueString();
    this.name = name;
    this.process = [];
    this.isRunning = false;
  }
}

export interface ServeContext {
  assistant: assisBackend.Decision;
  // promptCreator: PromptCreator;
  // autoTaskExec: AutoTaskExec;
}

const getFileMsg = async (url: string) => {
  let workspace = vscode.workspace.workspaceFolders?.[0]?.uri;
  if (workspace) {
    const uri = vscode.Uri.joinPath(workspace, url);
    const content = await readFileAsString(uri.fsPath);
    return `${content},帮我分析一下这段代码，它的作用是什么，有哪些可以优化的地方？`;
  }
  return "";
};

export const allservices =
  assisVscode.ServiceCore.defineSubscription<ServeContext>(
    // 非受控对话
    {
      url: "/ai/msgs-chat",
      do: async (props) => {
        const query = props.message.data;
      },
    },
    // // 任务对话
    // {
    //   url: "/ai/task-chat",
    //   do: async (props) => {
    //     const query = props.message.data;
    //   },
    // },

    // 基于文件的AI对话
    {
      url: "/ai/chat",
      do: async (props) => {
        try {
          console.log("--------------------props", props);
          let query = props.message.data;

          // 获取历史记录
          let chat = await useChatList(query.sessionId || undefined);
          let msgs: assisBackend.IMsg[] = chat.db.data.messages || [];
          let newMsg: assisBackend.IMsg = {
            role: "user",
            content: query.question,
          };
          if (query.isFile) {
            newMsg.content = await getFileMsg(
              decodeURIComponent(query.sessionId)
            );
          }
          // 仅保留后30条记录
          msgs = msgs.slice(-10);
          // 对msgs的操作会影响到数据存储
          msgs = msgs.concat(newMsg);
          // sql3 和vscode版本存在冲突

          let content = "";
          let lastData: any;
          for await (const res of props?.context?.assistant.determine(msgs) ||
            []) {
            console.log("AI解析答案", res);
            let data: any = res?.data;
            content += data?.result || "";
            //已经接收完成,切换返回有数据(排除返回为空的情况)
            if (!res?.isNotDone) {
              if (content) {
                chat.push(newMsg, {
                  role: "assistant",
                  content: content,
                  source: data || lastData,
                });
              } else {
                new Exception(
                  `出现异常: ${data?.error_msg || lastData?.error_msg}`
                );
              }
            }
            if (res?.isSuccess) {
              props.target.webview.postMessage(
                assisVscode.ServiceCore.createSuccessMsg(
                  "/ai/chat",
                  res.data,
                  res.isNotDone
                )
              );
            } else {
              props.target.webview.postMessage(
                assisVscode.ServiceCore.createErrorMsg(
                  "/ai/chat",
                  res?.msg || "AI核心异常"
                )
              );
            }
            lastData = res?.data;
          }
          // let res = await assistant.determine(msgs);
        } catch (error) {
          console.warn("ai/chat", error);
          props.target.webview.postMessage(
            assisVscode.ServiceCore.createErrorMsg("/ai/chat", "服务器异常")
          );
        }
      },
    },
    // 获取聊天历史
    {
      url: "/ai/chat/list",
      do: async (props) => {
        try {
          let query = props.message.data;
          let chatdb = await useChatList(query.sessionId);
          props.target.webview.postMessage(
            assisVscode.ServiceCore.createSuccessMsg(
              "/ai/chat/list",
              chatdb.db.data.messages
            )
          );
        } catch (error) {
          props.target.webview.postMessage(
            assisVscode.ServiceCore.createErrorMsg(
              "/ai/chat/list",
              "服务器异常"
            )
          );
        }
      },
    },
    // 删除聊天记录
    {
      url: "/ai/chat/deleteAll",
      do: async (props) => {
        try {
          let query = props.message.data;
          let chatdb = await useChatList(query.sessionId);
          chatdb.db.update((db) => {
            db.messages = [];
          });
          await chatdb.db.write();
          props.target.webview.postMessage(
            assisVscode.ServiceCore.createSuccessMsg("/ai/chat/deleteAll", null)
          );
        } catch (error) {
          props.target.webview.postMessage(
            assisVscode.ServiceCore.createErrorMsg(
              "/ai/chat/deleteAll",
              "服务器异常"
            )
          );
        }
      },
    },
    // 获取所有的Action
    {
      url: "/actions/getlist",
      do: async (props) => {
        try {
          let actions = props.context?.assistant.decisionCore.actions;
          props.target.webview.postMessage(
            assisVscode.ServiceCore.createSuccessMsg(
              "/actions/getlist",
              actions?.value
            )
          );
        } catch (error) {
          props.target.webview.postMessage(
            assisVscode.ServiceCore.createErrorMsg(
              "/actions/getlist",
              "服务器异常"
            )
          );
        }
      },
    },
    // 用户执行Action
    {
      url: "/actions/exec",
      do: async (props) => {
        try {
          const res = await props.context?.assistant.exec(
            props.message.data.id,
            props.message.data.commond
          );
          props.target.webview.postMessage(
            assisVscode.ServiceCore.createSuccessMsg("/actions/exec", res)
          );
        } catch (error) {}
      },
    },
    // 执行任务
    {
      url: "/ai/project-start",
      do: async (props) => {
        const res = await props.context?.assistant.taskExec({
          input: props.message.data.input,
        });
        props.target.webview.postMessage(
          assisVscode.ServiceCore.createSuccessMsg(
            "/ai/project-start",
            "任务执行中"
          )
        );
      },
    },
    {
      url: "/ai/project/list",
      do: async (props) => {
        // const res = await props.context?.assistant.
        const res = await props.context?.assistant.getTaskHistory();
        props.target.webview.postMessage(
          assisVscode.ServiceCore.createSuccessMsg("/ai/project/list", res)
        );
      },
    },
    // {
    //   url: "/ai/project-goon",
    //   do: async (props) => {
    //     const res = await props.context?.assistant.goOnExec(
    //       props.message.data.taskId,
    //       props.message.data.answer
    //     );
    //     props.target.webview.postMessage(
    //       assisVscode.ServiceCore.createSuccessMsg("/ai/project-goon", res)
    //     );
    //   },
    // },
    {
      url: "/think/getTreeList",
      do: async (props) => {
        if (props.message.data.name) {
          const res = await props.context?.assistant.think.getTreeByName(
            props.message.data.name,
            props.message.data.steps
          );
          props.target.webview.postMessage(
            assisVscode.ServiceCore.createSuccessMsg("/think/getTreeList", res)
          );
        } else {
          const res = await props.context?.assistant.think.getRootKen();
          props.target.webview.postMessage(
            assisVscode.ServiceCore.createSuccessMsg("/think/getTreeList", res)
          );
        }
      },
    },
    {
      url: "/think/getKenList",
      do: async (props) => {
        console.log(props.message.data, "/think/getKenList");
        if (props.message.data.name) {
          const res = await props.context?.assistant.think.getKenByName(
            props.message.data.name,
            props.message.data.steps,
            true
          );
          props.target.webview.postMessage(
            assisVscode.ServiceCore.createSuccessMsg("/think/getKenList", res)
          );
        } else {
          const res = await props.context?.assistant.think.getRootKen(6, true);
          props.target.webview.postMessage(
            assisVscode.ServiceCore.createSuccessMsg("/think/getKenList", res)
          );
        }
      },
    },
    {
      url: "/think/push",
      do: async (props) => {
        const res = await props.context?.assistant.think.pushConcept(
          props.message.data
        );
        props.target.webview.postMessage(
          assisVscode.ServiceCore.createSuccessMsg("/think/push", res)
        );
      },
    },
    {
      url: "/task/exec",
      do: async (props) => {
        const data = props.message.data;
        const taskInfoDb = await assisVscode.useWorkspaceLowDB("task.json", {
          tasks: {} as Record<string, IAITask>,
        });

        // 继续执行
        if (data.id) {
        }

        // 新建任务
        else {
          const t = new AITask(data.question);
          taskInfoDb.data.tasks[t.id] = t;
        }
      },
    },
    {
      url: "/storage",
      do: async (props) => {
        const data = props.message.data;
        switch (data.type) {
          case "get":
            props.target.webview.postMessage(
              assisVscode.ServiceCore.createSuccessMsg(
                "/storage",
                assisVscode.storage.get(data.key)
              )
            );
            break;
          case "set":
            assisVscode.storage.set(data.key, data.value);
            break;
        }
      },
    }
  );
