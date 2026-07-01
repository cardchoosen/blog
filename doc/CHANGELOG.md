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

## 2026-06-25 22:30 · 87a3e23 · feat: 深/浅主题切换 + 顶栏布局调整 + 书架交互优化

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

---

## 2026-06-25 23:10 · cc16ccc · feat: 接入 highlight.js 主题实现代码语法高亮

> 本条目对应本次提交，为代码块接入彩色语法高亮，跟随深/浅主题切换。所有改动已经用户本地验证通过。

### 改动

- **`_config.yml`**：`highlight.hljs` 从 `false` 改为 `true`
  - 之前输出旧式 class（`keyword`/`string`），不匹配 hljs 官方主题 CSS 选择器
  - 现在输出标准 `.hljs-keyword` / `.hljs-string` 等 token class

- **`head.ejs`**：加两个 `<link>` 引入 highlight.js 官方主题 CSS
  - `atom-one-light.min.css`（浅色模式）
  - `atom-one-dark.min.css`（深色模式）
  - 初始通过 `<link media="(prefers-color-scheme: xxx)">` 跟随系统偏好

- **`shelf.js`**：新增 `applyHljsTheme()` 函数
  - 主题切换时通过 `link.media` 启停对应 hljs 主题：启用 `'all'`、禁用 `'not all'`
  - 在 DOMContentLoaded 时根据 html class 初始化启用对应主题
  - 关键修复：启用时 media 必须设为 `'all'`，不能带 `prefers-color-scheme` 条件——否则用户手动切到与系统相反的主题时，启用方不匹配

- **`style.styl`**：
  - 新增 `.post-body .hljs { background: var(--color-code-bg) !important }` 强制代码块底色由主题变量控制（不被 hljs 主题 CSS 覆盖）
  - 去掉 `figure.highlight .code pre` 的 `color: var(--color-code-text)`——避免父级 color 通过继承覆盖 hljs 主题设的 token 颜色

### 调研过程

- 现状排查：发现 Hexo 已用 highlight.js 渲染，HTML 输出含 token class，但 CSS 没给这些 class 上色，所以视觉上看不到高亮
- 方案对比：A. 手写黑白灰阶规则；B. 引入 hljs 官方主题；C. 切换到 Prism.js
- 选 B 方案：改动最小（约 30 行），保留所有现有代码块修复（行号隐藏、hover 不变色、focus 不变色、无白线）
- 子决策：跟随主题切换（浅色用 atom-one-light，深色用 atom-one-dark）

### 踩坑记录

1. **`hljs: false` 导致无高亮**：Hexo 输出 `class="keyword"` 而非 `class="hljs-keyword"`，hljs 主题 CSS 选择器不匹配
2. **`color: !important` 覆盖 token 颜色**：最初给 `.hljs` 同时设 `background !important` 和 `color !important`，后者通过继承盖住了 token 颜色；后改为只保留 `background !important`
3. **`link.disabled` 不稳定**：Safari/Chrome 对 `<link rel="stylesheet">` 的 `disabled` 属性行为不一致；改用 `media = 'not all'` 禁用
4. **`media` 带条件导致切换失效**：启用时 media 设为 `(prefers-color-scheme: light)`，若用户系统是深色但手动切到浅色，条件不匹配导致 light 主题不生效；改为启用时 `media = 'all'`
5. **`.code pre` color 覆盖**：`.post-body figure.highlight .code pre` 的 `color: var(--color-code-text)`（特异性 0,3,1）通过继承影响所有子 span，让未匹配 token class 的字符看起来"没高亮"；去掉该 color 让 hljs 主题接管

### 文档同步

- `doc/ARCHITECTURE.md`：新增"代码语法高亮"小节、配置表加 `highlight.hljs: true` 条目
- `doc/FEATURES.md`：更新"8. 代码语法高亮"章节，描述 atom-one-light/dark 跟随切换机制
- `doc/CHANGELOG.md`：追加本次条目

---

## 2026-06-25 23:40 · （本次提交）· config: 绑定自定义域名 anemone.wiki

> 本条目对应本次提交，把站点 URL 从 GitHub Pages 默认地址改为自定义域名。

### 改动

- **`_config.yml`**：`url` 从 `https://cardchoosen.github.io/blog` 改为 `https://anemone.wiki`
  - 之前：项目站点默认走 `/<仓库名>/` 子路径，资源链接带 `/blog` 前缀
  - 现在：自定义域名根路径访问，资源链接自动改为根路径 `/css/style.css` 等

