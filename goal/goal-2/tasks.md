# Goal 2 Tasks

## Task 1: 参考调研与产品深度骨架

- 状态：completed
- 可验证目标：
  - 调研 `bcefghj` 多个公开项目的结构与内容深度。
  - 为当前项目补充更完整的数据类型和 demo 数据骨架。
  - 不改变主要 UI 交互前提下，保证项目可 build。
- 完成记录：
  - 已下载 `bcefghj/xiaoman` 到本地参考目录 `/tmp/xiaoman-reference-1784536875`，检查到其前端结构为 `frontend/index.html`、`frontend/css/app.css`、`frontend/js/app.js` 等；未在仓库根目录发现单独 LICENSE 文件。
  - 根据用户“直接把他那个下载了然后改”的要求，当前实现不再渲染旧 CoffeePlan 壳，而是新增 `src/xiaomanLuckin.tsx`，以小满下载版的结构为底座重写瑞幸版本：顶栏、左侧会话历史、中心对话、右侧四 pane、手机底部 tab。
  - `src/main.tsx` 已切换为渲染 `XiaomanLuckinApp`；旧 App 代码暂时保留但不作为主入口渲染，便于后续按 task 清理和迁移零散业务函数。
  - 新底座保留瑞幸需求：用户输入显示为用户消息；发送后先给三个候选方向，不立即固定推荐；选择方向后展示官方公开商品图、门店、优惠、官方 App/Menu/Stores 入口和支付前停止。
  - 手机视图按小满手机框逻辑显示：顶栏 + chat-first + bottom tab（对话/方案/门店/订单），左栏和右侧 canvas 隐藏。
  - Qwen 引导代理仍保留：`server/qwen-guide-proxy.mjs` 可读取 shell 环境变量或 `.env.local/.env`，前端只调用 `/api/guide`，不把 key 写入代码。
  - 已执行 `npm run build`、`git diff --check`，均通过。
  - 已执行敏感 key 扫描，未发现用户 key 或 key 片段进入仓库。
  - 已用 Playwright 验证：默认桌面显示小满式三栏；提交需求后显示用户消息和候选方向；选择方向后显示方案与官方图片；手机切换后显示手机框、对话和底部 tab。
  - 自信检查：当前 task 已完成“下载小满，以小满为底座直接改”的第一版落地。为了版权/交付稳妥，未整包提交对方源码，而是按下载版结构迁移并重写瑞幸内容；下一步可继续清理旧未渲染 React 壳，或进一步把小满 `app.js` 中会话历史/移动 pane 切换细节逐项迁入。
  - 按用户最新要求再次纠偏：用户输入可以正常显示为用户消息；Qwen 代理可以接收本轮用户需求生成引导，但 key 只从 shell 环境变量或 `.env.local/.env` 读取，不写入前端或仓库。
  - 顶栏重做为小满式结构：品牌、定位 badge、用户/商家切换、Qwen 可选状态、支付前停状态、电脑/手机视图切换。
  - 左栏重命名为小满式入口：`新的咖啡`、`会话历史`、`生活`、`记忆·进化`、`商家`、`接入·设置`。
  - 右侧 canvas 收敛为小满式四个 pane：`方案 / 门店 / 订单 / 记忆`；设置和真实来源从左侧接入入口进入，不再占据右侧主 tab。
  - 中间 chat 保持“先输入、再候选、后方案”：用户消息会显示；发送后展示候选方向卡，不直接固定推荐；点方向后才展开商品和右侧方案。
  - 手机视图加入小满式底部 tab：`对话 / 方案 / 门店 / 订单`；确认方向前执行按钮不可用。
  - 已执行 `npm run build`、`git diff --check`，均通过。
  - 已执行敏感 key 扫描，未发现用户 key 或 key 片段进入仓库。
  - 已用 Playwright 验证默认桌面壳：顶栏、左栏、中间 chat、右侧四 pane 均符合小满式布局；空输入时不会推荐；发送需求后显示用户消息和候选方向。
  - 自信检查：当前 task 已完成“先复刻小满产品壳，再把瑞幸需求挂进去”的第一版；下一步可以继续更像小满源码细节（移动端 pane 切换、会话历史状态、右侧订单 pane 的执行 Saga 细节），但本 task 已达到可提交状态。

