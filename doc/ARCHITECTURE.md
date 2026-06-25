# ARCHITECTURE

> 本文档描述 Hexo 博客项目的代码工程结构、构建与部署机制。
> AI 阅读此文档可快速理解项目骨架并上手开发。

## 技术栈

| 维度 | 选型 |
|------|------|
| 静态站点生成器 | Hexo 8.1.2 |
| 主题 | `geek-shelf`（自制定制主题，位于 `themes/geek-shelf/`，git 跟踪） |
| 模板引擎 | EJS（hexo-renderer-ejs） |
| 样式 | Stylus（hexo-renderer-stylus），含 mixin 抽象 |
| Markdown 渲染 | hexo-renderer-marked |
| 代码高亮 | highlight.js（已关行号） |
| 内容生成器 | archive / category / index / tag |
| 部署器 | hexo-deployer-git（推送静态站到 gh-pages 分支） |
| 运行时 | Node.js（开发机 v24.6.0） |
| 包管理 | npm |
| 版本控制 | git |
| 托管 | GitHub Pages（仓库 `cardchoosen/blog`，Public） |

## 目录结构

```
Hexo/
├── _config.yml              # 站点主配置（标题/语言/URL/deploy/theme 等）
├── _config.landscape.yml    # Landscape 主题专属配置（空文件，已不使用）
├── package.json             # 依赖与 npm scripts
├── package-lock.json        # 依赖锁
├── scaffolds/               # 文章模板
│   ├── draft.md
│   ├── page.md
│   └── post.md
├── source/                  # 内容源文件
│   ├── _posts/              #   文章 Markdown
│   │   ├── hello-world.md       # 默认示例（已加 Java/Go/TS 代码段）
│   │   ├── test-frontend-1.md   # 测试文章（categories: 前端）
│   │   ├── test-frontend-2.md   # 测试文章（categories: 前端）
│   │   ├── test-backend-1.md    # 测试文章（categories: 后端）
│   │   └── test-backend-2.md    # 测试文章（categories: 后端）
│   └── CNAME                   # GitHub Pages 自定义域名绑定（内容：anemone.wiki）
├── themes/
│   ├── .gitkeep             # 占位（已无用但保留）
│   └── geek-shelf/          # 自制主题（见下"主题结构"）
├── .github/
│   └── dependabot.yml       # Dependabot 依赖更新配置
├── .gitignore
├── CODEBUDDY.md             # AI 协作规则（每次对话自动加载）
└── doc/                     # 项目文档目录
    ├── ARCHITECTURE.md      #   本文档：代码工程结构
    ├── FEATURES.md          #   产品功能文档
    └── CHANGELOG.md         #   变更日志（追加式）
```

## 构建产物（git 忽略）

| 目录 | 用途 | 是否提交 |
|------|------|----------|
| `public/` | `hexo generate` 生成的静态站 | 否（.gitignore） |
| `db.json` | Hexo 内容数据库缓存 | 否 |
| `.deploy_git/` | `hexo deploy` 推送前的暂存区 | 否 |
| `node_modules/` | npm 依赖 | 否 |

## 配置关键项（_config.yml）

| 配置块 | 关键值 | 说明 |
|--------|--------|------|
| Site.title | `Anemone's Blog` | 站点标题 |
| Site.author | `nannnzhang` | 作者 |
| Site.language | `zh-CN` | 站点语言 |
| Site.timezone | `Asia/Shanghai` | 时区 |
| URL.url | `https://anemone.wiki` | 站点 URL（自定义域名，根路径访问） |
| URL.permalink | `:year/:month/:day/:title/` | 文章永久链接格式 |
| Writing.syntax_highlighter | `highlight.js` | 代码高亮引擎 |
| highlight.line_number | `false` | **已关代码行号** |
| highlight.hljs | `true` | 输出标准 `.hljs-xxx` token class，匹配官方主题 CSS |
| index_generator.per_page | `10` | 首页每页文章数 |
| Extensions.theme | `geek-shelf` | 主题名（自制） |
| Deploy.type | `git` | 部署器类型 |
| Deploy.repo | `https://github.com/cardchoosen/blog.git` | 部署目标仓库 |
| Deploy.branch | `gh-pages` | 部署目标分支 |