### 背景

- 用户在腾讯云为 `anemone.wiki` 配置了 DNS 解析（CNAME 指向 `cardchoosen.github.io` + 4 条 A 记录指向 GitHub Pages IP）
- 在 GitHub 仓库 `cardchoosen/blog` Settings → Pages → Custom domain 绑定 `anemone.wiki`，DNS check successful
- 绑定后 `https://anemone.wiki/` 能访问到博客 HTML 内容，但**无样式**——因为资源链接还是 `/blog/css/style.css`，而 `/blog/` 路径在自定义域名下不存在（404）
- 修复方式：把 `url` 改为 `https://anemone.wiki`，Hexo 的 `url_for()`/`css()`/`js()` 会根据 `url` 自动计算 root，所有资源链接自动变成根路径

### 文档同步

- `doc/ARCHITECTURE.md`：更新站点 URL 配置、访问入口、部署链路、本地预览 URL
- `doc/FEATURES.md`：更新访问入口、本地预览 URL
- `doc/CHANGELOG.md`：追加本次条目

---

## 2026-06-25 23:55 · 35ad05a · fix: 加 source/CNAME 防止自定义域名被部署清空

> 本条目对应本次提交，修复 GitHub Pages 自定义域名在 `hexo d` 后丢失的问题。

### 问题

- 用户在 GitHub 仓库 Settings → Pages → Custom domain 配置了 `anemone.wiki`，DNS check successful
- 但每次 `hexo d` 部署后，GitHub Pages 的 Custom domain 设置被清空，域名失效

### 根因

- GitHub Pages 的 Custom domain 配置依赖仓库根的 `CNAME` 文件
- `hexo-deployer-git` 把 `public/` 内容**强制覆盖**到 `gh-pages` 分支
- `public/` 里原本没有 `CNAME` 文件（它由 GitHub UI 写到 `gh-pages`，不属于 Hexo 生成物）→ 每次 `hexo d` 后 `CNAME` 被覆盖删除 → GitHub 检测到 `CNAME` 丢失 → 清空 Custom domain 设置

### 修复

- 新建 `source/CNAME` 文件，内容只有一行 `anemone.wiki`
- Hexo 把 `source/` 下所有非下划线开头文件原样拷贝到 `public/`，所以 `CNAME` 会随 `hexo d` 推到 `gh-pages` 根目录
- 这样每次部署后 `CNAME` 都在，GitHub Pages 的 Custom domain 配置不再被清空

### 文档同步

- `doc/ARCHITECTURE.md`：目录结构补 `source/CNAME`、分支隔离方案补"自定义域名"说明（含根因提示）
- `doc/CHANGELOG.md`：追加本次条目

---

## 2026-07-01 16:46 · （本次提交）· feat: 新增本地文章管理后台与发布工具

> 本条目对应本次提交，新增本机使用的文章管理工具 `post-admin`，并打通通过 SSH 发布到 GitHub Pages 的流程。所有改动已经用户本地验证通过。

### 本地文章管理工具

- 新增 `tools/post-admin/`，提供 Web UI + CLI 两种入口
- `npm run post:admin` 启动本地后台 `http://127.0.0.1:4100/`
- `npm run post:import -- <path>` 支持导入单篇文章包或批量文章包
- `npm run post:list` 列出当前 `source/_posts/` 下文章
- `npm run post:delete -- <slug>` 预览删除清单，追加 `--yes` 后移动到 `.trash/posts/<slug>-<timestamp>/`
- 工具使用 Node.js 内置模块实现，无新增 npm 依赖

### 文章包输入协议

- 新增 `tools/post-admin/POST_INPUT_FORMAT.md`，规定供人和 AI 使用的文章包格式
- 文章包结构：一个目录一篇文章，必含 `post.md`，可选 `assets/`
- `post.md` front-matter 要求 `title` / `slug` / `date` / `categories` / `tags`
- 导入后文章写入 `source/_posts/<slug>.md`
- 图片资源写入 `source/images/posts/<slug>/`
- 非图片附件写入 `source/files/posts/<slug>/`
- Markdown 中的 `assets/...` 引用自动重写为站点可访问路径
- 默认拒绝覆盖已有文章，必须传 `--force` 才覆盖

### Web 后台

