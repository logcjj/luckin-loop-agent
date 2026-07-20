import { StrictMode, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  Bot,
  CheckCircle2,
  ChevronRight,
  Coffee,
  Compass,
  Database,
  History,
  LineChart,
  MapPin,
  MessageSquareText,
  Monitor,
  Pause,
  Play,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Store,
  Ticket,
  Timer,
  UserRound,
  Zap
} from "lucide-react";
import { agentModules, dataConnectors, experienceMetrics, members, menuCatalog, scenarios } from "./data/demoData";
import { generateDecision } from "./logic/agent";
import type { AgentDecision, AgentTraceStep, DataConnector, Member, Scenario } from "./types";
import "./styles.css";

type WorkspaceModule = "briefing" | "dialogue" | "strategy" | "execute" | "growth" | "connectors";
type ViewMode = "desktop" | "phone";
type AutoScreen = "launch" | "home" | "search" | "product" | "customize" | "coupon" | "store" | "confirm" | "cashier";

type AutoStep = {
  id: string;
  screen: AutoScreen;
  observation: string;
  thought: string;
  action: string;
  target: string;
  memory: string;
  guardrail: string;
};

const moduleNav: Array<{ id: WorkspaceModule; label: string; detail: string; icon: ReactNode }> = [
  { id: "briefing", label: "今日任务", detail: "首屏闭环", icon: <Compass size={16} /> },
  { id: "dialogue", label: "Agent 对话", detail: "需求澄清", icon: <MessageSquareText size={16} /> },
  { id: "strategy", label: "推荐策略", detail: "召回精排", icon: <Coffee size={16} /> },
  { id: "execute", label: "自动执行", detail: "手机模拟", icon: <Bot size={16} /> },
  { id: "growth", label: "增长回写", detail: "复购评估", icon: <LineChart size={16} /> },
  { id: "connectors", label: "数据接入", detail: "真实边界", icon: <Database size={16} /> }
];

