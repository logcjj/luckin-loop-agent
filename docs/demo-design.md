# 小鹿 CoffeePlan Demo 设计

## Demo 定位

名称：小鹿 CoffeePlan

中文名：瑞幸意图增长智能体

一句话：把用户在 AI 入口里的一句话目标，规划成“今天这杯咖啡”的可解释推荐、优惠、门店、下单与复购运营闭环。

评委 2 分钟路径：

1. 桌面端左侧是新的咖啡、最近对话，以及生活、记忆·进化、商家、接入·设置入口；中间是大的聊天/引导主窗口；右侧是方案、门店、订单、记忆画布。
2. 手机端默认进入聊天流，先用自然语言说清楚需求，而不是展示桌面缩窄版。
3. Agent 先输出几个候选方向；用户确认后再生成“咖啡规划”：主意图、推荐饮品、官方商品图、到手价、取餐 ETA、定位/常购门店 fallback。
4. 点击“执行点单”后进入手机点单模拟，大窗展示模拟 App 操作，底部弹窗显示 Step、Observation、Action。
5. 自动执行必须停在支付前；不会创建真实订单、扣券或扣款。

## 页面结构

- 顶部：产品名、位置、用户/商家切换、Qwen 可选状态，以及右上角网页/手机切换。
- 左侧桌面栏：新的咖啡任务、最近对话，以及生活、记忆·进化、商家、接入·设置入口和支付前停止边界。
- 中间工作区：聊天起手、需求引导、用户消息、候选方向、商品方案卡、门店/券/兜底说明、底部输入。
- 右侧画布：方案、门店、订单、记忆四个 tab；数据接入、隐私、评测、模型设置通过弹层展示。
- 手机工作区：手机设备外框、聊天起手、定位授权/常购门店 fallback、商品方案卡、底部输入、执行点单入口。
- 自动执行：独立模块；桌面和手机都用模拟 App 大窗 + 链路浮层展示 Observe、Action、Guardrail。

## 合成数据模型

### Member

```ts
type Member = {
  id: string;
  name: string;
  segment: "new" | "active" | "sleeping" | "loyal";
  city: string;
  favoriteFlavors: string[];
  avoid: string[];
  priceSensitivity: "low" | "medium" | "high";
  lastOrderDays: number;
  avgWeeklyOrders: number;
  couponWallet: Coupon[];
  trustFlags: string[];
  recentOrders: Order[];
};
```

### Scenario

```ts
type Scenario = {
  id: string;
  text: string;
  timeSlot: "morning" | "afternoon" | "evening";
  weather: string;
  distanceToStoreMeters: number;
  channel: "system-agent" | "app" | "mini-program" | "social-search";
};
```

### AgentDecision

```ts
type AgentDecision = {
  primaryIntent: string;
  secondaryIntents: string[];
  confidence: number;
  memberMemory: string[];
  recommendation: ProductRecommendation;
  couponPlan: CouponPlan;
  orderPath: string[];
  wakeupMessage: string;
  repurchasePlan: string;
  trustExplanation: string[];
  estimatedImpact: {
    clickRateLift: number;
    wakeupLift: number;
    repurchaseCycleReduction: number;
  };
};
```

### CoffeeProduct 来源字段

```ts
type CoffeeProduct = {
  id: string;
  name: string;
  officialName?: string;
  imageUrl?: string;
  imageSourceUrl?: string;
  imageSourceName?: string;
  sourceNote: string;
};
```

商品图片来源于 Luckin Coffee US 官方菜单公开页面；中文名、价格、券、门店和库存仍为 demo mock。

## 样本会员

- 陈晨：活跃白领，下午提神场景，高频购买生椰拿铁，偏好少糖，对距离敏感。
- 小周：沉睡会员，近 21 天未下单，价格敏感，券包即将过期，常在周末尝新。
- Ada：新会员，偏好低糖/轻负担，对推荐解释和成分信息敏感。
- 老李：忠诚会员，早晨固定下单，对“老样子”快捷路径和排队时间敏感。

## Agent 决策流程

1. Intent Graph：关键词 + 场景规则识别主意图，例如提神、低糖、赶时间、尝新、囤券、复购。
2. Member Memory：结合会员偏好、避忌、复购周期、券包和信任风险，生成约束。
3. Next Best Action：饮品推荐、优惠券选择、门店/取餐路径、触达话术。
4. Trust Guard：解释为什么推荐、为什么用这张券、是否使用个人数据。
5. Feedback Loop：根据“接受/放弃/加购/复购”更新会员记忆和人群包指标。

## 可独立验证的交互

- 切换会员后，画像、券包、历史订单和策略会变化。
- 输入不同需求后，识别意图和推荐卡片会变化。
- 手机端默认展示聊天起手，而不是桌面缩窄版。
- 点击“用常购门店”或浏览器拒绝定位后展示常购门店兜底。
- 点击“执行点单”后进入模拟执行链路，并显示链路弹窗。
- 自动执行停止在支付前，不提供真实支付按钮。
- 数据接入弹层展示官方来源、adapter 状态和不可使用范围。
- 核心 Agent 逻辑无外部 API 依赖；官方商品图片和浏览器定位是可降级增强，离线时仍可运行 mock 决策链路。

## 实现约束

- 使用 Vite + React + TypeScript，便于快速运行和部署到 GitHub Pages。
- 不接入真实瑞幸 API，不处理真实支付，不保存真实个人信息。
- 商品图片可引用公开官方菜单 CDN；会员、券包、门店、库存、价格写在本地 `src/data` 中并明确标注为 demo data。
- 浏览器定位必须用户点击触发，不持久化精确坐标；拒绝授权可走常购门店兜底。
- 视觉风格应接近参赛作品：清晰、数据化、可截图，避免营销落地页。
