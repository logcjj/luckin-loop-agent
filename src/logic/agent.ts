import type { AgentDecision, Coupon, Member, ProductRecommendation, Scenario } from "../types";

const intentRules = [
  { intent: "提神醒脑", keywords: ["提神", "开会", "困", "下午"], product: "生椰拿铁" },
  { intent: "低糖轻负担", keywords: ["低糖", "轻", "负担", "健康"], product: "轻乳茶咖" },
  { intent: "快捷复购", keywords: ["老样子", "赶时间", "快取", "最近"], product: "标准美式" },
  { intent: "优惠尝新", keywords: ["划算", "新品", "券", "好久"], product: "橙 C 美式" }
];

export function generateDecision(member: Member, scenario: Scenario, request: string): AgentDecision {
  const text = `${scenario.text} ${request}`;
  const matches = intentRules
    .map((rule) => ({
      ...rule,
      score: rule.keywords.filter((keyword) => text.includes(keyword)).length
    }))
    .filter((rule) => rule.score > 0)
    .sort((a, b) => b.score - a.score);

  const primary = matches[0] ?? intentRules[0];
  const secondary = matches.slice(1, 3).map((rule) => rule.intent);
  const recommendation = buildRecommendation(primary.product, member, scenario);
  const coupon = chooseCoupon(member.couponWallet, recommendation.price);
  const finalPrice = Math.max(recommendation.price - coupon.value, 0);
  const isSleeping = member.segment === "sleeping" || member.lastOrderDays >= 14;
  const confidence = Math.min(92, 62 + primary.score * 10 + member.favoriteFlavors.length * 2);

  return {
    primaryIntent: primary.intent,
    secondaryIntents: secondary.length > 0 ? secondary : ["会员关系维护"],
    confidence,
    memberMemory: [
      `${member.name} 最近 ${member.lastOrderDays} 天未下单，周均 ${member.avgWeeklyOrders} 单`,
      `偏好：${member.favoriteFlavors.join(" / ")}`,
      `避忌：${member.avoid.join(" / ")}`,
      `信任提示：${member.trustFlags.join("；")}`
    ],
    recommendation,
    couponPlan: {
      couponName: coupon.name,
      discount: coupon.value,
      finalPrice,
      explanation: `${coupon.name} 在当前客单价下优惠最大，且 ${coupon.expiresInDays} 天后过期，优先使用可降低放弃率。`
    },
    orderPath: [
      `${channelName(scenario.channel)} 捕捉自然语言需求`,
      `推荐 ${recommendation.name}，默认 ${recommendation.temperature} / ${recommendation.sugar}`,
      `选择 ${scenario.distanceToStoreMeters}m 内门店，预估 5-8 分钟取餐`,
      `展示优惠解释后进入模拟支付页`
    ],
    wakeupMessage: isSleeping
      ? `${member.name}，你的 ${coupon.name} 快过期了。今天推荐 ${recommendation.name}，口味按你上次偏好调好，预计到手 ¥${finalPrice}。`
      : `${member.name}，按你最近的口味和当前位置，${recommendation.name} 是当前最省心选择，已自动匹配 ${coupon.name}。`,
    repurchasePlan: isSleeping
      ? "若本次接受推荐，3 天后推送同口味复购；若放弃，改用低打扰新品内容触达。"
      : "成交后 48 小时记录饮用反馈，下一次按相同场景优先展示快捷复购入口。",
    trustExplanation: [
      "仅使用会员历史订单、券包和当前场景信号，不读取通讯录或跨 App 隐私数据。",
      `推荐理由：${recommendation.reason}`,
      `优惠理由：${coupon.name} 比其他券更接近当前订单金额，减少用户手动比价。`
    ],
    estimatedImpact: {
      clickRateLift: isSleeping ? 18 : 15,
      wakeupLift: isSleeping ? 11 : 6,
      repurchaseCycleReduction: member.segment === "loyal" ? 7 : 10
    }
  };
}

function buildRecommendation(product: string, member: Member, scenario: Scenario): ProductRecommendation {
  const coldWeather = scenario.weather.includes("19") || scenario.weather.includes("阴");
  const sugar = member.avoid.includes("太甜") || member.avoid.includes("高糖") ? "少糖" : "半糖";
  const temperature = product === "标准美式" || coldWeather ? "热" : "冰";
  const priceByProduct: Record<string, number> = {
    "生椰拿铁": 21,
    "轻乳茶咖": 22,
    "标准美式": 16,
    "橙 C 美式": 19
  };

  return {
    name: product,
    reason: `${member.favoriteFlavors[0]} 偏好与 ${scenario.timeSlot === "morning" ? "早高峰快取" : "当前场景"} 匹配，并避开 ${member.avoid[0]}。`,
    sugar,
    temperature,
    price: priceByProduct[product] ?? 20,
    tags: [scenario.timeSlot, member.segment, ...member.favoriteFlavors.slice(0, 2)]
  };
}

function chooseCoupon(coupons: Coupon[], price: number): Coupon {
  const usable = coupons.filter((coupon) => price >= coupon.threshold);
  const sorted = (usable.length > 0 ? usable : coupons).sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value;
    return a.expiresInDays - b.expiresInDays;
  });
  return sorted[0] ?? { id: "none", name: "无可用优惠", value: 0, threshold: 0, expiresInDays: 99 };
}

function channelName(channel: Scenario["channel"]) {
  const names: Record<Scenario["channel"], string> = {
    "system-agent": "系统级 Agent",
    app: "瑞幸 App",
    "mini-program": "小程序",
    "social-search": "社交搜索"
  };
  return names[channel];
}
