# 数据样例与真实来源边界

当前 demo 的推荐、会员、券包、门店和履约状态仍使用本地合成数据，位于 `src/data/demoData.ts`。商品视觉使用公开可追溯来源，但不代表瑞幸中国区实时菜单、价格或库存。

## 公开来源

| 来源 | 用途 | 不可用于 |
|---|---|---|
| Luckin Coffee US Signature Lattes: `https://www.luckincoffee.us/menu/signature-lattes` | Coconut Latte、Velvet Latte 等官方商品图和英文描述 | 中国区实时价格、库存、券包、会员 |
| Luckin Coffee US Fruity Americano: `https://www.luckincoffee.us/menu/fruity-americano` | Orange Americano 等果咖图片和公开描述 | 中国区橙 C 美式实时售卖状态 |
| Luckin Coffee US Single Origin Espresso: `https://www.luckincoffee.us/menu/single-origin-espresso` | Americano、Flat White 类官方图片 | 中国区 SKU 精确映射、实时库存 |
| Browser Geolocation API | 演示“授权定位 / 拒绝定位”体验 | 后台持续定位、保存轨迹、真实瑞幸门店匹配 |

页面中的图片来自公开官方菜单 CDN；中文商品名、价格、券、门店 ETA、库存和会员权益是 demo mock。

## 会员样本

| 会员 | 分层 | 城市 | 核心偏好 | 关键运营问题 |
|---|---|---|---|---|
| 陈晨 | 活跃会员 | 上海 | 生椰、拿铁、少糖 | 需要下午提神，介意排队和甜度 |
| 小周 | 沉睡会员 | 杭州 | 果咖、冰饮、尝新 | 21 天未下单，价格敏感，券快过期 |
| Ada | 新会员 | 深圳 | 低糖、轻负担、茶咖 | 需要成分和健康解释 |
| 老李 | 忠诚会员 | 北京 | 美式、热饮、固定口味 | 需要老样子和快取路径 |

## 场景样本

| 场景 | 入口 | 距离 | 示例需求 |
|---|---|---:|---|
| 会议前提神 | 系统级 Agent | 180m | 下午开会前想喝点提神，但别太甜，最好别排队。 |
| 沉睡唤醒 | 社交搜索 | 420m | 好久没喝了，有没有今天划算又不踩雷的新品？ |
| 低糖轻负担 | 瑞幸 App | 260m | 想来一杯轻一点的，低糖，下午不会太负担。 |
| 老样子快取 | 小程序 | 120m | 老样子，赶时间，帮我选最近能快取的店。 |

## 决策输出

Agent 输出结构包含：

- 主意图与辅助意图。
- 置信度。
- 会员记忆。
- 推荐饮品。
- 优惠券方案。
- 下单路径。
- 唤醒话术。
- 复购计划。
- 信任解释。
- 预估业务影响。

## Adapter 蓝图

| Adapter | 当前状态 | 读取 | 写入/展示 | 边界 |
|---|---|---|---|---|
| 官方菜单图片 Snapshot Adapter | 已实现快照 | 公开官网商品名、描述、图片 URL | `CoffeeProduct.imageUrl`、`officialName`、`sourceNote` | 必须标注来源，不声称中国区实时 |
| 定位授权与门店兜底 Adapter | 可接真实接口 | 浏览器定位授权结果、城市 mock 门店、最近订单门店 | 本轮 locationMode、门店解释、fallback 文案 | 用户点击触发；不保存精确坐标 |
| 会员权益 Adapter | blocked | 官方 OAuth 后会员等级、积分、券包、历史订单 | 会员记忆、券解释、复购频控 | 没有授权时只能用合成样本 |
| 下单支付 Adapter | mock-only | 模拟订单草稿、支付前确认状态 | 本地 UI 状态、支付前停止记录 | 不创建真实订单、不扣款、不扣券 |
| 门店履约 Adapter | 可接真实接口 | 门店、营业、库存、排队、ETA | 候选门店排序、履约风险、兜底计划 | 无官方接口时只展示估算 |

## 隐私与安全

- 不保存浏览器返回的精确坐标。
- 不抓取、不导入、不伪造真实瑞幸会员信息。
- 自动执行只进入本地模拟器，必须停在支付前。
- 所有真实来源只做公开资料和视觉参考，真实下单、支付、扣券必须回到官方链路。
