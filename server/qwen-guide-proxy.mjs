import http from "node:http";
import fs from "node:fs";
import path from "node:path";

loadLocalEnv();

const port = Number(process.env.LUCKIN_GUIDE_PORT ?? 8787);
const endpoint = process.env.QWEN_OPENAI_BASE_URL ?? "https://coding.dashscope.aliyuncs.com/v1";
const model = process.env.QWEN_MODEL ?? "qwen-plus";
const apiKey = process.env.DASHSCOPE_API_KEY ?? process.env.QWEN_API_KEY;

function loadLocalEnv() {
  for (const filename of [".env.local", ".env"]) {
    const filePath = path.resolve(process.cwd(), filename);
    if (!fs.existsSync(filePath)) continue;
    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && !(key in process.env)) process.env[key] = value;
    }
  }
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "http://127.0.0.1:5173",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type"
  });
  res.end(JSON.stringify(body));
}

function fallbackGuide() {
  return {
    opening: "我先帮你把这杯咖啡的目标问清楚，再给推荐。",
    followUps: ["更想提神还是轻负担？", "甜度希望少糖还是正常？", "更在意快取、价格，还是想尝新？"],
    summary: "需求还在确认中，暂不直接固定推荐。",
    cta: "继续聊需求",
    source: "local"
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== "POST" || req.url !== "/api/guide") {
    sendJson(res, 404, { error: "not_found" });
    return;
  }

  let raw = "";
  req.on("data", (chunk) => {
    raw += chunk;
    if (raw.length > 16_384) req.destroy();
  });

  req.on("end", async () => {
    if (!apiKey) {
      sendJson(res, 200, fallbackGuide());
      return;
    }

    const payload = JSON.parse(raw || "{}");
    const requestSignal = payload.requestSignal ?? {};
    const prompt = [
      "你是瑞幸咖啡用户端的引导助手，风格参考成熟生活服务 App：自然、短句、人性化。",
      "用户原文会由前端单独显示。你的回复不要机械复读原文，不要说自己是 AI，不要一上来固定推荐。",
      "根据用户需求和上下文，输出 JSON：opening, followUps(3个短问题), summary, cta。",
      `用户原文：${String(payload.request ?? "").slice(0, 300)}`,
      `需求信号：${(requestSignal.labels ?? []).join("、") || "待追问"} / ${requestSignal.lengthBand ?? "unknown"}`,
      `城市：${payload.member?.city ?? ""}`,
      `偏好：${(payload.member?.favoriteFlavors ?? []).join("、")}`,
      `避忌：${(payload.member?.avoid ?? []).join("、")}`,
      `初步意图：${payload.decision?.primaryIntent ?? ""}`
    ].join("\n");

    try {
      const upstream = await fetch(`${endpoint.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "只输出 JSON，不要 Markdown。" },
            { role: "user", content: prompt }
          ],
          temperature: 0.5,
          response_format: { type: "json_object" }
        })
      });

      if (!upstream.ok) {
        sendJson(res, 200, fallbackGuide());
        return;
      }

      const data = await upstream.json();
      const content = data?.choices?.[0]?.message?.content ?? "{}";
      sendJson(res, 200, { ...JSON.parse(content), source: "qwen" });
    } catch {
      sendJson(res, 200, fallbackGuide());
    }
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Qwen guide proxy listening on http://127.0.0.1:${port}`);
});
