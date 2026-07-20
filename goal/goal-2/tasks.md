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

- 状态：completed
- 可验证目标：
  - 将推荐从简单 keyword rule 升级为多信号评分。
  - 输出更完整的推荐解释、门店策略、券策略、风险边界和 fallback。
  - 所有面板数据与类型保持一致。
- 完成记录：
  - 在 `src/types.ts` 扩展 `AgentDecision`，新增 `selectedStore`、`candidateScores`、`agentTrace`、`guardrails`、`fallbackPlan`，保留旧 UI 依赖字段以避免破坏现有面板。
  - 在 `src/logic/agent.ts` 将原本固定 product 的 keyword rule 升级为多信号评分：综合意图关键词、场景 trigger、会员偏好/避忌、最近订单、生命周期、价格敏感、甜度/温度、商品目录标签。
  - 新增门店选择策略：按城市、距离、排队、ETA、库存提示、用户等待敏感度排序，并把门店理由写入信任解释。
  - 新增券包策略：综合可用门槛、折扣、过期时间、价格敏感度，输出模拟到手价和解释。
  - 新增 Agent trace、guardrail 和 fallback 输出，覆盖低置信度、排队/ETA、低糖解释、价格犹豫、真实支付/会员/库存边界。
  - 已执行 `npm run build`，TypeScript 与 Vite 生产构建通过。
  - 自信检查：当前 task 已完成“逻辑深度”目标；新增的真实商品图片、地理位置授权和页面深度展示已记录到后续 Task 3-5，不在本 task 中假装完成。

## Task 3: 首屏与内容显示升级

- 状态：completed
- 可验证目标：
  - 优化桌面端首屏信息密度、层级和美术风格。
  - 新增业务闭环/Agent 配置/指标展示，使内容不空洞。
  - 展示商品候选、Agent trace、门店策略、guardrail、fallback 等 Task 2 新字段。
  - 所有文字不溢出，按钮和卡片稳定。
- 完成记录：
  - 在 `src/main.tsx` 重构首屏信息：展示 Agent 置信、取餐 ETA、候选商品数、选中门店、边界条数，并将对话回复摘要升级为商品 + 门店 + 券包 + 边界解释。
  - 在方案面板展示 Task 2 新字段：候选商品评分、风味/营养标签、门店策略、Agent 编排 Trace。
  - 在画像面板补充会员等级、积分、persona、权益、授权范围、最近订单，避免画像只剩浅层标签。
  - 在执行面板补充门店履约策略、完整执行链路、guardrail 列表和 fallback plan。
  - 在复购面板补充体验指标参照，连接推荐接受率、决策时长、沉睡唤醒、履约稳定度。
  - 在 `src/styles.css` 将主视觉从通用绿色调整为瑞幸感更强的蓝白主色 + 咖啡暖色强调，新增评分条、Trace 状态、商品视觉槽位、轻量进入/浮动动画，并加入 `prefers-reduced-motion` 降级。
  - 已执行 `npm run build`，TypeScript 与 Vite 生产构建通过。
  - 已用 Playwright 打开本地页面，检查桌面首屏、方案/执行/画像 tab；发现并修复了中栏标题、指标和摘要被右侧 canvas 挤压的问题。
  - 用户审美复核未通过：当前版本仍偏工程后台，蓝白替换和信息堆叠不足以达到参考项目的视觉完成度；Task 3 重新打开，需要进一步参考 `bcefghj` 项目的内容组织、视觉层次和演示包装后再收口。
  - 用户追加 GUI-Agent 方向后，本 task 需要把自动执行模块纳入信息架构：首屏不再只是右侧卡片，应呈现“真实 App/手机执行窗口 + Agent 运行小窗”的核心作品记忆点。
  - 根据用户纠偏，重新收敛边界：GUI-Agent 不再作为全站主壳，只保留在“自动执行”模块；主页面默认是咖啡 Agent 工作台，包含今日任务、Agent 对话、推荐策略、自动执行、增长回写、数据接入六个模块。
  - 参考 `bcefghj/xiaoman` README 的“三幕故事 / 电脑手机视图 / 真办事兜底 / 记忆进化”表达，以及 `bcefghj/hire-easy` 的 `FlowNav`、`ModeToggle`、`DesktopShell`、`PhoneShell` 结构，把左栏重做为演示导演式 FlowNav：展示三幕咖啡旅程、网页/手机预览切换、编号进度、场景脚本、会员分身和能力挂载。
  - 接入可追溯商品图片：从 `https://www.luckincoffee.us/menu/signature-lattes`、`/menu/fruity-americano`、`/menu/single-origin-espresso` 解析 Luckin Coffee US 官方菜单内嵌数据，为生椰拿铁、丝绒拿铁、橙 C 美式、美式、Flat White 视觉补充官方 CDN 图片；UI 中显示来源为 `Luckin Coffee US official menu`，并保留价格/库存/券为 mock 的边界说明。
  - 在 `src/main.tsx` 新增 `ProductMedia`、`ProductThumb`，让 hero、手机商品页、搜索结果、候选排序都出现真实咖啡图片，而不是抽象杯子。
  - 新增“网页 / 手机”预览模式，手机模式会把工作区收窄并改为窄屏可滚动布局；真正的手机端 Agent 对话 App-like 体验仍留给 Task 4，不在本 task 中假装完成。
  - 已执行 `npm run build`，TypeScript 与 Vite 生产构建通过。
  - 已用 Playwright 检查桌面首屏、真实图片加载、自动执行模块、手机预览模式，并确认 console 无 error/warning。
  - 自信检查：当前 task 对“首屏、左侧流程导航、真实商品图、GUI-Agent 模块边界”的修复已经达到可提交状态；手机端深度、地理定位、商品/会员真实 adapter 属于后续 Task 4/5。

