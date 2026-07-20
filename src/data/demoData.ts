import type {
  AdapterBlueprint,
  AgentModule,
  CoffeeProduct,
  DataConnector,
  DataSourceRecord,
  ExperienceMetric,
  Member,
  Scenario,
  StoreStatus
} from "../types";

export const menuCatalog: CoffeeProduct[] = [
  {
    id: "p-coconut-latte",
    name: "生椰拿铁",
    officialName: "Coconut Latte",
    category: "latte",
    basePrice: 21,
    imageUrl: "https://ilucky-fe-outside-aws-prod.luckincdn.us/iadmin/mmx6ylqv_00e8cfe5e352_aws_2.jpg",
    imageSourceUrl: "https://www.luckincoffee.us/menu/signature-lattes",
    imageSourceName: "Luckin Coffee US official menu",
    caffeineLevel: "medium",
    sweetnessOptions: ["无糖", "少糖", "半糖", "标准"],
    temperatureOptions: ["冰", "热"],
    flavorNotes: ["椰乳", "顺滑", "奶咖"],
    nutritionTags: ["可选少糖", "乳基底", "中等咖啡因"],
    sceneTags: ["下午提神", "稳定复购", "轻甜口"],
    launchType: "evergreen",
    sourceNote: "商品名和图片参考 Luckin Coffee US 官方菜单；中国区价格、库存和券为 demo mock，非瑞幸实时商品接口。"
  },
  {
    id: "p-velvet-latte",
    name: "丝绒拿铁",
    officialName: "Velvet Latte",
    category: "latte",
    basePrice: 23,
    imageUrl: "https://ilucky-fe-outside-aws-prod.luckincdn.us/iadmin/mmx6zeya_29541f3e71bc_aws_2.jpg",
    imageSourceUrl: "https://www.luckincoffee.us/menu/signature-lattes",
    imageSourceName: "Luckin Coffee US official menu",
    caffeineLevel: "medium",
    sweetnessOptions: ["少糖", "半糖", "标准"],
    temperatureOptions: ["冰", "热"],
    flavorNotes: ["厚乳", "坚果调", "绵密"],
    nutritionTags: ["乳基底", "口感厚", "可做热饮"],
    sceneTags: ["阴天", "会议前", "高确定性"],
    launchType: "evergreen",
    sourceNote: "商品名和图片参考 Luckin Coffee US 官方菜单；本地推荐链路使用 mock 价格和库存。"
  },
  {
    id: "p-americano",
    name: "标准美式",
    officialName: "Yirgacheffe Americano",
    category: "americano",
    basePrice: 16,
    imageUrl: "https://ilucky-fe-outside-aws-prod.luckincdn.us/iadmin/mmx6tau2_e48aa202c66b_aws_2.jpg",
    imageSourceUrl: "https://www.luckincoffee.us/menu/single-origin-espresso",
    imageSourceName: "Luckin Coffee US official menu",
    caffeineLevel: "high",
    sweetnessOptions: ["无糖"],
    temperatureOptions: ["冰", "热"],
    flavorNotes: ["黑咖", "清爽", "低负担"],
    nutritionTags: ["无糖", "低热量", "高咖啡因"],
    sceneTags: ["早高峰", "快取", "忠诚复购"],
    launchType: "evergreen",
    sourceNote: "图片参考 Luckin Coffee US 官方单品美式；中文名、价格和门店履约为 demo mock。"
  },
  {
    id: "p-orange-c-americano",
    name: "橙 C 美式",
    officialName: "Orange Americano",
    category: "fruit-coffee",
    basePrice: 19,
    imageUrl: "https://ilucky-fe-outside-aws-prod.luckincdn.us/iadmin/mmx6w8m4_6a538d565474_aws_2.jpg",
    imageSourceUrl: "https://www.luckincoffee.us/menu/fruity-americano",
    imageSourceName: "Luckin Coffee US official menu",
    caffeineLevel: "medium",
    sweetnessOptions: ["少糖", "标准"],
    temperatureOptions: ["冰"],
    flavorNotes: ["柑橘", "果咖", "清爽"],
    nutritionTags: ["果汁风味", "冰饮", "酸甜感"],
    sceneTags: ["新品尝鲜", "沉睡唤醒", "社交种草"],
    launchType: "campaign",
    sourceNote: "商品图片参考 Luckin Coffee US 官方菜单 Orange Americano；价格、券和库存为 mock。"
  },
  {
    id: "p-light-tea-coffee",
    name: "轻乳茶咖",
    officialName: "Creamy Dreamy Latte",
    category: "tea-coffee",
    basePrice: 22,
    imageUrl: "https://ilucky-fe-outside-aws-prod.luckincdn.us/iadmin/mmx70jxf_ba0ce592a8dd_aws_2.jpg",
    imageSourceUrl: "https://www.luckincoffee.us/menu/signature-lattes",
    imageSourceName: "Luckin Coffee US official menu",
    caffeineLevel: "low",
    sweetnessOptions: ["无糖", "少糖", "半糖"],
    temperatureOptions: ["冰"],
    flavorNotes: ["茶香", "轻乳", "低甜"],
    nutritionTags: ["低糖可选", "低咖啡因", "下午轻负担"],
    sceneTags: ["健康心智", "新会员", "下午不负担"],
    launchType: "seasonal",
    sourceNote: "图片借用 Luckin Coffee US 官方 Creamy Dreamy Latte 作为近似视觉；商品语义为健康偏好 demo mock。"
  },
  {
    id: "p-oat-flat-white",
    name: "燕麦澳瑞白",
    officialName: "Yirgacheffe Flat White",
    category: "latte",
    basePrice: 24,
    imageUrl: "https://ilucky-fe-outside-aws-prod.luckincdn.us/iadmin/mmx6vi7e_e4fe3f220983_aws_2.jpg",
    imageSourceUrl: "https://www.luckincoffee.us/menu/single-origin-espresso",
    imageSourceName: "Luckin Coffee US official menu",
    caffeineLevel: "medium",
    sweetnessOptions: ["无糖", "少糖"],
    temperatureOptions: ["热", "冰"],
    flavorNotes: ["燕麦", "咖啡香", "轻坚果"],
    nutritionTags: ["植物基", "可无糖", "乳糖敏感友好"],
    sceneTags: ["健康升级", "冬季热饮", "高客单"],
    launchType: "seasonal",
    sourceNote: "图片参考 Luckin Coffee US 官方 Flat White；燕麦口味、价格和库存为 demo mock。"
  }
];

