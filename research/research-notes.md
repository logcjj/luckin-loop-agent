# 瑞幸 AI Agent 流量运营方案研究笔记

访问日期：2026-07-19

## 1. 活动命题与报名字段

活动页面：<https://activity.feishu.cn/future-talent?detail=ruixingkafei>

从用户截图确认，所选企业命题为：AI Agent 时代，流量入口发生变化。结合瑞幸真实业务场景搭建 AI Agent 流量运营方案：在品牌无法直触用户的背景下，依托 AI Agent 洞察用户意图，重构会员关系，打通唤醒、推荐、下单、复购、长效忠诚的全运营闭环。

报名表要求：

- 开题报告 part 1：命题前置分析与洞察，建议 50-300 字。
- 开题报告 part 2：整体解决方案设计，建议 300-600 字。
- 可选补充材料：附件可上传开题报告补充材料、相关项目经验、数据分析样本、研究笔记、参考资料清单等；链接可填写 GitHub、个人主页、Notion 等。

## 2. 瑞幸业务背景

瑞幸具备强数字化交易基础，适合从“下单工具”升级到“意图运营系统”：

- 瑞幸 2025 年报已披露，2025 年度 Form 20-F 可在投资者关系网站访问；官方投资者关系页列出 2025 Annual Report 于 2026-03-27 发布。[来源：Luckin Coffee Annual Reports](https://investor.luckincoffee.com/financial-information/annual-reports/)
- 2025 Q4/全年业绩显示，2025 年末门店数达到 31,048 家，全年新增门店 8,708 家，Q4 月均交易客户 98.4 百万；规模扩张带来更高频、更碎片化的会员触达需求。[来源：Marketscreener 转引 Luckin 2025 Q4/FY 结果](https://www.marketscreener.com/news/luckin-coffee-announces-fourth-quarter-and-fiscal-year-2025-financial-results-ce7e5cddd88af72c)
- 2026 Q1 官方新闻稿显示，季度净收入同比增长 35.3% 至人民币 120 亿元，月均交易客户同比增长 25.3% 至 93.1 百万，期末门店 33,596 家。[来源：Luckin Coffee Q1 2026 Results](https://investor.lkcoffee.com/news-releases/news-release-details/luckin-coffee-announces-first-quarter-2026-financial-results-and/)
- 瑞幸早期增长方法论强调 APP/小程序下单、大私域、CDP 和用户分层规则，说明“用户理解 + 触点协同”原本就是瑞幸优势；Agent 时代的核心是把这种能力从 APP 内运营扩展到跨入口意图捕捉。[来源：瑞幸咖啡杨飞增长方法论采访](https://www.centurium.com/press/%E7%91%9E%E5%B9%B8%E5%92%96%E5%95%A1%E6%9D%A8%E9%A3%9E%EF%BC%9A%E4%BB%8E%E8%B0%B7%E7%88%B1%E5%87%8C%E5%88%B0%E6%A4%B0%E4%BA%91%E6%8B%BF%E9%93%81%EF%BC%8C%E7%91%9E%E5%B9%B8%E7%9A%84%E5%A2%9E%E9%95%BF/)

## 3. 瑞幸现有 AI 能力与机会边界

瑞幸已经不是从零做 AI 点单，因此参赛方案要避开“简单聊天点单助手”的同质化。

- 华为官方支持页介绍 Lucky AI 是瑞幸饮品助手，覆盖饮品推荐、购买饮品、查看订单等能力，并支持在 HarmonyOS 入口唤起。[来源：Huawei Lucky AI 功能介绍](https://consumer.huawei.com/cn/support/content/zh-cn16085305/)
- 公开报道显示，Lucky AI 可根据历史订单和用户偏好做推荐，用户可用语音表达“老样子，再来一单”等需求。[来源：新浪科技报道](https://finance.sina.com.cn/tech/roll/2025-05-26/doc-inexwtce9867943.shtml)
- HarmonyOS 相关报道显示 Lucky AI 已打通“对话-下单-支付”链路，并可生成取餐码、展示自提点信息。[来源：中国日报转载报道](https://ex.chinadaily.com.cn/exchange/partners/82/rss/channel/cn/columns/snl9a7/stories/WS698eb997a310942cc499f99c.html)
- 瑞幸 AI 开放平台页面说明其面向 AI Agent、智能应用与业务协作场景，提供 MCP Server、CLI 与 Skill 能力，用于接入瑞幸开放服务。[来源：瑞幸 AI 开放平台](https://open.lkcoffee.com/)

机会判断：现有 Lucky AI 更像“交易履约助手”。命题要的是“流量运营方案”，应往上游做用户意图识别、跨入口归因、会员关系重构、可解释推荐和复购策略，往下游承接下单、支付、自提和售后。

## 4. 行业与竞品案例

- McKinsey 认为 agentic commerce 会让用户通过 AI 购物代理完成发现、比较、购买，商家要重新思考如何与被 Agent 中介的消费者建立关系。[来源：McKinsey Agentic Commerce](https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-agentic-commerce-opportunity-how-ai-agents-are-ushering-in-a-new-era-for-consumers-and-merchants)
- Deloitte 将演进分为 assisted discovery、assisted shopping、agentic shopping：从推荐算法，到对话式购物助手，再到用户不访问品牌站也能完成购买的 Agentic Shopping。[来源：Deloitte Agentic Commerce Guide](https://www.deloitte.com/us/en/industries/consumer/articles/agentic-commerce-ai-shopping-agents-guide.html)
- Gartner 预测，到 2028 年至少 70% 客户会用对话式 AI 开启客服旅程；到 2029 年 Agentic AI 将可自主解决大量常见客服问题。这意味着品牌触点会从页面流量变成对话意图。[来源：Gartner Customer Service AI](https://www.gartner.com/en/articles/customer-service-ai)；[来源：Gartner Agentic AI Service Prediction](https://www.gartner.com/en/newsroom/press-releases/2025-03-05-gartner-predicts-agentic-ai-will-autonomously-resolve-80-percent-of-common-customer-service-issues-without-human-intervention-by-20290)
- Starbucks Deep Brew 案例显示，咖啡品牌的 AI 不止推荐饮品，还能连接会员、门店运营、库存与体验个性化。[来源：Microsoft x Starbucks](https://news.microsoft.com/source/features/digital-transformation/starbucks-turns-to-technology-to-brew-up-a-more-personal-connection-with-its-customers/)；[来源：Hyperight Deep Brew](https://hyperight.com/deep-brew-transforming-starbucks-into-a-data-driven-company/)

## 5. 用户反馈与真实痛点

可从公开评论中看到三个与 Agent 流量运营相关的痛点：

- 入口/注册门槛：旅行用户反馈 Luckin 下单依赖 App/小程序和手机号/支付宝链路，注册或支付流程可能卡住。[来源：Reddit travelchina 讨论](https://www.reddit.com/r/travelchina/comments/1nc90ep/ordering_at_luckin_coffe_doesnt_work/)
- 优惠券与价格信任：用户对优惠券未自动使用、不同账号价格差异、退改补偿规则有投诉和舆论讨论。Agent 推荐不能只追转化，还要解释优惠和价格逻辑，建立“可信推荐”。[来源：App Store 评论页](https://apps.apple.com/cn/app/1296749505?platform=iphone&see-all=reviews)；[来源：黑猫投诉样例](https://tousu.sina.cn/complaint/view/17370789667)；[来源：中国新闻网陕西频道](https://www.shx.chinanews.com.cn/news/2025/0430/105084.html)
- 场景决策复杂：咖啡消费包含时间、天气、工作日节奏、口味、门店距离、券、取餐方式、健康偏好等变量。普通推荐会把选择压力留给用户，Agent 应该把变量折叠成“此刻最合适的下一步”。

## 6. 参考 bcefghj 项目风格

参考入口：<https://github.com/bcefghj?tab=repositories>

适合借鉴的项目：

- `anker-ai-product-studio`：参赛命题型项目，README 开头明确命题、系统价值、一次运行产出、架构、快速开始，并强调“不是 PPT，而是可运行、可溯源、可评测”。[来源](https://github.com/bcefghj/anker-ai-product-studio)
- `hire-easy`：比赛交付物定位清晰，描述中包含“宣传网页 + 体验 Demo + 交付物”，适合本项目采用同样的提交结构。[来源](https://github.com/bcefghj/hire-easy)
- `xiaoman`、`ripple`：本地生活/增长类 Agent，命名具象、有场景角色，适合借鉴“产品人格 + 可体验 demo”的表达方式。[来源：xiaoman](https://github.com/bcefghj/xiaoman)；[来源：ripple](https://github.com/bcefghj/ripple)
- `multi-agent-ecommerce-system`、`multi-agent-ad-optimizer`：和推荐、营销、投放优化相关，可借鉴多 Agent 分工叙事，但本项目应控制技术复杂度，优先交付评委可直接打开的前端 demo。[来源：multi-agent-ecommerce-system](https://github.com/bcefghj/multi-agent-ecommerce-system)；[来源：multi-agent-ad-optimizer](https://github.com/bcefghj/multi-agent-ad-optimizer)

拟采用的交付风格：

- README 首屏说明命题、方案名、核心价值和在线/本地体验方式。
- 文档强调“真实业务闭环 + 合成数据可复现 + 可解释指标”。
- Demo 做成运营工作台，而不是聊天玩具：让评委看到从用户意图到运营动作的链路。
- 补充材料包含开题报告、架构图、研究笔记、数据样本、操作截图/链接。

## 7. 方案初步定位

项目名建议：`Luckin Loop Agent`，中文名“瑞幸意图增长智能体”。

一句话：把分散在 AI 入口、APP/小程序、支付与门店履约中的用户意图，转化为可解释的会员运营动作，形成“识别意图-推荐饮品-解释优惠-一键下单-复购唤醒-忠诚成长”的闭环。

核心模块草案：

- Intent Graph：解析用户对话、时间、位置、历史订单、券、天气/场景，识别当下任务。
- Member Memory：构建轻量会员画像，包括偏好、价格敏感度、复购节奏、健康约束和信任风险。
- Next Best Action：生成下一最佳动作，覆盖推荐、券组合、门店/取餐建议、复购提醒。
- Trust Guard：解释推荐原因、优惠券选择和隐私使用边界，降低“杀熟/被诱导”感知风险。
- Growth Loop Console：给运营侧展示人群、触达策略、预估 uplift、A/B 测试与留存指标。

## 8. 对后续 demo 的约束

- 使用合成数据，不引入真实用户隐私。
- 不接入真实瑞幸下单接口，避免误下单和支付风险；使用模拟订单流展示能力。
- 做出可点击、可解释、可截图的体验：选择用户样本，输入一句需求，Agent 输出意图、推荐、券、话术、预期指标。
- 方案要清楚区分“已有 Lucky AI 能做的下单”与“本项目新增的流量运营闭环”。
