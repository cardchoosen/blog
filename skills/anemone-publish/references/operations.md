# 素材和执行细节

## 单 Markdown 素材

- 普通相对路径以原 md 所在目录解析；指定 `assets_dir` 时以该目录为基准。复制图片和附件到临时包 `assets/` 并将真实内容引用改为 `assets/...`。
- 检查 Markdown 图片、下载链接、引用式链接以及 HTML 的本地素材引用。解析编码路径、空格、查询参数和锚点时保持引用语义；不能处理的形式要明确报告，不能假装全部支持。
- 原样保留 http/https 外链、data URI 和页内锚点，默认不下载远程文件。站内 `/images/...`、`/files/...` 引用按项目 source 路径核实并纳入素材计划，不能视为输入文件所在磁盘根目录。
- 处理素材同名冲突时使用不同子目录或确定性重命名，同时更新对应引用。不要复制 md 邻近目录中的无关文件、凭据或整个项目。
- 素材整理完成后检查最终临时包和渲染结果，当前导入器的链接改写只覆盖部分 Markdown/HTML 写法。对复杂引用可在临时正文中使用已知目标公开路径，并保证素材仍被导入复制。

## 覆盖已有文章

现有 `importPackage(..., { force: true })` 会先删除目标 md、图片目录和附件目录，然后复制文章包。它不是仅覆盖同名文件，也不自动保留旧素材。

因此必须先在独立临时包中备齐更新后的正文和所有需要保留的素材，再执行 force。如果输入本身在 `source/_posts` 或 `source/images/posts` 内，更要先完成暂存，避免导入器删除正在读取的源文件。

更新正文引用了目标原有站内素材时，将它们复制进暂存包并映射至同一公开路径。保留需要沿用的旧素材；清理未引用旧素材应另有用户授权。首次覆盖前在独立临时位置备份目标 md 和素材，失败时报告备份位置；不要在不清楚并发变更的情况下自动回滚。

## 命令与状态

在项目根目录运行，路径作为独立参数正确转义，不把用户文本拼成可执行 shell：

```bash
npm run post:list
npm run post:import -- <package-or-parent>
npm run post:import -- <package-or-parent> --force
npm run clean
npm run build
npm run deploy
```

这些是现有 CLI 命令。`mode`、`assets_dir`、`target_slug` 等是 skill 的理解参数，不是 CLI 已实现的选项，不要直接传给 CLI。

查询实际发布差异时检索 `tools/post-admin` 中的 `snapshot`、`diff`、`writePublishedSnapshot`，复用当时项目实现。没有可用发布基线时说明无法准确判定哪些内容已经上线，不能直接把 Git 未提交文件都称为未发布文章。
