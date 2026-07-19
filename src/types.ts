export type Segment = "new" | "active" | "sleeping" | "loyal";

export type Coupon = {
  id: string;
  name: string;
  value: number;
  threshold: number;
  expiresInDays: number;
};

export type Order = {
  product: string;
  sugar: string;
  temperature: string;
  daysAgo: number;
};

export type Member = {
  id: string;
  name: string;
  segment: Segment;
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

export type Scenario = {
  id: string;
  text: string;
  timeSlot: "morning" | "afternoon" | "evening";
  weather: string;
  distanceToStoreMeters: number;
  channel: "system-agent" | "app" | "mini-program" | "social-search";
};

export type ProductRecommendation = {
  name: string;
  reason: string;
  sugar: string;
  temperature: string;
  price: number;
  tags: string[];
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
