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
import {
  adapterBlueprints,
  dataConnectors,
  dataSources,
  experienceMetrics,
  members,
  menuCatalog,
  scenarios
} from "./data/demoData";
import { generateDecision } from "./logic/agent";
import { buildLocalGuideCopy, requestGuideCopy, type GuideCopy } from "./logic/guide";
import type { AdapterBlueprint, AgentDecision, AgentTraceStep, DataConnector, DataSourceRecord, Member, Scenario } from "./types";
import "./styles.css";
import { XiaomanLuckinApp } from "./xiaomanLuckin";

type WorkspaceModule = "briefing" | "dialogue" | "strategy" | "execute" | "growth" | "connectors";
type ViewMode = "desktop" | "phone";
type SurfaceMode = "consumer" | "merchant";
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

const rightTabs: Array<{ id: WorkspaceModule; label: string; icon: ReactNode }> = [
  { id: "briefing", label: "方案", icon: <Coffee size={15} /> },
  { id: "strategy", label: "门店", icon: <Store size={15} /> },
  { id: "execute", label: "订单", icon: <Ticket size={15} /> },
  { id: "dialogue", label: "记忆", icon: <UserRound size={15} /> }
];

const officialOrderLinks = {
  appDownload: "https://m.luckincoffee.us/app/download",
  menu: "https://m.luckincoffee.us/menu",
  stores: "https://www.luckincoffee.us/stores",
  googlePlay: "https://play.google.com/store/apps/details?hl=en_US&id=com.luckin.client.us",
  appStore: "https://apps.apple.com/us/app/luckin-coffee-usa/id6744305418"
};