export const storeStatuses: StoreStatus[] = [
  {
    id: "store-sh-001",
    name: "上海静安嘉里中心店",
    city: "上海",
    distanceMeters: 180,
    pickupEtaMinutes: 6,
    queueLevel: "low",
    inventoryHighlights: ["生椰基底充足", "热饮吧台空闲", "午后券可用"],
    riskFlags: ["写字楼电梯拥挤时需预留 3 分钟"]
  },
  {
    id: "store-hz-002",
    name: "杭州湖滨银泰店",
    city: "杭州",
    distanceMeters: 420,
    pickupEtaMinutes: 11,
    queueLevel: "medium",
    inventoryHighlights: ["果咖物料充足", "新品曝光位在线"],
    riskFlags: ["雨天外卖履约可能延迟"]
  },
  {
    id: "store-sz-003",
    name: "深圳科技园万象天地店",
    city: "深圳",
    distanceMeters: 260,
    pickupEtaMinutes: 8,
    queueLevel: "medium",
    inventoryHighlights: ["低糖 SKU 充足", "冰饮出杯稳定"],
    riskFlags: ["午后高峰需提示排队"]
  },
  {
    id: "store-bj-004",
    name: "北京国贸三期店",
    city: "北京",
    distanceMeters: 120,
    pickupEtaMinutes: 5,
    queueLevel: "low",
    inventoryHighlights: ["美式出杯最快", "早餐券可核销"],
    riskFlags: ["早高峰只推荐低改配商品"]
  }
];

