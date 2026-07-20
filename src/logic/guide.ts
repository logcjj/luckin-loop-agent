import type { AgentDecision, Member } from "../types";

export type GuideCopy = {
  opening: string;
  followUps: string[];
  summary: string;
  cta: string;
  source: "local" | "qwen";
};

export function buildLocalGuideCopy(member: Member, decision: AgentDecision, hasRequest: boolean): GuideCopy {
  if (!hasRequest) {
    return {
      opening: "先别急着选菜单。告诉我你现在的状态、口味、预算或取餐时间，我再帮你收窄到一杯。",
      followUps: [
        "你现在更想提神、解馋，还是轻负担？",
        "甜度希望少糖、无糖，还是正常就好？",
        "这次更在意快取、价格，还是想试试新品？"
      ],
      summary: "还没开始推荐，我会先通过对话把需求问清楚。",
      cta: "说一句你的需求",
      source: "local"
    };
  }

  return {
    opening: `我先按${member.city}附近、${decision.primaryIntent}和你的口味边界整理方案。`,
    followUps: [
      `如果要更稳，我会优先确认${decision.recommendation.sugar}和${decision.recommendation.temperature}是否合适。`,
      `如果赶时间，我会优先看${decision.selectedStore.name}的取餐时间。`,
      "如果价格更重要，我会先解释券包和到手价。"
    ],
    summary: `现在比较稳的是${decision.recommendation.name}，但执行前还会让你确认门店、优惠和付款。`,
    cta: "查看这杯方案",
    source: "local"
  };
}

export async function requestGuideCopy(payload: {
  request: string;
  member: Pick<Member, "city" | "favoriteFlavors" | "avoid" | "priceSensitivity">;
  decision: Pick<AgentDecision, "primaryIntent" | "confidence">;
}): Promise<GuideCopy | null> {
  try {
    const response = await fetch("/api/guide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        requestSignal: buildRequestSignal(payload.request)
      })
    });

    if (!response.ok) return null;
    const data = (await response.json()) as Partial<GuideCopy>;
    if (!data.opening || !Array.isArray(data.followUps) || !data.summary || !data.cta) return null;
    return {
      opening: data.opening,
      followUps: data.followUps.slice(0, 3),
      summary: data.summary,
      cta: data.cta,
      source: data.source === "qwen" ? "qwen" : "local"
    };
  } catch {
    return null;
  }
}

function buildRequestSignal(request: string) {
  const labels = [
    ["提神", /困|累|提神|醒|会议|开会|加班|早八|早高峰/],
    ["轻负担", /轻|低糖|无糖|健康|不腻|少糖|热量|负担/],
    ["快取", /赶|快|来不及|马上|路上|顺路|少折腾/],
    ["优惠", /便宜|划算|券|优惠|预算|价格/],
    ["尝新", /新品|试试|不一样|新鲜|果咖/]
  ]
    .filter(([, pattern]) => (pattern as RegExp).test(request))
    .map(([label]) => label);

  return {
    labels: labels.length > 0 ? labels : ["待追问"],
    lengthBand: request.length > 36 ? "long" : request.length > 12 ? "medium" : "short"
  };
}
