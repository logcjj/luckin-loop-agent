import { agentModules, menuCatalog, storeStatuses } from "../data/demoData";
import type {
  AgentDecision,
  AgentTraceStep,
  CoffeeProduct,
  Coupon,
  FallbackPlan,
  Member,
  ProductRecommendation,
  RecommendationScore,
  Scenario,
  StoreStatus
} from "../types";

const intentRules = [
  {
    intent: "提神醒脑",
    keywords: ["提神", "开会", "困", "下午", "咖啡因"],
    productSignals: ["下午提神", "会议前", "高咖啡因", "中等咖啡因", "拿铁", "美式"]
  },
  {
    intent: "低糖轻负担",
    keywords: ["低糖", "轻", "负担", "健康", "热量", "无糖"],
    productSignals: ["低糖可选", "无糖", "低热量", "下午轻负担", "植物基", "茶咖"]
  },
  {
    intent: "快捷复购",
    keywords: ["老样子", "赶时间", "快取", "最近", "排队"],
    productSignals: ["快取", "忠诚复购", "早高峰", "高确定性"]
  },
  {
    intent: "优惠尝新",
    keywords: ["划算", "新品", "券", "好久", "尝新", "不踩雷"],
    productSignals: ["新品尝鲜", "沉睡唤醒", "社交种草", "campaign", "seasonal"]
  }
];

export function generateDecision(member: Member, scenario: Scenario, request: string): AgentDecision {
  const text = normalizeText(`${scenario.text} ${request} ${scenario.triggerSignals.join(" ")}`);
  const intentMatches = scoreIntents(text);
  const primary = intentMatches[0] ?? { intent: "提神醒脑", score: 0, productSignals: intentRules[0].productSignals };
  const secondary = intentMatches
    .slice(1, 3)
    .map((rule) => rule.intent)
    .filter((intent) => intent !== primary.intent);
  const scoredProducts = menuCatalog
    .map((product) => scoreProduct(product, member, scenario, text, primary.productSignals))
    .sort((a, b) => b.score - a.score);
  const winner = scoredProducts[0] ?? scoreProduct(menuCatalog[0], member, scenario, text, primary.productSignals);
  const product = menuCatalog.find((item) => item.id === winner.productId) ?? menuCatalog[0];
  const selectedStore = chooseStore(member, scenario, product);
  const recommendation = buildRecommendation(product, member, scenario, selectedStore, winner);
  const coupon = chooseCoupon(member.couponWallet, recommendation.price, member.priceSensitivity);
  const finalPrice = Math.max(recommendation.price - coupon.value, 0);
  const isSleeping = member.segment === "sleeping" || member.lastOrderDays >= 14;
  const confidence = calculateConfidence(primary.score, winner, scoredProducts[1], selectedStore, member);
  const fallbackPlan = buildFallbackPlan(member, scenario, recommendation, selectedStore, coupon);
  const guardrails = buildGuardrails(member, coupon, selectedStore);
  const agentTrace = buildTrace(member, scenario, recommendation, selectedStore, coupon, confidence, fallbackPlan);

  return {
    primaryIntent: primary.intent,
    secondaryIntents: secondary.length > 0 ? secondary : [scenario.businessGoal],
    confidence,
    memberMemory: [
      `${member.name} 是${tierLabel(member.tier)}，${member.persona}`,
      `生命周期目标：${member.lifecycleGoal}`,
      `授权信号：${member.consentScopes.join(" / ")}`,
      `最近 ${member.lastOrderDays} 天未下单，周均 ${member.avgWeeklyOrders} 单，积分 ${member.points}`,
      `偏好：${member.favoriteFlavors.join(" / ")}；避忌：${member.avoid.join(" / ")}`,
      `信任提示：${member.trustFlags.join("；")}`
    ],
    recommendation,
    couponPlan: {
      couponName: coupon.name,
      discount: coupon.value,
      finalPrice,
      explanation: explainCoupon(coupon, recommendation.price, member.priceSensitivity)
    },
    selectedStore,
    candidateScores: scoredProducts.slice(0, 4),
    agentTrace,
    guardrails,
    fallbackPlan,
    orderPath: [
      `${channelName(scenario.channel)} 捕捉自然语言需求，并命中 ${scenario.triggerSignals.join(" / ")}`,
      `意图引导判断为 ${primary.intent}，候选最高分 ${winner.score}`,
      `菜单工具推荐 ${recommendation.name}，默认 ${recommendation.temperature} / ${recommendation.sugar}`,
      `门店工具选择 ${selectedStore.name}，${selectedStore.distanceMeters}m，预估 ${selectedStore.pickupEtaMinutes} 分钟取餐`,
      `券包工具使用 ${coupon.name}，模拟到手 ¥${finalPrice}`,
      `展示授权、价格、库存和支付边界后，才进入模拟留位`
    ],
    wakeupMessage: isSleeping
      ? `${member.name}，你的 ${coupon.name} 将在 ${coupon.expiresInDays} 天内过期。今天用它试 ${recommendation.name}，口味按你偏好调好，模拟到手 ¥${finalPrice}；不想被打扰可直接跳过。`
      : `${member.name}，按你的授权偏好、当前状态和附近门店，${recommendation.name} 是这轮最稳选择，已自动匹配 ${coupon.name}。`,
    repurchasePlan: isSleeping
      ? "若本次接受推荐，3 天后用同品类低打扰复购；若放弃，降频并改为只提醒明确到期券。"
      : member.segment === "loyal"
        ? "成交后只记录履约和甜温反馈，下次相似状态默认生成免打扰草稿，不主动推新品。"
        : "成交后 48 小时记录饮用反馈，下一次按相似需求优先展示快捷复购入口。",
    trustExplanation: [
      `仅使用已授权字段：${member.consentScopes.join("、")}；不读取通讯录、支付密码或跨 App 行为。`,
      `推荐理由：${recommendation.reason}`,
      `门店理由：${selectedStore.name} 当前排队${queueLabel(selectedStore.queueLevel)}，${selectedStore.inventoryHighlights.join("，")}。`,
      `优惠理由：${coupon.name} 在当前模拟客单价下综合折扣、门槛和过期时间最优。`
    ],
    estimatedImpact: {
      clickRateLift: Math.round(10 + confidence / 8 + (isSleeping ? 4 : 0)),
      wakeupLift: isSleeping ? 12 : member.segment === "new" ? 7 : 5,
      repurchaseCycleReduction: member.segment === "loyal" ? 7 : selectedStore.pickupEtaMinutes <= 6 ? 12 : 9
    }
  };
}

