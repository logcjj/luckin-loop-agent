# Luckin Loop Agent Demo 设计

## Demo 定位

名称：Luckin Loop Agent

中文名：瑞幸意图增长智能体

一句话：把用户在 AI 入口里的一句话目标，规划成“今天这杯咖啡”的可解释推荐、优惠、门店、下单与复购运营闭环。

评委 2 分钟路径：

1. 选择一个会员样本和会话模板。
2. 在中间对话区输入真实场景需求，例如“下午开会前想喝点提神但别太甜”。
3. Agent 像“小满”的出行规划一样，输出“咖啡规划”：主意图、推荐饮品、到手价和稳妥度。
4. 右侧方案画布展开画像、优惠解释、门店/下单模拟、兜底和复购策略。
5. 点击“确认这杯”“模拟支付完成”，看到执行状态进入复购运营页。

## 页面结构

- 顶部：产品名、无真实支付、本地规则 Agent 标识。
- 左侧：新的咖啡计划、会话模板、会员画像入口。
- 中间：对话区、快捷 prompt、输入框、本轮规划结果。
- 右侧：方案画布，使用“方案 / 画像 / 执行 / 复购”四个页签承载完整链路。

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
- 点击“确认这杯”后进入模拟执行链路。
- 点击“模拟支付完成”后进入复购页，并更新接受率。
- 点击“排队过长，启用兜底”后展示兜底状态。
- 页面无外部 API 依赖，离线可运行。

## 实现约束

- 使用 Vite + React + TypeScript，便于快速运行和部署到 GitHub Pages。
- 不接入真实瑞幸 API，不处理真实支付，不保存真实个人信息。
- 所有数据写在本地 `src/data` 中，明确标注为 synthetic demo data。
- 视觉风格应接近参赛作品：清晰、数据化、可截图，避免营销落地页。
