# 产物规格：{{ARTIFACT_NAME}}

| 字段 | 值 |
| --- | --- |
| `spec_id` | `{{BASE_SPEC_ID}}.{{PROJECT_ID}}.{{ARTIFACT_ID}}` |
| `base_spec` | `{{BASE_SPEC_ID}}` |
| `version` | `{{VERSION}}` |
| `status` | `draft` |
| `owner_agent` | `{{AGENT_ID}}` |
| `change_reason` | `{{CHANGE_REASON}}` |

## 目的与非目标

- 目的：`{{PURPOSE}}`
- 玩家/业务价值：`{{VALUE}}`
- 非目标：`{{NON_GOALS}}`

## 输入合同

| 输入 | 版本/状态 | 来源 | 必需条件 |
| --- | --- | --- | --- |
| `{{INPUT_ID}}` | `{{INPUT_VERSION}}` | `{{INPUT_SOURCE}}` | `{{INPUT_REQUIREMENT}}` |

## 输出合同

| 输出 | 精确路径 | 格式/结构 | 数量/参数 |
| --- | --- | --- | --- |
| `{{OUTPUT_ID}}` | `{{OUTPUT_PATH}}` | `{{OUTPUT_FORMAT}}` | `{{OUTPUT_PARAMETERS}}` |

## 消费合同

| 消费方 | 加载/调用方式 | 成功状态 | 失败行为 |
| --- | --- | --- | --- |
| `{{CONSUMER}}` | `{{CONSUMPTION}}` | `{{SUCCESS_STATE}}` | `{{FAILURE_BEHAVIOR}}` |

## 冻结不变量

- `{{INVARIANT_1}}`
- `{{INVARIANT_2}}`
- `{{INVARIANT_3}}`

## 验收

| 层级 | 场景/断言 | 环境 | 证据 |
| --- | --- | --- | --- |
| L0 | `{{L0_ASSERTION}}` | `{{L0_ENV}}` | `{{L0_EVIDENCE}}` |
| L1 | `{{L1_ASSERTION}}` | `{{L1_ENV}}` | `{{L1_EVIDENCE}}` |
| L2 | `{{L2_ASSERTION}}` | `{{L2_ENV}}` | `{{L2_EVIDENCE}}` |
| L3 | `{{L3_ASSERTION}}` | `{{L3_ENV}}` | `{{L3_EVIDENCE}}` |

## 依赖与影响

- `depends_on`：`{{DEPENDENCIES}}`
- `consumed_by`：`{{CONSUMERS}}`
- `verified_by`：`{{VERIFICATION}}`
- 变更等级：`{{CHANGE_LEVEL}}`
- 相邻回归：`{{ADJACENT_REGRESSION}}`

## 偏差与回滚

- 偏差：`{{DEVIATION_IDS_OR_NONE}}`
- 回滚点：`{{ROLLBACK_POINT}}`
