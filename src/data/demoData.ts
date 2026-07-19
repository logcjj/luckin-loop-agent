import type { Member, Scenario } from "../types";

export const members: Member[] = [
  {
    id: "m-chen",
    name: "陈晨",
    segment: "active",
    city: "上海",
    favoriteFlavors: ["生椰", "拿铁", "少糖"],
    avoid: ["太甜", "排队久"],
    priceSensitivity: "medium",
    lastOrderDays: 2,
    avgWeeklyOrders: 3,
    couponWallet: [
      { id: "c-12", name: "满 19 减 5", value: 5, threshold: 19, expiresInDays: 3 },
      { id: "c-speed", name: "下午茶加速券", value: 3, threshold: 15, expiresInDays: 1 }
    ],
    trustFlags: ["需要解释优惠券为什么这样用", "对距离和等待时间敏感"],
    recentOrders: [
      { product: "生椰拿铁", sugar: "半糖", temperature: "冰", daysAgo: 2 },
      { product: "丝绒拿铁", sugar: "少糖", temperature: "热", daysAgo: 5 }
    ]
  },
  {
    id: "m-zhou",
    name: "小周",
    segment: "sleeping",
    city: "杭州",
    favoriteFlavors: ["果咖", "冰饮", "尝新"],
    avoid: ["原价购买", "复杂规则"],
    priceSensitivity: "high",
    lastOrderDays: 21,
    avgWeeklyOrders: 0,
    couponWallet: [
      { id: "c-back", name: "回归专享 9.9", value: 10, threshold: 18, expiresInDays: 2 },
      { id: "c-new", name: "新品尝鲜券", value: 4, threshold: 16, expiresInDays: 6 }
    ],
    trustFlags: ["价格敏感", "容易因为券规则不清放弃"],
    recentOrders: [
      { product: "橙 C 美式", sugar: "标准", temperature: "冰", daysAgo: 21 },
      { product: "生椰拿铁", sugar: "半糖", temperature: "冰", daysAgo: 35 }
    ]
  },
  {
    id: "m-ada",
    name: "Ada",
    segment: "new",
    city: "深圳",
    favoriteFlavors: ["低糖", "轻负担", "茶咖"],
    avoid: ["高糖", "高热量"],
    priceSensitivity: "low",
    lastOrderDays: 6,
    avgWeeklyOrders: 1,
    couponWallet: [
      { id: "c-first", name: "新会员第二杯 6 折", value: 7, threshold: 20, expiresInDays: 5 }
    ],
    trustFlags: ["需要成分解释", "偏好健康信息透明"],
    recentOrders: [
      { product: "轻乳茶咖", sugar: "少糖", temperature: "冰", daysAgo: 6 }
    ]
  },
  {
    id: "m-li",
    name: "老李",
    segment: "loyal",
    city: "北京",
    favoriteFlavors: ["美式", "热饮", "固定口味"],
    avoid: ["推荐过多", "等待"],
    priceSensitivity: "low",
    lastOrderDays: 1,
    avgWeeklyOrders: 5,
    couponWallet: [
      { id: "c-loyal", name: "金卡早餐券", value: 4, threshold: 14, expiresInDays: 4 }
    ],
    trustFlags: ["偏好老样子快捷路径", "重视取餐时间稳定"],
    recentOrders: [
      { product: "标准美式", sugar: "无糖", temperature: "热", daysAgo: 1 },
      { product: "标准美式", sugar: "无糖", temperature: "热", daysAgo: 2 }
    ]
  }
];

export const scenarios: Scenario[] = [
  {
    id: "s-meeting",
    text: "下午开会前想喝点提神，但别太甜，最好别排队。",
    timeSlot: "afternoon",
    weather: "阴天 28C",
    distanceToStoreMeters: 180,
    channel: "system-agent"
  },
  {
    id: "s-coupon",
    text: "好久没喝了，有没有今天划算又不踩雷的新品？",
    timeSlot: "afternoon",
    weather: "小雨 25C",
    distanceToStoreMeters: 420,
    channel: "social-search"
  },
  {
    id: "s-healthy",
    text: "想来一杯轻一点的，低糖，下午不会太负担。",
    timeSlot: "afternoon",
    weather: "晴 31C",
    distanceToStoreMeters: 260,
    channel: "app"
  },
  {
    id: "s-repeat",
    text: "老样子，赶时间，帮我选最近能快取的店。",
    timeSlot: "morning",
    weather: "晴 19C",
    distanceToStoreMeters: 120,
    channel: "mini-program"
  }
];
