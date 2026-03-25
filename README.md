# 🔮 造命 ZaoMing AI — 不認命，用 AI 逆天改命

<p align="center">
  <strong>15 個命理系統 × AI 交叉驗證 × 成長導航 × AI 儀式</strong><br>
  <em>Forge Your Destiny — 15 divination systems, AI cross-validation, growth navigation.</em>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-why-this-exists">Why</a> •
  <a href="#-systems">Systems</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## ✨ Highlights

🎯 **世界第一個** 多命理系統 × AI 交叉解讀的開源引擎

🔄 **15 系統同時排盤** — 八字、紫微、占星、姓名、靈數、易經、MBTI、奇門、人類圖、塔羅、數字易經、風水、六爻、彩虹人生、合盤

🧠 **AI 交叉驗證** — 不是單系統猜測，是多系統共識。共鳴度算法量化可信度

💡 **不算命，造命** — 不只告訴你命盤結果，還幫你找資源、定策略、規劃落地

🔮 **AI 儀式引擎** — 造命宣言、每日聚運、月度復盤，把傳統儀式變成 AI 自動化

🏗️ **統一 Schema** — 業界首創，所有命理系統輸出同一格式，開發者可自由組合

---

## 🚀 Quick Start

```bash
git clone https://github.com/maxtsai01/destiny-engine.git
cd destiny-engine
npm install
npx ts-node src/demo.ts
```

**30 秒就能看到：** 八字排盤 + 紫微命盤 + 星座分析 + AI 交叉驗證報告 🔮

---

## 🤔 Why This Exists

市面上的命理工具有三個問題：

| 問題 | 現狀 | Destiny Engine |
|------|------|----------------|
| **各自為政** | 紫微一個 App、八字一個網站、星座又另一個 | 一個輸入 → 所有系統同時跑 |
| **只給結果不給建議** | 「你是殺破狼格局」...然後呢？ | 每次都以成長建議收尾 |
| **單系統容易偏頗** | 只看八字可能誤判 | 多系統交叉驗證，共鳴度越高越可信 |

**核心理念：**

> 命理不是宿命論，是自我認知的工具。
> 用戶不是來「被算」的，是來「被懂」的。

---

## 📦 Systems

### ✅ 已完成（v0.1.0）

| 系統 | 類型 | 輸入 | 亮點 |
|------|------|------|------|
| **八字四柱** | 中國傳統 | 出生年月日時 | 日主、五行平衡、用神、大運流年 |
| **紫微斗數** | 中國傳統 | 出生年月日時+性別 | 12 宮排盤、主星、四化飛星 |
| **西洋占星** | 西洋 | 出生年月日時 | 太陽星座、上升星座、月亮星座 |
| **交叉驗證引擎** | AI | 多系統結果 | 共鳴度分數、一致結論、內在張力分析 |

### 📋 開發中（Phase 2-3）

| 系統 | 狀態 | 預計時間 |
|------|------|----------|
| 姓名學（五格） | 📋 Phase 2 | Week 3-4 |
| 數字易經 | 📋 Phase 2 | Week 3-4 |
| 易經六十四卦 | 📋 Phase 2 | Week 3-4 |
| 生命靈數 | 📋 Phase 2 | Week 3-4 |
| 奇門遁甲 | 📋 Phase 3 | Week 5-6 |
| 六爻占卜 | 📋 Phase 3 | Week 5-6 |
| 擇日學 | 📋 Phase 3 | Week 5-6 |
| 風水 | 📋 Phase 3 | Week 5-6 |
| 人類圖 | 📋 Phase 3 | Week 5-6 |
| 塔羅牌 | 📋 Phase 3 | Week 5-6 |

**已完成 15 個系統 + AI 儀式引擎 + CLI 工具，涵蓋中西方命理 + 現代人格系統 + AI 整合**

---

## ⚙️ How It Works

```
使用者輸入：姓名 + 出生年月日時 + 性別
                    ↓
    ┌───────────────────────────────┐
    │       Destiny Engine          │
    ├─────────┬─────────┬───────────┤
    │  八字    │  紫微    │  占星     │
    │ BaZi    │ ZiWei   │ Astro    │
    ├─────────┴─────────┴───────────┤
    │     統一輸出格式 Schema         │
    ├───────────────────────────────┤
    │   🧠 AI 交叉驗證引擎            │
    │  共鳴分析 · 張力偵測 · 建議生成   │
    └───────────────────────────────┘
                    ↓
            個人化成長報告
    ├── 🎯 天賦雷達圖（你強在哪）
    ├── ⚠️ 盲區提醒（小心什麼）
    ├── 📊 系統共鳴度（多少系統同意）
    ├── 🔄 內在張力（矛盾 = 你的複雜性）
    └── 💡 成長建議 Top 3（具體行動）
```

### 交叉驗證的威力

傳統：八字說你適合創業 → 你信嗎？也許信也許不信

**Destiny Engine：**
- 八字說你適合創業 ✅
- 紫微也指向獨立事業 ✅
- 星座確認你有領導特質 ✅
- **共鳴度 85/100** → 三個系統都指向同一方向，可信度拉滿

如果有矛盾呢？
- 紫微說穩定工作好，八字說適合創業
- **不是錯誤，是內在張力** → 「你骨子裡想闖，但環境讓你傾向安穩」
- 這種解讀比單系統更貼近真實的你

---

## 📐 Unified Schema

所有系統輸出同一格式，讓交叉驗證成為可能：

```typescript
interface SystemOutput {
  system: SystemType;
  strengths: Trait[];        // 天賦強項
  risks: Trait[];            // 盲區風險
  personality: PersonalityTrait[];
  suitableDirections: Direction[];
  timeline: TimelineEntry[]; // 運勢時間軸
  currentFortune: Fortune;
  elementBalance?: ElementBalance;
}
```

完整 Schema → [`schema/unified-output.ts`](schema/unified-output.ts)

---

## 💰 商業應用

| 場景 | 說明 |
|------|------|
| **個人成長** | 輸入生辰 → 完整報告 → 知道自己的天賦和盲區 |
| **命理師工具** | 一鍵排多系統盤，AI 輔助解讀，效率 10x |
| **企業 HR** | 人才適配、團隊配置、領導力評估 |
| **LINE Bot / Web App** | 免費基礎盤 → 付費完整報告 → 月訂閱運勢更新 |
| **內容變現** | AI 自動生成每日/每週運勢 → 導流到付費報告 |

---

## 🤝 Contributing

歡迎貢獻！特別需要：
- 🔮 新的命理系統實作（姓名學、易經、奇門遁甲...）
- 🧠 AI 解讀 Prompt 優化
- 🌍 多語言翻譯（目前 zh-TW + en）
- 🧪 測試案例和 Bug 修復

---

## 📝 License

MIT — 自由使用，打造更好的東西。

## 🙏 Credits

- [iztro](https://github.com/SylarLong/iztro) — 紫微斗數排盤引擎
- [lunar-javascript](https://github.com/6tail/lunar-javascript) — 農曆萬年曆
- [astronomy-engine](https://github.com/cosinekitty/astronomy) — 天文計算

---

<p align="center">
  <strong>造命 ZaoMing AI — Built by <a href="https://ctmaxs.com">CTMaxs</a></strong><br>
  <em>不認命，用 AI 逆天改命。成為世人造命改命的源頭。</em>
</p>
