# NebulaKnow

AI-Tools

## 技术栈

| 类型       | 技术        | 版本   | 链接                                                       |
| :--------- | :---------- | :----- | :--------------------------------------------------------- |
| Node       | Node        | >18    | <https://nodejs.org/en>                                    |
| 包管理工具 | pnpm        | -      | <https://pnpm.io/zh/>                                      |
| 主框架     | React18     | 18.2.0 | <https://react.docschina.org/>                             |
| 构建工具   | Vite5       | 5.1.4  | <https://cn.vitejs.dev/guide/>                             |
| 组件库     | NextUI      | 2.2.9  | <https://nextui.org/docs/components/button>                |
| 组件库     | Antd        | 5.14.2 | <https://nextui.org/docs/components/button>                |
| 样式       | tailwindcss | 3.4.1  | <https://tailwindcss.com>                                  |
| 状态管理   | Valtio      | 1.13.1 | <https://valtio.pmnd.rs/docs/introduction/getting-started> |

## 代码组织结构

- 核心目标: 把代码的作用域根据需求限制在指定的范围, 清晰可见的展示

```javascript
├─api                 // 全局作用域: api
├─assets              // 全局作用域: 静态资源
├─components          // 全局作用域: 组件库,供给整个项目使用
│ └─DialogueHead      // 全局作用域: └─DialogueHead组件
├─hooks               // 全局作用域: 公用 hook
├─pages               // 全局作用域: 页面文件夹
│  ├─About            // ├─About 页面 /about
|  |   ├─index.tsx    //  About组件
|  |   ├─useXxx.tsx   //  仅用于About组件的hook
|  |   └─index.scss   //  仅用于About组件的样式
│  └─Index            // └─Index 页面 /index
│      ├─AiDialogue   //    ├─AiDialogue  /index/aiDialogue
│      └─components   //    └─components  仅用于Index文件夹下内容的组件存放文件夹
│          └─HomeLayout//      └─HomeLayout HomeLayout组件
├─store               // 全局作用域: 公用状态管理
└─utils               // 全局作用域: 公用工具
```

### 文件(文件夹)命名规范

```ts
// 文件(文件夹)命名规范

// 1. 默认-----------------小驼峰命名: 如 pages, myPages

// 2. 组件文件,组件文件夹---大驼峰命名: 如 DialogueHead, About
//   (备注: 单个文件存在多个组件,以默认导出组件为准, 即和默认导出组件同名)
//   (备注2: 组件文件夹,即某个文件夹内部仅默认导出某单个组件(如: DialogueHead/index.tsx 默认导出component-DialogueHead))

// 3. class文件------------大驼峰命名: 如: Person文件默认导出class-Person
```

## 开发说明

```shell
# 1.
pnpm install
# 2.
pnpm dev

```

### 样式开发说明

- 尽可能使用`tailwindcss`

- 尽可能使用主题(包含颜色,布局和尺寸,具体参考 [NextUI](https://nextui.org/docs/customization/theme))

### 组件库说明

优先使用 NextUI， 然后再选 Antd

### Form 表单

`hook-form-react` (自建的) 暂不支持嵌套对象
