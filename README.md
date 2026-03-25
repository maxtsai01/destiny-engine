# 🔮 造命 ZaoMing AI — Forge Your Destiny

> **不認命，用 AI 逆天改命。**
>
> Don't accept fate. Rewrite your destiny with AI.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Systems](https://img.shields.io/badge/Systems-40-orange.svg)]()

---

## 💥 造命是什麼？

**造命**（ZaoMing）是世界第一個**命理 × AI 人生策略引擎**。

不只算命 — 40 個命理系統同時排盤、交叉驗證、AI 解讀，幫你**看懂天賦、找到資源、造出自己的命**。

```
傳統算命：「你是XX命」→ 然後呢？

造命 AI：
  1. 排盤 → 15 大命理系統同時分析
  2. 交叉驗證 → AI 找出多系統共識，共鳴度越高越可信
  3. AI 解讀 → 不是玄學術語，是你聽得懂的策略建議
  4. 儀式引導 → 造命宣言 + 每日聚運 + 月度復盤
  5. 資源匹配 → 課程、人脈、工具、行動計畫
```

**一句話：把玄學變成科學，把算命變成策略。**

## 🎯 核心理念

| 理念 | 說明 |
|------|------|
| 🚫 不認命，造命 | 命盤不是判決書，是藏寶圖 |
| 💡 契合度 > 精準度 | 用戶不是來「被算」的，是來「被懂」的 |
| 🌱 成長導向 | 每次解讀都以「你可以做什麼」收尾 |
| 🔗 多系統交叉驗證 | 三個系統都指向同一方向 = 可信度拉滿 |
| ⚡ 道法術器 | 哲學 → 方法論 → 執行 → 工具，層層落地 |

## 📦 40 個命理系統（全部已完成 ✅）

### 命理系統

| # | 系統 | 模組 | 輸入 | 狀態 |
|---|------|------|------|------|
| 1 | **八字四柱** BaZi | `systems/bazi` | 出生日期+時辰 | ✅ |
| 2 | **紫微斗數** Zi Wei | `systems/ziwei` | 出生日期+時辰+性別 | ✅ |
| 3 | **西洋占星** Astrology | `systems/astro` | 出生日期+時辰 | ✅ |
| 4 | **姓名學** Nameology | `systems/name` | 姓名（中文） | ✅ |
| 5 | **生命靈數** Numerology | `systems/numerology` | 出生日期 | ✅ |
| 6 | **易經六十四卦** I-Ching | `systems/iching` | 出生日期+時辰 | ✅ |
| 7 | **MBTI 命盤推算** | `systems/mbti` | 五行+星座+靈數 | ✅ |
| 8 | **奇門遁甲** Qi Men | `systems/qimen` | 出生日期+時辰 | ✅ |
| 9 | **人類圖** Human Design | `systems/humandesign` | 出生日期+時辰 | ✅ |
| 10 | **塔羅本命牌** Tarot | `systems/tarot` | 出生日期 | ✅ |
| 11 | **數字易經** Phone Number | `systems/phonenumber` | 手機號碼 | ✅ |
| 12 | **八宅風水** Feng Shui | `systems/fengshui` | 出生年+性別 | ✅ |
| 13 | **合盤分析** Compatibility | `systems/compatibility` | 兩人出生資料 | ✅ |
| 14 | **彩虹人生 16 型** Rainbow | `systems/rainbow` | 五行+星座+靈數+MBTI | ✅ |
| 15 | **六爻占卜** Liu Yao | `systems/liuyao` | 出生日期+問事 | ✅ |

### AI 模組

| 模組 | 檔案 | 功能 |
|------|------|------|
| **交叉驗證引擎** | `ai/cross-validation.ts` | 多系統共識/張力/獨特觀點 + 共鳴度 |
| **AI 解讀引擎** | `ai/interpreter.ts` | 命盤數據 → 人話報告 + 成長建議 |
| **AI 儀式引擎** | `ai/ritual.ts` | 開盤儀式/造命宣言/每日聚運/月度復盤 |
| **聚運施法** | `ai/zhaomin-spell.ts` | 命盤 × 資源 → 行動計畫 |

### 基礎設施

| 模組 | 功能 |
|------|------|
| `core/types.ts` | 統一輸出 Schema（22 interfaces） |
| `core/wuxing.ts` | 五行引擎（相生相剋、納音、藏干） |
| `core/index.ts` | 核心模組匯出 |

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/maxtsai01/zaoming.git
cd zaoming

