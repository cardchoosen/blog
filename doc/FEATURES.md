# FEATURES

> 本文档描述 Hexo 博客项目的产品功能与用户可见行为。
> AI 阅读此文档可快速理解项目"做什么"和"提供什么"。

## 产品定位

基于 Hexo + GitHub Pages 的个人技术博客。源码托管在 GitHub，静态站通过 GitHub Pages 免费提供访问，采用分支隔离法（`main` 源码 / `gh-pages` 静态站）管理发布流程。

## 站点信息

| 项 | 值 |
|----|----|
| 标题 | My Blog |
| 作者 | nannnzhang |
| 语言 | 简体中文 |
| 时区 | Asia/Shanghai |
| 访问入口 | https://cardchoosen.github.io/blog |
| 主题 | Landscape（默认） |

## 核心功能

### 1. 内容管理
- **文章**：Markdown 编写，存放于 `source/_posts/`，front-matter 管理元信息
- **草稿**：`hexo new draft <title>` 生成草稿，存放于 `source/_drafts/`（默认不渲染）
- **自定义页面**：`hexo new page <name>` 生成独立页面
- **文章模板**：`scaffolds/` 下提供 `post.md` / `draft.md` / `page.md` 三种模板

### 2. 永久链接
- 格式：`/:year/:month/:day/:title/`
- 示例：`/2026/06/25/hello-world/`
- 默认保留 `index.html` 后缀与 `.html` 扩展名（pretty_urls 配置）

### 3. 分类与标签
- 文章 front-matter 中声明 `categories` 与 `tags`
- 自动生成 `/categories/` 与 `/tags/` 索引页（依赖 hexo-generator-category/tag）
- 默认分类：`uncategorized`

### 4. 归档
- 按时间归档，生成 `/archives/` 与 `/archives/:year/:month/` 索引页
- 依赖 hexo-generator-archive

### 5. 首页分页
- 首页每页 10 篇文章
- 按发布日期倒序排列
- 生成 `/page/:n/` 分页路径

### 6. 代码高亮
- 引擎：highlight.js
- 行号显示：开启
- 主题样式：Landscape 默认

### 7. 本地预览
- `npm run server` 启动本地服务，访问 `http://localhost:4000`
- 支持文件变更实时刷新

### 8. 一键部署
- 命令：`npx hexo clean && npx hexo g && npx hexo d`
- 流程：清理 → 生成静态站 → 推送到 `gh-pages` 分支
- GitHub Pages 自动识别 `gh-pages` 分支并提供访问

## 当前内容

- **文章数**：1 篇（`hello-world.md`，Hexo 默认示例）
- **自定义页面**：无
- **主题定制**：无（使用 Landscape 默认样式）

## 待规划 / 未实现

- [ ] 自定义主题（如 NexT / Fluid 等，需用户决策）
- [ ] 评论系统接入（如 Giscus / Disqus）
- [ ] 站点统计（如 Google Analytics / Umami）
- [ ] 自定义域名绑定
- [ ] SEO 优化（sitemap、robots.txt、meta 信息）
- [ ] 图床方案接入
- [ ] About / 友链 等独立页面

> 上述未实现项仅为规划候选，不代表已确定实施。具体功能以用户后续需求为准。