## 记录整理：Task 10 串位修复

- 状态：completed
- 说明：
  - 该位置原先误把 Task 1 的业务骨架完成记录插入到 “Task 10” 标题下，造成任务顺序和完成记录不一致。
  - 相关历史内容已由 Task 1 和 Task 9 覆盖，不再把这里当作独立执行任务。
  - 后续真正的 Task 10 放在 Task 9 后面，作为“逐功能完善与深度补齐”的下一步。

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

- 状态：completed
- 可验证目标：
  - 调研公开可用的瑞幸商品/品牌信息与图片来源，明确哪些可真实引用、哪些只能 mock。
  - 增加 mock adapter 或文档，说明如何接菜单、门店、券包、会员信息、地理位置和商品图片。
  - 明确隐私、安全、授权和非真实支付边界。
  - UI 中不误导为真实下单。
- 完成记录：
  - 调研并固化公开来源边界：Luckin Coffee US 官方菜单页 `signature-lattes`、`fruity-americano`、`single-origin-espresso` 可用于商品英文名、公开描述和官方 CDN 图片；官网 App/Stores 入口可作为 App 点单、会员权益、门店入口的体验参照；中国区实时价格、库存、券包、会员和支付没有授权接口，不能声明为真实结果。
  - 在 `src/types.ts` 新增 `DataSourceRecord`、`AdapterBlueprint`，区分 official menu、official site、browser API、synthetic demo、blocked private 等来源类型。
  - 在 `src/data/demoData.ts` 新增 `dataSources` 与 `adapterBlueprints`：覆盖官方菜单图片 Snapshot Adapter、定位授权与门店兜底 Adapter、会员权益 Adapter、下单支付 Adapter、门店履约 Adapter，并给出 reads/writes、permission、implementation、guardrail、uiDisclosure。
  - 在 `src/main.tsx` 重做数据接入页：展示“公开来源与可用范围”、“Adapter 蓝图”、“数据域状态”和“真实数据边界”，让评审能看到哪些字段真实、哪些 mock、哪些 blocked。
  - 手机端定位卡接入浏览器 Geolocation API：用户点击“用附近门店”才请求授权；授权失败/拒绝会切到“常购门店兜底”；本 demo 不保存精确坐标、不后台定位。
  - 更新 `docs/data-sample.md`，写明官方图片来源、可用/不可用范围、adapter 蓝图、隐私与安全边界。
  - 更新 `docs/demo-design.md`，修正旧的四页签/模拟支付描述，改为当前的桌面 FlowNav、手机聊天起手、执行链路弹窗和支付前停止。
  - 已执行 `npm run build` 和 `git diff --check`，均通过。
  - 已用 Playwright 检查桌面数据接入页，确认可见 `Luckin Coffee US Signature Lattes`、`官方菜单图片 Snapshot Adapter`、`真实数据边界`，console 无 error。
  - 已用 Playwright 390x844 检查手机定位授权路径，浏览器拒绝后自动切到常购门店兜底，console 无 error。
  - 自信检查：当前 task 已完成“真实商品/图片来源、地理位置授权体验、adapter 设计、隐私/安全/非真实支付边界、文档一致性”。后续 Task 6 继续做 README/交付包装和演示脚本，不在本 task 中扩大到完整文档重写。

## Task 6: 文档、演示脚本与交付包装

- 状态：completed
- 可验证目标：
  - 更新 README/docs，体现架构深度、Agent 配置、演示路线、评估指标。
  - 与参考项目一样能让评审快速理解项目价值。
  - 所有文档与现有功能一致。