- 页面风格贴合 `geek-shelf`：黑白主调、等宽字体、左侧导航、右侧操作区
- 提供文章列表、文章包导入、新建文章、删除文章、发布五个页面
- 新建文章页可填写标题、slug、日期、分类、标签、摘要和 Markdown 正文
- 删除文章默认移动到本地回收站，不做永久删除

### 发布页与差异可视化

- 发布页提供"仅构建检查"与"构建并发布"两个入口
- "仅构建检查"执行 `npm run build`
- "构建并发布"依次执行 `npm run clean` → `npm run build` → `npm run deploy`
- 发布前只检测博客内容与素材目录：
  - `source/_posts/`
  - `source/images/posts/`
  - `source/files/posts/`
- 不展示项目代码、工具代码、配置文件等非博客内容差异
- 内容变更以"目录 + 文件名 + 新增/删除行数或 binary"方式展示
- 发布成功后写入 `.tmp/post-admin/published-content.json` 作为"上次成功发布内容快照"
- 后续刷新发布页时，以该快照为基准判断是否还有未发布内容，而不是使用 git 工作区状态

### SSH 部署修复

- `_config.yml` 的 `deploy.repo` 从 HTTPS 改为 SSH：
  - 旧：`https://github.com/cardchoosen/blog.git`
  - 新：`git@github.com:cardchoosen/blog.git`
- 用户将本机 SSH 公钥添加到 GitHub 后，验证 `ssh -T git@github.com` 通过
- 执行 `npm run deploy` 成功推送到 `gh-pages`

### 内容更新

- 新增 `source/_posts/test.md`，通过 post-admin 创建并发布
- 当前文章数从 5 篇变为 6 篇

### 忽略规则

- `.gitignore` 新增：
  - `.tmp/`：post-admin 临时目录与发布快照
  - `.trash/`：post-admin 删除文章时的本地回收站

### 文档同步

- `doc/ARCHITECTURE.md`：新增 post-admin 架构、文章包导入机制、发布快照机制、npm scripts、SSH deploy repo
- `doc/FEATURES.md`：新增本地后台、CLI、文章包输入协议、发布差异可视化、当前内容 6 篇
- `doc/CHANGELOG.md`：追加本次条目

---

## 2026-07-01 19:39 · （本次提交）· feat: 新增分类与标签顶栏入口

> 本条目对应本次提交，给博客顶栏增加 `CATEGORY` 与 `TAG` 入口，并新增分类/标签总览页。所有改动已经用户本地验证通过。

### 改动

- **`themes/geek-shelf/_config.yml`**：顶栏菜单新增 `CATEGORY` 与 `TAG`
- **`source/categories/index.md`**：新增分类总览页入口，使用 `layout: category`
- **`source/tags/index.md`**：新增标签总览页入口，使用 `layout: tag`
- **`category.ejs`**：
  - 有 `page.category` 时保持原有分类文章列表
  - 无 `page.category` 时展示所有分类及文章数
- **`tag.ejs`**：
  - 有 `page.tag` 时保持原有标签文章列表
  - 无 `page.tag` 时展示所有标签及文章数
- **`style.styl`**：新增 `.term-list` / `.term-row` / `.term-name` / `.term-count` 样式，贴合现有归档页黑白等宽风格

### 验证

- `npm run build` 成功
- 本地预览 `http://localhost:4000/categories/` 与 `http://localhost:4000/tags/` 可访问
- 顶栏可直接进入分类/标签总览页

### 文档同步

- `doc/ARCHITECTURE.md`：补充 `source/categories/index.md`、`source/tags/index.md`、主题菜单、category/tag 模板分支与总览页机制
- `doc/FEATURES.md`：更新"分类与标签"功能，说明顶栏入口与总览页行为
- `doc/CHANGELOG.md`：追加本次条目

---

## 2026-07-01 19:47 · （本次提交）· docs: 新增 README 常用命令清单

> 本条目对应本次提交，新增根目录 README，仅记录项目常用指令及简短用途说明。

### 改动

- 新增 `README.md`
- 记录依赖安装、本地预览、构建、清理、部署命令
- 记录 post-admin 本地后台、文章列表、文章导入、文章删除命令
- 记录 Hexo 新建文章、草稿、页面命令
- 记录 `hexo clean` / `hexo generate` / `hexo deploy` 及组合发布命令

### 文档同步

- `doc/ARCHITECTURE.md`：目录结构补充 `README.md`
- `doc/CHANGELOG.md`：追加本次条目