function App() {
  const [memberId, setMemberId] = useState(members[0].id);
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [request, setRequest] = useState("");
  const [draftRequest, setDraftRequest] = useState("");
  const [guidedChoice, setGuidedChoice] = useState("");
  const [activeModule, setActiveModule] = useState<WorkspaceModule>("briefing");
  const [surfaceMode, setSurfaceMode] = useState<SurfaceMode>("consumer");
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 760) return "phone";
    return "desktop";
  });
  const [isCompactViewport, setIsCompactViewport] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 700px)").matches;
  });
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [accepted, setAccepted] = useState(64);
  const [dismissed, setDismissed] = useState(18);
  const [guideCopy, setGuideCopy] = useState<GuideCopy>(() => buildLocalGuideCopy(members[0], generateDecision(members[0], scenarios[0], scenarios[0].text), false));

  const member = members.find((item) => item.id === memberId) ?? members[0];
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  const decisionRequest = [request.trim(), guidedChoice].filter(Boolean).join(" ") || scenario.text;
  const decision = useMemo(() => generateDecision(member, scenario, decisionRequest), [member, scenario, decisionRequest]);
  const executionSteps = useMemo(() => buildExecutionSteps(member, scenario, decision), [member, scenario, decision]);
  const activeStep = executionSteps[Math.min(stepIndex, executionSteps.length - 1)];
  const acceptanceRate = Math.round((accepted / Math.max(accepted + dismissed, 1)) * 100);
  const effectiveViewMode: ViewMode = isCompactViewport ? "phone" : viewMode;
  const hasUserRequest = request.trim().length > 0;
  const isGuiding = hasUserRequest && !guidedChoice;
  const planReady = hasUserRequest && Boolean(guidedChoice);
  const canSubmitRequest = hasUserRequest || draftRequest.trim().length > 0;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const syncViewport = () => setIsCompactViewport(media.matches);
    syncViewport();
    media.addEventListener("change", syncViewport);
    return () => media.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (!running) return;
    if (stepIndex >= executionSteps.length - 1) {
      setRunning(false);
      return;
    }
    const timer = window.setTimeout(() => setStepIndex((value) => value + 1), 1120);
    return () => window.clearTimeout(timer);
  }, [running, stepIndex, executionSteps.length]);

  useEffect(() => {
    let cancelled = false;
    const localGuide = buildLocalGuideCopy(member, decision, hasUserRequest);
    setGuideCopy(localGuide);
    if (!hasUserRequest) return;

    requestGuideCopy({
      request,
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
    }).then((nextGuide) => {
      if (!cancelled && nextGuide) setGuideCopy(nextGuide);
    });

    return () => {
      cancelled = true;
    };
  }, [request, hasUserRequest, member, decision]);

  function resetScenario(nextScenario: Scenario) {
    setScenarioId(nextScenario.id);
    setRequest("");
    setDraftRequest("");
    setGuidedChoice("");
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
    if (draftRequest.trim()) {
      setRequest(draftRequest.trim());
      setDraftRequest("");
      setGuidedChoice("");
      setActiveModule("dialogue");
      setRunning(false);
      setStepIndex(0);
      return;
    }
    if (!hasUserRequest || !planReady) return;
    setAccepted((value) => value + 1);
    startExecution();
  }

  function submitQuickRequest(value: string) {
    setDraftRequest(value);
    setRunning(false);
    setStepIndex(0);
  }

  function selectGuideChoice(value: string) {
    setGuidedChoice(value);
    setActiveModule("briefing");
    setRunning(false);
    setStepIndex(0);
  }

  function fallbackPlan() {
    setDismissed((value) => value + 1);
    setRunning(false);
    setActiveModule("strategy");
    const storeStep = executionSteps.findIndex((step) => step.screen === "store");
    setStepIndex(storeStep >= 0 ? storeStep : 0);
  }

  function switchSurfaceMode(nextMode: SurfaceMode) {
    setSurfaceMode(nextMode);
    setRunning(false);
    setStepIndex(0);
    setActiveModule("briefing");
    setGuidedChoice("");
    if (nextMode === "consumer" && request === scenario.text) setRequest("");
  }

  return (
    <main className={`product-shell view-${effectiveViewMode} mode-${surfaceMode}`}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">鹿</div>
          <div>
            <strong>小鹿 CoffeePlan</strong>
            <span>把今天这杯咖啡点得刚刚好</span>
          </div>
        </div>
        <div className="top-actions">
          <button className="loc-badge" onClick={() => setActiveModule("strategy")}>
            <MapPin size={14} />
            {member.city} · {decision.selectedStore.distanceMeters}m
          </button>
          <div className="surface-toggle" aria-label="surface mode">
            <button className={surfaceMode === "consumer" ? "active" : ""} onClick={() => switchSurfaceMode("consumer")}>
              用户
            </button>
            <button className={surfaceMode === "merchant" ? "active" : ""} onClick={() => switchSurfaceMode("merchant")}>
              商家
            </button>
          </div>
          <Pill icon={<Sparkles size={14} />} text="Qwen 可选" />
          <Pill icon={<ShieldCheck size={14} />} text="支付前停" />
          <div className="view-toggle top-view-toggle" aria-label="view mode">
            <button className={viewMode === "desktop" ? "active" : ""} onClick={() => setViewMode("desktop")}>
              <Monitor size={14} />
              电脑
            </button>
            <button className={viewMode === "phone" ? "active" : ""} onClick={() => setViewMode("phone")}>
              <Smartphone size={14} />
              手机
            </button>
          </div>
        </div>
      </header>

      <aside className="navigator">
        <button className="new-task-button" onClick={() => resetScenario(scenarios[0])}>
          <span>＋</span>
          新的咖啡
        </button>

        <section className="rail-session">
          <RailTitle icon={<History size={15} />} title="会话历史" />
          <button className="session-card active" onClick={() => setActiveModule("briefing")}>
            <b>会前 18 分钟提神</b>
            <span>{decision.recommendation.name} · {decision.selectedStore.pickupEtaMinutes} 分钟取餐</span>
          </button>
          <button className="session-card" onClick={() => setActiveModule("dialogue")}>
            <b>{member.name} 的会员记忆</b>
            <span>{tierLabel(member.tier)} · {member.lifecycleGoal}</span>
          </button>
        </section>

        <section className="rail-business-group">
          <RailTitle icon={<Coffee size={15} />} title="生活" />
          <div className="business-link-list">
            {guideQuestions.map((item) => (
              <button className="business-link" key={item} onClick={() => setDraftRequest(item)}>
                <span>{item}</span>
                <small>点一下放入输入框，不直接生成推荐</small>
              </button>
            ))}
          </div>
        </section>

        <section className="rail-business-group">
          <RailTitle icon={<UserRound size={15} />} title="记忆·进化" />
          <div className="business-link-list">
            {members.map((item) => (
              <button className={item.id === member.id ? "business-link active" : "business-link"} key={item.id} onClick={() => switchMember(item)}>
                <span>{item.name} 的咖啡记忆</span>
                <small>{segmentLabel(item.segment)} / {item.city}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="rail-business-group">
          <RailTitle icon={<Store size={15} />} title="商家" />
          <div className="business-link-list">
            <button className="business-link" onClick={() => setActiveModule("briefing")}>
              <span>方案看板</span>
              <small>商品 / 优惠 / 取餐</small>
            </button>
            <button className="business-link" onClick={() => setActiveModule("execute")}>
              <span>订单执行</span>
              <small>手机链路 / 支付前停</small>
            </button>
          </div>
        </section>

        <section className="rail-business-group">
          <RailTitle icon={<Compass size={15} />} title="接入·设置" />
          <div className="business-link-list">
            <button className="business-link" onClick={() => setActiveModule("connectors")}>
              <span>真实来源</span>
              <small>官方菜单 / App / Stores</small>
            </button>
          </div>
        </section>

        <section className="rail-privacy">
          <ShieldCheck size={15} />
          <div>
            <b>支付前停止</b>
            <span>商品图片可追溯；会员、券、库存与支付均为演示边界。</span>
          </div>
        </section>

        <button className="primary-command rail-execute" onClick={acceptPlan} disabled={isGuiding || (!draftRequest.trim() && !planReady)}>
            <Sparkles size={16} />
            {isGuiding ? "先选方向" : planReady ? "执行点单" : "发送需求"}
        </button>
      </aside>

      <section className="workspace">
        {surfaceMode === "consumer" ? (
          effectiveViewMode === "phone" ? (
            <ConsumerPhoneStage
              member={member}
              request={request}
              draftRequest={draftRequest}
              decision={decision}
              guideCopy={guideCopy}
              isGuiding={isGuiding}
              planReady={planReady}
              activeStep={activeStep}
              executionSteps={executionSteps}
              stepIndex={stepIndex}
              running={running}
              isExecuting={activeModule === "execute"}
              hasUserRequest={hasUserRequest}
              canSubmitRequest={canSubmitRequest}
              onRequestChange={setDraftRequest}
              onExecute={acceptPlan}
              onGuideChoice={selectGuideChoice}
              onPause={() => setRunning((value) => !value)}
              onQuickRequest={submitQuickRequest}
            />
          ) : (
            <ConsumerWebStage
              member={member}
              scenario={scenario}
              request={request}
              draftRequest={draftRequest}
              decision={decision}
              guideCopy={guideCopy}
              isGuiding={isGuiding}
              planReady={planReady}
              activeModule={activeModule}
              acceptanceRate={acceptanceRate}
              activeStep={activeStep}
              executionSteps={executionSteps}
              stepIndex={stepIndex}
              running={running}
              hasUserRequest={hasUserRequest}
              canSubmitRequest={canSubmitRequest}
              onRequestChange={setDraftRequest}
              onExecute={acceptPlan}
              onQuickRequest={submitQuickRequest}
              onGuideChoice={selectGuideChoice}
              onTabSelect={setActiveModule}
              onRun={startExecution}
              onPause={() => setRunning(false)}
              onReset={() => {
                setRunning(false);
                setStepIndex(0);
              }}
            />
          )
        ) : (
          <div className="desktop-workbench">
            <DesktopChatCenter
              member={member}
              scenario={scenario}
              request={request}
              draftRequest={draftRequest}
              decision={decision}
              guideCopy={guideCopy}
              isGuiding={isGuiding}
              planReady={planReady}
              canSubmitRequest={canSubmitRequest}
              onRequestChange={setDraftRequest}
              onAccept={acceptPlan}
              onGuideChoice={selectGuideChoice}
              onFallback={fallbackPlan}
              onScenarioSelect={resetScenario}
              onTabSelect={setActiveModule}
              hasUserRequest={hasUserRequest}
            />
            <RightCanvas
              activeModule={activeModule}
              member={member}
              scenario={scenario}
              decision={decision}
              acceptanceRate={acceptanceRate}
              activeStep={activeStep}
              executionSteps={executionSteps}
              stepIndex={stepIndex}
              running={running}
              onTabSelect={setActiveModule}
              onRun={startExecution}
              onPause={() => setRunning(false)}
              onReset={() => {
                setRunning(false);
                setStepIndex(0);
              }}
              hasUserRequest={hasUserRequest}
              planReady={planReady}
            />
          </div>
        )}
      </section>
    </main>
  );
}

function ConsumerPhoneStage({
  member,
  request,
  draftRequest,
  decision,
  guideCopy,
  isGuiding,
  planReady,
  activeStep,
  executionSteps,
  stepIndex,
  running,
  isExecuting,
  hasUserRequest,
  canSubmitRequest,
  onRequestChange,
  onExecute,
  onGuideChoice,
  onPause,
  onQuickRequest
}: {
  member: Member;
  request: string;
  draftRequest: string;
  decision: AgentDecision;
  guideCopy: GuideCopy;
  isGuiding: boolean;
  planReady: boolean;
  activeStep: AutoStep;
  executionSteps: AutoStep[];
  stepIndex: number;
  running: boolean;
  isExecuting: boolean;
  hasUserRequest: boolean;
  canSubmitRequest: boolean;
  onRequestChange: (value: string) => void;
  onExecute: () => void;
  onGuideChoice: (value: string) => void;
  onPause: () => void;
  onQuickRequest: (value: string) => void;
}) {
  return (
    <section className="consumer-phone-stage">
      <aside className="consumer-copy">
        <span>用户视图 · 手机</span>
        <h1>手机里，像真的点单一样走。</h1>
        <p>聊天先说需求，执行后进入接近官方 App 的点单模拟器：菜单、搜索、商品详情、糖温、优惠、门店、支付前确认。</p>
        <div className="consumer-prompts">
          {quickRequests.map((item) => (
            <button key={item.label} onClick={() => onQuickRequest(item.text)}>
              {item.label}
            </button>
          ))}
        </div>
      </aside>
      <div className="showcase-phone-frame">
        <PhoneExperience
          member={member}
          request={request}
          draftRequest={draftRequest}
          decision={decision}
          guideCopy={guideCopy}
          isGuiding={isGuiding}
          planReady={planReady}
          activeStep={activeStep}
          executionSteps={executionSteps}
          stepIndex={stepIndex}
          running={running}
          isExecuting={isExecuting}
          hasUserRequest={hasUserRequest}
          canSubmitRequest={canSubmitRequest}
          onRequestChange={onRequestChange}
          onExecute={onExecute}
          onGuideChoice={onGuideChoice}
          onPause={onPause}
          onQuickRequest={onQuickRequest}
        />
      </div>
    </section>
  );
}

function ConsumerWebStage({
  member,
  scenario,
  request,
  draftRequest,
  decision,
  guideCopy,
  isGuiding,
  planReady,
  activeModule,
  acceptanceRate,
  activeStep,
  executionSteps,
  stepIndex,
  running,
  hasUserRequest,
  canSubmitRequest,
  onRequestChange,
  onExecute,
  onQuickRequest,
  onGuideChoice,
  onTabSelect,
  onRun,
  onPause,
  onReset
}: {
  member: Member;
  scenario: Scenario;
  request: string;
  draftRequest: string;
  decision: AgentDecision;
  guideCopy: GuideCopy;
  isGuiding: boolean;
  planReady: boolean;
  activeModule: WorkspaceModule;
  acceptanceRate: number;
  activeStep: AutoStep;
  executionSteps: AutoStep[];
  stepIndex: number;
  running: boolean;
  hasUserRequest: boolean;
  canSubmitRequest: boolean;
  onRequestChange: (value: string) => void;
  onExecute: () => void;
  onQuickRequest: (value: string) => void;
  onGuideChoice: (value: string) => void;
  onTabSelect: (tab: WorkspaceModule) => void;
  onRun: () => void;
  onPause: () => void;
  onReset: () => void;
}) {
  return (
    <div className="desktop-workbench consumer-workbench">
      <section className="consumer-web-chat center-chat-window">
        <div className="web-chat-head">
          <div className="phone-logo">鹿</div>
          <div>
            <b>小鹿</b>
            <span>先聊需求，再给方案</span>
          </div>
        </div>
        <div className="web-chat-feed">
          <Message role="agent" name="小鹿">
            {guideCopy.opening}
          </Message>
          {!hasUserRequest ? (
            <article className="desktop-starter-card">
              <b>先聊两句，再推荐。</b>
              <p>输入框为空时不会展示固定推荐。可以先回答小鹿的问题，也可以直接写一句今天想怎么喝。</p>
              <div>
                {quickRequests.map((item) => (
                  <button key={item.label} onClick={() => onQuickRequest(item.text)}>{item.label}</button>
                ))}
              </div>
            </article>
          ) : isGuiding ? (
            <>
              <Message role="user" name="你">
                {request}
              </Message>
              <Message role="agent" name="小鹿正在理解">
                我已经收到你的描述。先按千问式对话逻辑给你几个方向，你选一个，我再展开具体咖啡方案。
              </Message>
              <GuideFollowups guideCopy={guideCopy} />
              <GuideChoiceCards decision={decision} onChoose={onGuideChoice} />
            </>
          ) : planReady ? (
            <>
              <Message role="user" name="你">
                {request}
              </Message>
              <Message role="agent" name="小鹿正在理解">
                我已按你选择的方向收窄方案，下面才进入商品、门店、优惠和执行边界。
              </Message>
              <GuideFollowups guideCopy={guideCopy} />
              <PhonePlanCard member={member} decision={decision} onExecute={onExecute} />
              <OfficialHandoffCard />
            </>
          ) : null}
        </div>
        <footer className="desktop-composer">
          <input type="password" value={draftRequest} onChange={(event) => onRequestChange(event.target.value)} placeholder="比如：开会前想提神，别太甜" aria-label="用户网页咖啡任务" autoComplete="off" />
          <button onClick={onExecute} aria-label={planReady ? "执行点单" : "发送需求"} disabled={!canSubmitRequest}>
            <Play size={18} />
          </button>
        </footer>
      </section>
      <RightCanvas
        activeModule={activeModule}
        member={member}
        scenario={scenario}
        decision={decision}
        acceptanceRate={acceptanceRate}
        activeStep={activeStep}
        executionSteps={executionSteps}
        stepIndex={stepIndex}
        running={running}
        onTabSelect={onTabSelect}
        onRun={onRun}
        onPause={onPause}
        onReset={onReset}
        hasUserRequest={hasUserRequest}
        planReady={planReady}
      />
    </div>
  );
}

const quickRequests = [
  { label: "我现在有点困", text: "我现在有点困，想喝点提神的，但别太甜。" },
  { label: "想喝轻一点", text: "今天想喝轻一点、低糖一点的咖啡，别太腻。" },
  { label: "我赶时间", text: "我赶时间，帮我选一杯快取、少折腾的。" }
];

const guideQuestions = [
  "你现在更想提神、解馋，还是轻负担？",
  "能接受甜一点吗，还是希望少糖/无糖？",
  "你更在意快取、价格，还是想试试新品？"
];

function DesktopChatCenter({
  member,
  scenario,
  request,
  draftRequest,
  decision,
  guideCopy,
  isGuiding,
  planReady,
  onRequestChange,
  onAccept,
  onGuideChoice,
  onFallback,
  onScenarioSelect,
  onTabSelect,
  hasUserRequest,
  canSubmitRequest
}: {
  member: Member;
  scenario: Scenario;
  request: string;
  draftRequest: string;
  decision: AgentDecision;
  guideCopy: GuideCopy;
  isGuiding: boolean;
  planReady: boolean;
  onRequestChange: (value: string) => void;
  onAccept: () => void;
  onGuideChoice: (value: string) => void;
  onFallback: () => void;
  onScenarioSelect: (scenario: Scenario) => void;
  onTabSelect: (tab: WorkspaceModule) => void;
  hasUserRequest: boolean;
  canSubmitRequest: boolean;
}) {
  return (
    <section className="center-chat-window">
      <header className="chat-window-head">
        <div>
          <span>{scenarioTitle(scenario)} · {scenario.weather}</span>
          <h1>先把咖啡任务聊清楚</h1>
        </div>
        <button onClick={() => onTabSelect("dialogue")}>
          <UserRound size={15} />
          画像
        </button>
      </header>

      <div className="desktop-chat-feed">
        <Message role="agent" name="小鹿">
          {guideCopy.opening}
        </Message>
        {isGuiding ? (
          <>
            <Message role="user" name="用户需求">
              {request}
            </Message>
            <Message role="agent" name="小鹿正在理解">
              已收到描述。我先拆成几个可选方向，选中后再展开商品、门店和优惠。
            </Message>
            <GuideFollowups guideCopy={guideCopy} />
            <GuideChoiceCards decision={decision} onChoose={onGuideChoice} />
          </>
        ) : planReady ? (
          <>
            <Message role="user" name="用户需求">
              {request}
            </Message>
            <Message role="agent" name="小鹿正在理解">
              方向已确认，现在展开这杯咖啡的方案和执行边界。
            </Message>
            <GuideFollowups guideCopy={guideCopy} />
            <article className="rich-answer-card">
              <div className="answer-product">
                <ProductMedia decision={decision} compact />
                <div>
                  <small>{decision.primaryIntent}</small>
                  <h2>{decision.recommendation.name}</h2>
                  <p>{decision.recommendation.reason}</p>
                </div>
              </div>
              <div className="answer-metrics">
                <span>{decision.confidence}% 稳</span>
                <span>{decision.selectedStore.pickupEtaMinutes} 分钟</span>
                <span>¥{decision.couponPlan.finalPrice}</span>
                <span>{decision.recommendation.temperature} / {decision.recommendation.sugar}</span>
              </div>
              <div className="answer-plan-grid">
                <div>
                  <b>门店</b>
                  <p>{decision.selectedStore.name}，{decision.selectedStore.distanceMeters}m，排队{queueLabel(decision.selectedStore.queueLevel)}。</p>
                </div>
                <div>
                  <b>优惠</b>
                  <p>{decision.couponPlan.explanation}</p>
                </div>
                <div>
                  <b>兜底</b>
                  <p>{decision.fallbackPlan.userCopy}</p>
                </div>
              </div>
              <div className="official-handoff-card compact">
                <b>真实点单入口</b>
                <p>商品与图片来自公开官方菜单；真正下单请跳转官方 App，支付由用户确认。</p>
                <div>
                  <a href={officialOrderLinks.appDownload} target="_blank" rel="noreferrer">打开官方 App</a>
                  <a href={officialOrderLinks.menu} target="_blank" rel="noreferrer">看官方菜单</a>
                </div>
              </div>
              <div className="answer-actions">
                <button onClick={onAccept}><Bot size={15} /> 执行点单</button>
                <button onClick={() => onTabSelect("briefing")}><Coffee size={15} /> 看方案</button>
                <button onClick={onFallback}><RefreshCcw size={15} /> 换兜底</button>
              </div>
            </article>
            <Message role="agent" name="执行前确认">
              如果你点“执行点单”，右侧执行面板和手机视图会展示自动点单链路；流程只会推进到官方下单入口或支付前确认，不创建真实订单、不扣券、不扣款。
            </Message>
          </>
        ) : (
          <article className="desktop-starter-card">
            <b>先说一句需求，小鹿再推荐。</b>
              <p>不用先选菜单或模板。可以告诉我今天的状态、口味、预算、取餐时间，或者直接点下面的灵感。</p>
            <div>
              {quickRequests.map((item) => (
                <button key={item.label} onClick={() => onRequestChange(item.text)}>{item.label}</button>
              ))}
            </div>
          </article>
        )}
      </div>

      <div className="chat-scenario-chips">
        {guideQuestions.map((item) => (
          <button key={item} onClick={() => onRequestChange(item)}>
            {item}
          </button>
        ))}
      </div>

      <footer className="desktop-composer">
        <input id="coffee-request" type="password" value={draftRequest} onChange={(event) => onRequestChange(event.target.value)} aria-label="一句话咖啡任务" autoComplete="off" />
        <button onClick={onAccept} aria-label={planReady ? "执行点单" : "发送需求"} disabled={!canSubmitRequest}>
          <Play size={18} />
        </button>
      </footer>
    </section>
  );
}

function RightCanvas({
  activeModule,
  member,
  scenario,
  decision,
  acceptanceRate,
  activeStep,
  executionSteps,
  stepIndex,
  running,
  onTabSelect,
  onRun,
  onPause,
  onReset,
  hasUserRequest,
  planReady
}: {
  activeModule: WorkspaceModule;
  member: Member;
  scenario: Scenario;
  decision: AgentDecision;
  acceptanceRate: number;
  activeStep: AutoStep;
  executionSteps: AutoStep[];
  stepIndex: number;
  running: boolean;
  onTabSelect: (tab: WorkspaceModule) => void;
  onRun: () => void;
  onPause: () => void;
  onReset: () => void;
  hasUserRequest: boolean;
  planReady: boolean;
}) {
  const normalizedTab = rightTabs.some((tab) => tab.id === activeModule) ? activeModule : "briefing";

  return (
    <aside className="right-canvas">
      <nav className="right-tabs" aria-label="right canvas tabs">
        {rightTabs.map((tab) => (
          <button className={normalizedTab === tab.id ? "active" : ""} key={tab.id} onClick={() => onTabSelect(tab.id)}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="right-canvas-body">
        {(!hasUserRequest || !planReady) && normalizedTab !== "connectors" ? (
          <AwaitingNeedPanel hasUserRequest={hasUserRequest} />
        ) : (
          <>
            {normalizedTab === "briefing" && (
              <BriefingCanvas
                member={member}
                scenario={scenario}
                decision={decision}
                acceptanceRate={acceptanceRate}
                onExecute={onRun}
              />
            )}
            {normalizedTab === "dialogue" && <InsightPanel member={member} decision={decision} />}
            {normalizedTab === "strategy" && <StrategyCanvas decision={decision} />}
            {normalizedTab === "growth" && <GrowthCanvas decision={decision} acceptanceRate={acceptanceRate} />}
            {normalizedTab === "execute" && (
              <ExecuteStudio
                member={member}
                decision={decision}
                activeStep={activeStep}
                executionSteps={executionSteps}
                stepIndex={stepIndex}
                running={running}
                onRun={onRun}
                onPause={onPause}
                onReset={onReset}
              />
            )}
            {normalizedTab === "connectors" && <ConnectorCanvas />}
          </>
        )}
      </div>
    </aside>
  );
}

function AwaitingNeedPanel({ hasUserRequest }: { hasUserRequest: boolean }) {
  return (
    <section className="awaiting-panel">
      <div className="awaiting-icon">鹿</div>
      <h2>{hasUserRequest ? "先选一个方向，再展开方案。" : "等用户说一句，再展开方案。"}</h2>
      <p>
        {hasUserRequest
          ? "小鹿已进入理解阶段，右侧暂不提前给商品和执行链路。用户确认偏好方向后，再展示门店、券包、画像和执行。"
          : "这里不会先塞固定推荐。用户说出状态、口味、预算或取餐时间后，才显示候选方向。"}
      </p>
      <div>
        <span>先聊需求</span>
        <span>选择方向</span>
        <span>再给方案</span>
        <span>执行前确认</span>
      </div>
    </section>
  );
}

function PhoneExperience({
  member,
  request,
  draftRequest,
  decision,
  guideCopy,
  isGuiding,
  planReady,
  activeStep,
  executionSteps,
  stepIndex,
  running,
  isExecuting,
  hasUserRequest,
  canSubmitRequest,
  onRequestChange,
  onExecute,
  onGuideChoice,
  onPause,
  onQuickRequest
}: {
  member: Member;
  request: string;
  draftRequest: string;
  decision: AgentDecision;
  guideCopy: GuideCopy;
  isGuiding: boolean;
  planReady: boolean;
  activeStep: AutoStep;
  executionSteps: AutoStep[];
  stepIndex: number;
  running: boolean;
  isExecuting: boolean;
  hasUserRequest: boolean;
  canSubmitRequest: boolean;
  onRequestChange: (value: string) => void;
  onExecute: () => void;
  onGuideChoice: (value: string) => void;
  onPause: () => void;
  onQuickRequest: (value: string) => void;
}) {
  const [locationMode, setLocationMode] = useState<"nearby" | "fallback">("nearby");
  const [geoState, setGeoState] = useState<"idle" | "requesting" | "granted" | "denied" | "unsupported">("idle");

  function requestNearbyStore() {
    if (!("geolocation" in navigator)) {
      setGeoState("unsupported");
      setLocationMode("fallback");
      return;
    }

    setGeoState("requesting");
    navigator.geolocation.getCurrentPosition(
      () => {
        setGeoState("granted");
        setLocationMode("nearby");
      },
      () => {
        setGeoState("denied");
        setLocationMode("fallback");
      },
      { enableHighAccuracy: false, maximumAge: 0, timeout: 4500 }
    );
  }

  return (
    <div className="phone-experience">
      <header className="phone-topbar">
        <div className="phone-logo">鹿</div>
        <div>
          <b>小鹿</b>
          <span>{locationMode === "nearby" ? `${member.city} · ${decision.selectedStore.distanceMeters}m` : "常购门店兜底"}</span>
        </div>
        <button onClick={onExecute} disabled={!planReady}>
          <Bot size={14} />
          执行
        </button>
      </header>

      {isExecuting ? (
        <section className="phone-execute-screen">
          <PhoneApp member={member} decision={decision} activeStep={activeStep} />
          <MobileChainSheet
            activeStep={activeStep}
            stepIndex={stepIndex}
            total={executionSteps.length}
            running={running}
            onPause={onPause}
          />
        </section>
      ) : (
        <>
          <section className="phone-chat-feed">
            <PhoneBubble role="agent" name="小鹿">
              {guideCopy.opening}
            </PhoneBubble>
            <PhoneLocationCard
              mode={locationMode}
              geoState={geoState}
              decision={decision}
              onUseNearby={requestNearbyStore}
              onUseFallback={() => {
                setGeoState("denied");
                setLocationMode("fallback");
              }}
            />
            {isGuiding ? (
              <>
                <PhoneBubble role="user" name="你">
                  {request}
                </PhoneBubble>
                <PhoneBubble role="agent" name="小鹿正在理解">
                  我已收到你的描述。先选一个方向，再给具体这杯。
                </PhoneBubble>
                <MobileGuideFollowups guideCopy={guideCopy} />
                <MobileGuideChoices decision={decision} onChoose={onGuideChoice} />
              </>
            ) : planReady ? (
              <>
                <PhoneBubble role="user" name="你">
                  {request}
                </PhoneBubble>
                <PhoneBubble role="agent" name="小鹿正在理解">
                  方向已确认，现在给你这杯方案。
                </PhoneBubble>
                <MobileGuideFollowups guideCopy={guideCopy} />
                <PhonePlanCard member={member} decision={decision} onExecute={onExecute} />
                <PhoneBubble role="agent" name="执行前确认">
                  已按 {decision.primaryIntent} 匹配 {decision.recommendation.name}，{decision.recommendation.temperature} / {decision.recommendation.sugar}，模拟到手 ¥{decision.couponPlan.finalPrice}。点执行后进入手机点单模拟，链路会用弹窗显示，并停在支付前。
                </PhoneBubble>
              </>
            ) : (
              <PhoneStarterCard onQuickRequest={onQuickRequest} />
            )}
          </section>

          <section className="phone-quick-row">
            {quickRequests.map((item) => (
              <button key={item.label} onClick={() => onQuickRequest(item.text)}>
                {item.label}
              </button>
            ))}
          </section>

          <nav className="phone-tabbar" aria-label="手机底部导航">
            <button className="active"><MessageSquareText size={18} /><span>对话</span></button>
            <button><Coffee size={18} /><span>方案</span></button>
            <button><MapPin size={18} /><span>门店</span></button>
            <button><Ticket size={18} /><span>订单</span></button>
          </nav>

          <footer className="phone-composer">
            <input type="password" value={draftRequest} onChange={(event) => onRequestChange(event.target.value)} placeholder="比如：开会前想提神，别太甜" aria-label="手机端咖啡任务" autoComplete="off" />
            <button onClick={onExecute} aria-label={planReady ? "执行点单" : "发送需求"} disabled={!canSubmitRequest}>
              <Play size={17} />
            </button>
          </footer>
        </>
      )}
    </div>
  );
}

function PhoneStarterCard({ onQuickRequest }: { onQuickRequest: (value: string) => void }) {
  return (
    <article className="phone-starter-card">
      <b>先说说你现在的状态。</b>
      <p>不用先选菜单或模板。小鹿会继续追问口味、甜度、取餐时间，再给方案。</p>
      <ul>
        {guideQuestions.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <div>
        {quickRequests.map((item) => (
          <button key={item.label} onClick={() => onQuickRequest(item.text)}>{item.label}</button>
        ))}
      </div>
    </article>
  );
}

function PhoneLocationCard({
  mode,
  geoState,
  decision,
  onUseNearby,
  onUseFallback
}: {
  mode: "nearby" | "fallback";
  geoState: "idle" | "requesting" | "granted" | "denied" | "unsupported";
  decision: AgentDecision;
  onUseNearby: () => void;
  onUseFallback: () => void;
}) {
  const statusCopy = {
    idle: "未请求精确定位",
    requesting: "正在请求浏览器授权",
    granted: "已授权，本轮不保存坐标",
    denied: "已拒绝，走常购门店",
    unsupported: "浏览器不支持定位"
  }[geoState];

  return (
    <article className="phone-location-card">
      <div>
        <MapPin size={16} />
        <b>{mode === "nearby" ? "粗略定位已用于选店" : "已切到常购门店兜底"}</b>
      </div>
      <p>
        {mode === "nearby"
          ? `${decision.selectedStore.name} · ${decision.selectedStore.distanceMeters}m · ETA ${decision.selectedStore.pickupEtaMinutes} 分钟。`
          : "不读取实时位置，沿用最近订单/常购门店和城市级信号，仍会在支付前让用户确认门店。"}
      </p>
      <small>{statusCopy}</small>
      <div>
        <button className={mode === "nearby" ? "active" : ""} onClick={onUseNearby}>
          {geoState === "requesting" ? "授权中..." : "用附近门店"}
        </button>
        <button className={mode === "fallback" ? "active" : ""} onClick={onUseFallback}>拒绝定位</button>
      </div>
    </article>
  );
}

function PhoneBubble({ role, name, children }: { role: "user" | "agent"; name: string; children: ReactNode }) {
  return (
    <article className={`phone-bubble ${role}`}>
      <div className="phone-avatar">{role === "agent" ? "鹿" : "我"}</div>
      <div>
        <small>{name}</small>
        <p>{children}</p>
      </div>
    </article>
  );
}

function GuideFollowups({ guideCopy }: { guideCopy: GuideCopy }) {
  return (
    <article className="guide-followups">
      <b>{guideCopy.summary}</b>
      <div>
        {guideCopy.followUps.map((item) => <span key={item}>{item}</span>)}
      </div>
      <small>{guideCopy.source === "qwen" ? "Qwen 引导" : "本地引导"}</small>
    </article>
  );
}

function GuideChoiceCards({ decision, onChoose }: { decision: AgentDecision; onChoose: (value: string) => void }) {
  return (
    <section className="guide-choice-grid">
      {buildGuideChoices(decision).map((choice) => (
        <button key={choice.id} onClick={() => onChoose(choice.value)}>
          <span>{choice.kicker}</span>
          <b>{choice.title}</b>
          <p>{choice.description}</p>
          <small>{choice.meta}</small>
        </button>
      ))}
    </section>
  );
}

function MobileGuideChoices({ decision, onChoose }: { decision: AgentDecision; onChoose: (value: string) => void }) {
  return (
    <section className="mobile-guide-choices">
      {buildGuideChoices(decision).map((choice) => (
        <button key={choice.id} onClick={() => onChoose(choice.value)}>
          <span>{choice.kicker}</span>
          <b>{choice.title}</b>
          <small>{choice.meta}</small>
        </button>
      ))}
    </section>
  );
}

function MobileGuideFollowups({ guideCopy }: { guideCopy: GuideCopy }) {
  return (
    <article className="mobile-guide-followups">
      <b>{guideCopy.summary}</b>
      {guideCopy.followUps.map((item) => <span key={item}>{item}</span>)}
    </article>
  );
}

function buildGuideChoices(decision: AgentDecision) {
  const candidates = decision.candidateScores.slice(0, 3);
  const fallback = [
    { name: decision.recommendation.name, score: decision.confidence, reasons: [decision.primaryIntent], tradeoffs: [] },
    { name: "轻负担低糖", score: 82, reasons: ["少糖", "不腻"], tradeoffs: ["提神弱一点"] },
    { name: "快取少折腾", score: 78, reasons: ["门店近", "出杯稳"], tradeoffs: ["新品感弱"] }
  ];
  const source = candidates.length >= 3 ? candidates : fallback;
  const labels = ["稳妥一点", "轻一点", "快一点"];

  return source.slice(0, 3).map((item, index) => ({
    id: `${item.name}-${index}`,
    kicker: labels[index],
    title: item.name,
    description: item.reasons.join(" / ") || "按当前状态继续收窄",
    meta: `${item.score}% 匹配${item.tradeoffs.length ? ` · ${item.tradeoffs[0]}` : ""}`,
    value: `${labels[index]}：${item.name}。${item.reasons.join("，")}`
  }));
}

function PhonePlanCard({ member, decision, onExecute }: { member: Member; decision: AgentDecision; onExecute: () => void }) {
  return (
    <article className="phone-plan-card">
      <ProductMedia decision={decision} compact />
      <div className="phone-plan-main">
        <small>为 {member.name} 生成</small>
        <h3>{decision.recommendation.name}</h3>
        <p>{decision.recommendation.reason}</p>
        <div className="phone-plan-tags">
          <span>{decision.confidence}% 稳</span>
          <span>{decision.selectedStore.pickupEtaMinutes} 分钟</span>
          <span>¥{decision.couponPlan.finalPrice}</span>
        </div>
      </div>
      <button onClick={onExecute}>
        <Bot size={15} />
        执行点单
      </button>
    </article>
  );
}

function OfficialHandoffCard() {
  return (
    <article className="official-handoff-card">
      <b>接近真实点单的地方</b>
      <p>商品图和菜单入口接官方公开来源；真实下单需要跳转官方 App，由用户自己确认门店、券和付款。</p>
      <div>
        <a href={officialOrderLinks.appDownload} target="_blank" rel="noreferrer">官方 App</a>
        <a href={officialOrderLinks.menu} target="_blank" rel="noreferrer">官方菜单</a>
        <a href={officialOrderLinks.stores} target="_blank" rel="noreferrer">官方门店</a>
      </div>
    </article>
  );
}

function MobileChainSheet({
  activeStep,
  stepIndex,
  total,
  running,
  onPause
}: {
  activeStep: AutoStep;
  stepIndex: number;
  total: number;
  running: boolean;
  onPause: () => void;
}) {
  return (
    <aside className="mobile-chain-sheet">
      <div className="sheet-grip" />
      <div className="sheet-head">
        <div>
          <b>{running ? "执行链路运行中" : "执行链路暂停"}</b>
          <span>Step {stepIndex + 1}/{total}</span>
        </div>
        <button onClick={onPause}>{running ? <Pause size={15} /> : <Play size={15} />}</button>
      </div>
      <meter min="0" max={total - 1} value={stepIndex} />
      <div className="sheet-step">
        <small>Observe</small>
        <p>{activeStep.observation}</p>
      </div>
      <div className="sheet-action">
        <small>Action</small>
        <b>{activeStep.action}</b>
        <span>{activeStep.target}</span>
      </div>
    </aside>
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
          <input id="coffee-request" type="password" value={request} onChange={(event) => onRequestChange(event.target.value)} autoComplete="off" />
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
        <Metric label="小鹿把握" value={`${decision.confidence}%`} note={decision.primaryIntent} />
        <Metric label="取餐 ETA" value={`${decision.selectedStore.pickupEtaMinutes} 分钟`} note={decision.selectedStore.name} />
        <Metric label="推荐接受率" value={`${acceptanceRate}%`} note="本地交互样本" />
        <Metric label="会员周期" value={`${member.lastOrderDays} 天`} note={member.lifecycleGoal} />
      </div>

      <section className="panel-card">
        <SectionTitle icon={<Bot size={16} />} title="决策链路" />
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

function DialogueCanvas({ member, decision }: { member: Member; scenario: Scenario; decision: AgentDecision }) {
  return (
    <div className="dialogue-layout">
      <section className="chat-board">
        <Message role="agent" name="小鹿正在理解">
          用户描述已收到，这里不复述原文。先把状态、口味、门店和优惠边界问清楚。
        </Message>
        <Message role="agent" name="小鹿">
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
      <section className="panel-card full-span source-board">
        <SectionTitle icon={<Database size={16} />} title="公开来源与可用范围" />
        <div className="source-grid">
          {dataSources.map((source) => <SourceCard key={source.id} source={source} />)}
        </div>
      </section>

      <section className="panel-card full-span">
        <SectionTitle icon={<Zap size={16} />} title="Adapter 蓝图" />
        <div className="adapter-grid">
          {adapterBlueprints.map((adapter) => <AdapterCard key={adapter.id} adapter={adapter} />)}
        </div>
      </section>

      <section className="panel-card connector-summary">
        <SectionTitle icon={<Database size={16} />} title="数据域状态" />
        <div className="connector-status-list">
          {dataConnectors.map((connector) => (
            <ConnectorCard key={connector.id} connector={connector} />
          ))}
        </div>
      </section>

      <section className="panel-card full-span">
        <SectionTitle icon={<ShieldCheck size={16} />} title="真实数据边界" />
        <p>
          商品图片来自公开官方菜单页面；价格、库存、会员、券和支付都需要官方授权接口。当前页面用合成数据展示引导结构，
          不能声明为瑞幸中国区实时结果，也不会创建真实订单、扣券或扣款。
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
            <small>执行观察台</small>
            <h2>观察 · 判断 · 操作</h2>
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
        <PhoneScreen title="Luckin Coffee">
          <div className="launch-logo">鹿</div>
          <p className="screen-note">模拟打开官方点单入口；真实下单会跳转官方 App，由用户确认登录和支付。</p>
          <div className="official-link-row">
            <a href={officialOrderLinks.appDownload} target="_blank" rel="noreferrer">Get the App</a>
            <a href={officialOrderLinks.menu} target="_blank" rel="noreferrer">Menu</a>
            <a href={officialOrderLinks.stores} target="_blank" rel="noreferrer">Stores</a>
          </div>
        </PhoneScreen>
      )}

      {activeStep.screen === "home" && (
        <PhoneScreen title={`你好，${member.name}`}>
          <div className="promo-band">
            <b>Order ahead</b>
            <span>{decision.primaryIntent} · {decision.selectedStore.pickupEtaMinutes} 分钟快取 · 官方 App 付款</span>
          </div>
          <div className="official-source-note">参考 Luckin Coffee US App / Menu / Stores 公开入口；本地只模拟操作。</div>
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
          <div className="menu-category-tabs">
            <span className="active">推荐</span>
            <span>拿铁</span>
            <span>美式</span>
            <span>果咖</span>
          </div>
          <ProductResult decision={decision} />
          <div className="official-source-note">商品图片来自 Luckin Coffee US 官方菜单公开 CDN。</div>
        </PhoneScreen>
      )}

      {activeStep.screen === "product" && (
        <PhoneScreen title="商品详情">
          <ProductHero decision={decision} />
          <div className="detail-list">
            <span>风味：{decision.recommendation.flavorNotes?.join(" / ")}</span>
            <span>标签：{decision.recommendation.nutritionTags?.join(" / ")}</span>
            <span>来源：{getProduct(decision)?.imageSourceName ?? "公开菜单参考"}</span>
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
          <div className="official-source-note">真实优惠券需官方账号授权；这里不扣券。</div>
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
          <a className="store-official-link" href={officialOrderLinks.stores} target="_blank" rel="noreferrer">打开官方门店页</a>
        </PhoneScreen>
      )}

      {activeStep.screen === "confirm" && (
        <PhoneScreen title="确认订单">
          <OrderSummary decision={decision} />
          <button className="mock-pay">生成官方 App 下单草稿</button>
          <OfficialHandoffCard />
        </PhoneScreen>
      )}

      {activeStep.screen === "cashier" && (
        <PhoneScreen title="官方 App 支付前">
          <OrderSummary decision={decision} />
          <div className="pay-stop">
            <ShieldCheck size={20} />
            <b>已交给官方 App / 支付前停止</b>
            <span>真实下单、券和付款必须在官方 App 里由用户确认。</span>
          </div>
          <div className="official-link-row">
            <a href={officialOrderLinks.appDownload} target="_blank" rel="noreferrer">打开官方 App</a>
            <a href={officialOrderLinks.googlePlay} target="_blank" rel="noreferrer">Google Play</a>
            <a href={officialOrderLinks.appStore} target="_blank" rel="noreferrer">App Store</a>
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
    <article className="connector-card">
      <div className="connector-head">
        <SectionTitle icon={<Database size={16} />} title={connector.name} />
        <span className={`status-chip status-${connector.status}`}>{connectorStatus(connector.status)}</span>
      </div>
      <p>{connector.dataScope}</p>
      <b>权限边界</b>
      <p>{connector.permissionBoundary}</p>
      <b>UI 露出</b>
      <p>{connector.uiDisclosure}</p>
    </article>
  );
}

function SourceCard({ source }: { source: DataSourceRecord }) {
  return (
    <article className="source-card">
      <div>
        <span className={`source-kind kind-${source.kind}`}>{sourceKind(source.kind)}</span>
        <small>{source.lastChecked}</small>
      </div>
      <b>{source.name}</b>
      <p>{source.evidence}</p>
      {source.sourceUrl && <a href={source.sourceUrl} target="_blank" rel="noreferrer">查看来源</a>}
      <dl>
        <dt>可用于</dt>
        <dd>{source.canUseFor.join(" / ")}</dd>
        <dt>不可用于</dt>
        <dd>{source.cannotUseFor.join(" / ")}</dd>
      </dl>
    </article>
  );
}

function AdapterCard({ adapter }: { adapter: AdapterBlueprint }) {
  return (
    <article className="adapter-card">
      <div className="adapter-head">
        <b>{adapter.name}</b>
        <span className={`adapter-status adapter-${adapter.status}`}>{adapterStatus(adapter.status)}</span>
      </div>
      <p>{adapter.implementation}</p>
      <div className="adapter-columns">
        <div>
          <small>读取</small>
          <span>{adapter.reads.join(" / ")}</span>
        </div>
        <div>
          <small>写入</small>
          <span>{adapter.writes.join(" / ")}</span>
        </div>
      </div>
      <div className="adapter-guard">
        <ShieldCheck size={15} />
        <span>{adapter.guardrail}</span>
      </div>
      <small className="adapter-disclosure">{adapter.uiDisclosure}</small>
    </article>
  );
}

function buildExecutionSteps(member: Member, scenario: Scenario, decision: AgentDecision): AutoStep[] {
  return [
    {
      id: "launch",
      screen: "launch",
      observation: "手机停留在小鹿聊天页，尚未进入官方点单入口。",
      thought: "先打开接近 Luckin Coffee 官方 App 的点单模拟器，并准备官方 App/Menu/Stores 跳转。",
      action: "open(source='Luckin official app entry')",
      target: "官方 App 点单入口模拟",
      memory: `REMEMBER【计划】: 打开官方入口 → 搜索 ${decision.recommendation.name} → 选规格 → 用券 → 选店 → 跳转官方 App / 支付前停止`,
      guardrail: "本地只模拟操作；真实下单必须交给官方 App 和用户确认。"
    },
    {
      id: "home",
      screen: "home",
      observation: `首页显示 Order ahead、常购、券包、附近门店入口，类似官方 App 的点单路径。`,
      thought: "当前入口是自然语言点单，优先走搜索/常购入口，减少用户找菜单。",
      action: "click(point='现在点单')",
      target: "首页 · 现在点单",
      memory: `REMEMBER【会员】: ${segmentLabel(member.segment)} / ${member.city} / 避忌 ${member.avoid.join("、")}`,
      guardrail: "不读取未授权通讯录、精确轨迹或支付信息。"
    },
    {
      id: "search",
      screen: "search",
      observation: `菜单页展示分类 tab 和官方菜单商品图，候选商品最高分为 ${decision.candidateScores[0]?.score ?? decision.confidence}。`,
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
      observation: "确认页已汇总商品、规格、券和门店，并展示官方 App 下单入口。",
      thought: "检查订单四要素一致后，只生成官方 App 下单草稿，不创建真实订单。",
      action: "click(button='生成官方 App 下单草稿')",
      target: "确认订单页",
      memory: "REMEMBER【进度】: 商品、规格、券、门店均已确认",
      guardrail: "本地草稿只用于演示，真实订单必须在官方 App 中完成。"
    },
    {
      id: "cashier",
      screen: "cashier",
      observation: "页面到达官方 App 支付前交接点，出现 App Store / Google Play / 官方 App 入口。",
      thought: "任务已到安全停止点，不能代替用户完成真实支付。",
      action: "handoff(to='official Luckin app')",
      target: "官方 App / 支付前停止",
      memory: "REMEMBER【完成】: 已生成官方 App 交接入口并停在支付前",
      guardrail: "真实下单、券和付款必须在官方 App 里由用户确认。"
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
    used: "已采用",
    guarded: "已校验",
    fallback: "兜底"
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

function sourceKind(kind: DataSourceRecord["kind"]) {
  const labels: Record<DataSourceRecord["kind"], string> = {
    "official-menu": "official menu",
    "official-site": "official site",
    "browser-api": "browser API",
    "synthetic-demo": "synthetic",
    "blocked-private": "blocked"
  };
  return labels[kind];
}

function adapterStatus(status: AdapterBlueprint["status"]) {
  const labels: Record<AdapterBlueprint["status"], string> = {
    "implemented-snapshot": "snapshot",
    "ready-to-wire": "ready",
    "mock-only": "mock",
    blocked: "blocked"
  };
  return labels[status];
}

const rootElement = document.getElementById("root")! as HTMLElement & {
  _luckinRoot?: ReturnType<typeof createRoot>;
};
const root = rootElement._luckinRoot ?? createRoot(rootElement);
rootElement._luckinRoot = root;

root.render(
  <StrictMode>
    <XiaomanLuckinApp />
  </StrictMode>
);
