# Jev 候选筛选器 POC

## 目标与边界

这个 POC 用 Jev 对每条待录入新闻或产品资料做窄判断，再由代码组合为：

- `is_duplicate`
- `event_type`
- `monthly_importance`
- `evidence_quality`
- `contradicts_existing_record`
- `route`: `ignore` / `candidate` / `human_review`

它不会自动修改 `src/data.json`、`src/changelog.json`，也不会设置 `featured`、发布月报或推送 Git。最终录入与月报发布仍需人工确认。

## 为什么分成模型判断与代码规则

Jev 只负责需要语义理解的窄判断。以下工作固定留在代码中：

- URL、内容哈希和精确字段比对
- 日期排序与月份归属
- 候选记录召回
- 评分权重、阈值和高风险事件的硬规则
- 数据库写入与发布动作

`monthly_importance` 不是直接询问一个模糊的“重要性”，而是组合三项 Score：

1. 相对现有看板的信息新颖度
2. 对产品、团队或市场状态的实质改变程度
3. 对单一产品之外的行业判断价值

证据质量也不是单一模型分数：来源类型来自输入元数据，Jev 只判断材料是否支持主张及是否提供独立佐证。

## 输入格式

```json
{
  "title": "资料标题",
  "product_name": "产品名",
  "company_name": "公司或团队",
  "source_url": "https://example.com/article",
  "source_type": "official_self_disclosure",
  "published_at": "2026-09-20",
  "primary_claim": "这条资料最需要核验的核心事实",
  "content": "从来源中提取的相关正文，不要把整篇无关材料塞进来。",
  "independent_sources": [
    {
      "url": "https://example.org/independent-record",
      "excerpt": "与核心事实直接相关的材料"
    }
  ]
}
```

`source_type` 允许值：

- `official_self_disclosure`
- `independent_primary_record`
- `independent_reporting`
- `secondary_commentary`
- `unknown`

## 运行方式

先运行不需要 API 的策略组合测试：

```bash
npm run jev:test
npm run jev:fixture
npm run jev:dry-run
```

检查真实输入将发送给 Jev 的 state、问题和相似记录，但不发出请求：

```bash
node scripts/jev-candidate-filter.mjs \
  --input fixtures/jev-candidate-filter/sample-input.json \
  --dry-run
```

真实调用需要在仓库外提供 `TYPESAFE_API_KEY`。当前项目没有自动配置或保存该凭据；不要把密钥写入仓库、命令历史或日志。

```bash
node scripts/jev-candidate-filter.mjs --input path/to/candidate.json
```

脚本只把结果输出到标准输出，不写业务数据。

## 目前能验证和不能验证的内容

`fixtures/jev-candidate-filter/historical-decisions.json` 使用模拟的 Jev 返回值，只验证权重、硬规则和三路分流是否符合既定政策。它不能证明 Jev 对中文资料的真实准确率。

正式校准需要：

1. 收集 40–60 条带来源正文的历史候选。
2. 由人工给出重复关系、事件类型、重要性等级、证据状态和冲突结果。
3. 运行真实 Jev 判断并保留原始概率。
4. 重点检查重大事项召回率、自动忽略精度和人工审核比例。
5. 只有在误判成本可接受后，才允许扩大自动忽略范围。

第一阶段应偏保守：精确 URL/内容重复可以自动忽略；高影响事件、低置信度、证据冲突和相似记录歧义全部进入人工确认。