# Install
npm install

# 完整命盤報告（CLI）
npx ts-node src/cli.ts --name 蔡寅衍 --date 1993-08-07 --hour 9 --gender male --phone 0933539019

# 單系統測試
npx ts-node src/systems/bazi/index.ts       # 八字
npx ts-node src/systems/tarot/index.ts      # 塔羅
npx ts-node src/systems/phonenumber/index.ts 0933539019  # 手機吉凶

# 完整 Demo
npx ts-node src/demo.ts
```

## 🏗️ Architecture

```
User Input: Name + Birth DateTime + Gender + Phone(optional)
         ↓
┌───────────────────────────────────────────────────┐
│              Destiny Engine v0.4.0                 │
├──────┬──────┬──────┬──────┬──────┬──────┬─────────┤
│ 八字 │ 紫微 │ 占星 │ 姓名 │ 靈數 │ 易經 │  MBTI   │
├──────┼──────┼──────┼──────┼──────┼──────┼─────────┤
│ 奇門 │ 人類圖│ 塔羅 │ 數字 │ 風水 │ 合盤 │彩虹│六爻│
├──────┴──────┴──────┴──────┴──────┴──────┴─────────┤
│          Unified Output Schema (68+ traits)        │
├───────────────────────────────────────────────────┤
│        AI Cross-System Validation Engine           │
│    (Agreements · Tensions · Resonance Score)       │
├───────────────────────────────────────────────────┤
│          AI Ritual Engine (儀式引擎)               │
│   (Declaration · Daily Focus · Monthly Review)     │
└───────────────────────────────────────────────────┘
         ↓
   Complete Destiny Report
   ├── 15-System Analysis
   ├── Cross-Validation (Resonance Score)
   ├── Talent Radar Chart (8 dimensions)
   ├── 造命宣言 (Personalized Declaration)
   ├── 今日聚運 (Daily Fortune Focus)
   └── Growth Advice
```

## 📊 Sample Output (Allison 蔡寅衍)

```
八字：庚金日主，金強木弱，用神木
占星：獅子座 + 射手上升
姓名：71/100（天格18大吉 + 總格37大吉）
靈數：1號 領導者，行動線完整
易經：地天泰 95/100 大吉
MBTI：ESTJ 總經理（70% 信心）
塔羅：靈魂牌 #10 命運之輪
人類圖：顯示生產者 MG
風水：艮卦 西四命，財位西南
手機：0933539019 = 69/100（39 生氣 + 19 延年）

交叉驗證：12 系統 × 68 維度 × 共鳴度 100/100
Top 共識：6 系統同意 — 事業天賦（果斷領導者）
```

## 💰 Business Model

| 方案 | 價格 | 內容 |
|------|------|------|
| 基礎版 | 免費 | 單系統排盤 |
| 完整報告 | NT$299 | 15 系統 + AI 解讀 |
| 月度訂閱 | NT$99/月 | 每月運勢 + 每日聚運 |
| 合盤分析 | NT$499 | 兩人契合度 |
| 企業版 | NT$2,999/月 | 團隊分析 + HR + API |

## 🗺️ Roadmap

- [x] **Phase 1** — 核心引擎（15 系統）✅
- [x] **Phase 2** — AI 解讀層（4 模組）✅
- [x] **Phase 3** — CLI 工具 ✅
- [ ] **Phase 4** — LINE Bot / Web App
- [ ] **Phase 5** — LLM API 串接（GPT-4/Claude 個人化解讀）
- [ ] **Phase 6** — 金流串接 + 付費報告
- [ ] **Phase 7** — 命理師後台 + 校準系統

## 🤝 Contributing

We welcome contributions! Especially:
- Improved calculation accuracy (命理師校準)
- New divination system implementations
- Better AI interpretation prompts
- Translations (currently zh-TW + en)
- Frontend (LINE Bot / Web App / React)
- Bug fixes and tests

## 📝 License

MIT — Use it freely. Build amazing things.

## 🙏 Credits

- [iztro](https://github.com/SylarLong/iztro) — 紫微斗數引擎
- [lunar-javascript](https://github.com/6tail/lunar-javascript) — 農曆/八字
- [astronomy-engine](https://github.com/cosinekitty/astronomy) — 星曆計算

---

**Built with 🔮 by [CTMaxs](https://ctmaxs.com) — Allison, Max & Emily**

**造命 ZaoMing AI — 成為世人造命改命的源頭。**
