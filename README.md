<div align="center">

# 小鹿 CoffeePlan

**把一句“想喝什么”，变成可解释、可执行、可回写的瑞幸咖啡 Agent**

2026 AI 先锋未来人才大赛 · 瑞幸咖啡命题参赛 Demo

[![Demo](https://img.shields.io/badge/Demo-GitHub%20Pages-0052D9?style=for-the-badge)](https://logcjj.github.io/luckin-loop-agent/)
[![Stack](https://img.shields.io/badge/Vite%20%2B%20React%20%2B%20TypeScript-local%20agent-111827?style=for-the-badge)](#快速开始)

无需任何 Key · 不接真实支付 · 商品图片来自公开官方菜单 · 手机/网页双体验

</div>

---

## 一句话定位

**小鹿 CoffeePlan** 不是“聊天点咖啡”的玩具，而是一个面向瑞幸 Agentic Commerce 的小满式咖啡助手：

> 用户只说一句“下午开会前想提神，别太甜，最好别排队”，Agent 就把意图、会员记忆、商品图、券包、门店、定位兜底、自动点单模拟和复购回写串成一条可解释链路。

它参考了小满的“左侧会话与生活入口 + 中间大聊天 + 右侧画布 + 手机设备视图”表达，也参考了多 Agent 项目的 Supervisor、记忆、工具、Guardrail、可观测链路，把咖啡消费做成一个能被评审快速理解的完整 demo。

## 为什么需要它

当用户入口迁移到系统助手、车机、社交搜索、浏览器 Agent 后，品牌不一定先拥有页面流量。瑞幸已有 App/小程序和 Lucky AI 点单基础，下一步机会不是再做一个客服，而是把外部入口里的模糊需求变成：

- 可解释推荐：为什么是这杯、为什么这个糖温、为什么用这张券。
- 可执行路径：附近门店、常购门店兜底、支付前停止。
- 可回写资产：接受/放弃/定位拒绝/支付前停止都回到会员运营策略。
- 可接入边界：商品图片可来自公开官方菜单；会员、券、支付必须走官方授权。

## 三幕体验

### 第一幕 · 先聊天懂你

默认打开是用户视图网页：中间是一块大的聊天窗口，不让用户先选场景，也不展示固定推荐。用户消息会正常显示，小鹿会先给几个候选方向让用户选；确认方向后再展开商品方案卡、真实咖啡图、到手价、取餐 ETA 和定位授权/常购门店兜底。切到手机后显示一台手机里的聊天与点单模拟器。

### 第二幕 · 给稳方案

右上角可切到商家视角。商家视角按小满结构组织：左侧是新的咖啡任务、最近对话、生活、记忆·进化、商家、接入·设置；中间是经营参谋主窗口；右侧是方案、门店、订单、记忆四个画布。模型设置、隐私授权、数据接入、可靠性评测和咖啡手账通过弹层展开。

### 第三幕 · 自动办到但停在支付前

点击“执行点单”后进入自动执行模块：手机大窗模拟瑞幸式点单流程，链路浮层显示 Observe / Action / Guardrail。所有流程必须停在支付前，不创建真实订单、不扣券、不扣款。

## 核心创新

| # | 创新点 | 说明 |
|---|---|---|
| 1 | 意图增长而非菜单客服 | 把“提神、低糖、划算、快取、老样子”变成可运营意图，而不是只返回商品列表。 |
| 2 | 会员记忆 + 门店履约联合排序 | 合成会员画像、偏好、避忌、券包、最近订单、城市门店、排队和 ETA 共同参与推荐。 |
| 3 | 真实商品视觉与来源边界 | 商品图片来自 Luckin Coffee US 官方公开菜单；价格、库存、会员和券保持 mock/blocked 声明。 |
| 4 | 手机/网页双体验 | 网页端是演示工作台，手机端是聊天起手；执行时才进入点单模拟与链路弹窗。 |
| 5 | GUI-Agent 执行护栏 | 自动执行采用 Observe → Think → Act → Guardrail 的链路展示，支付前停止。 |
| 6 | Adapter 接入蓝图 | 明确菜单、定位、会员、支付、门店履约各自的 reads/writes、权限、实现和 UI disclosure。 |

## 架构

```text
前端体验层
  用户视图
    网页大聊天 / 手机设备外框 / 空输入起手 / 追问引导 / 商品方案卡 / 执行前确认
  桌面三栏工作台
    左侧：任务/会话/生活/记忆·进化/商家/接入·设置
    中间：大聊天窗口 / 方案引导 / 一句话咖啡任务输入
    右侧：方案 / 门店 / 订单 / 记忆画布
  手机聊天体验
    对话起手 / 商品方案卡 / 定位授权与常购门店兜底 / 底部输入 / 执行链路弹窗

Agent 决策层
  Intent Router        识别提神、低糖、快捷复购、优惠尝新
  Member Memory        会员等级、偏好、避忌、券包、历史订单、信任风险
  Menu Store Tools     商品召回、门店排序、库存/排队/ETA mock
  Coupon Optimizer     券门槛、过期时间、模拟到手价
  Growth Loop          唤醒话术、复购策略、体验指标

执行与安全层
  GUI-Agent Simulator  手机大窗自动点单模拟
  Guardrail            支付前停止、不读隐私、不声明实时库存
  Fallback             拒绝定位 → 常购门店；排队高 → 换店/换杯

数据与接入层
  Official menu snapshot     公开官方菜单图与描述
  Synthetic demo fixtures    会员、券包、门店、价格、库存
  Adapter blueprints         菜单/定位/会员/支付/门店履约接入边界
```

## 真实数据边界

| 数据 | 当前状态 | 说明 |
|---|---|---|
| 商品图片 | 公开官方来源 | 来自 Luckin Coffee US 官方菜单公开页面和 CDN。 |
| 中文商品名/价格 | demo mock | 不代表瑞幸中国区实时菜单或价格。 |
| 门店距离/ETA/库存 | demo mock + 定位授权体验 | 浏览器定位只在用户点击后请求，不保存坐标；拒绝后走常购门店兜底。 |
| 会员等级/积分/券包 | synthetic demo | 真实接入必须官方登录授权，当前不抓取、不伪造。 |
| 下单/支付/扣券 | mock-only | 自动执行只到支付前确认，不创建真实订单。 |

更详细的来源和 adapter 设计见 [`docs/data-sample.md`](docs/data-sample.md)。

## 快速开始

```bash
npm install
npm run dev
```

可选：启用 Qwen 引导代理。真实 key 只放本机环境变量，不写进前端代码。

```bash
# 方式一：shell 环境变量
export DASHSCOPE_API_KEY="你的 key"
npm run llm:proxy
npm run dev
```

也可以把 `.env.example` 复制为 `.env.local` 后填入 key；`.env.local` 已被 `.gitignore` 忽略。代理会把本轮用户需求发给 Qwen 生成追问与摘要，但不写入仓库、不落库。

本地访问：

```text
http://localhost:5173/luckin-loop-agent/
```

生产构建：

```bash
npm run build
```

## 演示路径

1. 桌面打开 Demo，先看用户视图网页的大聊天窗口：没有固定推荐，用户消息会显示，但不会立刻锁定一杯咖啡。
2. 回答引导问题或输入一句需求，小鹿追问/归纳后才给方案。
3. 用右上角切到手机，展示一台手机里的聊天和接近官方 App 的点单模拟器。
4. 点击“执行点单”，展示菜单、搜索、商品详情、糖温、优惠、门店、官方 App 入口和支付前停止。
5. 切到商家视角，看左侧生活/记忆/商家/接入入口，以及右侧方案、门店、订单、记忆画布；再打开设置/数据接入弹层。

完整脚本见 [`docs/demo-walkthrough.md`](docs/demo-walkthrough.md)。

## 目录结构

```text
luckin-agent-submission/
├── README.md
├── docs/
│   ├── data-sample.md         # 数据来源、adapter 与隐私边界
│   ├── demo-design.md         # Demo 设计说明
│   ├── demo-walkthrough.md    # 演示脚本
│   ├── solution-brief.md      # 方案补充材料
│   └── submission-copy.md     # 报名表文案
├── src/
│   ├── data/demoData.ts       # 商品、会员、门店、来源、adapter mock
│   ├── logic/agent.ts         # 本地 Agent 决策
│   ├── main.tsx               # React 入口
│   ├── xiaomanLuckin.tsx      # 小满式桌面/手机 UI 与执行模拟
│   ├── styles.css             # 响应式视觉系统
│   └── types.ts               # 数据模型
└── goal/goal-2/               # Goal 工作流记录
```

## 交付物

- 报名表文案：[`docs/submission-copy.md`](docs/submission-copy.md)
- 方案补充材料：[`docs/solution-brief.md`](docs/solution-brief.md)
- Demo 设计：[`docs/demo-design.md`](docs/demo-design.md)
- 演示脚本：[`docs/demo-walkthrough.md`](docs/demo-walkthrough.md)
- 数据来源与 adapter：[`docs/data-sample.md`](docs/data-sample.md)