## 主题结构（themes/geek-shelf/）

```
themes/geek-shelf/
├── _config.yml                    # 主题配置（menu / favicon）
├── layout/
│   ├── layout.ejs                 # 主布局：顶部黑条 + 左书架 + 右内容
│   ├── index.ejs                  # 首页文章列表 + 分页
│   ├── post.ejs                   # 文章详情（引入 article + post-nav）
│   ├── page.ejs                   # 自定义页面（复用 article）
│   ├── archive.ejs                # 归档（按年分组）
│   ├── category.ejs               # 分类索引（引入 archive-list）
│   ├── tag.ejs                    # 标签索引（引入 archive-list）
│   └── _partial/
│       ├── head.ejs               # <head>（meta/title/css/open_graph）
│       ├── header.ejs             # 顶部色块（站点标题 + 导航 + 主题切换按钮）
│       ├── shelf.ejs              # 左侧书架（核心：按 categories 聚合）
│       ├── article.ejs            # 文章渲染（标题/日期/分类/标签/正文）
│       ├── post-terms.ejs         # 文章的分类/标签条（参数化 type）
│       ├── post-nav.ejs           # 上一篇/下一篇导航
│       ├── archive-list.ejs       # 归档列表组件（category/tag 复用）
│       └── footer.ejs             # 版权
└── source/
    ├── css/style.styl             # 极客黑白样式（含 hover-soft mixin）
    └── js/shelf.js                # 手风琴交互（原生 JS，无依赖）
```

### 主题核心机制

**左侧书架**：遍历 `site.categories` 聚合所有分类及文章。点击分类按钮展开/收起该分类下文章列表，**允许多开**（点击不影响其他已展开分类）。展开状态通过 `localStorage` 持久化，跨页面保持。进入文章页时，**EJS 服务端渲染**即判断当前文章所属分类并直接给按钮加 `active` class、列表加 `open` class、文章链接加 `current` class——避免 JS 后加 class 导致的闪烁。

**深/浅主题切换**：
- CSS 变量（自定义属性）系统：`:root` 定义浅色主题默认变量，`@media (prefers-color-scheme: dark)` 覆盖深色，`html.theme-light`/`html.theme-dark` 手动切换覆盖（优先级最高）
- 顶栏右侧切换按钮：显示"深"/"浅"两字叠加，当前主题字放大在左（标识当前主题），另一字缩小透明在右（提示可切到）
- 防 FOUC：`layout.ejs` 在 `<head>` 内联脚本，CSS 加载前根据 localStorage 或 prefers-color-scheme 给 `<html>` 加 class
- 优先级：localStorage > 系统偏好 > 默认浅色

**视觉风格**：纯黑白 + 灰阶过渡。hover/active 用浅灰底 `#f0f0f0`/`#e0e0e0` 替代黑底白字突变。浅色主题代码块 `#e8e8e8` 底，深色主题 `#0a0a0a` 底（比页面背景 `#1a1a1a` 略黑）。无圆角无阴影无渐变。等宽字体 `ui-monospace` 全站。`overscroll-behavior: none` 禁用弹性滚动。

**代码语法高亮**：
- Hexo 内置 highlight.js 渲染器，`_config.yml` 配 `hljs: true` 输出标准 `.hljs-xxx` token class（`hljs-keyword`/`hljs-string`/`hljs-title` 等）
- 引入 highlight.js 官方主题 CSS 跟随深/浅主题切换：
  - `head.ejs` 加两个 `<link>`：atom-one-light（浅色模式）+ atom-one-dark（深色模式）
  - 初始通过 `<link media>` 跟随系统偏好
  - `shelf.js` 的 `applyHljsTheme()` 在主题切换时改 `link.media`：启用 `'all'`，禁用 `'not all'`
- 代码块底色仍由 `var(--color-code-bg)` 控制（CSS `.hljs { background !important }` 覆盖主题 CSS 的底色），token 颜色由 hljs 主题 CSS 提供
- `.code pre` 不设 `color`，让 hljs 主题的 `.hljs { color }` 接管字色，避免父级 color 通过继承覆盖 token 颜色