export const agentModules: AgentModule[] = [
  {
    id: "intent-router",
    name: "意图引导",
    role: "把一句自然语言拆成提神、轻负担、快取、优惠尝新等可执行意图。",
    inputs: ["用户文本", "入口渠道", "时间段", "天气"],
    outputs: ["primaryIntent", "secondaryIntents", "confidence"],
    guardrail: "低置信度时只给 2 个候选，不自动进入模拟下单。",
    fallback: "追问口味或切换到用户最近订单。"
  },
  {
    id: "member-memory",
    name: "咖啡记忆",
    role: "读取用户授权范围内的偏好、券包、复购周期和信任约束。",
    inputs: ["会员等级", "历史订单", "券包", "授权范围"],
    outputs: ["偏好摘要", "避忌列表", "可解释记忆"],
    guardrail: "仅使用 demo 授权字段，不读取跨 App 隐私。",
    fallback: "缺少历史时使用城市/天气/品类热门组合。"
  },
  {
    id: "menu-store-tools",
    name: "菜单与门店",
    role: "组合商品目录、门店距离、排队、库存和取餐 ETA。",
    inputs: ["商品库", "门店状态", "库存提示", "距离"],
    outputs: ["候选商品", "候选门店", "履约风险"],
    guardrail: "真实库存必须来自官方接口；当前仅做 mock 展示。",
    fallback: "库存或排队异常时切换同口味相近 SKU。"
  },
  {
    id: "coupon-optimizer",
    name: "优惠计算",
    role: "计算券可用性、过期优先级、到手价和用户放弃风险。",
    inputs: ["券包", "商品价格", "价格敏感度", "生命周期"],
    outputs: ["couponPlan", "finalPrice", "优惠解释"],
    guardrail: "不承诺真实到手价，所有价格在 demo 中标记为模拟。",
    fallback: "券不可用时强调稳定口味或推荐低价 SKU。"
  },
  {
    id: "growth-loop",
    name: "复购回写",
    role: "把接受、放弃、支付模拟和反馈写成下一轮触达策略。",
    inputs: ["本轮动作", "会员分群", "接受率", "复购周期"],
    outputs: ["wakeupMessage", "repurchasePlan", "运营指标"],
    guardrail: "触达文案需可退订、低打扰，不制造虚假紧迫感。",
    fallback: "连续放弃后降频，只保留服务型提醒。"
  }
];

export const experienceMetrics: ExperienceMetric[] = [
  {
    label: "推荐接受率",
    value: "78%",
    delta: "+14%",
    note: "模拟基线：只展示菜单和券包。"
  },
  {
    label: "下单决策时长",
    value: "42s",
    delta: "-31s",
    note: "用默认甜度、门店和券解释减少选择成本。"
  },
  {
    label: "沉睡唤醒",
    value: "11%",
    delta: "+6%",
    note: "过期券 + 低踩雷新品组合。"
  },
  {
    label: "履约稳定度",
    value: "91%",
    delta: "+8%",
    note: "排队、库存、距离参与推荐排序。"
  }
];

export const dataConnectors: DataConnector[] = [
  {
    id: "menu",
    name: "菜单与商品信息",
    status: "ready-to-wire",
    dataScope: "商品名、品类、可选糖温、基础价格、营养/风味标签、上下架状态。",
    permissionBoundary: "仅接官方或授权商品接口；无接口时使用人工维护 mock。",
    uiDisclosure: "价格和库存显示为模拟，不作为真实下单依据。"
  },
  {
    id: "store",
    name: "门店与履约信息",
    status: "ready-to-wire",
    dataScope: "距离、营业状态、排队、库存、取餐 ETA。",
    permissionBoundary: "需用户授权定位或选择门店；不保存精确轨迹。",
    uiDisclosure: "门店 ETA 为 demo 估算，真实履约需二次确认。"
  },
  {
    id: "member",
    name: "会员画像与权益",
    status: "blocked",
    dataScope: "等级、积分、券包、历史订单、偏好反馈。",
    permissionBoundary: "必须通过瑞幸官方授权登录；不能抓取或伪造真实会员数据。",
    uiDisclosure: "当前为合成会员样本，仅演示记忆结构。"
  },
  {
    id: "payment",
    name: "下单与支付",
    status: "mocked",
    dataScope: "模拟留位、支付前停止状态、模拟回写。",
    permissionBoundary: "真实支付必须由官方收银链路完成，并要求用户二次确认。",
    uiDisclosure: "本项目不会创建真实订单或扣款。"
  }
];

