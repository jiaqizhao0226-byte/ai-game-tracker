# 当前状态

更新时间：2026-10-10

## 项目形态

- Next.js 14 + React 18 + TypeScript
- 静态导出并部署到 GitHub Pages
- 正式仓库：`https://github.com/jiaqizhao0226-byte/ai-game-tracker.git`
- 线上地址：`https://jiaqizhao0226-byte.github.io/ai-game-tracker/`
- 主数据：`src/data.json`
- 更新记录：`src/changelog.json`
- 分类和录入规范：`docs/SCHEMA.md`

## 当前 Git 状态

本轮功能与数据发布版本为 `592e207`，已按用户授权于 2026-10-10 推送到 `origin/main` 并成功部署到 GitHub Pages。发布前构建、数据审计与差异检查通过，线上页面与图片已核对；最新文档提交以 `git log -1` 为准。主要包括：

- 新增 #161 Google Playground / Unity Spark（合并记录）、#163 Mora / Mora 1、#164 Pax Historia、#165 Playabl，共收录 137 款
- #162 Unity Spark 已按用户确认合入 #161，图片与动态保留；旧详情地址兼容展示 #161，不计作独立产品
- Pax Historia 为既有产品补录，使用 `sort_weight=142.5`，不占据新品首位
- Playabl 为上半年产品补录，使用 `sort_weight=130.5`，与既有创作平台相邻，不冒充最新首曝
- 刷新《不问凡尘》《星眠》《图灵证言》及 Meshy 公司动态，保留来源与统计口径
- 新增独立 `industry_events`，在概览页展示 General Intuition 融资与 Meshy 经营数据；不建立 General Intuition 产品卡
- 新增 6 张官方素材及 1 张 Playabl 社区作品实机截图，统一 Meshy 公司主页，修复更新记录页码的窄屏换行
- 新卡 `featured=false`；既有重点关注与玩法分类保留

历史已发布工作包括：

- 产品与公司主页补充
- 看板排序和老产品归位
- 和平精英 AI NPC 演进时间线
- 蛋仔派对 AI MV 玩法
- 删除过度解读和取消不再适用的重点关注

## 已知产品结构

- 首页产品情报与筛选
- 产品详情及实机截图
- 概览页与分类分布
- 趋势/洞察页
- 更新记录
- 概览页的行业动态（不计入产品数量）
- AI Native、AI in Game 和 AI for Game 分类体系

## 最近验证

- `npm run build`：成功，生成 267 个静态页面（含 #162 旧地址兼容页）
- `node scripts/audit.js`：0 个问题
- 已检查正式导出：首页、新卡详情、概览行业动态与本地图片的 `/ai-game-tracker` 路径
- 375px 首页筛选、新旧卡详情、概览及 Meshy 公司页无横向溢出；更新记录第 10 页可正常切换，控制台无错误
- Playabl #165 已检查桌面与 375px 详情、首页搜索、图片加载及大图打开；本地图片使用 `/ai-game-tracker` 路径，总数与更新记录均为 137
- 当前正式导出预览：`http://127.0.0.1:3000/ai-game-tracker/`；预览服务为临时运行进程，源码与数据保存在本项目
- 重开开发预览：`npm run dev` → `http://localhost:3000/`；GitHub Pages 已上线本轮更新
- [发布工作流 38034621467](https://github.com/jiaqizhao0226-byte/ai-game-tracker/actions/runs/38034621467)：构建与部署均成功，业务提交 `592e207`
- 线上 #161、#163、#164、#165 及 #162 兼容页均返回 200，#162 canonical 指向 #161；概览行业动态已显示，7 张新增图片与本地文件校验一致
- 线上 Playabl 封面与实机截图正常加载，桌面详情无横向溢出

## 视觉规则

- “重点关注”仅在用户明确指定时设置
- 重点关注使用单层紫色星标标签，不使用 warning/danger 的黄红状态色
- 保持既有页面结构、紧凑筛选与卡片尺寸；后续视觉调整以局部微调为主

## 新产品研究

- 2026-10-09 已保存 Instaplay 与 Playabl 的原始来源、公开作品观察、商业化边界及收录建议：`docs/research/2026-10-09-instaplay-playabl.md`
- Playabl 已按用户确认建立 #165 卡片（AI for Game / vibe game），使用公开作品 Orbit Loop 的实机截图；Instaplay 尚未建卡。两者均未设置重点关注，增长数字主要为团队披露，生成和联机流程尚未实测验证
- Instaplay 已有分阶段创作者奖励计划，不再沿用 8 月文章中“没有创作者变现”的旧描述

## 历史上下文

项目主要由两条 Claude 本地 session 持续维护，详情见 `CONTEXT/CLAUDE_HANDOFF.md`。原始 session 保留在本机 `.claude/projects`，未复制进 Git 仓库。
