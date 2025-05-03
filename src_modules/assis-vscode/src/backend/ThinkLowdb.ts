// import { Exception } from '@/base/serve/exception'
import {
  ExceptionClass,
  IConcept,
  IConceptContent,
  IConceptWithContent,
  IThink,
  Think,
} from "./Think";
import { Low } from "cjs-lowdb";
import { useLowDB } from "./base/lowdb";
import { ToastType } from "./base/types";
import path from "path";
import { mkdir } from "fs/promises";

export type DBList<T> = {
  data: T[];
};

const defaulIConceptData: DBList<IConcept> = { data: [] };
const defaulIConceptContentData: DBList<IConceptContent> = { data: [] };
export class ThinkLowdb<E extends Error> extends Think<E> implements IThink {
  /**
   * 概念库
   */
  private dbConcept: Low<DBList<IConcept>> | null = null;
  /**
   * 概念内容库
   */
  private dbConceptContent: Low<DBList<IConceptContent>> | null = null;

  /**
   *
   * @param unique
   * @param saveFolder Uri.fspath
   */
  constructor(
    private unique: string,
    private saveFolder: string,
    Exception: ExceptionClass<E>
  ) {
    super(Exception);
    console.log("ThinkLowdb", this.unique, this.saveFolder);
    this.init();
  }
  getConceptByKey(key: string): Promise<void | IConcept>;
  getConceptByKey(keys: string[]): Promise<void | IConcept[]>;
  getConceptByKey(
    keys: unknown
  ): Promise<void | IConcept[]> | Promise<void | IConcept> {
    throw new Error("Method not implemented.");
  }
  /**
   * 分辨:写入(push/update)概念同名是会触发分辨(原则上不建议同名,但不同的unique下允许同名概念存在)
   * @param concepts [[source,...other],[source,...other]]
   * @returns 待概念列表: source[]
   */
  async distinguish<T extends IConcept>(concepts: T[][]) {
    return concepts.map((it) => it[0]);
  }

  /**
   * 获取概念
   * @param key 键
   * @returns
   */
  getConceptContentByKey(key: string): Promise<IConceptContent | void>;
  getConceptContentByKey(keys: string[]): Promise<IConceptContent[] | void>;
  async getConceptContentByKey(keys: string | string[]) {
    const data = this.dbConceptContent?.data.data.filter((it) => {
      return ([] as string[]).concat(keys).includes(it.key);
    });
    if (!data) {
      return [];
    }
    if (typeof keys === "string") {
      return data[0] as any;
    }
    return data;
  }

  /**
   * 获取概念(unique越匹配越优先) 模糊查询截止到这里
   * @param name 概念名称:精准匹配
   * @returns [Concept] 名称相同的前提下,第一个最匹配,最后一个为全局
   */
  getConceptsByName(
    name: string,
    option?: { withContent: boolean }
  ): Promise<IConceptWithContent[] | void>;
  getConceptsByName(
    names: string[],
    option?: { withContent: boolean }
  ): Promise<IConceptWithContent[][] | void>;
  async getConceptsByName(
    names: string[] | string,
    { withContent = false } = {}
  ) {
    function isExactPrefix(suffix: string, unique: string): boolean {
      // 确保 suffix 是 unique 的精确前缀，且 suffix 的长度不超过 unique
      return suffix.length <= unique.length && unique.startsWith(suffix);
    }

    const name = ([] as string[]).concat(names);
    const res = name
      .map((na) => {
        const regex = new RegExp(`^(.*)@(.*)$`);
        const concepts = this.dbConcept?.data.data
          .filter((concept) => {
            // 替换掉"任意字符加@符号结尾"为空字符串
            const suffix = concept.key?.replace(/.*?@/, "");
            // console.log('------suffix', suffix, concept.key, na)
            return (
              concept.name == na && isExactPrefix(suffix || "", this.unique)
            );
          })
          .map((it) => {
            console.log(
              "withContent:",
              withContent,
              this.dbConceptContent?.data
            );
            if (!withContent) {
              return it;
            }
            return {
              ...it,
              content: this.dbConceptContent?.data.data.find(
                (con) => con.key == it.contentKey
              ),
            };
          })
          .sort((a, b) => {
            const suffixA = (a.key || "").match(regex)![1].length;
            const suffixB = (b.key || "")?.match(regex)![1].length;
            return suffixB - suffixA; // 按 suffix 的长度降序排序（越长优先级越高）
          });

        // return concepts || [this.createFreeNode(na)]
        return concepts;
      })
      .filter((concepts) => !!concepts);

    if (!res.length) {
      return null;
      // throw new this.Exception(`没有找到任何概念:${typeof names == 'object' ? names.join(',') : names}`)
    }
    if (typeof names == "string") {
      return res[0] as any; // 已过滤，过滤类型判断有问题
    }
    return res;

    // 这是函数入口参数如下
    // unique: xxxxx
    // name: AAAA

    // 对该列表进行过滤操作
    // const listData:any[] = []

    // 这是返回结果要求
    // AAAA@ :符合要求,匹配程度最低    => 放最后  []2
    // AAAA@xxx: 符合要求,匹配程度中等  =>放中间  []1
    // AAAA@xxxxx =>:符合要求,且匹配度最高 =>放第一个 []0
    // AAAA@xxxxxx =>不符合要求 no
    // AAAA@yyyyy => 不符合要求
    // return []
    // "".startsWith
  }

