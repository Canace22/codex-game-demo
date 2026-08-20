# Artifact Specification Operating Rules

本目录是《归云录：江岸危局》的项目产物规格源。

在本目录内生产或修改产物前：

1. 阅读 `README.md`、`01-specification-model.md`、相关分类文档、`06-agent-production-workflow.md` 和 `07-agent-definitions.md` 中对应角色。
2. 从 `templates/work-order-template.md` 创建一个单目标工作单。
3. 先选择基础规格并批准具体规格，再修改运行时代码或资源。
4. 保持已批准的 ID、阶段键、资源路径、脚本顺序、状态字段和依赖方向。
5. 修改范围只能包含工作单列出的路径；共享契约在同一批次只有一个写入所有者。
6. 依次执行所需 L0-L3 门禁，并用 `templates/acceptance-report-template.md` 返回证据。
7. 缺少必需证据或存在未批准偏差时，不得把产物标记为 `verified`。

本项目的具体规格包含桌面与手机横屏、合成音效和静态 GitHub Pages；不能把其他样本的桌面限定、无音频或框架实现带入本项目。

基础规格可跨项目复用。具体规格中的《归云录》名称、数值、坐标、路径、角色、资源键和证据不能通过批量替换项目名迁移。