function scoreIntents(text: string) {
  return intentRules
    .map((rule) => ({
      ...rule,
      score: rule.keywords.filter((keyword) => text.includes(keyword)).length
    }))
    .filter((rule) => rule.score > 0)
    .sort((a, b) => b.score - a.score);
}

function scoreProduct(
  product: CoffeeProduct,
  member: Member,
  scenario: Scenario,
  text: string,
  intentSignals: string[]
): RecommendationScore {
  const reasons: string[] = [];
  const tradeoffs: string[] = [];
  let score = 36;

  const searchable = normalizeText([
    product.name,
    product.category,
    product.caffeineLevel,
    product.launchType,
    ...product.flavorNotes,
    ...product.nutritionTags,
    ...product.sceneTags
  ].join(" "));

  for (const signal of intentSignals) {
    if (searchable.includes(normalizeText(signal))) {
      score += 8;
      reasons.push(`匹配${signal}`);
    }
  }

  for (const favorite of member.favoriteFlavors) {
    if (searchable.includes(normalizeText(favorite))) {
      score += 7;
      reasons.push(`贴合偏好「${favorite}」`);
    }
  }

  for (const signal of scenario.triggerSignals) {
    if (searchable.includes(normalizeText(signal))) {
      score += 5;
      reasons.push(`响应需求「${signal}」`);
    }
  }

  if (text.includes("老样子") && wasRecentlyOrdered(product, member)) {
    score += 16;
    reasons.push("复用最近订单，选择成本最低");
  }

  if (scenario.timeSlot === "morning" && product.category === "americano") {
    score += 9;
    reasons.push("早高峰美式出杯快");
  }

  if (scenario.timeSlot === "afternoon" && product.caffeineLevel !== "low") {
    score += 6;
    reasons.push("下午补能强度足够");
  }

  if (member.segment === "sleeping" && product.launchType !== "evergreen") {
    score += 8;
    reasons.push("适合沉睡用户尝新唤醒");
  }

  if (member.priceSensitivity === "high" && product.basePrice <= 19) {
    score += 7;
    reasons.push("价格敏感用户更容易接受");
  }

  if (member.avoid.includes("高糖") && product.nutritionTags.some((tag) => tag.includes("低糖") || tag.includes("无糖"))) {
    score += 10;
    reasons.push("规避高糖顾虑");
  }

  if (member.avoid.includes("太甜") && product.sweetnessOptions.includes("少糖")) {
    score += 8;
    reasons.push("可直接默认少糖");
  }

  if (member.avoid.includes("原价购买") && product.basePrice > 22) {
    score -= 7;
    tradeoffs.push("客单价偏高，需要强优惠解释");
  }

  if (member.avoid.includes("推荐过多") && !wasRecentlyOrdered(product, member)) {
    score -= 10;
    tradeoffs.push("高频用户不适合强推新品");
  }

  if ((text.includes("热") || scenario.weather.includes("19") || scenario.weather.includes("阴")) && product.temperatureOptions.includes("热")) {
    score += 5;
    reasons.push("天气/语义支持热饮");
  }

  if (reasons.length === 0) {
    reasons.push("作为默认咖啡候选保留");
  }

  return {
    productId: product.id,
    name: product.name,
    score: clamp(score, 12, 98),
    reasons: unique(reasons).slice(0, 4),
    tradeoffs: unique(tradeoffs).slice(0, 3)
  };
}

