# 验收报告：{{WORK_ORDER_ID}}

| 字段 | 值 |
| --- | --- |
| 项目 | `{{PROJECT_ID}}` |
| 验收版本 | `{{COMMIT_OR_VERSION}}` |
| 验收日期 | `{{DATE}}` |
| QA Agent | `{{QA_AGENT_ID}}` |
| 结论 | `PASS / PASS WITH DEVIATION / FAIL` |

## 验收范围

- 规格：`{{SPEC_IDS}}`
- 输出：`{{OUTPUTS}}`
- 环境：`{{ENVIRONMENTS}}`
- 非范围：`{{OUT_OF_SCOPE}}`

## 质量门

| 层级 | 实际检查 | 结果 | 证据 |
| --- | --- | --- | --- |
| L0 | `{{L0_ACTUAL}}` | `{{L0_RESULT}}` | `{{L0_EVIDENCE}}` |
| L1 | `{{L1_ACTUAL}}` | `{{L1_RESULT}}` | `{{L1_EVIDENCE}}` |
| L2 | `{{L2_ACTUAL}}` | `{{L2_RESULT}}` | `{{L2_EVIDENCE}}` |
| L3 | `{{L3_ACTUAL}}` | `{{L3_RESULT}}` | `{{L3_EVIDENCE}}` |
| 发布门 | `{{RELEASE_ACTUAL}}` | `{{RELEASE_RESULT}}` | `{{RELEASE_EVIDENCE}}` |

## 场景结果

| 场景 | 预期 | 实际 | 结果 |
| --- | --- | --- | --- |
| 最小启动 | `{{START_EXPECTED}}` | `{{START_ACTUAL}}` | `{{START_RESULT}}` |
| 黄金路径 | `{{GOLDEN_EXPECTED}}` | `{{GOLDEN_ACTUAL}}` | `{{GOLDEN_RESULT}}` |
| 失败恢复 | `{{RECOVERY_EXPECTED}}` | `{{RECOVERY_ACTUAL}}` | `{{RECOVERY_RESULT}}` |
| 关键机制 | `{{MECHANIC_EXPECTED}}` | `{{MECHANIC_ACTUAL}}` | `{{MECHANIC_RESULT}}` |
| 跨端/发布 | `{{DELIVERY_EXPECTED}}` | `{{DELIVERY_ACTUAL}}` | `{{DELIVERY_RESULT}}` |

## 缺陷与偏差

| ID | 严重度 | 状态 | 影响 | 责任人/失效条件 |
| --- | --- | --- | --- | --- |
| `{{DEVIATION_ID}}` | `{{SEVERITY}}` | `{{STATUS}}` | `{{IMPACT}}` | `{{OWNER_AND_EXPIRY}}` |

## 最终结论

`{{FINAL_DECISION_AND_NEXT_STEP}}`
