import { useEffect, useMemo, useState } from "react";
import { Coffee, MapPin, MessageSquareText, Monitor, Send, ShieldCheck, Smartphone, Store, Ticket } from "lucide-react";
import { members, menuCatalog, scenarios } from "./data/demoData";
import { generateDecision } from "./logic/agent";
import { buildLocalGuideCopy, requestGuideCopy, type GuideCopy } from "./logic/guide";
import type { AgentDecision, Member } from "./types";

type ViewMode = "desktop" | "mobile";
type RoleMode = "user" | "merchant";
type Pane = "plan" | "map" | "orders" | "memory";
type MobileTab = "chat" | Pane;
type Phase = "idle" | "choices" | "plan" | "execute";
type RailItem = {
  label: string;
  pane?: Pane;
  role?: RoleMode;
  notice?: string;
};

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

const railGroups: Array<{ title: string; items: RailItem[] }> = [
  {
    title: "生活",
    items: [
      { label: "新用户零启动体验", notice: "新用户可以只说一句状态，小鹿会先问口味和取餐约束，再给候选方向。" },
      { label: "附近门店与优惠", pane: "map" },
      { label: "咖啡手账 · 回忆册", pane: "memory" }
    ]
  },
  {
    title: "记忆 · 进化",
    items: [
      { label: "导入咖啡记忆", pane: "memory" },
      { label: "越用越懂你", pane: "memory" },
      { label: "可靠性评测", notice: "本轮评测只看三件事：有没有先引导、有没有支付前停止、有没有把真实数据和模拟数据说清楚。" }
    ]
  },
  {
    title: "商家",
    items: [{ label: "商家视角 · 供需分析", role: "merchant", pane: "plan" }]
  },
  {
    title: "接入 · 设置",
    items: [
      { label: "Qwen 模型设置", notice: "Qwen 通过本地代理读取环境变量，前端和仓库不会保存 API key。" },
      { label: "隐私与授权", notice: "定位、会员、券包都需要用户明确授权；没有官方授权时只使用合成样本。" },
      { label: "To-Agent 接入", pane: "orders" }
    ]
  }
];

