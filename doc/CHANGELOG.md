# CHANGELOG

> 本文档记录 `main` 分支源码的变更历史（追加式，不覆盖历史）。
> `gh-pages` 分支由 `hexo-deployer-git` 自动推送，不在本日志记录范围内。

格式：`## YYYY-MM-DD HH:mm · <git 提交短 hash> · <提交主题>`

---

## 2026-06-25 19:24 · 90d90f4 · init: hexo blog with landscape theme

- 初始化 Hexo 博客项目（`hexo init .`）
- 默认主题 Landscape（经 npm 安装）
- 默认依赖：hexo / hexo-server / hexo-generator-archive/category/index/tag / hexo-renderer-ejs/marked/stylus
- 生成默认文件结构：`_config.yml`、`package.json`、`scaffolds/`、`source/_posts/hello-world.md`
- 初始化 git 仓库于 `main` 分支
- 配置 `.gitignore`（排除 `node_modules/` `public/` `db.json` `.deploy*/` 等）

## 2026-06-25 19:25 · af209d5 · config: set deploy to gh-pages branch and zh-CN site info

- 安装 `hexo-deployer-git@^4.0.0` 插件
- `_config.yml` 站点信息改为：`title: My Blog` / `author: nannnzhang` / `language: zh-CN` / `timezone: Asia/Shanghai`
- `_config.yml` 配置 deploy：`type: git` / `branch: gh-pages`（repo 暂为占位符）

## 2026-06-25 19:25 · 024b21a · chore: revert url to placeholder pending real repo url

- 本地验证 `hexo g && hexo s` 通过（HTTP 200）
- 验证后将 `url` 字段临时回退为占位符（待真实仓库地址）

## 2026-06-25 19:27 · ec58feb · config: set real repo url and deploy target for cardchoosen/blog

- 用户提供 GitHub 仓库地址：`https://github.com/cardchoosen/blog.git`
- `_config.yml` 替换占位符：
  - `url` → `https://cardchoosen.github.io/blog`
  - `deploy.repo` → `https://github.com/cardchoosen/blog.git`
- 绑定 git remote `origin` → 仓库地址
- 推送 `main` 分支到 `origin`（首次推送）
- 执行 `hexo clean && hexo g && hexo d`，首次部署静态站到 `gh-pages` 分支
- GitHub Pages 配置 Source 为 `gh-pages` 分支 `/ (root)`，验证可访问

---

> 注：上述 4 次提交是在用户告知"开发铁律"之前完成的。自此条目之后的所有变更，将严格遵循"用户验证通过 + 用户明确指示"后才追加的流程。

---

## 2026-06-25 20:15 · 9d43cfa · docs: init doc/ with ARCHITECTURE, FEATURES, CHANGELOG

- 按开发铁律初始化 `doc/` 目录三文档
- ARCHITECTURE：技术栈 / 目录结构 / 配置关键项 / 分支隔离方案 / 命令 / 部署链路
- FEATURES：产品定位 / 站点信息 / 核心功能 / 当前内容 / 待规划
- CHANGELOG：补录 main 分支前 4 次提交历史

## 2026-06-25 21:30 · 43ddd29 · feat: 自制 geek-shelf 主题 + 代码精简 + 视觉优化

> 本条目对应本次提交，涵盖一系列主题定制与优化工作。所有改动已经用户本地验证通过。

### 主题定制（geek-shelf）

- 新建 `themes/geek-shelf/` 主题目录，从零编写模板与样式（不基于 Landscape 改造）
- 设计决策：纯黑白极客风 / 大色块拼接 / 等宽字体 / 无圆角无阴影无渐变
- 左侧书架：按 front-matter `categories` 聚合文章，手风琴交互（一次只展开一个分类）
- 进入文章页时自动展开当前文章所在分类并高亮
- 顶栏黑色色块 + 反白站点标题与导航
- 响应式：移动端书架堆叠到顶部
- `_config.yml` 的 `theme: landscape` → `theme: geek-shelf`

### 主题代码精简

- **CSS**：引入 `hover-soft()` mixin 统一 7 处 hover 重复块；删除未用变量 `color-line-strong`；合并双重 `.post-body` 声明；整理属性顺序
- **EJS**：
  - 新增 `_partial/archive-list.ejs`（归档列表组件，category/tag 复用）
  - 合并 `post-category.ejs` + `post-tag.ejs` → `post-terms.ejs`（参数化 type）
  - 简化 `article.ejs`（去掉 post.link 分支）
  - 简化 `page.ejs`（复用 article partial）
  - 简化 `head.ejs`（keywords 防御代码）
  - 合并 `shelf-wrap` 与 `shelf`（去掉一层 aside 嵌套）
  - `archive.ejs` 保留独立实现（因年分组特殊逻辑）
- **JS**：`shelf.js` 提取 `norm()` 函数，用 `classList.toggle(open, willOpen)` 替代 if/else，注释精简

### 视觉优化

- **SHELF 标题**：去掉黑底白字，改为浅灰小字 + 字母间距 + 透明背景，文案改为"目录"
- **对比度过强修复**：
  - 主文字色从纯黑 `#000` 改为略柔深灰 `#1a1a1a`
  - 分割线从纯黑改为浅灰 `#d0d0d0`
  - 书架分类 hover/active 从黑底白字突变改为浅灰底/中灰底灰阶过渡
  - 代码块从纯黑底纯白字改为深灰底 `#2a2a2a` + 浅灰字 `#e0e0e0`
  - 全局加 0.12s 平滑过渡

### 代码块修复

