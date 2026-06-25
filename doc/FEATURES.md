# FEATURES

> 本文档描述 Hexo 博客项目的产品功能与用户可见行为。
> AI 阅读此文档可快速理解项目"做什么"和"提供什么"。

## 产品定位

基于 Hexo + GitHub Pages 的个人技术博客。源码托管在 GitHub，静态站通过 GitHub Pages 免费提供访问，采用分支隔离法（`main` 源码 / `gh-pages` 静态站）管理发布流程。使用自制定制主题 `geek-shelf`，定位为"极客风技术笔记博客"。

## 站点信息

| 项 | 值 |
|----|----|
| 标题 | Anemone's Blog |
| 作者 | nannnzhang |
| 语言 | 简体中文 |
| 时区 | Asia/Shanghai |
| 访问入口 | https://cardchoosen.github.io/blog |
| 主题 | geek-shelf（自制，纯黑白极客风） |

## 核心功能

### 1. 内容管理
- **文章**：Markdown 编写，存放于 `source/_posts/`，front-matter 管理元信息
- **草稿**：`hexo new draft <title>` 生成草稿，存放于 `source/_drafts/`（默认不渲染）
- **自定义页面**：`hexo new page <name>` 生成独立页面
- **文章模板**：`scaffolds/` 下提供 `post.md` / `draft.md` / `page.md` 三种模板

### 2. 左侧分类书架（核心交互）
- **数据源**：文章 front-matter 的 `categories` 字段
- **形态**：左侧固定栏 280px 宽，顶部"目录"小字标识
- **手风琴交互**：
  - 默认所有分类折叠
  - 点击分类按钮 → 展开该分类下所有文章列表
  - 同时只展开一个分类，点其他自动收起
  - 再次点击已展开分类 → 收起
- **当前文章定位**：进入文章详情页时，自动展开该文章所在的分类，并高亮当前文章链接（反白显示）

### 3. 永久链接
- 格式：`/:year/:month/:day/:title/`
- 示例：`/2026/06/25/hello-world/`

### 4. 分类与标签
- 文章 front-matter 中声明 `categories` 与 `tags`
- 自动生成 `/categories/<name>/` 与 `/tags/<name>/` 索引页
- 文章详情页的 meta 区显示分类链接与标签链接（# 前缀）

### 5. 归档
- 按时间归档，生成 `/archives/` 索引页
- 按年分组显示（年度小色块标签 + 日期+标题列表）
- 依赖 hexo-generator-archive

### 6. 首页分页
- 首页每页 10 篇文章
- 按发布日期倒序排列
- 底部分页导航（OLDER / NEWER）

### 7. 代码高亮
- 引擎：highlight.js
- **已关闭行号**（`line_number: false`）
- 代码块深灰底 `#2a2a2a` + 浅灰字 `#e0e0e0`
- 鼠标 hover/聚焦不变色（已修复浏览器默认 focus 高亮 bug）

### 8. 视觉风格（极客黑白）
- 纯黑白主调，无彩色强调色
- 灰阶过渡：hover 浅灰底 `#f0f0f0`，active 中灰底 `#e0e0e0`
- 顶栏黑色色块 + 反白文字（站点标题 + 导航）
- 全站等宽字体 `ui-monospace, SFMono-Regular, Menlo, Monaco, ...`
- 无圆角 / 无阴影 / 无渐变
- 0.12s 平滑过渡

### 9. 本地预览
- `npm run server` 启动本地服务，访问 `http://localhost:4000/blog/`
- 监听 source/ 和 themes/ 文件变化自动重载
- 注意：改 `_config.yml` 站点配置后需重启 server

### 10. 一键部署
- 命令：`npx hexo clean && npx hexo g && npx hexo d`
- 流程：清理 → 生成静态站 → 推送到 `gh-pages` 分支
- GitHub Pages 自动识别 `gh-pages` 分支并提供访问

### 11. 响应式
- 桌面端（>768px）：左书架 + 右内容 双栏布局
- 移动端（≤768px）：书架堆叠到内容上方，单栏布局

## 当前内容

- **文章数**：5 篇
  - `hello-world.md`（Hexo 默认示例，已加 Java/Go/TypeScript 多语言代码段）
  - `test-frontend-1.md` / `test-frontend-2.md`（categories: 前端，测试用）
  - `test-backend-1.md` / `test-backend-2.md`（categories: 后端，测试用）
- **自定义页面**：无
- **主题**：geek-shelf（已实现并跑通）

## 待规划 / 未实现

- [ ] 评论系统接入（如 Giscus）
- [ ] 站点统计（如 Google Analytics / Umami）
- [ ] 自定义域名绑定
- [ ] SEO 优化（sitemap、robots.txt、meta 信息）
- [ ] 图床方案接入
- [ ] About / 友链 等独立页面
- [ ] 全站搜索功能
- [ ] 文章目录（TOC）自动生成

> 上述未实现项仅为规划候选，不代表已确定实施。具体功能以用户后续需求为准。