- 完成记录：
  - 重写 `README.md` 为更接近小满/HireEasy 参赛交付的结构：一句话定位、为什么需要、三幕体验、核心创新、架构、真实数据边界、快速开始、演示路径、目录与交付物。
  - 重写 `docs/solution-brief.md`：补充命题理解、桌面 FlowNav、手机聊天起手、Agent 模块分工、真实数据 adapter、价值假设和与常规客服/推荐方案的差异。
  - 重写 `docs/demo-walkthrough.md`：形成 3 分钟演示脚本，明确桌面工作台、手机聊天、自动执行弹窗、数据接入边界的讲解顺序。
  - 更新 `docs/submission-copy.md`：报名表文案明确“手机端先聊天，点击执行后才进入模拟点单和链路弹窗”，并强调 GUI-Agent 只用于执行模块、支付前停止、真实数据边界。
  - 根据用户最新纠偏，将 `goal/goal-2/input.md` 追加保存原始反馈，并把 `goal/goal-2/plan.md` 的旧验证项从“四页签/模拟支付”修正为六模块 FlowNav、手机聊天起手、执行链路弹窗与支付前停止。
  - 修复实际手机视口 bug：`src/main.tsx` 新增 compact viewport 监听，窄屏强制使用 `PhoneExperience`，避免页面先渲染桌面工作台；桌面端仍保留网页/手机预览切换。
  - 清理误导性支付文案：将 fallback action 从“停止模拟支付”改为“停止执行模拟”，将数据 connector 的 payment scope 改为“支付前停止状态”。
  - 已执行 `npm run build`，TypeScript 与 Vite 生产构建通过。
  - 已执行 `git diff --check` 通过。
  - 已用 Playwright 390x844 验证：手机首屏为“小鹿 Agent”聊天、定位卡、商品方案卡和底部输入；点击“执行点单”后才进入模拟 App 大窗，并出现底部链路弹窗，显示 Step、Observe、Action；console warning/error 为 0。
  - 自信检查：Task 6 的文档包装、报名文案、手机端纠偏和验证闭环已完成；`output/` 仅为本地截图验证产物，不提交。

## 大型全面检查 Debug 循环 B

- 状态：completed
- 覆盖范围：
  - 全量 build
  - 桌面/移动端截图检查
  - 文档与功能一致性
  - 安全/隐私/真实数据声明检查
- 完成记录：
  - 工作树检查：除 `output/` 本地 Playwright 截图目录外无未提交业务改动；`output/` 不纳入提交。
  - 全量构建：执行 `npm run build`，TypeScript 与 Vite 生产构建通过。
  - 空白/补丁检查：执行 `git diff --check` 通过。
  - 文案一致性扫描：在 `README.md`、`docs/`、`src/` 中扫描 `支付完成`、`模拟支付完成`、`停止模拟支付`、`真实订单已创建`、`四页签`、`四个 canvas`、`确认这杯`、`右侧方案画布`、`后台定位` 等旧/危险说法；未发现正式交付口径中的误导承诺。命中项均为“不保存坐标/不使用真实会员数据/真实库存必须官方接口”等边界说明。
  - 桌面 1440x900 Playwright 检查：首屏展示 FlowNav 六模块、三幕咖啡旅程、真实商品图、Agent 编排、会员画像、信任解释，截图未见主要重叠；页面 `scrollWidth === clientWidth`，无横向溢出。
  - 桌面模块检查：逐项验证 `Agent 对话`、`推荐策略`、`自动执行`、`增长回写`、`数据接入`；可见对话记忆、候选商品召回、券包/兜底/订单路径、GUI-Agent Cockpit、增长回写和真实数据边界。
  - 真实图片检查：桌面首屏 `Coconut Latte` 图片加载成功，浏览器报告 `naturalWidth=920`、`naturalHeight=920`。
  - 手机 390x844 Playwright 检查：刷新后默认进入“小鹿 Agent”聊天首屏，可见定位卡、商品方案卡、底部输入和“执行点单”，没有显示桌面工作台缩窄版。
  - 手机定位检查：点击“拒绝定位”后显示“已切到常购门店兜底”，说明不读取实时位置，沿用常购门店/城市级信号，并要求支付前确认门店。
  - 手机执行检查：点击“执行点单”后进入模拟 App 大窗，底部链路弹窗显示 `执行链路运行中`、`Observe`、`Action`；执行到 Step 9/9 后变为 `执行链路暂停`，页面停在 `支付前确认`，显示 `已停止在支付前` 和 `真实支付必须由用户二次确认，本 demo 不扣款`，未出现 `订单已创建`。
  - Console 检查：桌面和手机路径 `console error` / `console warning` 均为 0。
  - 自信检查：当前 Debug 循环 B 对 build、桌面模块、移动端入口、自动执行边界、真实数据口径和视觉/溢出进行了覆盖验证；未发现需要修复的代码缺陷，下一步进入 Final Review。