- **关闭行号**：`_config.yml` 的 `highlight.line_number` 从 `true` 改为 `false`
- **隐藏 gutter 列**：CSS `.figure.highlight .gutter { display: none }`（Hexo 渲染器仍输出 `<td class="gutter">`，需 CSS 强制隐藏）
- **修复代码块 hover 变白 bug**：根因是 `tr:hover td` 表格行 hover 规则无差别作用于代码块内的 `<td>`，导致鼠标移过代码时浅灰底覆盖深灰底；修复方式：`figure.highlight tr:hover td { background: transparent }`
- **修复代码块四周白线**：根因是 `.post-body td { border: 1px solid }` 作用于代码块 `<td class="code">`；修复方式：`figure.highlight td { border: none; padding: 0 }`
- **修复代码块 focus 变色**：根因是浏览器对可滚动 `<pre>` 的默认 `:focus` 高亮；修复方式：显式重置 `:focus` 与 `:focus-visible` 的 outline 和背景色

### 站点配置

- **站点标题**：`My Blog` → `Anemone's Blog`
- **brand-title hover/focus**：黑底顶栏内的标题，hover/focus 仅加下划线，不变背景色（避免被全局 `a:hover` 浅灰底规则覆盖导致看不清）
- **nav-item focus**：统一 hover 与 focus 行为（反白），禁掉 focus-visible outline

### 测试内容

- `hello-world.md` 新增 "Code Samples" 章节，含 Java / Go / TypeScript 三段代码各十几行，用于验证多语言代码块渲染
- 新增 4 篇测试文章（前端×2、后端×2），用于验证书架分类聚合与手风琴交互

### 文档同步

- `doc/ARCHITECTURE.md`：更新技术栈（主题改为 geek-shelf）、目录结构、配置关键项、新增"主题结构"与"开发注意事项"小节
- `doc/FEATURES.md`：更新站点信息（标题改为 Anemone's Blog）、新增"左侧分类书架"核心功能、更新视觉风格描述、更新当前内容（5 篇文章）、更新待规划项
- `doc/CHANGELOG.md`：追加本次条目

---

## 2026-06-25 22:30 · （本次提交）· feat: 深/浅主题切换 + 顶栏布局调整 + 书架交互优化

> 本条目对应本次提交，涵盖主题切换架构、顶栏布局重排、书架交互优化、视觉细节调整等改动。所有改动已经用户本地验证通过。

### 顶栏布局调整

- **导航移到标题旁**：首页/归档从顶栏右侧移到左侧，紧挨着站点标题（gap 24px）
- **顶栏最右侧加主题切换按钮**

### 深/浅主题切换架构

- **CSS 变量系统**：`:root` 定义浅色主题默认变量；`@media (prefers-color-scheme: dark)` 覆盖深色；`html.theme-light`/`html.theme-dark` 手动覆盖（优先级最高）
- **防 FOUC**：`layout.ejs` 在 `<head>` 加内联脚本，CSS 加载前根据 localStorage 或系统偏好给 `<html>` 加 class，避免页面加载时闪默认主题色
- **主题切换按钮**：
  - 显示"深"/"浅"两字叠加，当前主题字放大在左（16px 不透明），另一字缩小半透明在右（10px, opacity 0.35）
  - 容器宽 28px，两字约 1/3 部分重叠
  - 按钮 hover/focus 不变背景色（避免在黑底顶栏内被全局 hover 规则覆盖）
- **shelf.js** 加主题切换 click 逻辑：切换 html.className + 写 localStorage
- **优先级**：localStorage > 系统偏好 > 默认浅色

### 书架交互优化

- **允许多开**：点击分类按钮只切换自己展开/收起，不影响其他已展开分类（之前是手风琴一次只展开一个）
- **状态持久化**：展开状态存于 localStorage（key: `shelf-opened`），跨页面保持。用户在 A 页面展开多个分类后，跳到文章页时这些展开状态不丢失
- **active 状态前移到 EJS 渲染**：当前文章所在分类的 `active`/`open`/`current` class 由 `shelf.ejs` 服务端渲染时直接写入 HTML，避免 JS 在 DOMContentLoaded 后加 class 导致的"白→灰"闪烁

### 目录标题样式优化

- 字号 10px → 13px，加粗
- 颜色从 `#999` 改为 `var(--color-text)`（主文字色）
- 左侧加 3px 粗竖线 accent bar（`::before` 伪元素）作为视觉提示
- 去掉 `text-transform: uppercase`（中文不生效）

### 视觉细节

- **顶栏 sticky 修复**：根因是 `html, body { height: 100% }` 破坏了 sticky（body 高度被限制为视口高度，内容溢出后 sticky 锚点错乱）。已删除该规则
- **禁用弹性滚动**：`html` 和 `body` 都加 `overscroll-behavior: none`，滑动到顶/底时不再延伸出空白区域
- **深色主题代码块底色**：从纯黑 `#000` 改为 `#0a0a0a`（比页面背景 `#1a1a1a` 略黑，不是纯黑）
- **浅色主题代码块底色**：从 `#2a2a2a` 改为 `#e8e8e8`（避免过黑费眼）

### 站点配置

- **brand-title hover/focus 修复**：黑底顶栏内的标题，hover/focus 仅加下划线，不变背景色（避免被全局 `a:hover` 浅灰底规则覆盖导致看不清）
- **nav-item focus 统一**：hover 与 focus 行为一致（反白），禁掉 focus-visible outline

### 文档同步

- `doc/ARCHITECTURE.md`：更新主题结构描述（多开 + 持久化 + EJS active 渲染）、新增深/浅主题切换机制、补充开发注意事项（EJS 注释语法、active 状态前移、sticky 限制、防 FOUC）
- `doc/FEATURES.md`：新增"深/浅主题切换"核心功能章节、更新书架交互为多开模式、更新代码块底色（浅色 #e8e8e8 / 深色 #0a0a0a）、补充禁用弹性滚动
- `doc/CHANGELOG.md`：追加本次条目

