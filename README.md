# 🔮 Destiny Engine — 命理 AI 引擎

> **One input, multiple divination systems, AI-powered cross-system interpretation.**
>
> 一個輸入，多個命理系統，AI 跨系統交叉解讀。

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

## 🌟 What is this?

Destiny Engine is the **first open-source project** that integrates multiple Chinese and Western divination systems into a unified framework, powered by AI cross-system interpretation.

**The problem:** Existing fortune-telling tools are siloed — you go to one site for Zi Wei Dou Shu, another for BaZi, yet another for astrology. No one combines them.

**Our solution:** One birth input → multiple systems calculate simultaneously → AI finds agreements, tensions, and unique insights across systems → actionable growth advice.

## 🎯 Core Philosophy

- **Not fortune-telling, but self-discovery** — Know your "factory settings" and play your cards right
- **Resonance > Accuracy** — Users should feel "That's exactly me!" 
- **Growth-oriented** — Every reading ends with "Here's what you can do next"
- **Cross-validation** — Multiple systems pointing the same direction = high confidence

## 📦 Systems (22 Modules)

### Divination Systems (13)

| System | Input | Status |
|--------|-------|--------|
| **八字 BaZi (Four Pillars)** | Birth date/time | 🔨 In Progress |
| **紫微斗數 Zi Wei Dou Shu** | Birth date/time + gender | ✅ Working |
| **西洋占星 Western Astrology** | Birth date/time + location | 🔨 In Progress |
| **姓名學 Chinese Nameology** | Full name | 📋 Planned |
| **數字易經 Number I-Ching** | Phone/plate number | 📋 Planned |
| **易經 I-Ching** | Divination method | 📋 Planned |
| **奇門遁甲 Qi Men Dun Jia** | Time + direction | 📋 Planned |
| **六爻 Liu Yao** | Coin toss | 📋 Planned |
| **擇日 Date Selection** | Event + candidates | 📋 Planned |
| **風水 Feng Shui** | Direction/space | 📋 Planned |
| **人類圖 Human Design** | Birth date/time + location | 📋 Planned |
| **塔羅 Tarot** | Card draw | 📋 Planned |
| **生命靈數 Life Path Number** | Birth date | 📋 Planned |

### Infrastructure (4)
- ✅ **Chinese Calendar Engine** — Solar↔Lunar, 24 Solar Terms
- ✅ **Heavenly Stems & Earthly Branches** — 60 Jiazi cycle
- ✅ **Wu Xing (Five Elements)** — Generation & overcoming cycles
- 📋 **Ephemeris** — Planetary positions (for Western astrology)

### AI Layer (5)
- 🔨 **Cross-validation Engine** — Find agreements across systems
- 🔨 **Resonance Algorithm** — Quantify cross-system confidence
- 📋 **Personalized Interpretation** — Context-aware AI readings
- 📋 **Growth Path Generator** — Actionable advice + timeline
- 📋 **Feedback Learning** — User feedback improves interpretation

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/maxtsai01/destiny-engine.git
cd destiny-engine

# Install
npm install

# Run demo
npx ts-node src/demo.ts
```

## 🏗️ Architecture

```
User Input: Name + Birth DateTime + Gender
         ↓
┌─────────────────────────────────┐
│       Destiny Engine            │
├────────┬────────┬───────┬───────┤
│  BaZi  │ ZiWei  │ Astro │ More  │
│  八字   │ 紫微    │ 占星   │  ...  │
├────────┴────────┴───────┴───────┤
│     Unified Output Schema       │
├─────────────────────────────────┤
│   AI Cross-System Interpretation │
│   (Agreements · Tensions · Advice)│
└─────────────────────────────────┘
         ↓
   Personalized Report
   ├── Talent Radar Chart
   ├── Blind Spot Alerts  
   ├── Current Fortune
   ├── System Resonance Score
   └── Growth Advice (Top 3)
```

## 📐 Unified Output Schema

Every system outputs the same standardized format for cross-validation:

```typescript
interface SystemOutput {
  system: SystemType;
  strengths: Trait[];      // Natural talents
  risks: Trait[];          // Blind spots
  personality: PersonalityTrait[];
  suitableDirections: Direction[];
  timeline: TimelineEntry[];
  currentFortune: Fortune;
  elementBalance?: ElementBalance;
}
```

See [`schema/unified-output.ts`](schema/unified-output.ts) for the full specification.

## 💰 Business Model

| Tier | Price | Content |
|------|-------|---------|
| Basic | Free | Single-system chart |
| Full Report | NT$299 | Multi-system cross-analysis + AI |
| Monthly | NT$99/mo | Monthly fortune updates |
| Compatibility | NT$499 | Two-person analysis |
| Enterprise | NT$2,999/mo | Team analysis + HR + API |

## 🤝 Contributing

We welcome contributions! Especially:
- New divination system implementations
- Improved interpretation prompts
- Translations (currently zh-TW + en)
- Bug fixes and tests

## 📝 License

MIT — Use it freely. Build amazing things.

## 🙏 Credits

- [iztro](https://github.com/SylarLong/iztro) — Zi Wei Dou Shu engine
- [lunar-javascript](https://github.com/6tail/lunar-javascript) — Chinese calendar
- [astronomy-engine](https://github.com/cosinekitty/astronomy) — Planetary calculations

---

**Built with 🔮 by [CTMaxs](https://ctmaxs.com) — Allison, Max & Emily**

*「命理 GPS — 不只告訴你在哪，還告訴你怎麼走」*