## Final Review: 完成前最大审查与归档

- 状态：reopened
- 可验证目标：
  - 从 C 端体验、代码质量、安全合规、性能、移动端、演示完整度全面审查。
  - 修复发现的问题。
  - 标记 goal 完成并整理归档。
- 完成记录：
  - 最终需求审计：逐条对照用户目标，确认已覆盖参考 `bcefghj` 多项目深度、小满式网页/手机双体验、GUI-Agent 仅用于执行模块、真实咖啡图片、地理位置授权与兜底、商品/会员/门店/券包/支付 adapter 边界、Agent 配置与决策链路、文档交付包装。
  - C 端体验审查：桌面端首屏不再是空洞卡片，而是 FlowNav + 三幕旅程 + 商品视觉 + Agent 编排 + 会员画像 + 信任解释；手机 390x844 刷新默认进入聊天首屏，可见“小鹿 Agent”、定位卡、商品图方案卡、底部输入和“执行点单”。
  - 业务深度审查：验证切换“小周 / 沉睡唤醒”会生成“优惠尝新 · 橙 C 美式”、杭州门店、回归券和沉睡唤醒解释；切换“Ada / 低糖轻负担”会生成“低糖轻负担 · 轻乳茶咖”、深圳门店和低糖/轻负担解释；切换“老李 / 老样子快取”会生成“快捷复购 · 标准美式”、北京门店、5 分钟 ETA 和老样子快取解释。
  - Agent 与架构审查：桌面模块可验证 `今日任务`、`Agent 对话`、`推荐策略`、`自动执行`、`增长回写`、`数据接入`；策略模块展示候选商品召回、券包策略、兜底策略、订单路径；数据接入展示公开来源、Adapter 蓝图、数据域状态和真实数据边界。
  - 自动执行审查：桌面执行模块可见 `GUI-Agent Cockpit` 与 `Observe · Think · Act`；手机端点击“执行点单”后才进入模拟 App 大窗，底部链路弹窗显示 Observe/Action；执行到 Step 9/9 后停在 `支付前确认`，显示 `已停止在支付前` 和 `支付前停止`，未出现 `订单已创建`。
  - 移动端审查：手机首屏 `scrollWidth === clientWidth === 390`，无横向溢出；手机商品图 `Coconut Latte` 加载成功；拒绝定位后显示“已切到常购门店兜底”，并说明不读取实时位置、沿用常购门店/城市级信号。
  - 安全合规审查：执行 `npm audit --audit-level=high`，结果 `found 0 vulnerabilities`；文案扫描未发现正式交付口径中的“支付完成 / 真实订单已创建 / 后台定位 / 保存精确坐标 / 真实会员数据已接入”等误导承诺；所有价格、库存、券、会员、支付均保持 mock/blocked/官方授权边界说明。
  - 代码质量审查：执行 `npm run build`，TypeScript strict 与 Vite 生产构建通过；执行 `git diff --check` 通过；console error/warning 在最终桌面/手机路径中为 0。
  - 性能与资产审查：生产构建产物约 `index-DpMhE5AO.js` 272.96 kB、`index-DNZmqF-k.css` 33.74 kB；桌面/手机核心图片均来自公开官方菜单 CDN 并在浏览器中加载成功；核心决策逻辑本地运行，无外部 API key 依赖。
  - 文档交付审查：`README.md`、`docs/solution-brief.md`、`docs/demo-walkthrough.md`、`docs/demo-design.md`、`docs/data-sample.md`、`docs/submission-copy.md` 与当前功能一致，均明确小满式手机聊天起手、执行后链路弹窗、支付前停止和真实数据边界。
  - 归档状态：`goal/goal-2/input.md`、`goal/goal-2/plan.md`、`goal/goal-2/tasks.md` 已保留完整原始输入、执行计划、任务拆解、两次 Debug 循环和最终审查记录；本 goal 文件夹标记为 completed/archived，无需压缩。
  - 自信检查：最终审查未发现阻塞问题或需继续修复项；当前实现已满足本轮目标，可以标记 goal 完成。
  - 用户复核未通过：2026-07-20 用户指出当前版本“差的非常多”，核心问题是没有真正参考小满结构：左侧仍是 AI 模块堆叠，中间不是大的引导/聊天窗口，右侧应回到画像/执行，网页/手机切换位置也不对。因此撤回 Final Review 完成判断，goal 继续进行。

