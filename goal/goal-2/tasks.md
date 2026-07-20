# Goal 2 Tasks

## Task 1: 参考调研与产品深度骨架

- 状态：completed
- 可验证目标：
  - 调研 `bcefghj` 多个公开项目的结构与内容深度。
  - 为当前项目补充更完整的数据类型和 demo 数据骨架。
  - 不改变主要 UI 交互前提下，保证项目可 build。
- 完成记录：
  - 通过 GitHub API 调研 `bcefghj` 公开仓库，重点参考了多 Agent 电商推荐、智能客服、广告优化、HireEasy 等项目在项目描述中体现的深度模式；其中智能客服 README 的 Supervisor、分层记忆、MCP 工具、链路追踪、合规审查结构被转译为咖啡业务的 Agent 分工。
  - 在 `src/types.ts` 新增 `CoffeeProduct`、`StoreStatus`、`AgentModule`、`ExperienceMetric`、`DataConnector` 等类型，并扩展会员、订单、场景、推荐结构。
  - 在 `src/data/demoData.ts` 新增 mock 商品目录、门店履约状态、Agent 模块配置、体验指标、真实数据接入边界；会员和场景补充了等级、积分、权益、授权范围、生命周期目标、业务目标等字段。
  - 已执行 `npm run build`，TypeScript 与 Vite 生产构建通过。
  - 自信检查：当前 task 的边界是“业务骨架与 demo 数据”，未承诺 UI 已全部消费这些字段；下一 task 将把数据接入决策逻辑。

## Task 2: Agent 决策逻辑升级

- 状态：pending
- 可验证目标：
  - 将推荐从简单 keyword rule 升级为多信号评分。
  - 输出更完整的推荐解释、门店策略、券策略、风险边界和 fallback。
  - 所有面板数据与类型保持一致。
- 完成记录：

## Task 3: 首屏与内容显示升级

- 状态：pending
- 可验证目标：
  - 优化桌面端首屏信息密度、层级和美术风格。
  - 新增业务闭环/Agent 配置/指标展示，使内容不空洞。
  - 所有文字不溢出，按钮和卡片稳定。
- 完成记录：

## 大型全面检查 Debug 循环 A

- 状态：pending
- 覆盖范围：
  - TypeScript build
  - 桌面 UI 检查
  - 核心交互检查
  - 数据解释一致性检查
- 完成记录：

## Task 4: 移动端与响应式体验

- 状态：pending
- 可验证目标：
  - 手机端布局可用，不横向溢出。
  - rail、chat、canvas 在窄屏自然重排。
  - tab、输入框、快捷 prompt、卡片按钮均可触达。
- 完成记录：

## Task 5: 真实信息接入边界与 adapter 设计

- 状态：pending
- 可验证目标：
  - 增加 mock adapter 或文档，说明如何接菜单、门店、券包、会员信息。
  - 明确隐私、安全、授权和非真实支付边界。
  - UI 中不误导为真实下单。
- 完成记录：

## Task 6: 文档、演示脚本与交付包装

- 状态：pending
- 可验证目标：
  - 更新 README/docs，体现架构深度、Agent 配置、演示路线、评估指标。
  - 与参考项目一样能让评审快速理解项目价值。
  - 所有文档与现有功能一致。
- 完成记录：

## 大型全面检查 Debug 循环 B

- 状态：pending
- 覆盖范围：
  - 全量 build
  - 桌面/移动端截图检查
  - 文档与功能一致性
  - 安全/隐私/真实数据声明检查
- 完成记录：

## Final Review: 完成前最大审查与归档

- 状态：pending
- 可验证目标：
  - 从 C 端体验、代码质量、安全合规、性能、移动端、演示完整度全面审查。
  - 修复发现的问题。
  - 标记 goal 完成并整理归档。
- 完成记录：