function buildRecommendation(
  product: CoffeeProduct,
  member: Member,
  scenario: Scenario,
  store: StoreStatus,
  score: RecommendationScore
): ProductRecommendation {
  const sugar = chooseSugar(product, member);
  const temperature = chooseTemperature(product, member, scenario);

  return {
    productId: product.id,
    name: product.name,
    reason: `${score.reasons.slice(0, 2).join("，")}；同时 ${store.name} ${store.distanceMeters}m、预计 ${store.pickupEtaMinutes} 分钟取餐，能避开 ${member.avoid[0]}。`,
    sugar,
    temperature,
    price: product.basePrice,
    tags: [scenario.timeSlot, member.segment, product.category, ...product.sceneTags.slice(0, 2)],
    flavorNotes: product.flavorNotes,
    nutritionTags: product.nutritionTags
  };
}

function chooseStore(member: Member, scenario: Scenario, product: CoffeeProduct): StoreStatus {
  const eligible = storeStatuses.filter((store) => store.city === member.city);
  const candidates = eligible.length > 0 ? eligible : storeStatuses;

  return [...candidates].sort((a, b) => {
    const scoreA = scoreStore(a, scenario, product, member);
    const scoreB = scoreStore(b, scenario, product, member);
    return scoreB - scoreA;
  })[0];
}

function scoreStore(store: StoreStatus, scenario: Scenario, product: CoffeeProduct, member: Member) {
  const queueScore = store.queueLevel === "low" ? 18 : store.queueLevel === "medium" ? 8 : -8;
  const distanceScore = Math.max(0, 18 - Math.round(store.distanceMeters / 60));
  const etaScore = Math.max(0, 16 - store.pickupEtaMinutes);
  const inventoryScore = store.inventoryHighlights.some((item) => product.name.includes(item.slice(0, 2)) || item.includes(product.category))
    ? 8
    : 4;
  const waitPenalty = member.avoid.includes("等待") || member.avoid.includes("排队久") ? store.pickupEtaMinutes : 0;
  const scenarioDistancePenalty = Math.abs(store.distanceMeters - scenario.distanceToStoreMeters) / 120;
  return queueScore + distanceScore + etaScore + inventoryScore - waitPenalty - scenarioDistancePenalty;
}

