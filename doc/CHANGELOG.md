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
