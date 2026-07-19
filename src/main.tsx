import { StrictMode, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  ChevronRight,
  Coffee,
  Compass,
  CreditCard,
  History,
  MapPin,
  MessageCircle,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserRound
} from "lucide-react";
import { members, scenarios } from "./data/demoData";
import { generateDecision } from "./logic/agent";
import type { AgentDecision, Member, Scenario } from "./types";
import "./styles.css";

type ChatMessage = {
  id: string;
  role: "user" | "agent";
  text: string;
};

type CanvasTab = "plan" | "profile" | "execute" | "growth";

function App() {
  const [memberId, setMemberId] = useState(members[0].id);
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [request, setRequest] = useState(scenarios[0].text);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "hello",
      role: "agent",
      text:
        "我是小鹿，瑞幸咖啡规划 Agent。你不用翻菜单和券包，直接说今天这杯咖啡要解决什么问题，我会把画像、饮品、优惠、门店、下单和复购都串起来。"
    }
  ]);
  const [activeTab, setActiveTab] = useState<CanvasTab>("plan");
  const [orderState, setOrderState] = useState<"idle" | "held" | "paid" | "fallback">("idle");
  const [accepted, setAccepted] = useState(64);
  const [dismissed, setDismissed] = useState(18);

  const member = members.find((item) => item.id === memberId) ?? members[0];
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  const decision = useMemo(() => generateDecision(member, scenario, request), [member, scenario, request]);
  const steadiness = calculateSteadiness(decision, member, scenario);
  const acceptanceRate = Math.round((accepted / Math.max(accepted + dismissed, 1)) * 100);

  function useScenario(next: Scenario) {
    setScenarioId(next.id);
    setRequest(next.text);
    setOrderState("idle");
  }

  function submitPrompt(prompt = request) {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const nextDecision = generateDecision(member, scenario, trimmed);
    setRequest(trimmed);
    setMessages((items) => [
      ...items,
      { id: `u-${Date.now()}`, role: "user", text: trimmed },
      { id: `a-${Date.now()}`, role: "agent", text: summarizeDecision(member, nextDecision) }
    ]);
    setActiveTab("plan");
  }

  function simulateAccept() {
    setAccepted((value) => value + 1);
    setOrderState("held");
    setActiveTab("execute");
  }

  function simulatePay() {
    setAccepted((value) => value + 2);
    setOrderState("paid");
    setActiveTab("growth");
  }

  function simulateFallback() {
    setDismissed((value) => value + 1);
    setOrderState("fallback");
    setActiveTab("execute");
  }

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">鹿</div>
          <div>
            <strong>小鹿 CoffeePlan</strong>
            <span>把今天这杯咖啡，规划到刚刚好</span>
          </div>
        </div>
        <div className="top-actions">
          <Pill icon={<ShieldCheck size={14} />} text="无真实支付" />
          <Pill icon={<Bot size={14} />} text="本地规则 Agent" />
        </div>
      </header>

      <aside className="rail">
        <button className="new-session" onClick={() => setMessages(messages.slice(0, 1))}>
          <Sparkles size={16} /> 新的咖啡计划
        </button>

        <SectionLabel icon={<History size={15} />} text="会话模板" />
        <div className="scenario-list">
          {scenarios.map((item) => (
            <button
              className={item.id === scenario.id ? "scenario active" : "scenario"}
              key={item.id}
              onClick={() => useScenario(item)}
            >
              <span>{scenarioTitle(item)}</span>
              <small>{channelLabel(item.channel)} · {item.distanceToStoreMeters}m</small>
            </button>
          ))}
        </div>

        <SectionLabel icon={<UserRound size={15} />} text="会员画像" />
        <div className="member-list">
          {members.map((item) => (
            <button
              className={item.id === member.id ? "member active" : "member"}
              key={item.id}
              onClick={() => {
                setMemberId(item.id);
                setOrderState("idle");
              }}
            >
              <span>{item.name}</span>
              <small>{segmentLabel(item.segment)} · {item.city}</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="chat-pane">
        <div className="chat-header">
          <p>一句话咖啡规划</p>
          <h1>不是给菜单，是把今天这杯咖啡办成闭环。</h1>
          <span>想喝什么、怎么买、何时再来，都由 Agent 串起来。</span>
        </div>

        <div className="chat-feed" aria-label="咖啡规划对话">
          {messages.map((message) => (
            <article className={`message ${message.role}`} key={message.id}>
              <div className="avatar">{message.role === "agent" ? "鹿" : member.name.slice(0, 1)}</div>
              <div className="bubble">{message.text}</div>
            </article>
          ))}

          <article className="agent-card">
            <div className="card-title">
              <Compass size={18} />
              <strong>本轮规划结果</strong>
              <span>稳 {steadiness}%</span>
            </div>
            <div className="plan-summary">
              <div>
                <small>主意图</small>
                <strong>{decision.primaryIntent}</strong>
              </div>
              <ArrowRight size={18} />
              <div>
                <small>推荐</small>
                <strong>{decision.recommendation.name}</strong>
              </div>
              <ArrowRight size={18} />
              <div>
                <small>到手</small>
                <strong>¥{decision.couponPlan.finalPrice}</strong>
              </div>
            </div>
            <p>{decision.trustExplanation[1]}</p>
            <div className="card-actions">
              <button onClick={simulateAccept}>确认这杯</button>
              <button onClick={simulateFallback}>换兜底</button>
            </div>
          </article>
        </div>

        <div className="composer">
          <div className="chips">
            {quickPrompts(member).map((prompt) => (
              <button key={prompt} onClick={() => submitPrompt(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
          <div className="input-row">
            <input
              value={request}
              onChange={(event) => setRequest(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitPrompt();
              }}
              placeholder="例如：下午开会前想喝点提神，但别太甜，最好别排队"
            />
            <button aria-label="发送咖啡规划需求" onClick={() => submitPrompt()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="canvas">
        <div className="tabs">
          <Tab active={activeTab === "plan"} icon={<Coffee size={15} />} text="方案" onClick={() => setActiveTab("plan")} />
          <Tab active={activeTab === "profile"} icon={<Brain size={15} />} text="画像" onClick={() => setActiveTab("profile")} />
          <Tab active={activeTab === "execute"} icon={<CreditCard size={15} />} text="执行" onClick={() => setActiveTab("execute")} />
          <Tab active={activeTab === "growth"} icon={<RefreshCcw size={15} />} text="复购" onClick={() => setActiveTab("growth")} />
        </div>

        {activeTab === "plan" && <PlanCanvas decision={decision} member={member} scenario={scenario} steadiness={steadiness} />}
        {activeTab === "profile" && <ProfileCanvas member={member} decision={decision} />}
        {activeTab === "execute" && (
          <ExecuteCanvas
            decision={decision}
            scenario={scenario}
            orderState={orderState}
            onPay={simulatePay}
            onFallback={simulateFallback}
          />
        )}
        {activeTab === "growth" && (
          <GrowthCanvas
            member={member}
            decision={decision}
            accepted={accepted}
            dismissed={dismissed}
            acceptanceRate={acceptanceRate}
          />
        )}
      </section>
    </main>
  );
}

function PlanCanvas({
  decision,
  member,
  scenario,
  steadiness
}: {
  decision: AgentDecision;
  member: Member;
  scenario: Scenario;
  steadiness: number;
}) {
  return (
    <div className="canvas-body">
      <div className="hero-plan">
        <div>
          <p>今日最佳咖啡计划</p>
          <h2>{decision.recommendation.name}</h2>
          <span>{decision.recommendation.temperature} / {decision.recommendation.sugar} / 到手 ¥{decision.couponPlan.finalPrice}</span>
        </div>
        <div className="steady-ring" style={{ "--v": steadiness } as React.CSSProperties}>
          <i>{steadiness}%</i>
        </div>
      </div>

      <CanvasCard title="为什么是这杯" icon={<MessageCircle size={17} />}>
        <p>{decision.recommendation.reason}</p>
        <div className="tag-row">
          {decision.recommendation.tags.map((tag) => (
            <span key={tag}>{translateTag(tag)}</span>
          ))}
        </div>
      </CanvasCard>

      <CanvasCard title="咖啡规划时间线" icon={<Compass size={17} />}>
        <ol className="timeline">
          <li><b>识别意图</b><span>{decision.primaryIntent}，辅以 {decision.secondaryIntents.join(" / ")}</span></li>
          <li><b>匹配画像</b><span>{member.name} 偏好 {member.favoriteFlavors.join(" / ")}，避开 {member.avoid.join(" / ")}</span></li>
          <li><b>组合优惠</b><span>{decision.couponPlan.explanation}</span></li>
          <li><b>规划门店</b><span>{scenario.distanceToStoreMeters}m 内快取，保留模拟支付前确认。</span></li>
          <li><b>回写复购</b><span>{decision.repurchasePlan}</span></li>
        </ol>
      </CanvasCard>
    </div>
  );
}

function ProfileCanvas({ member, decision }: { member: Member; decision: AgentDecision }) {
  return (
    <div className="canvas-body">
      <CanvasCard title="Member Memory" icon={<Brain size={17} />}>
        <div className="profile-grid">
          <Metric label="会员状态" value={segmentLabel(member.segment)} />
          <Metric label="最近下单" value={`${member.lastOrderDays} 天前`} />
          <Metric label="周均频次" value={`${member.avgWeeklyOrders} 单`} />
          <Metric label="价格敏感" value={sensitivityLabel(member.priceSensitivity)} />
        </div>
      </CanvasCard>

      <CanvasCard title="偏好与约束" icon={<ShieldCheck size={17} />}>
        <div className="memory-list">
          {decision.memberMemory.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </CanvasCard>

      <CanvasCard title="券包" icon={<Ticket size={17} />}>
        {member.couponWallet.map((coupon) => (
          <div className="coupon" key={coupon.id}>
            <strong>{coupon.name}</strong>
            <span>满 ¥{coupon.threshold} 减 ¥{coupon.value} · {coupon.expiresInDays} 天后过期</span>
          </div>
        ))}
      </CanvasCard>
    </div>
  );
}

function ExecuteCanvas({
  decision,
  scenario,
  orderState,
  onPay,
  onFallback
}: {
  decision: AgentDecision;
  scenario: Scenario;
  orderState: "idle" | "held" | "paid" | "fallback";
  onPay: () => void;
  onFallback: () => void;
}) {
  return (
    <div className="canvas-body">
      <CanvasCard title="模拟执行链路" icon={<CreditCard size={17} />}>
        <ol className="tool-steps">
          {decision.orderPath.map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
        <div className="permission-box">
          <ShieldCheck size={18} />
          <p>真实下单和支付必须二次确认；本 demo 只展示模拟订单，不会调用瑞幸真实接口。</p>
        </div>
        <div className="execute-actions">
          <button onClick={onPay}><CheckCircle2 size={16} /> 模拟支付完成</button>
          <button onClick={onFallback}><RefreshCcw size={16} /> 排队过长，启用兜底</button>
        </div>
      </CanvasCard>

      <CanvasCard title="状态" icon={<MapPin size={17} />}>
        <p className="order-state">{orderStateText(orderState, scenario, decision)}</p>
      </CanvasCard>
    </div>
  );
}

function GrowthCanvas({
  member,
  decision,
  accepted,
  dismissed,
  acceptanceRate
}: {
  member: Member;
  decision: AgentDecision;
  accepted: number;
  dismissed: number;
  acceptanceRate: number;
}) {
  return (
    <div className="canvas-body">
      <CanvasCard title="复购与运营闭环" icon={<RefreshCcw size={17} />}>
        <p className="nudge">{decision.wakeupMessage}</p>
        <p>{decision.repurchasePlan}</p>
      </CanvasCard>

      <CanvasCard title="运营回看" icon={<Compass size={17} />}>
        <div className="profile-grid">
          <Metric label="人群包" value={`${segmentLabel(member.segment)} / ${member.city}`} />
          <Metric label="接受率" value={`${acceptanceRate}%`} />
          <Metric label="接受" value={`${accepted}`} />
          <Metric label="放弃" value={`${dismissed}`} />
        </div>
        <div className="impact-row">
          <span>推荐点击 +{decision.estimatedImpact.clickRateLift}%</span>
          <span>唤醒 +{decision.estimatedImpact.wakeupLift}%</span>
          <span>复购周期 -{decision.estimatedImpact.repurchaseCycleReduction}%</span>
        </div>
      </CanvasCard>
    </div>
  );
}

function CanvasCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <article className="canvas-card">
      <div className="canvas-card-title">
        {icon}
        <h3>{title}</h3>
      </div>
      {children}
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Pill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <span className="pill">
      {icon}
      {text}
    </span>
  );
}

function Tab({ active, icon, text, onClick }: { active: boolean; icon: ReactNode; text: string; onClick: () => void }) {
  return (
    <button className={active ? "tab active" : "tab"} onClick={onClick}>
      {icon}
      {text}
    </button>
  );
}

function SectionLabel({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="section-label">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function summarizeDecision(member: Member, decision: AgentDecision) {
  return `我给 ${member.name} 规划的是「${decision.recommendation.name}」：主意图是${decision.primaryIntent}，使用${decision.couponPlan.couponName}后到手 ¥${decision.couponPlan.finalPrice}。我会先解释推荐和优惠原因，再进入模拟下单；本次反馈会回写到复购策略里。`;
}

function quickPrompts(member: Member) {
  return [
    "我现在有点困，想要提神但别太甜",
    `${member.name} 的券快过期了，帮我找最划算一杯`,
    "赶时间，按老样子选最近快取门店"
  ];
}

function calculateSteadiness(decision: AgentDecision, member: Member, scenario: Scenario) {
  const distanceBonus = scenario.distanceToStoreMeters < 250 ? 5 : scenario.distanceToStoreMeters < 450 ? 2 : -2;
  const couponBonus = decision.couponPlan.discount >= 5 ? 4 : 2;
  const trustPenalty = member.trustFlags.length > 1 ? 2 : 0;
  return Math.max(76, Math.min(96, 84 + distanceBonus + couponBonus - trustPenalty));
}

function scenarioTitle(item: Scenario) {
  if (item.text.includes("提神")) return "会议前提神";
  if (item.text.includes("划算")) return "沉睡唤醒";
  if (item.text.includes("低糖")) return "低糖轻负担";
  return "老样子快取";
}

function segmentLabel(segment: Member["segment"]) {
  const labels: Record<Member["segment"], string> = {
    new: "新会员",
    active: "活跃会员",
    sleeping: "沉睡会员",
    loyal: "忠诚会员"
  };
  return labels[segment];
}

function sensitivityLabel(value: Member["priceSensitivity"]) {
  const labels: Record<Member["priceSensitivity"], string> = {
    low: "低",
    medium: "中",
    high: "高"
  };
  return labels[value];
}

function channelLabel(channel: Scenario["channel"]) {
  const labels: Record<Scenario["channel"], string> = {
    "system-agent": "系统级 Agent",
    app: "瑞幸 App",
    "mini-program": "小程序",
    "social-search": "社交搜索"
  };
  return labels[channel];
}

function translateTag(tag: string) {
  const labels: Record<string, string> = {
    afternoon: "下午",
    morning: "早晨",
    evening: "晚上",
    active: "活跃",
    sleeping: "沉睡",
    loyal: "忠诚",
    new: "新客"
  };
  return labels[tag] ?? tag;
}

function orderStateText(orderState: "idle" | "held" | "paid" | "fallback", scenario: Scenario, decision: AgentDecision) {
  if (orderState === "paid") return `模拟订单已完成：${decision.recommendation.name} 已锁定，预计 5-8 分钟后在 ${scenario.distanceToStoreMeters}m 内门店取餐。`;
  if (orderState === "held") return "已进入 5 分钟模拟留位，等待用户二次确认支付。";
  if (orderState === "fallback") return "检测到排队/价格犹豫，已切换兜底：保留口味偏好，优先选择更近门店或更清晰优惠。";
  return "还未执行写操作。点击“确认这杯”后才会进入模拟留位。";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
