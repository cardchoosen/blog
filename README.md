# Commands

```bash
# 安装项目依赖
npm install

# 启动 Hexo 本地预览服务（http://localhost:4000/）
npm run server

# 生成静态站点到 public/
npm run build

# 清理 public/、db.json、.deploy_git/
npm run clean

# 部署 public/ 到 GitHub Pages 的 gh-pages 分支
npm run deploy

# 启动本地文章管理后台（http://127.0.0.1:4100/）
npm run post:admin

# 列出当前文章
npm run post:list

# 导入单篇文章包或批量文章包
npm run post:import -- <article-package-or-parent>

# 覆盖导入单篇文章包或批量文章包
npm run post:import -- <article-package-or-parent> --force

# 预览删除文章及其素材的清单
npm run post:delete -- <slug>

# 将文章及其素材移动到 .trash/ 回收站
npm run post:delete -- <slug> --yes

# 新建正式文章
npx hexo new "文章标题"

# 新建草稿
npx hexo new draft "草稿标题"

# 新建独立页面
npx hexo new page "页面名称"

# 清理 Hexo 生成缓存和产物
npx hexo clean

# 生成静态站点
npx hexo generate

# 部署静态站点
npx hexo deploy

# 清理、生成并部署
npx hexo clean && npx hexo generate && npx hexo deploy
```