export const dataSources: DataSourceRecord[] = [
  {
    id: "luckin-us-signature-lattes",
    name: "Luckin Coffee US Signature Lattes",
    kind: "official-menu",
    sourceUrl: "https://www.luckincoffee.us/menu/signature-lattes",
    lastChecked: "2026-07-20",
    evidence: "官方菜单页面内嵌 menuData，包含 Coconut Latte、Velvet Latte 等商品名、描述和 CDN 图片 URL。",
    canUseFor: ["商品英文名", "商品图片", "公开菜单描述", "视觉真实性"],
    cannotUseFor: ["中国区实时价格", "中国区库存", "会员券包", "真实下单"]
  },
  {
    id: "luckin-us-fruity-americano",
    name: "Luckin Coffee US Fruity Americano",
    kind: "official-menu",
    sourceUrl: "https://www.luckincoffee.us/menu/fruity-americano",
    lastChecked: "2026-07-20",
    evidence: "官方菜单页面公开 Orange Americano、Pomelo Americano 等果咖商品与图片。",
    canUseFor: ["果咖图片", "果咖品类命名", "公开菜单描述"],
    cannotUseFor: ["中国区橙 C 美式实时售卖状态", "优惠规则", "门店库存"]
  },
  {
    id: "luckin-us-single-origin-espresso",
    name: "Luckin Coffee US Single Origin Espresso",
    kind: "official-menu",
    sourceUrl: "https://www.luckincoffee.us/menu/single-origin-espresso",
    lastChecked: "2026-07-20",
    evidence: "官方菜单页面公开 Yirgacheffe Americano、Latte、Flat White 等单品与图片。",
    canUseFor: ["美式/澳瑞白类商品视觉", "公开菜单描述"],
    cannotUseFor: ["中国区 SKU 精确映射", "实时价格", "实时库存"]
  },
  {
    id: "luckin-us-app-site",
    name: "Luckin Coffee US App / Stores",
    kind: "official-site",
    sourceUrl: "https://www.luckincoffee.us",
    lastChecked: "2026-07-20",
    evidence: "官网导航公开 Get the App、Menu、Stores；页脚说明 App 支持提前点单、优惠和会员权益。",
    canUseFor: ["App 点单体验参照", "会员权益存在性参照", "门店入口参照"],
    cannotUseFor: ["中国区会员登录", "真实支付授权", "实时排队 ETA"]
  },
  {
    id: "browser-geolocation",
    name: "Browser Geolocation API",
    kind: "browser-api",
    sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API",
    lastChecked: "2026-07-20",
    evidence: "浏览器定位只能在用户授权后读取；本 demo 只用授权结果触发附近门店/拒绝定位分支，不持久化精确坐标。",
    canUseFor: ["授权体验", "附近门店排序触发", "拒绝授权 fallback"],
    cannotUseFor: ["后台持续定位", "跨 App 轨迹", "真实瑞幸门店匹配"]
  },
  {
    id: "synthetic-member-store",
    name: "Synthetic member/store/order fixtures",
    kind: "synthetic-demo",
    lastChecked: "2026-07-20",
    evidence: "本仓库 `src/data/demoData.ts` 内维护合成会员、券包、门店、库存和排队状态。",
    canUseFor: ["引导结构演示", "隐私安全 demo", "离线评审"],
    cannotUseFor: ["真实会员画像", "真实优惠券", "真实门店库存"]
  },
  {
    id: "luckin-private-member-payment",
    name: "Luckin private member/payment APIs",
    kind: "blocked-private",
    lastChecked: "2026-07-20",
    evidence: "会员、券包、支付、扣券必须走官方授权登录和收银链路；本项目没有授权。",
    canUseFor: ["接入方案说明", "权限边界说明"],
    cannotUseFor: ["抓取会员数据", "代付", "扣券", "创建真实订单"]
  }
];