## Task 7: 小满式信息架构纠偏

- 状态：completed
- 可验证目标：
  - 重新参考 `bcefghj/xiaoman` 以及 bcefghj 其他高级项目，把桌面布局改成更接近小满的产品结构。
  - 左侧不再堆 AI 能力模块，而是场景、任务、工作流、人群/会话入口。
  - 中间成为大的聊天/引导主窗口，内容可随场景/输入变化，不是写死的大卡片展示。
  - 右侧承载画像、执行、门店/券、数据边界等辅助信息，保留原先右栏较好的深度。
  - 网页/手机切换移动到右上角；切换到手机后仍可聊天并进入模拟执行。
  - 默认用户端展示为手机设备预览，不是管理员后台；运营端可切换进入三栏工作台。
  - 用户端不写死输入和场景，应允许自然输入并提供轻量快捷需求。
  - 文案和模块命名更通俗、人性化，减少 AI/后台感。
  - 保留真实商品图、地理位置兜底、支付前停止、adapter 边界和移动端执行弹窗。
- 完成记录：
  - 用户最新要求把现有 UI 壳整体抛弃，只保留瑞幸需求/数据/执行/真实来源等素材，在小满基础上改；本 task 继续进行，不以当前旧壳修补为完成。
  - 已先把中断后的 TypeScript 状态修回可构建：`npm run build` 通过，`git diff --check` 通过。
  - 已加入可选 Qwen 引导代理的安全接入方式：`server/qwen-guide-proxy.mjs` 通过环境变量读取 `DASHSCOPE_API_KEY`/`QWEN_API_KEY`，`.gitignore` 忽略 `.env*`，`.env.example` 只放空模板；未把用户提供的 key 写入仓库。
  - 已将用户输入原文从聊天气泡中移除，并把提交后的输入框改为草稿模式，避免提交后的需求明文继续展示。
  - 用户后续明确“输入可以显示”，该限制已被 Task 9 覆盖调整；Task 7 作为纠偏任务关闭，继续由 Task 8/9 按小满底座推进。

## Task 8: 以小满为底座重搭 UI

