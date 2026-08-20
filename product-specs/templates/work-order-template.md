# 工作单：{{WORK_ORDER_TITLE}}

| 字段 | 值 |
| --- | --- |
| `work_order_id` | `{{WORK_ORDER_ID}}` |
| `project_id` | `{{PROJECT_ID}}` |
| `baseline` | `{{COMMIT_OR_VERSION}}` |
| `owner_agent` | `{{AGENT_ID}}` |
| `target_spec` | `{{SPEC_ID}}` |
| `status` | `ready` |

## 单一目标

`{{ONE_VERIFIABLE_GOAL}}`

## 输入

- 已批准规格：`{{APPROVED_SPECS}}`
- 现状文件/资源：`{{CURRENT_INPUTS}}`
- 用户约束：`{{USER_CONSTRAINTS}}`

## 允许与禁止

- `allowed_paths`：`{{ALLOWED_PATHS}}`
- `frozen_contracts`：`{{FROZEN_CONTRACTS}}`
- `non_goals`：`{{NON_GOALS}}`
- 外部写入权限：`{{EXTERNAL_AUTHORITY}}`

## 输出

| 输出 | 路径 | 消费方 |
| --- | --- | --- |
| `{{OUTPUT}}` | `{{OUTPUT_PATH}}` | `{{CONSUMER}}` |

## 验收矩阵

| 层级 | 检查 | 预期证据 |
| --- | --- | --- |
| L0 | `{{L0_CHECK}}` | `{{L0_EVIDENCE}}` |
| L1 | `{{L1_CHECK}}` | `{{L1_EVIDENCE}}` |
| L2 | `{{L2_CHECK}}` | `{{L2_EVIDENCE}}` |
| L3 | `{{L3_CHECK}}` | `{{L3_EVIDENCE}}` |

## 回滚与失败处理

- 回滚点：`{{ROLLBACK_POINT}}`
- 阻塞上报：`{{ESCALATION}}`
- 相邻重验：`{{ADJACENT_REGRESSION}}`

## 交付格式

按“产出 / 验收 / 证据 / 偏差 / 风险”返回；不得用实现描述替代实际结果。