export const adapterBlueprints: AdapterBlueprint[] = [
  {
    id: "official-menu-image-adapter",
    name: "官方菜单图片 Snapshot Adapter",
    status: "implemented-snapshot",
    sourceIds: ["luckin-us-signature-lattes", "luckin-us-fruity-americano", "luckin-us-single-origin-espresso"],
    reads: ["商品英文名", "商品描述", "官方 CDN 图片 URL"],
    writes: ["本地 `CoffeeProduct.imageUrl` / `officialName` / `sourceNote`"],
    permission: "只读取公开官网页面；不抓取登录态、不绕过接口。",
    implementation: "把官方 US 菜单公开字段映射到 demo SKU，中文品名、价格、券和库存仍由本地 mock 控制。",
    guardrail: "UI 必须标注图片来源；不得把 US 菜单价格或库存说成中国区实时。",
    uiDisclosure: "图片为 Luckin Coffee US 官方菜单参考；本 demo 不代表中国区实时菜单。"
  },
  {
    id: "geo-permission-adapter",
    name: "定位授权与门店兜底 Adapter",
    status: "ready-to-wire",
    sourceIds: ["browser-geolocation", "synthetic-member-store"],
    reads: ["用户点击授权/拒绝", "浏览器授权结果", "城市级门店 mock", "最近订单门店"],
    writes: ["本轮 locationMode", "门店选择解释", "拒绝定位 fallback 文案"],
    permission: "必须由用户点击触发；精确坐标只在内存中短暂使用，本 demo 不保存。",
    implementation: "授权成功走附近门店说明；拒绝或失败走常购门店/城市级 mock；后续可替换成官方门店搜索 API。",
    guardrail: "不能后台定位，不能保存轨迹，不能声称真实 ETA。",
    uiDisclosure: "定位只用于本轮演示排序；拒绝后仍可用常购门店兜底。"
  },
  {
    id: "member-benefit-adapter",
    name: "会员权益 Adapter",
    status: "blocked",
    sourceIds: ["luckin-private-member-payment", "synthetic-member-store"],
    reads: ["官方 OAuth 后的会员等级", "积分", "券包", "历史订单"],
    writes: ["会员记忆", "券包解释", "复购触达频控"],
    permission: "必须用户登录并授权瑞幸官方账号；当前无授权。",
    implementation: "现阶段仅使用合成会员样本；真实接入时需要最小字段授权和可撤回同意。",
    guardrail: "禁止抓包、爬取、伪造或导入真实个人会员信息。",
    uiDisclosure: "当前会员是合成样本；真实会员能力处于 blocked。"
  },
  {
    id: "order-payment-adapter",
    name: "下单支付 Adapter",
    status: "mock-only",
    sourceIds: ["luckin-private-member-payment"],
    reads: ["模拟订单草稿", "支付前确认状态"],
    writes: ["本地 UI 状态", "支付前停止记录"],
    permission: "真实支付必须由官方 App/小程序收银台和用户二次确认完成。",
    implementation: "GUI-Agent 模拟只跑到支付前确认；不会创建订单、不会扣款、不会扣券。",
    guardrail: "任何自动执行都必须在支付前停止。",
    uiDisclosure: "本 demo 不下单、不扣款、不扣券。"
  },
  {
    id: "store-fulfillment-adapter",
    name: "门店履约 Adapter",
    status: "ready-to-wire",
    sourceIds: ["luckin-us-app-site", "synthetic-member-store"],
    reads: ["门店列表", "营业状态", "库存", "排队", "取餐 ETA"],
    writes: ["候选门店排序", "履约风险", "兜底计划"],
    permission: "真实接入需官方门店/履约接口；没有接口时只展示估算。",
    implementation: "当前使用城市 mock 门店与排队等级；后续 adapter 可替换为官方门店搜索和库存服务。",
    guardrail: "门店 ETA 与库存必须标注为估算或官方来源。",
    uiDisclosure: "当前 ETA/库存/排队是 demo 估算。"
  }
];

