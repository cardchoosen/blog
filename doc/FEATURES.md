# FEATURES

> 本文档描述 Hexo 博客项目的产品功能与用户可见行为。
> AI 阅读此文档可快速理解项目"做什么"和"提供什么"。

## 产品定位

基于 Hexo + GitHub Pages 的个人技术博客。源码托管在 GitHub，静态站通过 GitHub Pages 免费提供访问，采用分支隔离法（`main` 源码 / `gh-pages` 静态站）管理发布流程。使用自制定制主题 `geek-shelf`，定位为"极客风技术笔记博客"。

同时提供本机文章管理工具 `post-admin`，用于更方便地导入 AI 生成的文章包、管理文章与素材、预览待发布内容变更，并一键构建发布到 GitHub Pages。

## 站点信息

| 项 | 值 |
|----|----|
| 标题 | Anemone's Blog |
| 作者 | nannnzhang |
| 语言 | 简体中文 |
| 时区 | Asia/Shanghai |
| 访问入口 | https://anemone.wiki |
| 主题 | geek-shelf（自制，纯黑白极客风） |

## 核心功能

### 1. 内容管理
- **文章**：Markdown 编写，存放于 `source/_posts/`，front-matter 管理元信息
- **草稿**：`hexo new draft <title>` 生成草稿，存放于 `source/_drafts/`（默认不渲染）
- **自定义页面**：`hexo new page <name>` 生成独立页面
- **文章模板**：`scaffolds/` 下提供 `post.md` / `draft.md` / `page.md` 三种模板
- **本机后台**：`npm run post:admin` 启动 `http://127.0.0.1:4100/`，提供文章列表、导入、新建、修改、分类重命名、删除、发布等操作
- **CLI 工具**：`npm run post:import` / `post:list` / `post:delete` 支持单篇或批量文章包导入、文章列表查看、删除到回收站
- **文章包格式**：一篇文章一个目录，包含 `post.md` 与可选 `assets/`，格式详见 `tools/post-admin/POST_INPUT_FORMAT.md`
- **素材管理**：图片导入到 `source/images/posts/<slug>/`，其他附件导入到 `source/files/posts/<slug>/`，Markdown 引用自动重写为站点根路径
- **段落排版**：文章普通正文段落自动首行缩进 `2em`，引用块内段落不缩进
- **系列排序**：文章可选 `series_order`，同分类内按该数字升序排列，支持负数；未设置时保留日期倒序兜底
- **公开控制**：文章可通过 `published: false` 隐藏，不对外生成；post-admin 支持按分类批量隐藏/公开

### 2. 左侧分类书架（核心交互）
- **数据源**：文章 front-matter 的 `categories` 字段
- **形态**：左侧固定栏 280px 宽，顶部"目录"标题（加粗、左侧粗竖线 accent bar 作为视觉提示）
- **多开交互**：
  - 默认所有分类折叠
  - 点击分类按钮 → 展开该分类下所有文章列表
  - **允许多开**：点击不影响其他已展开分类
  - 再次点击已展开分类 → 收起
- **状态持久化**：展开状态存于 localStorage，跨页面保持。用户在 A 页面手动展开多个分类后，跳转到文章页时这些展开状态不丢失
- **当前文章定位**：进入文章详情页时，EJS 服务端渲染即给当前文章所在分类的按钮加 `active` 状态、列表加 `open` 状态、文章链接加 `current` 高亮——无 JS 后加 class 导致的闪烁
- **系列文章排序**：分类下文章优先按 `series_order` 升序排列；适合课程笔记的 `01/02/03` 顺序展示

