export type Segment = "new" | "active" | "sleeping" | "loyal";

export type MemberTier = "newbie" | "silver" | "gold" | "diamond";

export type ProductCategory = "latte" | "americano" | "fruit-coffee" | "tea-coffee" | "limited";

export type CoffeeProduct = {
  id: string;
  name: string;
  category: ProductCategory;
  basePrice: number;
  caffeineLevel: "low" | "medium" | "high";
  sweetnessOptions: string[];
  temperatureOptions: string[];
  flavorNotes: string[];
  nutritionTags: string[];
  sceneTags: string[];
  launchType: "evergreen" | "seasonal" | "campaign";
  sourceNote: string;
};

export type Coupon = {
  id: string;
  name: string;
  value: number;
  threshold: number;
  expiresInDays: number;
};

export type Order = {
  productId?: string;
  product: string;
  sugar: string;
  temperature: string;
  daysAgo: number;
  storeName?: string;
  finalPrice?: number;
};

export type Member = {
  id: string;
  name: string;
  segment: Segment;
  tier: MemberTier;
  city: string;
  persona: string;
  favoriteFlavors: string[];
  avoid: string[];
  priceSensitivity: "low" | "medium" | "high";
  lastOrderDays: number;
  avgWeeklyOrders: number;
  points: number;
  memberBenefits: string[];
  couponWallet: Coupon[];
  trustFlags: string[];
  consentScopes: string[];
  recentOrders: Order[];
  lifecycleGoal: string;
};

export type Scenario = {
  id: string;
  text: string;
  mission: string;
  timeSlot: "morning" | "afternoon" | "evening";
  weather: string;
  distanceToStoreMeters: number;
  channel: "system-agent" | "app" | "mini-program" | "social-search";
  triggerSignals: string[];
  businessGoal: string;
};

export type ProductRecommendation = {
  productId?: string;
  name: string;
  reason: string;
  sugar: string;
  temperature: string;
  price: number;
  tags: string[];
  flavorNotes?: string[];
  nutritionTags?: string[];
};

export type CouponPlan = {
  couponName: string;
  discount: number;
  finalPrice: number;
  explanation: string;
};

export type AgentDecision = {
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

export type StoreStatus = {
  id: string;
  name: string;
  city: string;
  distanceMeters: number;
  pickupEtaMinutes: number;
  queueLevel: "low" | "medium" | "high";
  inventoryHighlights: string[];
  riskFlags: string[];
};

export type AgentModule = {
  id: string;
  name: string;
  role: string;
  inputs: string[];
  outputs: string[];
  guardrail: string;
  fallback: string;
};

export type ExperienceMetric = {
  label: string;
  value: string;
  delta: string;
  note: string;
};

export type DataConnector = {
  id: string;
  name: string;
  status: "mocked" | "ready-to-wire" | "blocked";
  dataScope: string;
  permissionBoundary: string;
  uiDisclosure: string;
};