export const members: Member[] = [
  {
    id: "m-chen",
    name: "陈晨",
    segment: "active",
    tier: "gold",
    city: "上海",
    persona: "写字楼下午咖啡用户，常在会议前快速补能，讨厌排队和复杂选择。",
    favoriteFlavors: ["生椰", "拿铁", "少糖"],
    avoid: ["太甜", "排队久"],
    priceSensitivity: "medium",
    lastOrderDays: 2,
    avgWeeklyOrders: 3,
    points: 1280,
    memberBenefits: ["金卡生日券", "午后加速券", "常购口味快捷入口"],
    couponWallet: [
      { id: "c-12", name: "满 19 减 5", value: 5, threshold: 19, expiresInDays: 3 },
      { id: "c-speed", name: "下午茶加速券", value: 3, threshold: 15, expiresInDays: 1 }
    ],
    trustFlags: ["需要解释优惠券为什么这样用", "对距离和等待时间敏感"],
    consentScopes: ["历史订单", "券包", "粗略位置", "本轮时间"],
    recentOrders: [
      { productId: "p-coconut-latte", product: "生椰拿铁", sugar: "半糖", temperature: "冰", daysAgo: 2, storeName: "上海静安嘉里中心店", finalPrice: 16 },
      { productId: "p-velvet-latte", product: "丝绒拿铁", sugar: "少糖", temperature: "热", daysAgo: 5, storeName: "上海静安嘉里中心店", finalPrice: 18 }
    ],
    lifecycleGoal: "提升下午咖啡复购稳定度，同时减少排队导致的放弃。"
  },
  {
    id: "m-zhou",
    name: "小周",
    segment: "sleeping",
    tier: "silver",
    city: "杭州",
    persona: "沉睡用户，愿意尝新但非常在意到手价和规则是否简单。",
    favoriteFlavors: ["果咖", "冰饮", "尝新"],
    avoid: ["原价购买", "复杂规则"],
    priceSensitivity: "high",
    lastOrderDays: 21,
    avgWeeklyOrders: 0,
    points: 360,
    memberBenefits: ["回归专享券", "新品尝鲜券", "低打扰唤醒"],
    couponWallet: [
      { id: "c-back", name: "回归专享 9.9", value: 10, threshold: 18, expiresInDays: 2 },
      { id: "c-new", name: "新品尝鲜券", value: 4, threshold: 16, expiresInDays: 6 }
    ],
    trustFlags: ["价格敏感", "容易因为券规则不清放弃"],
    consentScopes: ["历史订单", "券包", "城市", "触达频次"],
    recentOrders: [
      { productId: "p-orange-c-americano", product: "橙 C 美式", sugar: "标准", temperature: "冰", daysAgo: 21, storeName: "杭州湖滨银泰店", finalPrice: 9.9 },
      { productId: "p-coconut-latte", product: "生椰拿铁", sugar: "半糖", temperature: "冰", daysAgo: 35, storeName: "杭州湖滨银泰店", finalPrice: 14 }
    ],
    lifecycleGoal: "用低风险新品和即将过期券唤醒，避免复杂规则造成二次流失。"
  },
  {
    id: "m-ada",
    name: "Ada",
    segment: "new",
    tier: "newbie",
    city: "深圳",
    persona: "新会员，关注低糖和轻负担，希望知道为什么这杯适合自己。",
    favoriteFlavors: ["低糖", "轻负担", "茶咖"],
    avoid: ["高糖", "高热量"],
    priceSensitivity: "low",
    lastOrderDays: 6,
    avgWeeklyOrders: 1,
    points: 120,
    memberBenefits: ["新会员第二杯券", "低糖标签解释", "新人偏好收集"],
    couponWallet: [
      { id: "c-first", name: "新会员第二杯 6 折", value: 7, threshold: 20, expiresInDays: 5 }
    ],
    trustFlags: ["需要成分解释", "偏好健康信息透明"],
    consentScopes: ["历史订单", "券包", "营养标签偏好"],
    recentOrders: [
      { productId: "p-light-tea-coffee", product: "轻乳茶咖", sugar: "少糖", temperature: "冰", daysAgo: 6, storeName: "深圳科技园万象天地店", finalPrice: 15 }
    ],
    lifecycleGoal: "建立首月偏好记忆，让下一次推荐不再像冷启动。"
  },
  {
    id: "m-li",
    name: "老李",
    segment: "loyal",
    tier: "diamond",
    city: "北京",
    persona: "高频忠诚用户，固定喝热美式，目标是少打扰、快确认、稳定取餐。",
    favoriteFlavors: ["美式", "热饮", "固定口味"],
    avoid: ["推荐过多", "等待"],
    priceSensitivity: "low",
    lastOrderDays: 1,
    avgWeeklyOrders: 5,
    points: 4860,
    memberBenefits: ["钻石早餐券", "常购免确认草稿", "高峰快取门店优先"],
    couponWallet: [
      { id: "c-loyal", name: "金卡早餐券", value: 4, threshold: 14, expiresInDays: 4 }
    ],
    trustFlags: ["偏好老样子快捷路径", "重视取餐时间稳定"],
    consentScopes: ["历史订单", "券包", "常购门店", "粗略位置"],
    recentOrders: [
      { productId: "p-americano", product: "标准美式", sugar: "无糖", temperature: "热", daysAgo: 1, storeName: "北京国贸三期店", finalPrice: 12 },
      { productId: "p-americano", product: "标准美式", sugar: "无糖", temperature: "热", daysAgo: 2, storeName: "北京国贸三期店", finalPrice: 12 }
    ],
    lifecycleGoal: "不打扰地提升履约确定性，减少高频用户重复操作。"
  }
];