### 3. 深/浅主题切换
- **顶栏右侧切换按钮**：显示"深"/"浅"两字叠加，当前主题字放大在左（标识当前主题），另一字缩小半透明在右
- **按钮 hover/focus 不变背景色**：避免在黑底顶栏内被全局 hover 规则覆盖导致看不清
- **三套主题变量**：默认深色 / `@media prefers-color-scheme: light` / `html.theme-light` `html.theme-dark` 手动覆盖（优先级最高）
- **优先级**：localStorage > 系统偏好 > 默认深色
- **防 FOUC**：`<head>` 内联脚本在 CSS 加载前根据 localStorage 或系统偏好给 `<html>` 加 class
- **浅色主题**：白底 `#fff` + 深灰字 `#1a1a1a` + 代码块底色 `#e8e8e8`
- **深色主题**：深灰底 `#1a1a1a` + 浅灰字 `#e0e0e0` + 代码块底色 `#0a0a0a`（比页面背景略黑）

### 3. 永久链接
- 格式：`/:year/:month/:day/:title/`
- 示例：`/2026/06/25/hello-world/`

### 5. 分类与标签
- 文章 front-matter 中声明 `categories` 与 `tags`
- 顶栏提供 `CATEGORY` 与 `TAG` 入口，可直接进入分类/标签总览页
- `/categories/` 默认展示所有分类及文章数，点击分类进入对应文章列表
- `/tags/` 默认展示所有标签及文章数，点击标签进入对应文章列表
- 自动生成 `/categories/<name>/` 与 `/tags/<name>/` 索引页
- 文章详情页的 meta 区显示分类链接与标签链接（# 前缀）
- post-admin 支持批量重命名分类，所有关联文章的 front-matter 会一起更新

### 6. 归档
- 按时间归档，生成 `/archives/` 索引页
- 按年分组显示（年度小色块标签 + 日期+标题列表）
- 依赖 hexo-generator-archive

### 7. 首页分页
- 首页每页 10 篇文章
- 按发布日期倒序排列
- 底部分页导航（OLDER / NEWER）

### 8. 代码语法高亮
- 引擎：Hexo 内置 highlight.js，`hljs: true` 输出标准 `.hljs-xxx` token class
- **彩色高亮**：引入 highlight.js 官方主题 CSS，跟随深/浅主题切换
  - 浅色主题：atom-one-light（紫红关键字、绿字符串、蓝数字等柔和配色）
  - 深色主题：atom-one-dark（同色系但更鲜艳，适配深色底）
- **已关闭行号**（`line_number: false`）
- **代码块底色由主题控制**（不被 hljs 主题覆盖）：浅色 `#e8e8e8` / 深色 `#0a0a0a`
- **主题切换时 token 颜色同步切换**：JS 通过 `link.media` 启停对应 hljs 主题 CSS
- 鼠标 hover/聚焦不变色（已修复浏览器默认 focus 高亮 bug）

### 9. 评论
- 文章详情页正文下方提供 `COMMENTS` 评论区
- 评论系统使用 utterances，按页面 `pathname` 将文章评论映射到 GitHub Issue
- 评论框首次加载时按当前页面主题初始化，深/浅主题切换时同步切换为 `github-light` / `github-dark`
- 生效前置条件：`cardchoosen/blog` 仓库需要安装 utterances GitHub App，并允许创建 issue

### 10. 阅读量统计
- 文章详情页 meta 行显示阅读量，位置在日期、分类、标签之后
- 统计使用 Busuanzi，根据当前页面 URL 记录和回填 `page_pv`
- 线上访问时累计阅读量；如果第三方服务不可用，页面保留 `阅读 -` 占位

### 11. 视觉风格（极客黑白）
- 纯黑白主调，无彩色强调色
- 灰阶过渡：hover 浅灰底 `#f0f0f0`，active 中灰底 `#e0e0e0`（浅色主题）
- 顶栏黑色色块 + 反白文字（站点标题 + 导航 + 主题切换按钮）
- 顶栏、侧栏、标题使用等宽字体，正文使用系统阅读字体，降低中文长文阅读疲劳
- 首页列表、文章正文、评论区、归档、分类、标签等主体内容在右侧内容区内居中显示，保持 780px 阅读宽度
- 首页文章列表保持紧凑间距；正文 h2/h3 通过左侧标记和分割线增强层级
- 无圆角 / 无阴影 / 无渐变
- 0.12s 平滑过渡
- `overscroll-behavior: none` 禁用弹性滚动