  /**
   * 创建一个游离立即概念节点
   * @param name
   * @param unique
   */
  protected createFreeNode(name: string, unique = this.unique) {
    const key = this.getKey(name, unique);
    // const contentKey = this.getKey(name, unique)
    const concept: IConcept = {
      key,
      name,
      unique,
      children: [],
      parent: ThinkLowdb.ThinkConstant.Free,
    };
  }

  /**
   * 获取指定键的视野
   */
  async getKenByName(name: string, steps = 4, withContent = false) {
    // 传入参数
    // name: string
    // steps: number

    // 用于根据名称获取Tree的相邻节点
    // 获取到相邻节点后再递归获取相邻节点, 每次steps +1
    // 直到steps 等于传入的steps, 获取没有相邻节点
    // 相邻节点: 当前节点的父节点"parent", 子节点"children"

    // 返回所有遍历到的节点
    const res: Map<string, IConcept[]> = new Map();
    let names = [name];
    while (steps > 0 && names.length) {
      steps--;
      const data = await this.getConceptsByName(names, { withContent });
      console.log("PromptCreator:init:data:getConceptsByName", data);
      names = [];
      if (data) {
        data.map((item) => {
          console.log(item, "PromptCreator:init:data:item");
          if (item.length) {
            res.set(item[0].name, item); // 会有重复赋值情况,先不管了, Map去重
            // 设置游标
            const best = item[0];
            names.push(best.parent, ...(best.children || []));
          }
        });
      }
    }
    if (res.size) {
      return Array.from(res.values());
    }
    throw new this.Exception(`没有找到相关概念:${name}`, {
      type: ToastType.Error,
    });
  }

  /**
   * 获取指定键的树
   * @param name 节点名称
   * @param steps 查询的最大层级
   * @returns
   */
  async getTreeByName(name: string, steps = 6, withContent = false) {
    const res: Map<string, IConcept[]> = new Map();
    // console.log(name, 'getTreeByName:name')
    let names = [name];
    while (steps > 0 && names.length) {
      steps--;
      const data = await this.getConceptsByName(names, { withContent });
      names = [];
      if (data) {
        data.map((item) => {
          if (item.length) {
            res.set(item[0].name, item); // 会有重复赋值情况,先不管了, Map去重
            // 设置游标
            const best = item[0];
            names.push(...(best.children || []));
          }
        });
      }
    }
    // console.log('getTreeByName:Array.from(res.values())', Array.from(res.values()))
    return Array.from(res.values());
    // if (res.size) {
    //   return Array.from(res.values())
    // }
    // throw new this.Exception(`没有找到相关概念:${name}`, { type: ToastType.Error })
  }

  /**
   * 获取根节点为Root的视野
   * @returns
   */
  async getRootKen(steps = 6, withContent = false) {
    return await this.getKenByName(
      ThinkLowdb.ThinkConstant.Root,
      steps,
      withContent
    );
  }

  /**
   * 获取游离节点
   * @returns
   */
  async getFreeConceptList() {
    return this.dbConcept?.data.data.filter(
      (c) => c.parent === ThinkLowdb.ThinkConstant.Free
    );
  }

  // TODO 指定父键, 但父键无对应元素怎么处理 入库时若发现则创建一个`空父:parent为Free的节点`
  /**
   * 获取从指定节点到根节点`Root/Free`的链路
   */
  async getConceptLinetoStartByName(key: string | string[]) {
    throw new this.Exception("getLinetoStart is not implement", {
      type: ToastType.Error,
    });
  }

  /**
   * 根据名称搜索概念列表
   * @param name 名称模糊匹配
   */
  async searchConceptListByName(name: string) {
    throw new this.Exception("searchByName is not implement", {
      type: ToastType.Error,
    });
  }