- 状态：completed
- 可验证目标：
  - 丢弃当前自设计壳，不再围绕 FlowNav/自定义运营大屏做界面。
  - 按小满结构重搭：顶栏、左侧会话/生活入口、中间大聊天、右侧方案/订单/记忆/执行画布、手机底部 tab。
  - 用户视图网页和手机都存在；商家视角另行显示画像、订单、执行、数据。
  - 用户侧不显示“场景选择”，只通过聊天追问引导。
  - 手机点单模拟器更像官方 App：菜单、搜索、商品详情、规格、优惠、门店、官方 App/菜单/门店入口、支付前停止。
  - 保留瑞幸官方公开商品图片、真实来源说明、Qwen 可选引导代理和安全边界。
- 完成记录：
  - 重新按小满结构收敛桌面用户视图：顶栏保留用户/商家、网页/手机切换；左栏为新的咖啡任务、最近对话、生活、记忆·进化、商家、接入·设置；中间为大聊天窗口；右侧为方案、门店、订单、记忆、执行、设置画布。
  - 修复用户指出的“对话不了/一输入就推荐”：新增 `guidedChoice` 引导状态，用户提交后只进入理解阶段，不回显原文；页面展示 3 个千问式候选方向卡（稳妥一点/轻一点/快一点），用户点选方向后才展开商品方案和右侧画布。
  - 手机端同步为聊天起手和候选方向卡；顶部“执行”和底部执行按钮只有方案确认后可用，避免把对话入口做成点单入口。
  - 右侧画布在未输入或未确认方向时显示等待/选择方向面板，不提前展示商品、画像和执行链路。
  - Qwen 可选引导代理继续走本地 server：读取 shell 环境变量或 `.env.local/.env`，不把 key 写入前端或仓库；发送给 Qwen 的是“提神/轻负担/快取”等派生信号，不转发用户原文。
  - 将 UI 可见的“场景路由 Agent / 会员记忆 Agent / AI 模块”等后台味命名降噪为意图引导、咖啡记忆、菜单与门店、优惠计算、复购回写。
  - 修复 dev/HMR reload 下 `createRoot` 重复创建的 console error。
  - 已执行 `npm run build` 和 `git diff --check`，均通过。
  - 已执行敏感 key 扫描：`sk-sp`、key 片段、用户 key 字面量均未命中。
  - 已用 Playwright 验证桌面用户链路：空输入不推荐；发送需求后显示候选方向卡且不回显原文；右侧仍停在“先选一个方向”；选择方向后才出现商品方案和右侧方案画布。
  - 已用 Playwright 验证手机链路：右上角切手机后显示手机设备框；需求阶段显示候选方向卡；确认前执行按钮不可用。
  - 自信检查：当前 task 对用户最新提出的“要能对话、不要一输入就推荐、参考千问式推荐几个让用户选、小满式 UI”的问题已完成可验证修复；后续若继续深化，应进入新的任务做更完整的多轮上下文、候选重排和 Qwen 在线效果评测。

## Task 9: 先复刻小满产品壳再替换瑞幸功能

- 状态：completed
- 可验证目标：
  - 抛弃当前 CoffeePlan 自创舞台感，优先复刻小满的应用骨架。
  - 顶栏接近小满：品牌、定位、用户/商家、在线/Qwen 状态、网页/手机切换。
  - 左侧接近小满：新的咖啡、会话历史、生活、记忆·进化、商家、接入·设置。
  - 中间只作为对话页，用户消息可显示；发送后先给候选方向，不立刻固定推荐。
  - 右侧接近小满 canvas：方案、门店、订单、记忆；执行点单作为订单/方案中的动作，而不是全站主壳。
  - 手机端接近小满：手机视图中 chat-first，底部 tab 为对话、方案、门店、订单；执行后进入模拟 App 并显示链路弹窗。
  - 保留瑞幸官方公开商品图、真实数据边界、Qwen 本地代理和支付前停止。