## 大型全面检查 Debug 循环 A

- 状态：completed
- 覆盖范围：
  - TypeScript build
  - 桌面 UI 检查
  - 核心交互检查
  - 数据解释一致性检查
- 完成记录：
  - TypeScript/Vite：执行 `npm run build` 通过。
  - 桌面 UI：Playwright 1280x720 截图检查默认首屏，左侧 FlowNav、hero 商品图、会员画像、信任解释均可见，未发现主要重叠。
  - 自动执行：Playwright 点击“查看自动执行”，确认手机大窗 + GUI-Agent cockpit 小窗出现，执行链路可推进到支付前停止。
  - 手机 smoke：Playwright 390px 宽度截图检查，无结构性横向溢出；另测试“手机”预览切换，工作区可收窄滚动。
  - 数据解释一致性：商品图片来源显示为 Luckin Coffee US official menu；价格、库存、券、会员和支付仍明确为 mock/演示边界。
  - Console：Playwright `console error` / `console warning` 检查无错误和警告。

## Task 4: 移动端与响应式体验

- 状态：completed
- 可验证目标：
  - 手机端布局可用，不横向溢出。
  - rail、chat、canvas 在窄屏自然重排。
  - tab、输入框、快捷 prompt、卡片按钮均可触达。
  - 手机端有明确的商品视觉、门店距离、授权/拒绝定位 fallback，不只是桌面布局缩小。
  - 手机端自动执行模块需可模拟“一个大窗操作 + 一个小窗进度”，并保持支付前停止的安全边界。
- 完成记录：
  - 根据用户反馈重新定义手机端入口：手机端首屏不再是桌面工作台缩窄，而是参考小满手机视图的聊天起手，直接展示“小鹿 Agent”对话、用户需求、推荐方案卡和底部输入栏。
  - 在 `src/main.tsx` 新增 `PhoneExperience`、`PhoneBubble`、`PhonePlanCard`、`PhoneLocationCard`、`MobileChainSheet`，将手机聊天、定位兜底和执行链路从桌面工作台中拆出来。
  - 手机端点击“执行点单”后进入手机点单模拟页面；点单画面保持大窗主操作，底部弹出链路浮层显示执行状态、Step、Observation、Action，可暂停/继续，符合“手机上有一个弹窗显示链路”的要求。
  - 手机端新增定位权限/fallback 卡：默认展示粗略定位选店，点击“拒绝定位”切到“常购门店兜底”，说明不读取实时位置，沿用最近订单/常购门店和城市级信号，并仍要求支付前确认门店。
  - 窄屏下隐藏左侧 FlowNav/导演栏，避免手机首屏先出现左栏；桌面预览模式仍可保留左侧 FlowNav。
  - 已执行 `npm run build`，TypeScript 与 Vite 生产构建通过。
  - 已用 Playwright 390x844 检查手机首屏聊天、拒绝定位 fallback、点击执行后的手机点单 + 链路弹窗，并确认 console 无 error。
  - 自信检查：当前 task 已完成“手机端聊天起手、可触达输入/快捷场景、商品视觉、定位 fallback、执行弹窗链路、支付前停止边界”。后续 Task 5 继续做真实商品/地理位置 adapter 的系统化接入说明，不在本 task 中冒充真实接口。

## Task 5: 真实商品、图片、地理位置与 adapter 设计

- 状态：pending
- 可验证目标：
  - 调研公开可用的瑞幸商品/品牌信息与图片来源，明确哪些可真实引用、哪些只能 mock。
  - 增加 mock adapter 或文档，说明如何接菜单、门店、券包、会员信息、地理位置和商品图片。
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