  /**
   * 写入概念 当concepts.content存在时更新内容表concepts.content key会以程序生成
   * @description 烧脑的写入
   *  @param concepts 不用包含key
   */
  async pushConcept(...concepts: IConceptWithContent[]) {
    // console.log('pushConcept', concepts)
    const allNames: string[] = concepts
      .map((it) => it.name || "")
      .filter((it) => it);

    const dbConceptss = (await this.getConceptsByName(allNames)) || [];

    // // 从数据库查询到的数据
    // const dbConceptssMap = new Map(
    //   dbConceptss.filter((it) => it?.length).map((it) => [it[0].name, it])
    // )

    const conceptMap = new Map(
      concepts.map((it) => {
        const name = it.name || "";
        return [name, it];
      })
    );

    /** 分辨好的概念 */
    const conceptList = await this.distinguish(
      dbConceptss
        .filter((it) => it?.length)
        .map((it) => {
          const name = it[0].name;
          // const key = this.getKey(name, this.unique)
          // conceptMap.get(key) 必定存在
          const item = conceptMap.get(name);
          conceptMap.delete(name); // 删除后: 剩下的是非重复的,不用分辨的
          return [item as any, ...it];
        })
    );
    const data = this.addChildrenKeys(
      Array.from(conceptMap.values()) // 剩下的, 非重复的, 不用分辨的
        .concat(conceptList), // 经过分辨好的概念
      this.unique
    ).map((concept) => {
      const key = this.getKey(concept.name, this.unique);
      const contentKey = ThinkLowdb.getUniqueString();
      return {
        content: concept.content
          ? { ...concept.content, key: contentKey }
          : null,
        concept: { ...concept, content: undefined, key, contentKey },
      };
    });
    await this.dbConceptContent?.update((db) => {
      db.data.push(...data.map((it) => it.content).filter((it) => !!it));
    });
    // console.log(
    //   'pushConcept',
    //   data.map((it) => it.concept)
    // )

    await this.dbConcept?.update((db) =>
      db.data.push(...data.map((it) => it.concept))
    );
  }

  /**
   * 删除概念
   * @param names
   */
  async deleteConcept(...names: string[]) {
    // TODO 删除时,若存在子节点,则仅情况节点内容(变为空节点)(去掉除了键名以外的其他内容)
    // 若不存在子节点,则删除节点
    // 可存储到回收站附表中
    // 还原: 当子节点还在执行当前节点时,则还原到当前节点, 否则去掉的children对应的key(取消关联)
    throw new this.Exception("deleteConcept is not implement", {
      type: ToastType.Error,
    });
  }

  /**
   * 删除概念及子节点
   * @param names
   */
  async deleteConceptAndChildren(...names: string[]) {
    // TODO 删除时,若存在子节点也一并删除
    throw new this.Exception("deleteConcept is not implement", {
      type: ToastType.Error,
    });
  }

  /**
   * 获取关系列表
   */
  async getRelationAllList(names?: string | string[]) {
    // TODO 关系之下,全是关系
    throw new this.Exception("getRelationlist is not implement", {
      type: ToastType.Error,
    });
  }

  /**
   * 获取关系列表, 仅获取当前节点的孩子节点
   */
  async getRelationListByName(names: string | string[]) {
    // 亲属=>家人=>父  可以形成一条关系链
    // 亲属=>家人=>页  可以形成一条关系链
    // TODO 概念交叉的时候怎么搞
    // 家族=>父
    // 家族=>爷
    throw new this.Exception("getRelationlist is not implement", {
      type: ToastType.Error,
    });
  }

  /**
   * 初始化
   */
  async init() {
    console.log(
      "---------初始化init:ThinkLowdb",
      path.join(this.saveFolder, "conceptDB.json")
    );
    try {
      await mkdir(this.saveFolder);
    } catch (error) {}
    this.dbConcept = await useLowDB(
      path.join(this.saveFolder, "conceptDB.json"),
      defaulIConceptData
    );
    this.dbConceptContent = await useLowDB(
      path.join(this.saveFolder, "conceptContentDB.json"),
      defaulIConceptContentData
    );
    if (!this.dbConcept.data.data?.length) {
      await this.dbConcept.update((data) => {
        console.log("update", data);
        if (!data.data?.length) {
          data.data = [];
          data.data.push(
            {
              name: ThinkLowdb.ThinkConstant.Root,
              key: this.getKey(ThinkLowdb.ThinkConstant.Root, ""),
              parent: ThinkLowdb.ThinkConstant.Zero,
              children: [
                ThinkLowdb.ThinkConstant.Relation,
                ThinkLowdb.ThinkConstant.Node,
              ],
            },
            {
              name: ThinkLowdb.ThinkConstant.Relation,
              key: this.getKey(ThinkLowdb.ThinkConstant.Relation, ""),
              parent: ThinkLowdb.ThinkConstant.Root,
              children: [],
            },
            {
              name: ThinkLowdb.ThinkConstant.Node,
              key: this.getKey(ThinkLowdb.ThinkConstant.Node, ""),
              parent: ThinkLowdb.ThinkConstant.Root,
              children: [],
            }
          );
        }
      });
    }
  }

  /**
   * 获取所有概念:用于测试
   * @returns
   */
  getAllDbConcept() {
    return this.dbConcept?.data.data;
  }

  /**
   * 获取所有概念详情:用于测试
   * @returns
   */
  getAllDbConceptContent() {
    return this.dbConceptContent?.data.data;
  }
}
