# Goal 1 Tasks

## Task 1: 建立 goal 与项目骨架

- 状态：已完成
- 独立验证：
  - `goal/goal-1/input.md`、`plan.md`、`tasks.md` 存在。
  - `input.md` 保存了用户原始输入和截图文字要点。
  - 当前尚未修改业务代码。
- 完成记录：
  - 新建项目目录 `luckin-agent-submission/`。
  - 新建 `goal/goal-1/input.md`、`plan.md`、`tasks.md`。
  - 修正 `input.md`，仅保留原始用户输入和图片路径标签，不混入解释性截图 OCR。
  - 验证三个 goal 文件存在且当前尚未修改业务代码。

## Task 2: 调研活动、参考仓库与公开资料

- 状态：已完成
- 独立验证：
  - 形成 `research/research-notes.md`。
  - 至少包含活动命题、瑞幸业务背景、AI Agent/会员运营案例、参考项目结构观察。
  - 所有关键外部信息附来源链接和访问日期。
- 完成记录：
  - 新建 `research/research-notes.md`。
  - 记录活动命题、报名字段、瑞幸业务背景、Lucky AI 现有能力、行业/竞品案例、用户反馈痛点、bcefghj 参考项目风格。
  - 研究笔记包含 26 个来源链接，并标注访问日期 2026-07-19。

## Task 3: 产出报名表核心文案

- 状态：已完成
- 独立验证：
  - 形成 `docs/submission-copy.md`。
  - part 1 控制在 50-300 字。
  - part 2 控制在 300-600 字。
  - 覆盖洞察、架构、创新点、业务价值、可行性。
- 完成记录：
  - 新建 `docs/submission-copy.md`。
  - 完成开题报告 part 1，可直接粘贴，去空白后 199 字符。
  - 完成开题报告 part 2，可直接粘贴，去空白后 440 字符。
  - 文案覆盖洞察、整体方案、架构模块、创新点、量化价值和可行性。

## Task 4: 大型全面检查-debug循环 1

- 状态：已完成
- 独立验证：
  - 检查 Task 1-3 输出的一致性、事实准确性、字数、引用完整性。
  - 修复发现的问题。
- 完成记录：
  - 新建 `goal/goal-1/check-1.md`。
  - 检查 Task 1-3 的文件完整性、原始输入保存、研究覆盖、来源链接、报名文案字数和待办占位。
  - 确认 part 1 为 199 字符、part 2 为 440 字符；未发现需要额外修复的阻塞缺陷。

## Task 5: 设计 demo 产品形态与数据模型

- 状态：已完成
- 独立验证：
  - 形成 demo 的信息架构和数据模型。
  - 明确合成数据字段、Agent 决策流程、核心用户路径。
- 完成记录：
  - 新建 `docs/demo-design.md`。
  - 明确 demo 定位、页面结构、合成数据模型、样本会员、Agent 决策流程和可独立验证交互。
  - 选定 Vite + React + TypeScript 作为实现方案，约束为离线合成数据、无真实 API/支付/隐私数据。

## Task 6: 实现可运行 demo

- 状态：已完成
- 独立验证：
  - demo 可本地启动。
  - 包含用户意图识别、会员分层、推荐/唤醒/复购动作生成、指标面板。
  - 没有真实密钥或隐私数据。
- 完成记录：
  - 新建 Vite + React + TypeScript demo：`package.json`、`index.html`、`src/`。
  - 实现合成会员数据、场景数据和本地 Agent 决策逻辑。
  - 实现工作台界面：会员切换、场景输入、意图识别、会员记忆、推荐/优惠/下单路径、复购话术、增长指标反馈。
  - 执行 `npm install` 与 `npm run build`，构建通过；`npm audit` 显示 0 vulnerabilities。
  - 启动本地 dev server：`http://localhost:5173/`。

## Task 7: 大型全面检查-debug循环 2

- 状态：已完成
- 独立验证：
  - 构建通过。
  - 浏览器打开 demo，无明显 UI 重叠和控制台关键错误。
  - 关键交互路径可用。
- 完成记录：
  - 新建 `goal/goal-1/check-2.md`。
  - 根据用户反馈确认第一版 demo 方向不佳：过于仪表盘化，缺少参考项目中的 Agent 对话、产品人格和规划链路。
  - 使用本机代理 `127.0.0.1:7890` 成功克隆小满、Ripple、Anker 参考仓库，并重点参考小满“一句话目标 -> 方案画布 -> 执行/兜底/记忆”的表达方式。
  - 将 demo 返工为“小鹿 CoffeePlan”咖啡规划 Agent：左侧会话/会员，中间对话，右侧方案/画像/执行/复购。
  - 修复 1280 宽度下标题和按钮挤压问题。
  - 执行 `npm run build` 通过；Playwright 验证确认、模拟支付、复购链路通过，Console 0 errors / 0 warnings。

## Task 8: 产出补充材料包

- 状态：已完成
- 独立验证：
  - README、方案补充说明、数据样例、参考资料清单齐全。
  - 材料能作为报名附件/链接直接提交。
- 完成记录：
  - 新建 `README.md`，按参赛项目风格补充一句话定位、为什么需要、核心创新、架构、快速开始、交付物。
  - 新建 `docs/solution-brief.md`、`docs/demo-walkthrough.md`、`docs/data-sample.md`。
  - 保存 demo 截图到 `docs/screenshots/desktop-coffeeplan.png`。
  - 新建 `.gitignore`，排除 `node_modules/`、`dist/`、`.playwright-cli/` 等。
  - 修正 `docs/submission-copy.md` 的补充材料目录，移除旧 `demo/` 占位。
  - 执行 `npm run build` 通过。

## Task 9: 初始化 Git 并提交，尽可能推送 GitHub

- 状态：待开始
- 独立验证：
  - 本地 Git 提交完成。
  - 若 GitHub 已认证，远程仓库创建并推送成功。
  - 若未认证，记录阻塞与推送命令。
- 完成记录：

## Task 10: 大型全面检查-debug循环 3

- 状态：待开始
- 独立验证：
  - 重新检查 demo、材料、Git 状态、报名字段。
  - 修复遗留问题。
- 完成记录：

## Task 11: 辅助完成报名页面提交

- 状态：待开始
- 独立验证：
  - 打开活动报名页并定位表单字段。
  - 可自动填写的字段已准备或填写。
  - 需要用户授权/个人信息/验证码/最终确认的部分明确说明。
- 完成记录：

## Task 12: 最终全面 review、归档 goal

- 状态：待开始
- 独立验证：
  - 从 C 端体验、代码、安全、材料、提交完整性进行最终 review。
  - 修复能修复的问题。
  - 标记 goal 完成并整理归档。
- 完成记录：