- 完成记录：
  - 按用户“直接把小满下载下来改”的方向，继续以 `/tmp/xiaoman-reference-1784536875` 的 `frontend/index.html`、`frontend/css/app.css`、`frontend/js/app.js` 为结构参考，保留小满的顶栏、左栏、对话中栏、右侧 canvas、手机底部 tab 逻辑。
  - 清理 `src/main.tsx`：删除 2200+ 行旧 CoffeePlan 自创工作台死代码，只保留 React root 和 `XiaomanLuckinApp` 挂载，避免旧架构继续污染项目。
  - 强化 `src/xiaomanLuckin.tsx`：手机底部 tab 现在能真正切换对话/方案/门店/订单内容；点击执行后会自动切到订单页展示执行链路；左侧生活/记忆/商家/设置入口有对应 pane 或对话反馈，不再只是静态按钮。
  - 强化用户端/商家端分离：用户端继续是自然语言聊天和候选方向；商家端切换后中间主区变为经营参谋，右侧 canvas 变为经营方案、门店履约、执行边界、匿名记忆，不再像用户端点单页。
  - 修复手机框可用性：保留小满式手机外框，同时右上角仍显示网页/手机切换控件，避免进入手机预览后无法从 UI 返回电脑视图。
  - 保留瑞幸需求资产：官方公开咖啡图片、门店/优惠/会员 mock、Qwen 本地代理、支付前停止和真实数据边界均继续工作。
  - 已执行 `npm run build`，TypeScript 与 Vite 生产构建通过。
  - 已执行 `git diff --check` 通过。
  - 已执行敏感 key 扫描：`sk-sp`、`b948a03e0`、`ac044d5a95f2625171b379b` 均未命中仓库文件。
  - 自信检查：当前 task 已完成“清掉旧壳、以小满产品壳为主入口、补齐移动 tab/左栏入口/商家端差异”的可验证目标。剩余工作进入 Task 10：逐功能把小满原项目里的会话历史、设置弹层、隐私弹层、执行链路浮层、可靠性评测、数据接入说明继续补深。

## 大型全面检查 Debug 循环 C

- 状态：completed
- 覆盖范围：
  - 旧壳清理完整性
  - 桌面用户端对话链路
  - 手机框与 bottom tab
  - 执行链路支付前停止
  - 用户端/商家端分离
  - 构建、补丁空白、安全 key 扫描
- 完成记录：
  - 旧壳清理：`src/main.tsx` 从 2232 行收敛为仅挂载 `XiaomanLuckinApp` 的入口文件，主界面不再渲染旧 CoffeePlan/FlowNav 工作台。
  - 桌面 Playwright 检查：默认首屏为小满式三栏，左侧会话/生活入口、中间大聊天、右侧方案/门店/订单/记忆 canvas；空输入不推荐。
  - 对话 Playwright 检查：输入“开会前有点困，想喝提神的，别太甜”后显示用户消息，并先展示“稳妥一点 / 轻一点 / 快一点”三个候选方向；未立即锁定单一推荐。
  - 方案 Playwright 检查：选择方向后展示生椰拿铁方案、Luckin Coffee US official menu 图片、门店、优惠和官方 App/Menu/Stores 入口。
  - 手机 Playwright 检查：点击右上角手机后出现手机外框，底部 tab 可在对话/方案/门店/订单间切换；右上角仍可点“电脑”返回。
  - 执行 Playwright 检查：手机端点击“执行点单模拟”后自动切到订单内容，链路从选择规格推进到“支付前停止，等待用户自己确认”，未出现真实订单/扣款承诺。
  - 商家 Playwright 检查：切换商家后中间主区变为“咖啡需求参谋”，右侧画布展示执行边界/运营内容，不再是用户点单聊天页。
  - Console 检查：浏览器路径共有 0 error、0 warning，仅 React DevTools info。
  - 全量构建：执行 `npm run build`，TypeScript 与 Vite 生产构建通过。
  - 空白检查：执行 `git diff --check` 通过。
  - 敏感 key 扫描：`sk-sp`、`b948a03e0`、`ac044d5a95f2625171b379b` 均未命中仓库文件。
  - 自信检查：Debug C 未发现本轮新增代码的阻塞缺陷；Task 10 可继续逐功能完善，不需要回滚当前提交。