function chooseCoupon(coupons: Coupon[], price: number, sensitivity: Member["priceSensitivity"]): Coupon {
  const usable = coupons.filter((coupon) => price >= coupon.threshold);
  const candidates = usable.length > 0 ? usable : coupons;
  const urgencyWeight = sensitivity === "high" ? 1.4 : 1;

  return [...candidates].sort((a, b) => {
    const scoreA = a.value * 10 + (8 - Math.min(a.expiresInDays, 8)) * urgencyWeight - Math.max(0, a.threshold - price);
    const scoreB = b.value * 10 + (8 - Math.min(b.expiresInDays, 8)) * urgencyWeight - Math.max(0, b.threshold - price);
    return scoreB - scoreA;
  })[0] ?? { id: "none", name: "无可用优惠", value: 0, threshold: 0, expiresInDays: 99 };
}

function explainCoupon(coupon: Coupon, price: number, sensitivity: Member["priceSensitivity"]) {
  if (coupon.id === "none") return "当前没有可用优惠，小鹿会优先解释口味稳定性和取餐确定性。";
  const gap = Math.max(0, price - coupon.threshold);
  const sensitivityCopy = sensitivity === "high" ? "价格敏感用户优先最大折扣" : "在不增加选择成本的前提下优先核销";
  return `${coupon.name} 满 ¥${coupon.threshold} 可用，当前模拟客单价高出门槛 ¥${gap}，${coupon.expiresInDays} 天后过期；${sensitivityCopy}。`;
}

function buildFallbackPlan(
  member: Member,
  scenario: Scenario,
  recommendation: ProductRecommendation,
  store: StoreStatus,
  coupon: Coupon
): FallbackPlan {
  if (store.queueLevel === "high" || store.pickupEtaMinutes > 10) {
    return {
      trigger: "排队或取餐 ETA 超过阈值",
      action: "保留口味和券，切换到距离稍远但排队更低的门店，或提示用户稍后再取。",
      userCopy: `${member.name}，${recommendation.name} 先不急着下单；当前门店可能要等 ${store.pickupEtaMinutes} 分钟，我可以保留券和口味，换一家更稳的店。`
    };
  }

  if (member.priceSensitivity === "high" && coupon.value < 5) {
    return {
      trigger: "优惠力度低于价格敏感阈值",
      action: "切换低价 SKU 或直接展示券不可用原因，避免制造被套路感。",
      userCopy: `${member.name}，这张券优惠不够明显。我先给你保留低价候选，不强推原价购买。`
    };
  }

  if (scenario.triggerSignals.includes("低糖") && !recommendation.nutritionTags?.some((tag) => tag.includes("低糖") || tag.includes("无糖"))) {
    return {
      trigger: "健康约束无法解释清楚",
      action: "切换到低糖标签更明确的商品，并展开营养说明。",
      userCopy: "这杯的低糖信息不够清楚，我会换成标签更透明的选择。"
    };
  }

  return {
    trigger: "用户犹豫、库存变化或需要二次确认",
    action: "停止执行模拟，展示第二候选和人工可理解的换杯理由。",
    userCopy: `${recommendation.name} 已准备好模拟留位；如果你犹豫，我会保留甜温偏好并换一个更稳选择。`
  };
}

function buildGuardrails(member: Member, coupon: Coupon, store: StoreStatus) {
  return [
    "真实下单、支付、扣券必须二次确认；当前仅生成模拟订单计划。",
    `会员数据只使用 demo 授权范围：${member.consentScopes.join(" / ")}。`,
    "价格、库存、排队和 ETA 为 mock 数据，不声明为瑞幸官方实时结果。",
    coupon.id === "none" ? "无券时不得暗示隐藏优惠。" : `使用 ${coupon.name} 时展示门槛和过期时间。`,
    store.riskFlags.length > 0 ? `履约风险需明示：${store.riskFlags.join("；")}。` : "门店无额外风险时仍保留支付前确认。"
  ];
}