function App() {
  const [memberId, setMemberId] = useState(members[0].id);
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [request, setRequest] = useState(scenarios[0].text);
  const [activeModule, setActiveModule] = useState<WorkspaceModule>("briefing");
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [accepted, setAccepted] = useState(64);
  const [dismissed, setDismissed] = useState(18);

  const member = members.find((item) => item.id === memberId) ?? members[0];
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  const decision = useMemo(() => generateDecision(member, scenario, request), [member, scenario, request]);
  const executionSteps = useMemo(() => buildExecutionSteps(member, scenario, decision), [member, scenario, decision]);
  const activeStep = executionSteps[Math.min(stepIndex, executionSteps.length - 1)];
  const acceptanceRate = Math.round((accepted / Math.max(accepted + dismissed, 1)) * 100);

  useEffect(() => {
    if (!running) return;
    if (stepIndex >= executionSteps.length - 1) {
      setRunning(false);
      return;
    }
    const timer = window.setTimeout(() => setStepIndex((value) => value + 1), 1120);
    return () => window.clearTimeout(timer);
  }, [running, stepIndex, executionSteps.length]);

  function resetScenario(nextScenario: Scenario) {
    setScenarioId(nextScenario.id);
    setRequest(nextScenario.text);
    setRunning(false);
    setStepIndex(0);
    setActiveModule("briefing");
  }

  function switchMember(nextMember: Member) {
    setMemberId(nextMember.id);
    setRunning(false);
    setStepIndex(0);
  }

  function startExecution() {
    if (stepIndex >= executionSteps.length - 1) setStepIndex(0);
    setActiveModule("execute");
    setRunning(true);
  }

  function acceptPlan() {
    setAccepted((value) => value + 1);
    startExecution();
  }

  function fallbackPlan() {
    setDismissed((value) => value + 1);
    setRunning(false);
    setActiveModule("strategy");
    const storeStep = executionSteps.findIndex((step) => step.screen === "store");
    setStepIndex(storeStep >= 0 ? storeStep : 0);
  }

  return (
    <main className={`product-shell view-${viewMode}`}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">鹿</div>
          <div>
            <strong>小鹿 CoffeePlan</strong>
            <span>Luckin-style Agent ordering demo</span>
          </div>
        </div>
        <div className="top-actions">
          <Pill icon={<ShieldCheck size={14} />} text="模拟数据" />
          <Pill icon={<Timer size={14} />} text={`${decision.selectedStore.pickupEtaMinutes} 分钟取餐`} />
          <Pill icon={<MapPin size={14} />} text={`${decision.selectedStore.distanceMeters}m`} />
        </div>
      </header>

      <aside className="navigator">
        <section className="director-card">
          <div className="director-eyebrow">三幕咖啡旅程</div>
          <h2>懂你 → 给稳方案 → 自动办到</h2>
          <p>参考小满的“三幕故事”和 HireEasy 的 FlowNav：左侧不只是导航，而是演示进度、视图模式和能力挂载。</p>
          <div className="view-toggle" aria-label="view mode">
            <button className={viewMode === "desktop" ? "active" : ""} onClick={() => setViewMode("desktop")}>
              <Monitor size={14} />
              网页
            </button>
            <button className={viewMode === "phone" ? "active" : ""} onClick={() => setViewMode("phone")}>
              <Smartphone size={14} />
              手机
            </button>
          </div>
          <button className="primary-command" onClick={acceptPlan}>
            <Sparkles size={16} />
            生成并执行
          </button>
        </section>

        <RailTitle icon={<Compass size={15} />} title="FlowNav · 演示流" />
        <nav className="story-flow" aria-label="workspace modules">
          {moduleNav.map((item) => (
            <button
              className={flowClassName(item.id, activeModule)}
              key={item.id}
              onClick={() => setActiveModule(item.id)}
            >
              <i>{moduleNav.findIndex((module) => module.id === item.id) + 1}</i>
              <span className="flow-line" />
              <span className="flow-icon">{item.icon}</span>
              <span className="flow-copy">
                <b>{item.label}</b>
                <small>{item.detail} · {moduleStatus(item.id, activeModule)}</small>
              </span>
            </button>
          ))}
        </nav>

        <section className="script-panel">
          <RailTitle icon={<Coffee size={15} />} title="场景脚本" />
          <div className="script-list">
            {scenarios.map((item) => (
              <button className={item.id === scenario.id ? "script-item active" : "script-item"} key={item.id} onClick={() => resetScenario(item)}>
                <b>{scenarioTitle(item)}</b>
                <span>{item.triggerSignals.slice(0, 3).join(" / ")}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="member-dock">
          <RailTitle icon={<UserRound size={15} />} title="会员分身" />
          <button className="member-active-card">
            <strong>{member.name}</strong>
            <span>{segmentLabel(member.segment)} · {tierLabel(member.tier)} · {member.city}</span>
            <small>{member.lifecycleGoal}</small>
          </button>
          <div className="member-switcher">
            {members.map((item) => (
              <button className={item.id === member.id ? "active" : ""} key={item.id} onClick={() => switchMember(item)}>
                {item.name}
              </button>
            ))}
          </div>
        </section>

        <section className="ability-stack">
          <RailTitle icon={<Zap size={15} />} title="能力挂载" />
          {agentModules.slice(0, 3).map((module) => (
            <div key={module.id}>
              <b>{module.name}</b>
              <span>{module.outputs.slice(0, 2).join(" / ")}</span>
            </div>
          ))}
        </section>
      </aside>

      <section className="workspace">
        <MissionComposer
          request={request}
          scenario={scenario}
          decision={decision}
          onRequestChange={setRequest}
          onAccept={acceptPlan}
          onFallback={fallbackPlan}
        />

        {activeModule === "execute" ? (
          <ExecuteStudio
            member={member}
            decision={decision}
            activeStep={activeStep}
            executionSteps={executionSteps}
            stepIndex={stepIndex}
            running={running}
            onRun={startExecution}
            onPause={() => setRunning(false)}
            onReset={() => {
              setRunning(false);
              setStepIndex(0);
            }}
          />
        ) : (
          <div className="work-grid">
            <section className="main-canvas">
              {activeModule === "briefing" && (
                <BriefingCanvas
                  member={member}
                  scenario={scenario}
                  decision={decision}
                  acceptanceRate={acceptanceRate}
                  onExecute={startExecution}
                />
              )}
              {activeModule === "dialogue" && <DialogueCanvas member={member} scenario={scenario} decision={decision} />}
              {activeModule === "strategy" && <StrategyCanvas decision={decision} />}
              {activeModule === "growth" && <GrowthCanvas decision={decision} acceptanceRate={acceptanceRate} />}
              {activeModule === "connectors" && <ConnectorCanvas />}
            </section>

            <InsightPanel member={member} decision={decision} />
          </div>
        )}
      </section>
    </main>
  );
}

function MissionComposer({
  request,
  scenario,
  decision,
  onRequestChange,
  onAccept,
  onFallback
}: {
  request: string;
  scenario: Scenario;
  decision: AgentDecision;
  onRequestChange: (value: string) => void;
  onAccept: () => void;
  onFallback: () => void;
}) {
  return (
    <section className="mission-bar">
      <div className="mission-copy">
        <p>{scenario.businessGoal}</p>
        <h1>{decision.primaryIntent} · {decision.recommendation.name}</h1>
        <span>{decision.trustExplanation[0]}</span>
      </div>
      <div className="composer-card">
        <label htmlFor="coffee-request">一句话咖啡任务</label>
        <div className="input-row">
          <input id="coffee-request" value={request} onChange={(event) => onRequestChange(event.target.value)} />
          <button onClick={onAccept} aria-label="生成并执行">
            <Play size={17} />
          </button>
        </div>
        <div className="composer-actions">
          <button onClick={onAccept}><CheckCircle2 size={15} /> 接受方案</button>
          <button onClick={onFallback}><RefreshCcw size={15} /> 看兜底</button>
        </div>
      </div>
    </section>
  );
}

function BriefingCanvas({
  member,
  scenario,
  decision,
  acceptanceRate,
  onExecute
}: {
  member: Member;
  scenario: Scenario;
  decision: AgentDecision;
  acceptanceRate: number;
  onExecute: () => void;
}) {
  const product = getProduct(decision);

  return (
    <div className="briefing-layout">
      <section className="hero-panel">
        <div className="hero-copy">
          <small>{scenarioTitle(scenario)} / {scenario.weather}</small>
          <h2>把“想喝什么”变成可解释的取餐计划。</h2>
          <p>{decision.recommendation.reason}</p>
          <div className="hero-tags">
            <span>{decision.recommendation.temperature}</span>
            <span>{decision.recommendation.sugar}</span>
            <span>模拟到手 ¥{decision.couponPlan.finalPrice}</span>
            <span>{decision.confidence}% 置信</span>
          </div>
          <button onClick={onExecute}><Bot size={16} /> 查看自动执行</button>
        </div>
        <div className="cup-stage">
          <ProductMedia decision={decision} />
          <div>
            <b>{decision.recommendation.name}</b>
            <span>{product?.officialName ?? decision.recommendation.flavorNotes?.join(" / ")}</span>
          </div>
        </div>
      </section>

      <div className="kpi-grid">
        <Metric label="Agent 置信" value={`${decision.confidence}%`} note={decision.primaryIntent} />
        <Metric label="取餐 ETA" value={`${decision.selectedStore.pickupEtaMinutes} 分钟`} note={decision.selectedStore.name} />
        <Metric label="推荐接受率" value={`${acceptanceRate}%`} note="本地交互样本" />
        <Metric label="会员周期" value={`${member.lastOrderDays} 天`} note={member.lifecycleGoal} />
      </div>

      <section className="panel-card">
        <SectionTitle icon={<Bot size={16} />} title="Agent 编排" />
        <div className="agent-runway">
          {decision.agentTrace.map((step) => <TraceStep key={step.moduleId} step={step} />)}
        </div>
      </section>

      <section className="panel-card">
        <SectionTitle icon={<Store size={16} />} title="门店与履约" />
        <div className="store-strip">
          <div>
            <b>{decision.selectedStore.name}</b>
            <span>{decision.selectedStore.distanceMeters}m · 排队{queueLabel(decision.selectedStore.queueLevel)} · ETA {decision.selectedStore.pickupEtaMinutes} 分钟</span>
          </div>
          <div>
            <b>库存/吧台信号</b>
            <span>{decision.selectedStore.inventoryHighlights.join(" / ")}</span>
          </div>
          <div>
            <b>优惠解释</b>
            <span>{decision.couponPlan.explanation}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function DialogueCanvas({ member, scenario, decision }: { member: Member; scenario: Scenario; decision: AgentDecision }) {
  return (
    <div className="dialogue-layout">
      <section className="chat-board">
        <Message role="user" name={member.name}>
          {scenario.text}
        </Message>
        <Message role="agent" name="小鹿 Agent">
          我会按“{decision.primaryIntent}”处理：先用会员记忆避开 {member.avoid.join("、")}，再用门店 ETA 和券包做排序。推荐 {decision.recommendation.name}，{decision.recommendation.temperature} / {decision.recommendation.sugar}，模拟到手 ¥{decision.couponPlan.finalPrice}。
        </Message>
        <Message role="agent" name="执行确认">
          {decision.fallbackPlan.userCopy}
        </Message>
      </section>

      <section className="panel-card">
        <SectionTitle icon={<Zap size={16} />} title="对话背后的记忆" />
        <div className="memory-grid">
          {decision.memberMemory.map((item) => <p key={item}>{item}</p>)}
        </div>
      </section>
    </div>
  );
}

function StrategyCanvas({ decision }: { decision: AgentDecision }) {
  return (
    <div className="strategy-layout">
      <section className="panel-card">
        <SectionTitle icon={<Coffee size={16} />} title="候选商品召回" />
        <div className="score-list">
          {decision.candidateScores.map((item, index) => (
            <article className="score-row" key={item.productId}>
              <span className="rank">{index + 1}</span>
              <ProductThumb productId={item.productId} name={item.name} />
              <div>
                <b>{item.name}</b>
                <small>{item.reasons.join(" / ")}</small>
                {item.tradeoffs.length > 0 && <em>{item.tradeoffs.join(" / ")}</em>}
              </div>
              <meter min="0" max="100" value={item.score} />
              <strong>{item.score}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="panel-card split-panel">
        <div>
          <SectionTitle icon={<Ticket size={16} />} title="券包策略" />
          <p>{decision.couponPlan.explanation}</p>
        </div>
        <div>
          <SectionTitle icon={<ShieldCheck size={16} />} title="兜底策略" />
          <p><b>{decision.fallbackPlan.trigger}</b></p>
          <p>{decision.fallbackPlan.action}</p>
        </div>
      </section>

      <section className="panel-card">
        <SectionTitle icon={<History size={16} />} title="订单路径" />
        <ol className="path-list">
          {decision.orderPath.map((item) => <li key={item}>{item}</li>)}
        </ol>
      </section>
    </div>
  );
}

function GrowthCanvas({ decision, acceptanceRate }: { decision: AgentDecision; acceptanceRate: number }) {
  return (
    <div className="growth-layout">
      <section className="panel-card">
        <SectionTitle icon={<LineChart size={16} />} title="体验指标" />
        <div className="metric-stack">
          {experienceMetrics.map((item) => (
            <div key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label} · {item.delta}</span>
              <small>{item.note}</small>
            </div>
          ))}
        </div>
      </section>
      <section className="panel-card">
        <SectionTitle icon={<MessageSquareText size={16} />} title="增长回写" />
        <div className="nudge-card">
          <b>下一次触达文案</b>
          <p>{decision.wakeupMessage}</p>
        </div>
        <div className="impact-row">
          <span>接受率样本 {acceptanceRate}%</span>
          <span>点击提升 +{decision.estimatedImpact.clickRateLift}%</span>
          <span>唤醒提升 +{decision.estimatedImpact.wakeupLift}%</span>
          <span>复购周期 -{decision.estimatedImpact.repurchaseCycleReduction}h</span>
        </div>
        <p className="muted-block">{decision.repurchasePlan}</p>
      </section>
    </div>
  );
}

function ConnectorCanvas() {
  return (
    <div className="connector-layout">
      {dataConnectors.map((connector) => (
        <ConnectorCard key={connector.id} connector={connector} />
      ))}
      <section className="panel-card full-span">
        <SectionTitle icon={<ShieldCheck size={16} />} title="真实数据边界" />
        <p>
          商品、价格、库存、会员、券和支付都需要官方授权接口；当前页面用合成数据展示 Agent 架构，
          不能声明为瑞幸实时结果，也不会创建真实订单。
        </p>
      </section>
    </div>
  );
}

function ExecuteStudio({
  member,
  decision,
  activeStep,
  executionSteps,
  stepIndex,
  running,
  onRun,
  onPause,
  onReset
}: {
  member: Member;
  decision: AgentDecision;
  activeStep: AutoStep;
  executionSteps: AutoStep[];
  stepIndex: number;
  running: boolean;
  onRun: () => void;
  onPause: () => void;
  onReset: () => void;
}) {
  return (
    <section className="execute-studio">
      <div className="phone-zone">
        <div className="phone-frame">
          <PhoneApp member={member} decision={decision} activeStep={activeStep} />
        </div>
        <FloatingProgress activeStep={activeStep} stepIndex={stepIndex} total={executionSteps.length} running={running} />
      </div>

      <aside className="agent-cockpit">
        <div className="cockpit-head">
          <div>
            <small>GUI-Agent Cockpit</small>
            <h2>Observe · Think · Act</h2>
          </div>
          <div>
            <button onClick={running ? onPause : onRun}>{running ? <Pause size={16} /> : <Play size={16} />}</button>
            <button onClick={onReset}><RefreshCcw size={16} /></button>
          </div>
        </div>

        <div className="step-status">
          <span>Step {stepIndex + 1}/{executionSteps.length}</span>
          <meter min="0" max={executionSteps.length - 1} value={stepIndex} />
        </div>

        <div className="observe-card">
          <small>Observation</small>
          <p>{activeStep.observation}</p>
        </div>
        <div className="action-card">
          <small>Thought</small>
          <p>{activeStep.thought}</p>
          <div>
            <b>{activeStep.action}</b>
            <span>{activeStep.target}</span>
          </div>
        </div>

        <section className="memory-panel">
          <SectionTitle icon={<Zap size={16} />} title="Pinned Memory" />
          <p>{activeStep.memory}</p>
          <p>订单：{decision.recommendation.name} / {decision.recommendation.temperature} / {decision.recommendation.sugar}</p>
          <p>门店：{decision.selectedStore.name} / ETA {decision.selectedStore.pickupEtaMinutes} 分钟</p>
        </section>

        <section className="memory-panel guard">
          <SectionTitle icon={<ShieldCheck size={16} />} title="Guardrails" />
          <p>{activeStep.guardrail}</p>
          {decision.guardrails.slice(0, 3).map((item) => <p key={item}>{item}</p>)}
        </section>

        <section className="trace-panel">
          <SectionTitle icon={<History size={16} />} title="Action History" />
          {executionSteps.slice(0, stepIndex + 1).map((step, index) => (
            <div className="trace-row" key={step.id}>
              <span>{index + 1}</span>
              <div>
                <b>{step.action}</b>
                <small>{step.target}</small>
              </div>
            </div>
          ))}
        </section>
      </aside>
    </section>
  );
}

function InsightPanel({ member, decision }: { member: Member; decision: AgentDecision }) {
  return (
    <aside className="insight-panel">
      <section className="panel-card member-card">
        <SectionTitle icon={<UserRound size={16} />} title="会员画像" />
        <div className="member-head">
          <div>
            <b>{member.name}</b>
            <span>{segmentLabel(member.segment)} · {tierLabel(member.tier)} · {member.city}</span>
          </div>
          <strong>{member.points}</strong>
        </div>
        <p>{member.persona}</p>
        <div className="tag-row">
          {member.favoriteFlavors.map((item) => <span key={item}>{item}</span>)}
          {member.avoid.map((item) => <span className="warn" key={item}>{item}</span>)}
        </div>
      </section>

      <section className="panel-card">
        <SectionTitle icon={<ShieldCheck size={16} />} title="信任解释" />
        <div className="trust-list">
          {decision.trustExplanation.map((item) => <p key={item}>{item}</p>)}
        </div>
      </section>

      <section className="panel-card">
        <SectionTitle icon={<Ticket size={16} />} title="权益与最近订单" />
        <div className="coupon-list">
          {member.couponWallet.map((coupon) => (
            <div className="coupon" key={coupon.id}>
              <b>{coupon.name}</b>
              <span>满 ¥{coupon.threshold} 减 ¥{coupon.value} · {coupon.expiresInDays} 天后过期</span>
            </div>
          ))}
        </div>
        <div className="order-history">
          {member.recentOrders.map((order) => (
            <div key={`${order.product}-${order.daysAgo}`}>
              <b>{order.product}</b>
              <span>{order.temperature} / {order.sugar} · {order.daysAgo} 天前</span>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

function PhoneApp({ member, decision, activeStep }: { member: Member; decision: AgentDecision; activeStep: AutoStep }) {
  return (
    <div className="phone-app">
      <div className="phone-status">
        <span>13:14</span>
        <span>5G 82%</span>
      </div>
      <div className="app-header">
        <div>
          <small>当前位置</small>
          <strong>{decision.selectedStore.name}</strong>
        </div>
        <MapPin size={18} />
      </div>

      {activeStep.screen === "launch" && (
        <PhoneScreen title="小鹿正在启动点单">
          <div className="launch-logo">鹿</div>
          <p className="screen-note">读取授权：历史订单、券包、粗略位置、场景时间。</p>
        </PhoneScreen>
      )}

      {activeStep.screen === "home" && (
        <PhoneScreen title={`你好，${member.name}`}>
          <div className="promo-band">
            <b>今天这杯交给 Agent</b>
            <span>{decision.primaryIntent} · {decision.selectedStore.pickupEtaMinutes} 分钟快取</span>
          </div>
          <div className="app-menu-grid">
            <button>现在点单</button>
            <button>常购</button>
            <button>券包</button>
            <button>附近门店</button>
          </div>
        </PhoneScreen>
      )}

      {activeStep.screen === "search" && (
        <PhoneScreen title="搜索商品">
          <div className="search-box"><Search size={14} /> {decision.recommendation.name}</div>
          <ProductResult decision={decision} />
        </PhoneScreen>
      )}

      {activeStep.screen === "product" && (
        <PhoneScreen title="商品详情">
          <ProductHero decision={decision} />
          <div className="detail-list">
            <span>风味：{decision.recommendation.flavorNotes?.join(" / ")}</span>
            <span>标签：{decision.recommendation.nutritionTags?.join(" / ")}</span>
          </div>
        </PhoneScreen>
      )}

      {activeStep.screen === "customize" && (
        <PhoneScreen title="定制口味">
          <ChoiceGroup title="温度" active={decision.recommendation.temperature} items={["冰", "热"]} />
          <ChoiceGroup title="甜度" active={decision.recommendation.sugar} items={["无糖", "少糖", "半糖", "标准"]} />
          <div className="screen-confirm">已按画像避开：{member.avoid.join(" / ")}</div>
        </PhoneScreen>
      )}

      {activeStep.screen === "coupon" && (
        <PhoneScreen title="选择优惠">
          <div className="coupon-ticket">
            <b>{decision.couponPlan.couponName}</b>
            <span>模拟到手 ¥{decision.couponPlan.finalPrice}</span>
          </div>
          <p className="screen-note">{decision.couponPlan.explanation}</p>
        </PhoneScreen>
      )}

      {activeStep.screen === "store" && (
        <PhoneScreen title="选择门店">
          <div className="map-card">
            <div className="route-line" />
            <MapPin size={30} />
          </div>
          <div className="store-choice active">
            <b>{decision.selectedStore.name}</b>
            <span>{decision.selectedStore.distanceMeters}m · ETA {decision.selectedStore.pickupEtaMinutes} 分钟 · 排队{queueLabel(decision.selectedStore.queueLevel)}</span>
          </div>
        </PhoneScreen>
      )}

      {activeStep.screen === "confirm" && (
        <PhoneScreen title="确认订单">
          <OrderSummary decision={decision} />
          <button className="mock-pay">提交模拟订单</button>
        </PhoneScreen>
      )}

      {activeStep.screen === "cashier" && (
        <PhoneScreen title="支付前确认">
          <OrderSummary decision={decision} />
          <div className="pay-stop">
            <ShieldCheck size={20} />
            <b>已停止在支付前</b>
            <span>真实支付必须由用户二次确认，本 demo 不扣款。</span>
          </div>
        </PhoneScreen>
      )}
    </div>
  );
}

function PhoneScreen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="phone-screen">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function ProductResult({ decision }: { decision: AgentDecision }) {
  return (
    <div className="product-result">
      <ProductMedia decision={decision} compact />
      <div>
        <b>{decision.recommendation.name}</b>
        <span>{decision.recommendation.temperature} / {decision.recommendation.sugar}</span>
        <strong>¥{decision.recommendation.price}</strong>
      </div>
      <ChevronRight size={18} />
    </div>
  );
}

function ProductHero({ decision }: { decision: AgentDecision }) {
  return (
    <div className="phone-product-hero">
      <ProductMedia decision={decision} compact />
      <b>{decision.recommendation.name}</b>
      <span>{decision.recommendation.temperature} / {decision.recommendation.sugar} / ¥{decision.recommendation.price}</span>
      <small>{getProduct(decision)?.imageSourceName ?? "demo visual"}</small>
    </div>
  );
}

function ChoiceGroup({ title, active, items }: { title: string; active: string; items: string[] }) {
  return (
    <div className="choice-group">
      <b>{title}</b>
      <div>
        {items.map((item) => <span className={item === active ? "selected" : ""} key={item}>{item}</span>)}
      </div>
    </div>
  );
}

function OrderSummary({ decision }: { decision: AgentDecision }) {
  return (
    <div className="order-summary">
      <div>
        <b>{decision.recommendation.name}</b>
        <span>{decision.recommendation.temperature} / {decision.recommendation.sugar}</span>
      </div>
      <div>
        <span>{decision.couponPlan.couponName}</span>
        <strong>¥{decision.couponPlan.finalPrice}</strong>
      </div>
      <small>{decision.selectedStore.name} · ETA {decision.selectedStore.pickupEtaMinutes} 分钟</small>
    </div>
  );
}

function FloatingProgress({ activeStep, stepIndex, total, running }: { activeStep: AutoStep; stepIndex: number; total: number; running: boolean }) {
  return (
    <div className="floating-progress">
      <div>
        <span className={running ? "pulse-dot" : "pulse-dot idle"} />
        <b>{running ? "自动执行中" : "等待执行"}</b>
        <small>{stepIndex + 1}/{total}</small>
      </div>
      <p>{activeStep.action} · {activeStep.target}</p>
    </div>
  );
}

function ProductCup({ name }: { name: string }) {
  return (
    <div className="product-cup" aria-label={name}>
      <span className="cup-cap" />
      <span className="cup-shell">
        <i>luckin</i>
      </span>
      <span className="cup-shadow" />
    </div>
  );
}

function ProductMedia({ decision, compact = false }: { decision: AgentDecision; compact?: boolean }) {
  const product = getProduct(decision);
  if (!product?.imageUrl) return <ProductCup name={decision.recommendation.name} />;
  return (
    <figure className={compact ? "product-photo compact" : "product-photo"}>
      <img src={product.imageUrl} alt={product.officialName ?? decision.recommendation.name} />
      {!compact && (
        <figcaption>
          <span>{product.officialName}</span>
          <small>{product.imageSourceName}</small>
        </figcaption>
      )}
    </figure>
  );
}

function ProductThumb({ productId, name }: { productId: string; name: string }) {
  const product = menuCatalog.find((item) => item.id === productId);
  if (!product?.imageUrl) return <ProductCup name={name} />;
  return (
    <div className="product-thumb">
      <img src={product.imageUrl} alt={product.officialName ?? name} />
    </div>
  );
}

function TraceStep({ step }: { step: AgentTraceStep }) {
  return (
    <article className={`trace-step trace-${step.status}`}>
      <span>{statusLabel(step.status)}</span>
      <b>{step.moduleName}</b>
      <p>{step.summary}</p>
    </article>
  );
}

function Message({ role, name, children }: { role: "user" | "agent"; name: string; children: ReactNode }) {
  return (
    <article className={`message ${role}`}>
      <div className="avatar">{role === "user" ? "我" : "鹿"}</div>
      <div className="bubble">
        <small>{name}</small>
        <p>{children}</p>
      </div>
    </article>
  );
}

function ConnectorCard({ connector }: { connector: DataConnector }) {
  return (
    <section className="panel-card connector-card">
      <div className="connector-head">
        <SectionTitle icon={<Database size={16} />} title={connector.name} />
        <span className={`status-chip status-${connector.status}`}>{connectorStatus(connector.status)}</span>
      </div>
      <p>{connector.dataScope}</p>
      <b>权限边界</b>
      <p>{connector.permissionBoundary}</p>
      <b>UI 露出</b>
      <p>{connector.uiDisclosure}</p>
    </section>
  );
}

function buildExecutionSteps(member: Member, scenario: Scenario, decision: AgentDecision): AutoStep[] {
  return [
    {
      id: "launch",
      screen: "launch",
      observation: "手机停留在咖啡 Agent 工作台，任务尚未进入 App 点单流程。",
      thought: "先打开瑞幸式点单入口，并把用户需求写入置顶记忆。",
      action: "open(app='luckin mock')",
      target: "瑞幸点单模拟器",
      memory: `REMEMBER【计划】: 打开 App → 搜索 ${decision.recommendation.name} → 选规格 → 用券 → 选店 → 到支付前停止`,
      guardrail: "仅打开本地模拟器，不启动真实瑞幸 App。"
    },
    {
      id: "home",
      screen: "home",
      observation: `首页识别到 ${member.name} 的会员状态、附近门店和常购入口。`,
      thought: "当前场景是自然语言点单，优先走搜索/常购入口，减少用户找菜单。",
      action: "click(point='现在点单')",
      target: "首页 · 现在点单",
      memory: `REMEMBER【会员】: ${segmentLabel(member.segment)} / ${member.city} / 避忌 ${member.avoid.join("、")}`,
      guardrail: "不读取未授权通讯录、精确轨迹或支付信息。"
    },
    {
      id: "search",
      screen: "search",
      observation: `搜索框为空，候选商品最高分为 ${decision.candidateScores[0]?.score ?? decision.confidence}。`,
      thought: "按推荐结果直接输入商品名，避免被热门词或广告位干扰。",
      action: `type(content='${decision.recommendation.name}')`,
      target: "搜索框",
      memory: `REMEMBER【商品】: ${decision.recommendation.name}`,
      guardrail: "如果搜索无结果，回退到商品分类和最近订单。"
    },
    {
      id: "product",
      screen: "product",
      observation: `商品详情显示风味 ${decision.recommendation.flavorNotes?.join(" / ")}。`,
      thought: "商品满足主意图和会员偏好，可以进入规格选择。",
      action: "click(point='选择规格')",
      target: `${decision.recommendation.name} · 商品详情`,
      memory: `REMEMBER【推荐理由】: ${decision.recommendation.reason}`,
      guardrail: "商品价格和库存为 mock，不能写成官方实时。"
    },
    {
      id: "customize",
      screen: "customize",
      observation: `规格页可选择温度和甜度，用户避忌 ${member.avoid.join(" / ")}。`,
      thought: "默认选择画像推荐的温度和甜度，降低决策成本。",
      action: `click(${decision.recommendation.temperature}) + click(${decision.recommendation.sugar})`,
      target: "温度/甜度控件",
      memory: `REMEMBER【规格】: ${decision.recommendation.temperature} / ${decision.recommendation.sugar}`,
      guardrail: "若低糖信息解释不清，切换到低糖标签更明确的商品。"
    },
    {
      id: "coupon",
      screen: "coupon",
      observation: `券包存在 ${decision.couponPlan.couponName}，可把价格降至 ¥${decision.couponPlan.finalPrice}。`,
      thought: "优先核销即将过期且门槛匹配的券，并展示理由。",
      action: `click(coupon='${decision.couponPlan.couponName}')`,
      target: "券包列表",
      memory: `REMEMBER【券】: ${decision.couponPlan.couponName} / 到手 ¥${decision.couponPlan.finalPrice}`,
      guardrail: "不得暗示隐藏优惠或真实扣券。"
    },
    {
      id: "store",
      screen: "store",
      observation: `附近门店 ${decision.selectedStore.name}，ETA ${decision.selectedStore.pickupEtaMinutes} 分钟。`,
      thought: "选择距离、排队、库存综合最稳的门店。",
      action: `click(store='${decision.selectedStore.name}')`,
      target: "门店列表",
      memory: `REMEMBER【门店】: ${decision.selectedStore.name} / ${decision.selectedStore.distanceMeters}m`,
      guardrail: decision.selectedStore.riskFlags.join("；")
    },
    {
      id: "confirm",
      screen: "confirm",
      observation: "确认页已汇总商品、规格、券和门店，尚未进入真实支付。",
      thought: "检查订单四要素一致后，只提交模拟订单。",
      action: "click(button='提交模拟订单')",
      target: "确认订单页",
      memory: "REMEMBER【进度】: 商品、规格、券、门店均已确认",
      guardrail: "提交动作只更新本地 UI，不创建真实订单。"
    },
    {
      id: "cashier",
      screen: "cashier",
      observation: "页面到达支付前确认点，出现支付提示和订单摘要。",
      thought: "任务已到安全停止点，不能继续点击真实支付。",
      action: "complete(content='')",
      target: "支付前停止",
      memory: "REMEMBER【完成】: 已停在支付前确认页",
      guardrail: "真实支付必须用户二次确认，本 demo 不扣款。"
    }
  ];
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{note}</small>
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

function RailTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="rail-title">
      {icon}
      <span>{title}</span>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="section-title">
      {icon}
      <h3>{title}</h3>
    </div>
  );
}

function scenarioTitle(item: Scenario) {
  if (item.text.includes("提神")) return "会议前提神";
  if (item.text.includes("划算")) return "沉睡唤醒";
  if (item.text.includes("低糖")) return "低糖轻负担";
  return "老样子快取";
}

function flowClassName(moduleId: WorkspaceModule, activeModule: WorkspaceModule) {
  const current = moduleNav.findIndex((item) => item.id === activeModule);
  const target = moduleNav.findIndex((item) => item.id === moduleId);
  if (moduleId === activeModule) return "flow-step active";
  if (target < current) return "flow-step done";
  return "flow-step";
}

function moduleStatus(moduleId: WorkspaceModule, activeModule: WorkspaceModule) {
  const current = moduleNav.findIndex((item) => item.id === activeModule);
  const target = moduleNav.findIndex((item) => item.id === moduleId);
  if (moduleId === activeModule) return "进行中";
  if (target < current) return "已走过";
  return "待演示";
}

function getProduct(decision: AgentDecision) {
  return menuCatalog.find((item) => item.id === decision.recommendation.productId);
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

function tierLabel(tier: Member["tier"]) {
  const labels: Record<Member["tier"], string> = {
    newbie: "新人",
    silver: "银卡",
    gold: "金卡",
    diamond: "钻石"
  };
  return labels[tier];
}

function queueLabel(queue: AgentDecision["selectedStore"]["queueLevel"]) {
  const labels: Record<AgentDecision["selectedStore"]["queueLevel"], string> = {
    low: "较低",
    medium: "中等",
    high: "偏高"
  };
  return labels[queue];
}

function statusLabel(status: AgentTraceStep["status"]) {
  const labels: Record<AgentTraceStep["status"], string> = {
    used: "used",
    guarded: "guarded",
    fallback: "fallback"
  };
  return labels[status];
}

function connectorStatus(status: DataConnector["status"]) {
  const labels: Record<DataConnector["status"], string> = {
    mocked: "mocked",
    "ready-to-wire": "ready",
    blocked: "blocked"
  };
  return labels[status];
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