export const scenarios: Scenario[] = [
  {
    id: "s-meeting",
    text: "下午开会前想喝点提神，但别太甜，最好别排队。",
    mission: "会议前 10 分钟内完成从需求识别到模拟留位。",
    timeSlot: "afternoon",
    weather: "阴天 28C",
    distanceToStoreMeters: 180,
    channel: "system-agent",
    triggerSignals: ["下午", "开会", "提神", "少糖", "近店快取"],
    businessGoal: "提升工作日下午咖啡接受率与履约稳定度。"
  },
  {
    id: "s-coupon",
    text: "好久没喝了，有没有今天划算又不踩雷的新品？",
    mission: "把沉睡会员从券包提醒引导到低风险新品尝试。",
    timeSlot: "afternoon",
    weather: "小雨 25C",
    distanceToStoreMeters: 420,
    channel: "social-search",
    triggerSignals: ["沉睡", "划算", "新品", "雨天", "券快过期"],
    businessGoal: "提高沉睡用户唤醒，不牺牲信任感。"
  },
  {
    id: "s-healthy",
    text: "想来一杯轻一点的，低糖，下午不会太负担。",
    mission: "向新会员解释低糖/低负担选择，收集偏好反馈。",
    timeSlot: "afternoon",
    weather: "晴 31C",
    distanceToStoreMeters: 260,
    channel: "app",
    triggerSignals: ["低糖", "轻负担", "晴热", "新会员", "营养透明"],
    businessGoal: "降低新会员冷启动推荐的不确定性。"
  },
  {
    id: "s-repeat",
    text: "老样子，赶时间，帮我选最近能快取的店。",
    mission: "为高频用户用最少确认步骤完成模拟快取。",
    timeSlot: "morning",
    weather: "晴 19C",
    distanceToStoreMeters: 120,
    channel: "mini-program",
    triggerSignals: ["老样子", "赶时间", "最近", "热饮", "早高峰"],
    businessGoal: "降低忠诚用户重复操作成本。"
  }
];
