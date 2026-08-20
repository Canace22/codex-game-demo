# Reusable Artifact Process Rules

在本目录生产或修改规格时：

1. 先读取 `README.md`、`01-artifact-contract.md` 和目标工作单。
2. 通用正文不得出现示例项目的名称、角色、数值、路径或框架结论。
3. 项目事实只能写入 `instances/` 或 `examples/`。
4. 每个工作单只包含一个可独立验收目标，并列出允许路径和冻结合同。
5. 共享文件在同一批次只能有一个写入所有者。
6. 先完成 L0/L1，再进行正式 L2/L3；发布是独立门禁。
7. 生产 Agent 不能为自己签发最终 `PASS`。
8. 缺少证据或存在未批准偏差时，不得标记 `verified`。
9. 不得通过批量替换项目名迁移具体规格。
10. 更新母版后必须运行 `node scripts/validate-spec-process.mjs`。