export function XiaomanLuckinApp() {
  const [view, setView] = useState<ViewMode>("desktop");
  const [role, setRole] = useState<RoleMode>("user");
  const [memberId, setMemberId] = useState(members[0].id);
  const [pane, setPane] = useState<Pane>("plan");
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [phase, setPhase] = useState<Phase>("idle");
  const [input, setInput] = useState("");
  const [userText, setUserText] = useState("");
  const [choice, setChoice] = useState("");
  const [step, setStep] = useState(0);
  const [railNotice, setRailNotice] = useState("");
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
    setMobileTab("chat");
    setStep(0);
    setRailNotice("");
  }

  function chooseDirection(value: string) {
    setChoice(value);
    setPhase("plan");
    setPane("plan");
    setMobileTab("plan");
  }

  function startExecute() {
    if (phase !== "plan") return;
    setPhase("execute");
    setPane("orders");
    setMobileTab("orders");
    setStep(0);
  }

  function startNew() {
    setInput("");
    setUserText("");
    setChoice("");
    setPhase("idle");
    setPane("plan");
    setMobileTab("chat");
    setStep(0);
    setRailNotice("");
  }

  function handleRailItem(item: RailItem) {
    if (item.role) setRole(item.role);
    if (item.pane) {
      setPane(item.pane);
      setMobileTab(item.pane);
    }
    if (item.notice) {
      setRailNotice(item.notice);
      setMobileTab("chat");
    }
  }

  return (
    <div className={`xm-shell ${view === "mobile" ? "m-mobile phone-frame" : "m-desktop"} role-${role}`}>
      <Topbar member={member} view={view} role={role} setView={setView} setRole={setRole} />
      <Rail member={member} phase={phase} decision={decision} onNew={startNew} onMember={setMemberId} onPane={setPane} onItem={handleRailItem} />
      <main className="xm-center">
        {role === "merchant" ? (
          <MerchantCenter decision={decision} member={member} onBack={() => setRole("user")} />
        ) : view === "mobile" && mobileTab !== "chat" ? (
          <MobilePane tab={mobileTab} phase={phase} decision={decision} member={member} choices={choices} steps={steps} step={step} onChoose={chooseDirection} onExecute={startExecute} />
        ) : (
          <>
            <section className="xm-chat">
              <BotMessage>{guide.opening}</BotMessage>
              {railNotice && <BotMessage>{railNotice}</BotMessage>}
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
          </>
        )}
      </main>
      <Canvas role={role} pane={pane} setPane={setPane} phase={phase} decision={decision} member={member} choices={choices} steps={steps} step={step} onChoose={chooseDirection} onExecute={startExecute} />
      <nav className="xm-tabbar">
        <button className={mobileTab === "chat" ? "active" : ""} onClick={() => setMobileTab("chat")}><MessageSquareText size={19} /><span>对话</span></button>
        <button className={mobileTab === "plan" ? "active" : ""} onClick={() => setMobileTab("plan")}><Coffee size={19} /><span>方案</span></button>
        <button className={mobileTab === "map" ? "active" : ""} onClick={() => setMobileTab("map")}><MapPin size={19} /><span>门店</span></button>
        <button className={mobileTab === "orders" ? "active" : ""} onClick={() => setMobileTab("orders")}><Ticket size={19} /><span>订单</span></button>
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

function Rail({ member, phase, decision, onNew, onMember, onPane, onItem }: {
  member: Member;
  phase: Phase;
  decision: AgentDecision;
  onNew: () => void;
  onMember: (id: string) => void;
  onPane: (pane: Pane) => void;
  onItem: (item: RailItem) => void;
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
              <button key={item.label} className="xm-link" onClick={() => onItem(item)}>{item.label}</button>
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

function Canvas({ role, pane, setPane, phase, decision, member, choices, steps, step, onChoose, onExecute }: {
  role: RoleMode;
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
        {role === "merchant" ? (
          <MerchantCanvasPane pane={pane} decision={decision} member={member} step={step} steps={steps} />
        ) : (
          <>
            {pane === "plan" && (phase === "idle" ? <EmptyPane text="还没有方案" sub="回到对话，说一句今天想怎么喝" /> : phase === "choices" ? <ChoiceGrid choices={choices} onChoose={onChoose} /> : <PlanPane decision={decision} onExecute={onExecute} />)}
            {pane === "map" && <StorePane decision={decision} />}
            {pane === "orders" && <OrderPane phase={phase} decision={decision} steps={steps} step={step} onExecute={onExecute} />}
            {pane === "memory" && <MemoryPane member={member} decision={decision} />}
          </>
        )}
      </div>
    </section>
  );
}

function MobilePane({ tab, phase, decision, member, choices, steps, step, onChoose, onExecute }: {
  tab: MobileTab;
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
    <section className="xm-mobile-pane">
      {tab === "plan" && (phase === "idle" ? <EmptyPane text="还没有方案" sub="先回对话说一句今天想怎么喝" /> : phase === "choices" ? <ChoiceGrid choices={choices} onChoose={onChoose} /> : <PlanPane decision={decision} onExecute={onExecute} />)}
      {tab === "map" && <StorePane decision={decision} />}
      {tab === "orders" && <OrderPane phase={phase} decision={decision} steps={steps} step={step} onExecute={onExecute} />}
      {tab === "memory" && <MemoryPane member={member} decision={decision} />}
    </section>
  );
}

function MerchantCenter({ decision, member, onBack }: { decision: AgentDecision; member: Member; onBack: () => void }) {
  return (
    <section className="xm-merchant-center">
      <article className="xm-merchant-hero">
        <span>商家视角</span>
        <h1>{member.city} 咖啡需求参谋</h1>
        <p>用户端负责自然聊天和支付前确认；商家端只看匿名化需求、门店压力、券包效率和执行边界。</p>
        <button onClick={onBack}>回到用户端对话</button>
      </article>
      <div className="xm-metrics">
        <Metric label="方案接受率" value={`${decision.estimatedImpact.clickRateLift + 64}%`} note="模拟相对提升" />
        <Metric label="取餐稳定度" value={`${Math.max(72, 100 - decision.selectedStore.pickupEtaMinutes)}%`} note={decision.selectedStore.name} />
        <Metric label="复购缩短" value={`${decision.estimatedImpact.repurchaseCycleReduction} 天`} note={decision.primaryIntent} />
      </div>
      <article className="xm-card">
        <h2>今天应该盯什么</h2>
        <div className="xm-line"><b>热门需求</b><span>{decision.primaryIntent}、少糖解释、附近快取、券包简单明了。</span></div>
        <div className="xm-line"><b>门店动作</b><span>{decision.selectedStore.name} 当前 ETA {decision.selectedStore.pickupEtaMinutes} 分钟，适合前置提示等待时间。</span></div>
        <div className="xm-line"><b>边界</b><span>不读取真实会员、不代付、不创建真实订单；真实接入需要官方登录和履约接口。</span></div>
      </article>
    </section>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="xm-metric">
      <b>{value}</b>
      <span>{label}</span>
      <small>{note}</small>
    </div>
  );
}

function MerchantCanvasPane({ pane, decision, member, step, steps }: {
  pane: Pane;
  decision: AgentDecision;
  member: Member;
  step: number;
  steps: string[];
}) {
  if (pane === "map") {
    return (
      <article className="xm-card">
        <div className="xm-map-card"><Store size={34} /><span>{member.city}</span></div>
        <h2>门店履约热区</h2>
        <p>{decision.selectedStore.name} 是本轮候选首店，排队{decision.selectedStore.queueLevel === "low" ? "较低" : "中等"}，风险是：{decision.selectedStore.riskFlags.join(" / ")}。</p>
        <div className="xm-line"><b>运营建议</b><span>把预计取餐时间、可用券和库存风险提前露出，减少用户到支付前才放弃。</span></div>
      </article>
    );
  }
  if (pane === "orders") {
    return (
      <article className="xm-card">
        <h2>执行边界看板</h2>
        <p>GUI-Agent 只负责演示观察、点击、校验、停在支付前；真实支付必须交回官方收银台。</p>
        <div className="xm-chain"><b>当前链路</b><meter min={0} max={steps.length - 1} value={step} /><p>{steps[Math.min(step, steps.length - 1)]}</p></div>
      </article>
    );
  }
  if (pane === "memory") {
    return (
      <article className="xm-card">
        <h2>匿名咖啡记忆</h2>
        <p>商家端只能看到群组信号和授权摘要，不展示个人原始输入、真实券包或支付数据。</p>
        {decision.agentTrace.map((item) => <div className="xm-line" key={item.moduleId}><b>{item.moduleName}</b><span>{item.summary}</span></div>)}
      </article>
    );
  }
  return (
    <article className="xm-card">
      <h2>经营方案</h2>
      <p>{member.city} 当前适合主推「{decision.recommendation.name}」相关组合，但要把少糖、快取和券规则讲清楚。</p>
      <div className="xm-line"><b>人群</b><span>{member.segment} · {member.lifecycleGoal}</span></div>
      <div className="xm-line"><b>商品</b><span>{decision.recommendation.name} · {decision.recommendation.tags.join(" / ")}</span></div>
      <div className="xm-line"><b>券包</b><span>{decision.couponPlan.explanation}</span></div>
    </article>
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
