/**
 * 造命施法引擎 — 聚運模組
 * 
 * 把命盤天賦 × 當前運勢 × 手上資源 → 聚焦成一個行動計畫
 * 這就是「造命」的核心：不是算命，是用命理驅動行動
 */

// ====== Allison 蔡寅衍的完整資源盤點 ======

export interface ResourceInventory {
  name: string;
  birthData: {
    solar: string;
    hour: number;
    minute: number;
    gender: 'male' | 'female';
    birthplace: string;
  };
  destinyProfile: {
    dayMaster: string;        // 日主
    sunSign: string;          // 太陽星座
    risingSign: string;       // 上升星座
    godOfUse: string;         // 用神
    strongElement: string;    // 最強五行
    weakElement: string;      // 最弱五行
    resonanceScore: number;   // 共鳴度
  };
  currentResources: {
    skills: string[];
    businesses: string[];
    networks: string[];
    assets: string[];
    channels: string[];
    team: string[];
  };
  goal: {
    target: string;
    amount: number;
    deadline: string;
    currency: string;
  };
}

// ====== Allison 的資源盤 ======

export const allisonResource: ResourceInventory = {
  name: '蔡寅衍 Allison',
  birthData: {
    solar: '1993-08-07',
    hour: 9,
    minute: 46,
    gender: 'male',
    birthplace: '屏東',
  },
  destinyProfile: {
    dayMaster: '庚金',
    sunSign: '獅子座',
    risingSign: '射手座',
    godOfUse: '木（需要創新、變通、成長來平衡）',
    strongElement: '金（4.5）— 果斷、魄力、執行力',
    weakElement: '木（0.5）— 彈性、變通',
    resonanceScore: 83,
  },
  currentResources: {
    skills: [
      'FB/Google 廣告投放（實戰級）',
      'SEO 優化',
      'Landing Page 規劃',
      'LINE@ 經營',
      'YouTube 影片行銷',
      'IG 經營',
      '直播帶貨',
      '知識變現（線上課程）',
      'AI 工具整合',
    ],
    businesses: [
      '跟單兔 FollowBunny — FB 自動按讚+留言（月費制，3家客戶）',
      '老紀私房菜 — 廣告代操（月費 31,500）',
      'CTMaxs 行銷公司',
      '客製狂人 — 客製化手機殼',
      '造命 ZaoMing AI — 命理×AI（剛誕生）',
    ],
    networks: [
      '美業圈（千金商學院、Savi教母、Doco妲可）',
      '直播圈（emily_onlive、TK娛樂公會）',
      '微商圈（欣究好）',
      '教育圈（南臺企管系）',
      '兩岸電商圈（深圳、廈門）',
      '思萌 AI 教育（凱德、明杰哥）',
      '彩虹人生（16型人格體系）',
    ],
    assets: [
      'FB 個人 3,483 追蹤',
      'IG @10000allison 1,318 粉絲',
      'TikTok @maxtsai01 2,232 粉絲',
      '造命引擎 MVP（已完成）',
      '彩虹人生 16 型人格完整體系',
      '18 個 AdsPower 帳號',
    ],
    channels: [
      'LINE@ 祿馬行銷',
      'FB 粉專 CTMaxs',
      'IG',
      'YouTube',
      'Discord 團隊',
    ],
    team: [
      'Max（AI COO）',
      'Emily（AI 專案經理）',
      'Kimi（AI 內容工廠）',
    ],
  },
  goal: {
    target: '三天內獲利 100 萬',
    amount: 1000000,
    deadline: '2026-03-28',
    currency: 'TWD',
  },
};

// ====== 造命施法：聚運分析 ======

