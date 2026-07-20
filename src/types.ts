export type Segment = "new" | "active" | "sleeping" | "loyal";

export type MemberTier = "newbie" | "silver" | "gold" | "diamond";

export type ProductCategory = "latte" | "americano" | "fruit-coffee" | "tea-coffee" | "limited";

export type CoffeeProduct = {
  id: string;
  name: string;
  officialName?: string;
  category: ProductCategory;
  basePrice: number;
  imageUrl?: string;
  imageSourceUrl?: string;
  imageSourceName?: string;
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
  selectedStore: StoreStatus;
  candidateScores: RecommendationScore[];
  agentTrace: AgentTraceStep[];
  guardrails: string[];
  fallbackPlan: FallbackPlan;
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

export type RecommendationScore = {
  productId: string;
  name: string;
  score: number;
  reasons: string[];
  tradeoffs: string[];
};

export type AgentTraceStep = {
  moduleId: string;
  moduleName: string;
  status: "used" | "guarded" | "fallback";
  summary: string;
};

export type FallbackPlan = {
  trigger: string;
  action: string;
  userCopy: string;
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

export type DataSourceRecord = {
  id: string;
  name: string;
  kind: "official-menu" | "official-site" | "browser-api" | "synthetic-demo" | "blocked-private";
  sourceUrl?: string;
  lastChecked: string;
  evidence: string;
  canUseFor: string[];
  cannotUseFor: string[];
};

export type AdapterBlueprint = {
  id: string;
  name: string;
  status: "implemented-snapshot" | "ready-to-wire" | "mock-only" | "blocked";
  sourceIds: string[];
  reads: string[];
  writes: string[];
  permission: string;
  implementation: string;
  guardrail: string;
  uiDisclosure: string;
};