## Task 10: 逐功能完善小满式瑞幸版本

- 状态：completed
- 可验证目标：
  - 会话历史可新增、切换、恢复上下文，左栏不只是展示。
  - 设置/隐私/数据接入入口有小满式弹层或画布，不依赖解释文字堆叠。
  - 手机执行页更像真实 App 点单过程：菜单、商品、规格、优惠、门店、支付前确认和链路浮层都可逐步观察。
  - 运营端继续补深：供需分析、券包效率、门店履约、匿名记忆和风险边界可切换查看。
  - 完成第三轮大型全面检查 Debug 循环 C。
- 完成记录：
  - 会话历史补齐：新增 `CoffeeSession` 状态，左侧历史可新增、切换、恢复用户文本、候选方向、方案/执行阶段和当前 pane；默认打开空白“今天想喝什么”，不会把历史输入写死成首屏。
  - 左侧入口补齐：`Qwen 模型设置`、`隐私与授权`、`To-Agent 接入`、`可靠性评测`、`咖啡手账 · 回忆册` 改为小满式 modal，不再只是对话提示；弹层中展示模型代理、授权边界、官方来源、adapter、评测指标和历史订单手账。
  - 数据接入弹层补齐：展示 Luckin Coffee US 官方菜单/App/Stores、Browser Geolocation、synthetic fixtures、blocked private APIs，并列出官方菜单图片 Snapshot Adapter、定位授权 Adapter、会员权益 Adapter、下单支付 Adapter、门店履约 Adapter。
  - 手机执行补齐：`OrderPane` 从纯文本步骤升级为 `luckin coffee` App 模拟器，逐步展示菜单、商品、规格、优惠、门店、支付前确认；底部链路浮层显示 Observe、Action、Guardrail。
  - 支付边界补齐：执行链路最终停在“支付前确认”，明确“本 demo 不创建真实订单、不扣款、不扣券”。
  - 运营端补齐：商家端中间主区展示咖啡需求参谋、方案接受率、取餐稳定度、复购缩短；右侧 canvas 可展示经营方案、门店履约、执行边界、匿名记忆。
  - 真手机宽度修复：390px 视口默认进入手机聊天页，隐藏左栏/右栏，显示底部 tab，`scrollWidth === clientWidth === 390`。
  - 已执行 `npm run build`，TypeScript 与 Vite 生产构建通过。
  - 已执行 `git diff --check` 通过。
  - 已执行敏感 key 扫描：`sk-sp`、`b948a03e0`、`ac044d5a95f2625171b379b` 均未命中仓库文件。
  - 已用 Playwright 验证：默认桌面空白聊天、历史会话恢复、Qwen 设置弹层、数据接入弹层、手机方案页、手机执行 App 模拟器、支付前停止、商家端经营参谋、390px 真手机布局和 console 0 error/0 warning。
  - 自信检查：当前 task 的功能位均可独立验证，并且修复了验证中发现的两个缺陷（默认误入历史会话、手机记忆 pane 无对应 bottom tab）。本轮无需回滚；下一步可进入最终最大 review，逐项审查是否已达到“每个功能都完善”的完成标准。

## Final Review 2: 小满底座最终审查

- 状态：pending
- 可验证目标：
  - 对照用户最新目标逐项审计：旧项目是否真正抛弃、小满底座是否成为主结构、用户端/商家端/手机端/执行端/设置与数据接入是否完整。
  - 从 C 端体验、移动端、代码质量、安全合规、真实数据边界、文档一致性角度做最大 review。
  - 修复审查发现的问题；确认后标记 goal 完成并归档。
- 完成记录：