**CSS 关键设计**：
- `hover-soft()` mixin：统一管理"hover 时浅灰底 + 深灰字 + 0.12s 过渡"，多处复用
- 代码块 `<figure class="highlight"><table><td>` 结构特殊处理：
  - `.gutter` `display:none`（隐藏行号列）
  - `td` `border:none`（去掉代码块四周白线，与 markdown 表格的 td 边框区分）
  - `tr:hover td` `background:transparent`（避免鼠标 hover 代码块时变白底）
  - `:focus`/`:focus-visible` 重置 outline 与背景（避免浏览器默认 focus 高亮覆盖深灰底）

## 分支隔离发布方案

```
main       ← 源码（Markdown、配置、scaffolds、themes 等）
gh-pages   ← hexo g 生成的静态站（由 hexo d 自动推送）
```

- `main` 分支通过 `git push` 维护，保存所有源文件
- `gh-pages` 分支由 `hexo-deployer-git` 自动创建并推送，只含 `public/` 内容
- GitHub Pages Source 配置为 `gh-pages` 分支 `/ (root)` 目录
- **自定义域名**：`source/CNAME` 文件（内容 `anemone.wiki`）由 Hexo 拷贝到 `public/`，随 `hexo d` 推到 `gh-pages` 根目录，GitHub Pages 据此识别 Custom domain。**没有这个文件，每次 `hexo d` 后 GitHub 仓库的 Custom domain 设置会被清空**
- 访问入口：`https://anemone.wiki`（自定义域名，根路径访问）

## 常用命令（npm scripts）

```bash
npm run build    # = hexo generate，生成静态站到 public/
npm run clean    # = hexo clean，清理 public/、db.json、.deploy_git/
npm run server   # = hexo server，本地预览 http://localhost:4000/
npm run deploy   # = hexo deploy，推送 public/ 到 gh-pages
```

## 完整发布流程

```bash
# 1. 写新文章
npx hexo new "文章标题"

# 2. 编辑 source/_posts/文章标题.md（注意在 front-matter 写 categories）

# 3. 一键发布
npx hexo clean && npx hexo g && npx hexo d

# 4. （可选）提交源码到 main 分支
git add -A && git commit -m "post: 新增文章标题"
git push
```

## 部署链路

```
source/_posts/*.md
      │
      │  hexo generate（渲染器：ejs/marked/stylus）
      ▼
public/  （静态 HTML/CSS/JS）
      │
      │  hexo deploy（hexo-deployer-git）
      ▼
gh-pages 分支  →  GitHub Pages  →  https://anemone.wiki
```

## 开发注意事项

- **改 `_config.yml` 后必须重启 hexo server**：hexo server 不热重载站点配置，进程内存里保留旧值。停掉 `npx hexo s` 再重新启动即可。
- **改主题代码无需重启**：hexo server 监听 `themes/` 和 `source/` 下文件变化，会自动重新渲染。
- **Stylus mixin 调用语法**：用 `name()`（不带 `+` 前缀），不要用 `+name()`——当前 stylus 版本不支持 `+name()` 调用形式，会导致整个 CSS 编译失败生成空文件。
- **EJS 注释语法**：只能用 `<%# 注释 %>`，不要用 `<%-- 注释 --%>`（JSP 风格），后者会导致 EJS 编译抛 `SyntaxError: missing ) after argument list`，hexo server 进程崩溃退出。
- **hexo server 异常退出排查**：若 task 启动后秒退，先看 stderr 是否有 EJS/Stylus 编译错误——通常是模板语法问题导致渲染流程抛 Unhandled rejection，不是端口冲突。
- **书架 active 状态由 EJS 渲染**：当前文章所在分类的 `active`/`open`/`current` class 在 `shelf.ejs` 服务端渲染时即写入 HTML，JS 只负责 localStorage 持久化的其他展开分类恢复 + 点击交互。这样避免 JS 后加 class 导致的闪烁。
- **顶栏 sticky 不要被 html/body height 破坏**：不要给 html/body 设 `height: 100%`，会让 sticky 在滚动到某位置失效（顶栏消失）。
- **主题切换防 FOUC**：`layout.ejs` 的 `<head>` 内联脚本必须在 CSS 加载前执行，根据 localStorage/prefers-color-scheme 给 `<html>` 加 class，否则页面加载时会闪一下默认主题色。
