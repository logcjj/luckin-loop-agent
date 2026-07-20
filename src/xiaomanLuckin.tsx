import { useEffect, useMemo, useState } from "react";
import { Coffee, MapPin, MessageSquareText, Monitor, Send, ShieldCheck, Smartphone, Store, Ticket, UserRound } from "lucide-react";
import { members, menuCatalog, scenarios } from "./data/demoData";
import { generateDecision } from "./logic/agent";
import { buildLocalGuideCopy, requestGuideCopy, type GuideCopy } from "./logic/guide";
import type { AgentDecision, Member } from "./types";

type ViewMode = "desktop" | "mobile";
type RoleMode = "user" | "merchant";
type Pane = "plan" | "map" | "orders" | "memory";
type Phase = "idle" | "choices" | "plan" | "execute";

const officialLinks = {
  app: "https://m.luckincoffee.us/app/download",
  menu: "https://m.luckincoffee.us/menu",
  stores: "https://www.luckincoffee.us/stores"
};

const quickPrompts = [
  "开会前有点困，想喝提神的，别太甜",
  "今天想喝轻一点、低糖一点，别太腻",
  "我赶时间，想要快取、少折腾"
];

const railGroups = [
  { title: "生活", items: ["新用户零启动体验", "附近门店与优惠", "咖啡手账 · 回忆册"] },
  { title: "记忆 · 进化", items: ["导入咖啡记忆", "越用越懂你", "可靠性评测"] },
  { title: "商家", items: ["商家视角 · 供需分析"] },
  { title: "接入 · 设置", items: ["Qwen 模型设置", "隐私与授权", "To-Agent 接入"] }
];

export function XiaomanLuckinApp() {
  const [view, setView] = useState<ViewMode>("desktop");
  const [role, setRole] = useState<RoleMode>("user");
  const [memberId, setMemberId] = useState(members[0].id);
  const [pane, setPane] = useState<Pane>("plan");
  const [phase, setPhase] = useState<Phase>("idle");
  const [input, setInput] = useState("");
  const [userText, setUserText] = useState("");
  const [choice, setChoice] = useState("");
  const [step, setStep] = useState(0);
  const [guide, setGuide] = useState<GuideCopy>(() => buildLocalGuideCopy(members[0], generateDecision(members[0], scenarios[0], scenarios[0].text), false));

  const member = members.find((item) => item.id === memberId) ?? members[0];
  const scenario = scenarios[0];
  const decisionText = [userText, choice].filter(Boolean).join(" ") || scenario.text;
  const decision = useMemo(() => generateDecision(member, scenario, decisionText), [member, scenario, decisionText]);
  const choices = useMemo(() => buildChoices(decision), [decision]);
  const steps = useMemo(() => buildOrderSteps(decision), [decision]);

  useEffect(() => {
    let cancelled = false;
    const local = buildLocalGuideCopy(member, decision, Boolean(userText));
    setGuide(local);
    if (!userText) return;
    requestGuideCopy({
      request: userText,
      member: {
        city: member.city,
        favoriteFlavors: member.favoriteFlavors,
        avoid: member.avoid,
        priceSensitivity: member.priceSensitivity
      },
      decision: {
        primaryIntent: decision.primaryIntent,
        confidence: decision.confidence
      }
    }).then((next) => {
      if (!cancelled && next) setGuide(next);
    });
    return () => {
      cancelled = true;
    };
  }, [userText, member, decision]);

  useEffect(() => {
    if (phase !== "execute" || step >= steps.length - 1) return;
    const timer = window.setTimeout(() => setStep((value) => value + 1), 950);
    return () => window.clearTimeout(timer);
  }, [phase, step, steps.length]);

  function sendNeed() {
    const text = input.trim();
    if (!text) return;
    setUserText(text);
    setInput("");
    setChoice("");
    setPhase("choices");
    setPane("plan");
    setStep(0);
  }

  function chooseDirection(value: string) {
    setChoice(value);
    setPhase("plan");
    setPane("plan");
  }

  function startExecute() {
    if (phase !== "plan") return;
    setPhase("execute");
    setPane("orders");
    setStep(0);
  }

  function startNew() {
    setInput("");
    setUserText("");
    setChoice("");
    setPhase("idle");
    setPane("plan");
    setStep(0);
  }

  return (
    <div className={`xm-shell ${view === "mobile" ? "m-mobile phone-frame" : "m-desktop"} role-${role}`}>
      <Topbar member={member} view={view} role={role} setView={setView} setRole={setRole} />
      <Rail member={member} phase={phase} decision={decision} onNew={startNew} onMember={setMemberId} onPane={setPane} />
      <main className="xm-center">
        <section className="xm-chat">
          <BotMessage>{guide.opening}</BotMessage>
          {phase === "idle" && (
            <article className="xm-starter">
              <b>先说一句，小鹿再帮你收窄。</b>
              <p>可以直接写状态、口味、预算、取餐时间；小鹿会像千问一样先给几个方向让你选。</p>
              <div>
                {quickPrompts.map((prompt) => (
                  <button key={prompt} onClick={() => setInput(prompt)}>{prompt}</button>
                ))}
              </div>
            </article>
          )}
          {userText && <UserMessage>{userText}</UserMessage>}
          {phase === "choices" && (
            <>
              <BotMessage>我先不直接固定推荐。下面是三个方向，选一个后再展开商品、门店、优惠和执行。</BotMessage>
              <GuideCard guide={guide} />
              <ChoiceGrid choices={choices} onChoose={chooseDirection} />
            </>
          )}
          {(phase === "plan" || phase === "execute") && (
            <>
              <BotMessage>方向已确认，我把这杯咖啡整理成可执行方案。真实支付仍然由你在官方 App 里确认。</BotMessage>
              <PlanBubble decision={decision} member={member} onExecute={startExecute} />
            </>
          )}
        </section>
        <Composer value={input} onChange={setInput} onSend={sendNeed} disabled={phase === "execute"} />
      </main>
      <Canvas pane={pane} setPane={setPane} phase={phase} decision={decision} member={member} choices={choices} steps={steps} step={step} onChoose={chooseDirection} onExecute={startExecute} />
      <nav className="xm-tabbar">
        <button className="active"><MessageSquareText size={19} /><span>对话</span></button>
        <button onClick={() => setPane("plan")}><Coffee size={19} /><span>方案</span></button>
        <button onClick={() => setPane("map")}><MapPin size={19} /><span>门店</span></button>
        <button onClick={() => setPane("orders")}><Ticket size={19} /><span>订单</span></button>
      </nav>
    </div>
  );
}

