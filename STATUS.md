# 当前状态

更新时间：2026-08-19

## 项目形态

- Next.js 14 + React 18 + TypeScript
- 静态导出并部署到 GitHub Pages
- 正式仓库：`https://github.com/jiaqizhao0226-byte/ai-game-tracker.git`
- 线上地址：`https://jiaqizhao0226-byte.github.io/ai-game-tracker/`
- 主数据：`src/data.json`
- 更新记录：`src/changelog.json`
- 分类和录入规范：`docs/SCHEMA.md`

## 当前 Git 状态

当前存在未提交改动，尚未 commit、push 或 deploy。主要包括：

- 新增 7 款产品与产业平台，当前收录总数 133
- 新增融资/产品动态与趋势洞察 #9
- Astrocade 经用户明确确认设为重点关注
- ProductIntro 的 GitHub Pages basePath 修复
- 已撤回全站视觉重构，仅保留原有风格上的轻量角标优化

最近提交围绕：

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
- AI Native、AI in Game 和 AI for Game 分类体系

## 最近验证

- `npm run build`：成功，生成 245 个静态页面
- `node scripts/audit.js`：0 个问题
- 桌面首页、375px 窄屏、概览和洞察页完成浏览器检查
- 窄屏无横向溢出，浏览器控制台无错误
- 本地预览：`npm run dev` → `http://localhost:3000/`

## 视觉规则

- “重点关注”仅在用户明确指定时设置
- 重点关注使用单层紫色星标标签，不使用 warning/danger 的黄红状态色
- 保持既有页面结构、紧凑筛选与卡片尺寸；后续视觉调整以局部微调为主

## 历史上下文

项目主要由两条 Claude 本地 session 持续维护，详情见 `CONTEXT/CLAUDE_HANDOFF.md`。原始 session 保留在本机 `.claude/projects`，未复制进 Git 仓库。