export function castZaomingSpell(resource: ResourceInventory): string {
  const { destinyProfile, currentResources, goal } = resource;

  let spell = '';

  spell += `# 🔮 造命施法 — ${resource.name}\n`;
  spell += `> 目標：${goal.target}\n`;
  spell += `> 截止：${goal.deadline}\n`;
  spell += `> 共鳴度：${destinyProfile.resonanceScore}/100\n\n`;

  // ====== 命盤能量分析 ======
  spell += `## ⚡ 你的命盤能量\n\n`;
  spell += `**日主 ${destinyProfile.dayMaster}** — 你是一把刀，鋒利、果斷、一擊必中。\n`;
  spell += `**太陽 ${destinyProfile.sunSign}** — 天生的舞台人，站出來就有人看。\n`;
  spell += `**上升 ${destinyProfile.risingSign}** — 給人的第一印象：自由、冒險、敢衝。\n`;
  spell += `**用神 ${destinyProfile.godOfUse}** — 你需要「新」的東西來催動能量。\n\n`;
  spell += `**解讀：** 你的命格是「創業者 + 領袖」的組合。金強 = 執行力爆表，但缺木 = 容易走老路。造命的關鍵是「做你沒做過的事」。\n\n`;

  // ====== 資源聚焦分析 ======
  spell += `## 🎯 資源聚焦\n\n`;
  spell += `你手上有 ${currentResources.businesses.length} 個事業、${currentResources.networks.length} 個人脈圈、${currentResources.skills.length} 項技能。\n\n`;
  spell += `**問題不是沒有資源，是太分散。**\n\n`;
  spell += `要在三天內聚運，必須把所有能量集中到一個點：\n\n`;

  // ====== 最佳路徑計算 ======
  spell += `## 🚀 造命路徑（按可行性排序）\n\n`;

  spell += `### 路徑 1：「彩虹人生 × 造命 AI」高端私董會（最快見錢）\n`;
  spell += `- **產品：** 「用 AI 看透你的賺錢天賦」— 2 小時私董會\n`;
  spell += `- **定價：** NT$88,000/人（限額 12 人）= NT$1,056,000 ✅\n`;
  spell += `- **賣點：** 彩虹人格測驗 + 造命 AI 命盤 + Allison 親自解讀 + 30天行動計畫\n`;
  spell += `- **通路：** 微商圈 + 美業圈 + 直播圈（你最熟的三個圈子）\n`;
  spell += `- **行動：**\n`;
  spell += `  - Day 1：製作銷售頁 + 朋友圈文案 + 私訊 50 個種子名單\n`;
  spell += `  - Day 2：開一場 30 分鐘免費直播「預告」+ 收款\n`;
  spell += `  - Day 3：舉辦私董會 + 追單\n`;
  spell += `- **為什麼可行：** 你有操盤經驗 + 人脈基礎 + 造命工具差異化\n`;
  spell += `- **命盤支持度：** 庚金果斷成交 + 獅子座舞台魅力 + 射手上升冒險精神\n\n`;

  spell += `### 路徑 2：「造命企業診斷」B2B 方案（單價最高）\n`;
  spell += `- **產品：** 幫企業做「團隊命盤配置」+ 年度運勢策略\n`;
  spell += `- **定價：** NT$200,000-500,000/案\n`;
  spell += `- **找誰：** 你認識的老闆們（明杰哥圈子、美業老闆、微商團隊長）\n`;
  spell += `- **行動：** 先免費幫 1 個老闆做 → 他滿意就推薦 → 三天內成交 2-5 案\n`;
  spell += `- **命盤支持度：** 偏印+傷官組合 = 擅長給建議賺錢\n\n`;

  spell += `### 路徑 3：「造命報告」線上快閃（量最大）\n`;
  spell += `- **產品：** 個人造命報告 — AI 生成完整命盤解讀\n`;
  spell += `- **定價：** NT$999/份\n`;
  spell += `- **目標：** 1,000 份 = NT$999,000 ≈ 100 萬\n`;
  spell += `- **通路：** FB 廣告（你最強的技能）+ IG + LINE@\n`;
  spell += `- **行動：** 做 Landing Page + 投廣告 + 自動出報告\n`;
  spell += `- **問題：** 三天內要跑 1,000 單太緊，但可以開始累積\n\n`;

  // ====== 聚運建議 ======
  spell += `## 🌟 造命建議\n\n`;
  spell += `**路徑 1 最適合你。** 原因：\n`;
  spell += `1. 高單價 × 少量成交 = 金型人的打法（一擊必中）\n`;
  spell += `2. 用你的舞台魅力（獅子座）面對面成交\n`;
  spell += `3. 彩虹人生 + 造命 AI = 市場上沒有的組合\n`;
  spell += `4. 你的人脈圈裡有足夠的高消費力人群\n\n`;

  spell += `**用神啟動：** 你的用神是木。木 = 新、成長、突破。\n`;
  spell += `「造命 AI 私董會」就是你從沒做過的新東西 → 正好啟動用神能量。\n\n`;

  spell += `---\n\n`;
  spell += `> 🔮 **造命 ZaoMing AI**\n`;
  spell += `> 不認命，用 AI 逆天改命。\n`;
  spell += `> 這不是預測，這是行動計畫。走不走，看你。\n`;

  return spell;
}

// 執行
if (require.main === module) {
  console.log(castZaomingSpell(allisonResource));
}