function Topbar({ member, view, role, setView, setRole }: {
  member: Member;
  view: ViewMode;
  role: RoleMode;
  setView: (value: ViewMode) => void;
  setRole: (value: RoleMode) => void;
}) {
  return (
    <header className="xm-topbar">
      <div className="xm-brand">
        <div className="xm-logo">鹿</div>
        <div className="xm-brand-text">
          <b>小鹿</b>
          <span>把今天这杯咖啡点得刚刚好</span>
        </div>
      </div>
      <button className="xm-loc"><MapPin size={14} />{member.city} · 附近门店</button>
      <div className="xm-role">
        <button className={role === "user" ? "active" : ""} onClick={() => setRole("user")}>用户</button>
        <button className={role === "merchant" ? "active" : ""} onClick={() => setRole("merchant")}>商家</button>
      </div>
      <button className="xm-pill">Qwen 可选</button>
      <div className="xm-view">
        <button className={view === "mobile" ? "active" : ""} onClick={() => setView("mobile")}><Smartphone size={14} />手机</button>
        <button className={view === "desktop" ? "active" : ""} onClick={() => setView("desktop")}><Monitor size={14} />电脑</button>
      </div>
    </header>
  );
}

function Rail({ member, phase, decision, onNew, onMember, onPane }: {
  member: Member;
  phase: Phase;
  decision: AgentDecision;
  onNew: () => void;
  onMember: (id: string) => void;
  onPane: (pane: Pane) => void;
}) {
  return (
    <aside className="xm-rail">
      <button className="xm-new" onClick={onNew}>＋ 新的咖啡</button>
      <div className="xm-rail-title">会话历史</div>
      <button className="xm-session active" onClick={() => onPane("plan")}>
        <b>{phase === "idle" ? "今天想喝什么" : decision.recommendation.name}</b>
        <span>{phase === "choices" ? "等待选择方向" : `${decision.selectedStore.pickupEtaMinutes} 分钟取餐`}</span>
      </button>
      <button className="xm-session" onClick={() => onPane("memory")}>
        <b>{member.name} 的咖啡记忆</b>
        <span>{member.city} · {member.lifecycleGoal}</span>
      </button>
      <div className="xm-rail-scroll">
        {railGroups.map((group) => (
          <section key={group.title}>
            <div className="xm-group">{group.title}</div>
            {group.items.map((item) => (
              <button key={item} className="xm-link">{item}</button>
            ))}
          </section>
        ))}
        <section>
          <div className="xm-group">会员样本</div>
          {members.map((item) => (
            <button key={item.id} className={item.id === member.id ? "xm-link active" : "xm-link"} onClick={() => onMember(item.id)}>
              {item.name} · {item.city}
            </button>
          ))}
        </section>
      </div>
      <div className="xm-safe"><ShieldCheck size={15} />支付前停止，不创建真实订单</div>
    </aside>
  );
}

