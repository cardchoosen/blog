# ARCHITECTURE

> 本文档描述 Hexo 博客项目的代码工程结构、构建与部署机制。
> AI 阅读此文档可快速理解项目骨架并上手开发。

## 技术栈

| 维度 | 选型 |
|------|------|
| 静态站点生成器 | Hexo 8.1.2 |
| 主题 | Landscape（默认，经 npm 安装，非实体目录） |
| 模板渲染 | hexo-renderer-ejs / hexo-renderer-marked / hexo-renderer-stylus |
| 内容生成器 | archive / category / index / tag |
| 部署器 | hexo-deployer-git（推送静态站到 gh-pages 分支） |
| 运行时 | Node.js（开发机 v24.6.0） |
| 包管理 | npm |
| 版本控制 | git |
| 托管 | GitHub Pages（仓库 `cardchoosen/blog`，Public） |

## 目录结构

```
Hexo/
├── _config.yml              # 站点主配置（标题/语言/URL/deploy 等）
├── _config.landscape.yml    # 主题专属配置（当前空文件，Landscape 默认未覆盖）
├── package.json             # 依赖与 npm scripts
├── package-lock.json        # 依赖锁
├── scaffolds/               # 文章模板
│   ├── draft.md             #   草稿模板
│   ├── page.md              #   自定义页面模板
│   └── post.md              #   文章模板
├── source/                  # 内容源文件
│   └── _posts/              #   文章 Markdown
│       └── hello-world.md   #   默认示例文章
├── themes/                  # 主题目录（当前仅 .gitkeep，Landscape 通过 npm 提供）
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
| Site.title | `My Blog` | 站点标题 |
| Site.author | `nannnzhang` | 作者 |
| Site.language | `zh-CN` | 站点语言 |
| Site.timezone | `Asia/Shanghai` | 时区 |
| URL.url | `https://cardchoosen.github.io/blog` | 站点 URL（项目站点，带 `/blog` 路径） |
| URL.permalink | `:year/:month/:day/:title/` | 文章永久链接格式 |
| Writing.syntax_highlighter | `highlight.js` | 代码高亮 |
| index_generator.per_page | `10` | 首页每页文章数 |
| Extensions.theme | `landscape` | 主题名 |
| Deploy.type | `git` | 部署器类型 |
| Deploy.repo | `https://github.com/cardchoosen/blog.git` | 部署目标仓库 |
| Deploy.branch | `gh-pages` | 部署目标分支 |

## 分支隔离发布方案

```
main       ← 源码（Markdown、配置、scaffolds、themes 等）
gh-pages   ← hexo g 生成的静态站（由 hexo d 自动推送）
```

- `main` 分支通过 `git push` 维护，保存所有源文件
- `gh-pages` 分支由 `hexo-deployer-git` 自动创建并推送，只含 `public/` 内容
- GitHub Pages Source 配置为 `gh-pages` 分支 `/ (root)` 目录
- 访问入口：`https://cardchoosen.github.io/blog`

## 常用命令（npm scripts）

```bash
npm run build    # = hexo generate，生成静态站到 public/
npm run clean    # = hexo clean，清理 public/、db.json、.deploy_git/
npm run server   # = hexo server，本地预览 http://localhost:4000
npm run deploy   # = hexo deploy，推送 public/ 到 gh-pages
```

## 完整发布流程

```bash
# 1. 写新文章
npx hexo new "文章标题"

# 2. 编辑 source/_posts/文章标题.md

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
gh-pages 分支  →  GitHub Pages  →  https://cardchoosen.github.io/blog
```