### 12. 本地预览
- `npm run server` 启动本地服务，访问 `http://localhost:4000/`
- 监听 source/ 和 themes/ 文件变化自动重载
- 注意：改 `_config.yml` 站点配置后需重启 server

### 13. 本地后台发布
- **发布入口**：post-admin 的"发布"页提供"仅构建检查"与"构建并发布"两个按钮
- **构建检查**：执行 `npm run build`，用于发布前确认 Hexo 能正常生成静态站
- **构建并发布**：依次执行 `npm run clean` → `npm run build` → `npm run deploy`
- **空站保护**：构建后如果没有公开文章或缺少 `public/index.html`，发布前会要求二次确认；命令行需显式传 `--allow-empty-site`
- **差异可视化**：只展示博客内容相关目录的变化：`source/_posts/`、`source/images/posts/`、`source/files/posts/`
- **内容变更列表**：以"目录 + 文件名 + 新增/删除行数或 binary"方式展示，贴合站点黑白等宽风格
- **发布快照**：发布成功后记录 `.tmp/post-admin/published-content.json`，刷新后不再显示已发布内容差异；后续只有再次修改文章或素材才显示新差异
- **部署凭据**：`_config.yml` 的 deploy repo 使用 SSH 地址 `git@github.com:cardchoosen/blog.git`，依赖本机 GitHub SSH key

### 14. 本地后台修改文章
- **修改入口**：post-admin 的"修改"页列出当前所有文章
- **加载文章**：点击"修改"后读取 `source/_posts/<slug>.md`，回填标题、日期、分类、标签、摘要与正文 Markdown
- **保存修改**：保存后直接写回原 Markdown 文件，并刷新文章列表与发布差异
- **Slug 策略**：修改页的 slug 只读，不做文章文件改名或素材路径迁移
- **排序字段**：新建/修改表单支持 `series_order`，可填写负数、0 或正整数
- **写作辅助**：新建文章页的正文标题右侧显示可复制的 `&emsp;&emsp;`，用于手动段首缩进

### 15. 本地后台分类管理
- **分类列表**：列出当前所有分类、文章数量与关联文章
- **重命名预览**：输入旧分类名和新分类名后，可先预览会影响哪些文章
- **批量写回**：确认后统一更新所有关联文章的 front-matter `categories`
- **安全写出**：分类名包含冒号、中文或特殊字符时自动加引号，避免 YAML 解析成对象
- **隐藏/公开**：可按分类预览并批量写入或移除 `published: false`，隐藏文章不会对外生成

### 16. 一键部署（命令行）
- 命令：`npx hexo clean && npx hexo g && npx hexo d`
- 流程：清理 → 生成静态站 → 推送到 `gh-pages` 分支
- GitHub Pages 自动识别 `gh-pages` 分支并提供访问

### 17. 响应式
- 桌面端（>768px）：左书架 + 右内容 双栏布局
- 移动端（≤768px）：书架堆叠到内容上方，单栏布局

## 当前内容

- **文章数**：6 篇
  - `bilibili-bv199rlyjez2-p1.md`（CMU 10-414 课程整理文章）
  - `bilibili-bv1opafzpef9-p1.md`（B 站课程整理文章 01）
  - `bilibili-bv1knphzpera-p1.md`（B 站课程整理文章 02）
  - `my-note-260724.md`（日常随笔）
  - `my-note-260727.md`（日常随笔）
  - `my-note-260728.md`（日常随笔）
- **自定义页面**：无
- **主题**：geek-shelf（已实现并跑通）
- **本地内容工具**：post-admin 已实现并跑通，支持 Web UI + CLI

## 待规划 / 未实现

- [ ] 站点统计（如 Google Analytics / Umami）
- [ ] SEO 优化（sitemap、robots.txt、meta 信息）
- [ ] 图床方案接入
- [ ] About / 友链 等独立页面
- [ ] 全站搜索功能
- [ ] 文章目录（TOC）自动生成

> 上述未实现项仅为规划候选，不代表已确定实施。具体功能以用户后续需求为准。