function BotMessage({ children }: { children: React.ReactNode }) {
  return <article className="xm-msg bot"><div className="xm-av">鹿</div><div className="xm-bubble">{children}</div></article>;
}

function UserMessage({ children }: { children: React.ReactNode }) {
  return <article className="xm-msg user"><div className="xm-av">你</div><div className="xm-bubble">{children}</div></article>;
}

function Composer({ value, disabled, onChange, onSend }: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <footer className="xm-composer">
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSend();
        }}
        placeholder="例如：开会前想提神，别太甜，最好别排队"
      />
      <button onClick={onSend} disabled={disabled || !value.trim()} aria-label="发送"><Send size={18} /></button>
    </footer>
  );
}

function GuideCard({ guide }: { guide: GuideCopy }) {
  return (
    <article className="xm-guide">
      <b>{guide.summary}</b>
      {guide.followUps.map((item) => <span key={item}>{item}</span>)}
      <small>{guide.source === "qwen" ? "Qwen 引导" : "本地引导"}</small>
    </article>
  );
}

function ChoiceGrid({ choices, onChoose }: { choices: ReturnType<typeof buildChoices>; onChoose: (value: string) => void }) {
  return (
    <section className="xm-choice-grid">
      {choices.map((choice) => (
        <button key={choice.title} onClick={() => onChoose(choice.value)}>
          <span>{choice.kicker}</span>
          <b>{choice.title}</b>
          <p>{choice.reason}</p>
          <small>{choice.score}% 匹配</small>
        </button>
      ))}
    </section>
  );
}

function PlanBubble({ decision, member, onExecute }: { decision: AgentDecision; member: Member; onExecute: () => void }) {
  return (
    <article className="xm-plan-bubble">
      <ProductImage decision={decision} />
      <div>
        <span>为 {member.name} 生成</span>
        <h2>{decision.recommendation.name}</h2>
        <p>{decision.recommendation.reason}</p>
        <div className="xm-tags">
          <i>{decision.confidence}% 稳</i>
          <i>{decision.selectedStore.pickupEtaMinutes} 分钟</i>
          <i>¥{decision.couponPlan.finalPrice}</i>
        </div>
        <button onClick={onExecute}>执行点单模拟</button>
      </div>
    </article>
  );
}

function Canvas({ pane, setPane, phase, decision, member, choices, steps, step, onChoose, onExecute }: {
  pane: Pane;
  setPane: (pane: Pane) => void;
  phase: Phase;
  decision: AgentDecision;
  member: Member;
  choices: ReturnType<typeof buildChoices>;
  steps: string[];
  step: number;
  onChoose: (value: string) => void;
  onExecute: () => void;
}) {
  return (
    <section className="xm-canvas">
      <nav className="xm-canvas-tabs">
        <button className={pane === "plan" ? "active" : ""} onClick={() => setPane("plan")}>方案</button>
        <button className={pane === "map" ? "active" : ""} onClick={() => setPane("map")}>门店</button>
        <button className={pane === "orders" ? "active" : ""} onClick={() => setPane("orders")}>订单</button>
        <button className={pane === "memory" ? "active" : ""} onClick={() => setPane("memory")}>记忆</button>
      </nav>
      <div className="xm-canvas-body">
        {pane === "plan" && (phase === "idle" ? <EmptyPane text="还没有方案" sub="回到对话，说一句今天想怎么喝" /> : phase === "choices" ? <ChoiceGrid choices={choices} onChoose={onChoose} /> : <PlanPane decision={decision} onExecute={onExecute} />)}
        {pane === "map" && <StorePane decision={decision} />}
        {pane === "orders" && <OrderPane phase={phase} decision={decision} steps={steps} step={step} onExecute={onExecute} />}
        {pane === "memory" && <MemoryPane member={member} decision={decision} />}
      </div>
    </section>
  );
}

function EmptyPane({ text, sub }: { text: string; sub: string }) {
  return <div className="xm-empty"><div>☕</div><b>{text}</b><span>{sub}</span></div>;
}