function buildTrace(
  member: Member,
  scenario: Scenario,
  recommendation: ProductRecommendation,
  store: StoreStatus,
  coupon: Coupon,
  confidence: number,
  fallbackPlan: FallbackPlan
): AgentTraceStep[] {
  return agentModules.map((module) => {
    if (module.id === "intent-router") {
      return {
        moduleId: module.id,
        moduleName: module.name,
        status: confidence < 76 ? "guarded" : "used",
        summary: `从 ${channelName(scenario.channel)} 提取 ${scenario.triggerSignals.slice(0, 3).join(" / ")}，置信度 ${confidence}%。`
      };
    }

    if (module.id === "member-memory") {
      return {
        moduleId: module.id,
        moduleName: module.name,
        status: "used",
        summary: `读取 ${member.consentScopes.length} 类授权信号，目标是${member.lifecycleGoal}`
      };
    }

    if (module.id === "menu-store-tools") {
      return {
        moduleId: module.id,
        moduleName: module.name,
        status: store.queueLevel === "high" ? "guarded" : "used",
        summary: `选中 ${recommendation.name} + ${store.name}，ETA ${store.pickupEtaMinutes} 分钟。`
      };
    }

    if (module.id === "coupon-optimizer") {
      return {
        moduleId: module.id,
        moduleName: module.name,
        status: coupon.id === "none" ? "fallback" : "used",
        summary: `券策略为 ${coupon.name}，避免用户手动比价。`
      };
    }

    return {
      moduleId: module.id,
      moduleName: module.name,
      status: fallbackPlan.trigger.includes("用户犹豫") ? "used" : "guarded",
      summary: `${fallbackPlan.trigger} 时执行：${fallbackPlan.action}`
    };
  });
}

function chooseSugar(product: CoffeeProduct, member: Member) {
  if ((member.avoid.includes("高糖") || member.avoid.includes("太甜")) && product.sweetnessOptions.includes("少糖")) return "少糖";
  if (member.favoriteFlavors.includes("低糖") && product.sweetnessOptions.includes("无糖")) return "无糖";
  return product.sweetnessOptions.includes("半糖") ? "半糖" : product.sweetnessOptions[0];
}

function chooseTemperature(product: CoffeeProduct, member: Member, scenario: Scenario) {
  if ((member.favoriteFlavors.includes("热饮") || scenario.weather.includes("19") || scenario.weather.includes("阴")) && product.temperatureOptions.includes("热")) return "热";
  return product.temperatureOptions.includes("冰") ? "冰" : product.temperatureOptions[0];
}

function calculateConfidence(
  intentScore: number,
  winner: RecommendationScore,
  runnerUp: RecommendationScore | undefined,
  store: StoreStatus,
  member: Member
) {
  const gap = runnerUp ? winner.score - runnerUp.score : 12;
  const queueBonus = store.queueLevel === "low" ? 5 : store.queueLevel === "medium" ? 1 : -6;
  const memoryBonus = Math.min(8, member.recentOrders.length * 3 + member.consentScopes.length);
  return clamp(62 + intentScore * 5 + gap + queueBonus + memoryBonus, 68, 96);
}

function wasRecentlyOrdered(product: CoffeeProduct, member: Member) {
  return member.recentOrders.some((order) => order.productId === product.id || order.product === product.name);
}

function queueLabel(queue: StoreStatus["queueLevel"]) {
  const labels: Record<StoreStatus["queueLevel"], string> = {
    low: "较低",
    medium: "中等",
    high: "偏高"
  };
  return labels[queue];
}

function channelName(channel: Scenario["channel"]) {
  const names: Record<Scenario["channel"], string> = {
    "system-agent": "系统助手",
    app: "瑞幸 App",
    "mini-program": "小程序",
    "social-search": "社交搜索"
  };
  return names[channel];
}

function tierLabel(tier: Member["tier"]) {
  const labels: Record<Member["tier"], string> = {
    newbie: "新会员",
    silver: "银卡会员",
    gold: "金卡会员",
    diamond: "钻石会员"
  };
  return labels[tier];
}

function normalizeText(text: string) {
  return text.toLocaleLowerCase("zh-CN");
}

function unique(items: string[]) {
  return [...new Set(items)];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}