function PlanPane({ decision, onExecute }: { decision: AgentDecision; onExecute: () => void }) {
  return (
    <article className="xm-card">
      <ProductImage decision={decision} />
      <h2>{decision.recommendation.name}</h2>
      <p>{decision.recommendation.reason}</p>
      <div className="xm-line"><b>门店</b><span>{decision.selectedStore.name} · {decision.selectedStore.pickupEtaMinutes} 分钟</span></div>
      <div className="xm-line"><b>优惠</b><span>{decision.couponPlan.explanation}</span></div>
      <div className="xm-official">
        <a href={officialLinks.app} target="_blank" rel="noreferrer">官方 App</a>
        <a href={officialLinks.menu} target="_blank" rel="noreferrer">官方菜单</a>
        <a href={officialLinks.stores} target="_blank" rel="noreferrer">官方门店</a>
      </div>
      <button className="xm-primary" onClick={onExecute}>执行点单模拟</button>
    </article>
  );
}

function StorePane({ decision }: { decision: AgentDecision }) {
  return (
    <article className="xm-card">
      <div className="xm-map-card"><MapPin size={34} /><span>{decision.selectedStore.distanceMeters}m</span></div>
      <h2>{decision.selectedStore.name}</h2>
      <p>排队{decision.selectedStore.queueLevel === "low" ? "较低" : "中等"} · ETA {decision.selectedStore.pickupEtaMinutes} 分钟 · {decision.selectedStore.inventoryHighlights.join(" / ")}</p>
    </article>
  );
}

function OrderPane({ phase, decision, steps, step, onExecute }: {
  phase: Phase;
  decision: AgentDecision;
  steps: string[];
  step: number;
  onExecute: () => void;
}) {
  if (phase !== "execute") {
    return (
      <article className="xm-card">
        <h2>暂无真实订单</h2>
        <p>确认方案后可以模拟手机点单链路。流程只到支付前，不创建订单、不扣券、不扣款。</p>
        <button className="xm-primary" disabled={phase !== "plan"} onClick={onExecute}>执行点单模拟</button>
      </article>
    );
  }

  return (
    <article className="xm-card">
      <div className="xm-phone-mini">
        <ProductImage decision={decision} />
        <b>{decision.recommendation.name}</b>
        <span>{steps[step]}</span>
      </div>
      <div className="xm-chain">
        <b>{step >= steps.length - 1 ? "支付前停止" : "执行链路运行中"}</b>
        <meter min={0} max={steps.length - 1} value={step} />
        <p>{steps[step]}</p>
      </div>
    </article>
  );
}

function MemoryPane({ member, decision }: { member: Member; decision: AgentDecision }) {
  return (
    <article className="xm-card">
      <h2>{member.name} 的咖啡记忆</h2>
      <p>{member.persona}</p>
      <div className="xm-tags">
        {member.favoriteFlavors.map((item) => <i key={item}>{item}</i>)}
        {member.avoid.map((item) => <i key={item}>{item}</i>)}
      </div>
      <div className="xm-line"><b>本轮解释</b><span>{decision.trustExplanation[0]}</span></div>
    </article>
  );
}

function ProductImage({ decision }: { decision: AgentDecision }) {
  const product = menuCatalog.find((item) => item.id === decision.recommendation.productId);
  return (
    <figure className="xm-product">
      {product?.imageUrl ? <img src={product.imageUrl} alt={product.officialName ?? decision.recommendation.name} /> : <div>☕</div>}
      <figcaption>{product?.imageSourceName ?? "demo visual"}</figcaption>
    </figure>
  );
}

function buildChoices(decision: AgentDecision) {
  const labels = ["稳妥一点", "轻一点", "快一点"];
  return decision.candidateScores.slice(0, 3).map((item, index) => ({
    kicker: labels[index],
    title: item.name,
    reason: item.reasons.slice(0, 3).join(" / "),
    score: item.score,
    value: `${labels[index]}：${item.name}。${item.reasons.join("，")}`
  }));
}

function buildOrderSteps(decision: AgentDecision) {
  return [
    "打开官方 App 点单入口模拟",
    `搜索 ${decision.recommendation.name}`,
    `选择 ${decision.recommendation.temperature} / ${decision.recommendation.sugar}`,
    `使用 ${decision.couponPlan.couponName}`,
    `确认 ${decision.selectedStore.name}`,
    "生成官方 App 交接入口",
    "支付前停止，等待用户自己确认"
  ];
}
