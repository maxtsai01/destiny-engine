/**
 * 造命 ZaoMing — AI 解讀引擎
 * 把命盤數據翻譯成用戶聽得懂的語言
 * 
 * 語氣：像朋友在跟你聊天，不像算命先生在斷命
 * 原則：每段結尾都要有「你可以做什麼」
 */

import type {
  DestinyReport,
  SystemAnalysis,
  CrossValidation,
  Trait,
  GrowthAdvice,
  LifeDimension,
} from '../core/types';

// ====== 維度中文名 ======

const DIMENSION_NAMES: Record<LifeDimension, string> = {
  career: '事業',
  wealth: '財運',
  relationship: '感情',
  health: '健康',
  family: '家庭',
  social: '人際',
  study: '學習',
  spiritual: '心靈成長',
};

const DIMENSION_EMOJIS: Record<LifeDimension, string> = {
  career: '💼',
  wealth: '💰',
  relationship: '❤️',
  health: '🏃',
  family: '🏠',
  social: '🤝',
  study: '📚',
  spiritual: '🧘',
};

// ====== 解讀 Prompt 模板 ======

/**
 * 生成 AI 解讀用的 System Prompt
 * 這個 prompt 定義了「造命」的語氣和風格
 */
export function getSystemPrompt(): string {
  return `你是「造命 AI」的解讀引擎。

## 你的身份
你是用戶的好朋友，剛幫他做了一次深度的命理分析。
你不是算命先生，不用「您」「閣下」這種距離感的稱呼。
你直接叫他「你」，像朋友聊天一樣。

## 語氣規則
1. 不說「你命中注定...」→ 說「你天生就有...的優勢」
2. 不說「你要小心...」→ 說「這方面你可能需要多留意」
3. 不說「你不適合...」→ 說「比起 X，你在 Y 方面更有天賦」
4. 每段結尾都要有具體可行的建議（不是「多注意」這種廢話）
5. 用比喻讓抽象概念變具體
6. 適度使用 emoji，但不要像營銷號

## 報告結構
1. **開場白** — 一句話總結這個人（像一把鑰匙打開自我認知）
2. **天賦亮點** — 你最強的 2-3 個特質，用故事性語言描述
3. **盲區提醒** — 可能踩的坑，但正面表達（盲區 = 成長空間）
4. **系統共鳴** — 哪些結論是多個系統都同意的（= 高可信度）
5. **內在張力** — 你身上的矛盾不是壞事，是你的複雜性和深度
6. **造命行動計畫** — Top 3 具體行動，現在就能開始做

## 核心信念
- 命盤不是判決書，是藏寶圖
- 每個人都有天賦，問題是你知不知道
- 盲區不是缺陷，是成長方向
- 矛盾不是問題，是你這個人有深度的證明
- 「不認命，造命」— 每次解讀都要讓用戶覺得「我可以做些什麼來改變」`;
}

/**
 * 生成解讀用的 User Prompt
 * 把結構化的命盤數據轉成 LLM 可以理解的文字
 */
export function generateInterpretationPrompt(report: DestinyReport): string {
  const { input, systems, crossValidation, talentRadar } = report;

  let prompt = `## 用戶資訊\n`;
  prompt += `- 出生日期：${input.solarDate}\n`;
  prompt += `- 出生時辰：${input.hour}時\n`;
  prompt += `- 性別：${input.gender === 'male' ? '男' : '女'}\n\n`;

  // 各系統分析結果
  for (const sys of systems) {
    prompt += `## ${sys.systemName} 分析結果\n`;
    prompt += `原始數據摘要：${JSON.stringify(sys.rawData, null, 2).slice(0, 500)}\n\n`;
    
    const strengths = sys.traits.filter(t => t.type === 'strength');
    const weaknesses = sys.traits.filter(t => t.type === 'weakness');
    
    if (strengths.length > 0) {
      prompt += `### 天賦\n`;
      for (const t of strengths) {
        prompt += `- [${DIMENSION_NAMES[t.dimension]}] ${t.label}（${t.score}/100）：${t.description}\n`;
      }
      prompt += '\n';
    }
    
    if (weaknesses.length > 0) {
      prompt += `### 盲區\n`;
      for (const t of weaknesses) {
        prompt += `- [${DIMENSION_NAMES[t.dimension]}] ${t.label}（${t.score}/100）：${t.description}\n`;
      }
      prompt += '\n';
    }
  }

  // 交叉驗證
  prompt += `## 交叉驗證結果\n`;
  prompt += `共鳴度：${crossValidation.resonanceScore}/100\n\n`;

  if (crossValidation.agreements.length > 0) {
    prompt += `### 多系統共識（高可信度）\n`;
    for (const a of crossValidation.agreements) {
      prompt += `- [${DIMENSION_NAMES[a.dimension]}] ${a.conclusion}（${a.supportingSystems.join('+')} 都同意，信心 ${a.confidence}%）\n`;
    }
    prompt += '\n';
  }

  if (crossValidation.tensions.length > 0) {
    prompt += `### 內在張力（矛盾 = 複雜性）\n`;
    for (const t of crossValidation.tensions) {
      prompt += `- [${DIMENSION_NAMES[t.dimension]}] ${t.description}\n`;
      prompt += `  ${t.systemA.system}：${t.systemA.view} vs ${t.systemB.system}：${t.systemB.view}\n`;
    }
    prompt += '\n';
  }

  // 天賦雷達圖
  if (talentRadar && talentRadar.length > 0) {
    prompt += `## 天賦雷達圖\n`;
    for (const r of talentRadar) {
      const emoji = DIMENSION_EMOJIS[r.dimension];
      const bar = '█'.repeat(Math.round(r.score / 10));
      prompt += `${emoji} ${r.label}：${bar} ${r.score}/100\n`;
    }
    prompt += '\n';
  }

  prompt += `## 請求\n`;
  prompt += `請根據以上所有資料，用「造命 AI」的語氣為這位用戶寫一份個人化解讀報告。\n`;
  prompt += `記住：不認命，造命。每段都要有「你可以做什麼」的具體建議。\n`;
  prompt += `報告長度：800-1200 字。\n`;

  return prompt;
}

// ====== 離線解讀（不需 LLM）======

/**
 * 純規則解讀 — 不需要 LLM 就能生成基本報告
 * 適合免費版或 API 掛掉時的降級方案
 */
export function generateOfflineInterpretation(report: DestinyReport): string {
  const { systems, crossValidation, talentRadar, growthAdvice } = report;
  
  let text = '';

  // 開場白
  text += `# 🔮 你的造命報告\n\n`;
  text += `> 不認命，用 AI 逆天改命。\n\n`;

  // 天賦雷達圖
  if (talentRadar && talentRadar.length > 0) {
    text += `## 📊 天賦雷達圖\n\n`;
    
    // 找出最強和最弱
    const sorted = [...talentRadar].sort((a, b) => b.score - a.score);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];
    
    text += `你最突出的是 **${DIMENSION_NAMES[strongest.dimension]}**（${strongest.score}/100），`;
    text += `相對需要注意的是 **${DIMENSION_NAMES[weakest.dimension]}**（${weakest.score}/100）。\n\n`;
    
    for (const r of sorted) {
      const emoji = DIMENSION_EMOJIS[r.dimension];
      const bar = '█'.repeat(Math.round(r.score / 10));
      const space = '░'.repeat(10 - Math.round(r.score / 10));
      text += `${emoji} ${DIMENSION_NAMES[r.dimension].padEnd(4, '　')} ${bar}${space} ${r.score}\n`;
    }
    text += '\n';
  }

  // 天賦亮點
  const allStrengths = systems.flatMap(s => s.traits.filter(t => t.type === 'strength'));
  if (allStrengths.length > 0) {
    text += `## ✨ 你的天賦亮點\n\n`;
    const topStrengths = allStrengths.sort((a, b) => b.score - a.score).slice(0, 5);
    for (const t of topStrengths) {
      text += `### ${DIMENSION_EMOJIS[t.dimension]} ${t.label}\n`;
      text += `${t.description}\n`;
      text += `_— 來自${getSystemChinese(t.source)}的洞察_\n\n`;
    }
  }

  // 盲區提醒
  const allWeaknesses = systems.flatMap(s => s.traits.filter(t => t.type === 'weakness'));
  if (allWeaknesses.length > 0) {
    text += `## ⚠️ 成長空間\n\n`;
    text += `這不是「你不行」，而是「你在這些方面還有成長空間」：\n\n`;
    const topWeaks = allWeaknesses.sort((a, b) => b.score - a.score).slice(0, 3);
    for (const t of topWeaks) {
      text += `- **${t.label}**：${t.description}\n`;
    }
    text += '\n';
  }

  // 交叉驗證亮點
  if (crossValidation.agreements.length > 0) {
    text += `## 🎯 多系統共識（高可信度）\n\n`;
    text += `以下結論是**多個命理系統都同意的**，可信度最高：\n\n`;
    for (const a of crossValidation.agreements) {
      const systems = a.supportingSystems.map(s => getSystemChinese(s)).join('、');
      text += `- **${a.conclusion}**\n`;
      text += `  _${systems} 都指向同一結論（信心 ${a.confidence}%）_\n`;
    }
    text += '\n';
  }

  // 內在張力
  if (crossValidation.tensions.length > 0) {
    text += `## 🔄 內在張力\n\n`;
    text += `你身上有些看似矛盾的特質——這不是壞事，這是你這個人有**深度**的證明：\n\n`;
    for (const t of crossValidation.tensions) {
      text += `- ${t.description}\n`;
      if (t.interpretation) {
        text += `  → _${t.interpretation}_\n`;
      }
    }
    text += '\n';
  }

  // 造命行動計畫
  if (growthAdvice && growthAdvice.length > 0) {
    text += `## 🚀 造命行動計畫\n\n`;
    text += `不認命，造命。以下是你現在就能開始的行動：\n\n`;
    const topAdvice = growthAdvice.sort((a, b) => a.priority - b.priority).slice(0, 3);
    for (let i = 0; i < topAdvice.length; i++) {
      const a = topAdvice[i];
      text += `### ${i + 1}. ${a.title}\n`;
      text += `${a.content}\n`;
      text += `_共鳴度 ${a.resonanceScore}/100 — ${a.sources.map(s => getSystemChinese(s)).join('、')}都支持_\n\n`;
    }
  }

  // 結尾
  text += `---\n\n`;
  text += `> 🔮 **造命 ZaoMing AI**\n`;
  text += `> 不認命，用 AI 逆天改命。\n`;
  text += `> 共鳴度：${crossValidation.resonanceScore}/100\n`;
  text += `> ${systems.length} 個系統交叉驗證\n`;

  return text;
}

// ====== 成長建議生成器 ======

/**
 * 根據命盤分析結果自動生成成長建議
 */
export function generateGrowthAdvice(
  systems: SystemAnalysis[],
  crossValidation: CrossValidation
): GrowthAdvice[] {
  const advice: GrowthAdvice[] = [];

  // 從共識中提取建議
  for (const agreement of crossValidation.agreements) {
    advice.push({
      title: `發揮你在${DIMENSION_NAMES[agreement.dimension]}的天賦`,
      content: generateAdviceContent(agreement.conclusion, agreement.dimension),
      dimension: agreement.dimension,
      priority: agreement.confidence > 80 ? 1 : 2,
      sources: agreement.supportingSystems,
      resonanceScore: agreement.confidence,
    });
  }

  // 從張力中提取建議
  for (const tension of crossValidation.tensions) {
    advice.push({
      title: `平衡你在${DIMENSION_NAMES[tension.dimension]}的內在張力`,
      content: `你的內在有一股張力：${tension.description}。這不是缺陷，而是你的獨特之處。` +
        `試著找到兩者的平衡點——既保持${tension.systemA.view}的優勢，也發展${tension.systemB.view}的能力。`,
      dimension: tension.dimension,
      priority: 3,
      sources: [tension.systemA.system, tension.systemB.system],
      resonanceScore: 50,
    });
  }

  // 從盲區提取建議
  const allWeaknesses = systems.flatMap(s => 
    s.traits.filter(t => t.type === 'weakness')
  );
  
  // 按維度分組，找到多系統都認為的盲區
  const weakByDim = new Map<LifeDimension, Trait[]>();
  for (const w of allWeaknesses) {
    const arr = weakByDim.get(w.dimension) || [];
    arr.push(w);
    weakByDim.set(w.dimension, arr);
  }

  for (const [dim, traits] of weakByDim) {
    if (traits.length >= 2) { // 多系統都認為的盲區
      advice.push({
        title: `加強${DIMENSION_NAMES[dim]}方面的能力`,
        content: `多個系統都指出你在${DIMENSION_NAMES[dim]}方面有成長空間。` +
          `具體來說：${traits.map(t => t.label).join('、')}。` +
          `建議從最小的行動開始——每天花 10 分鐘在這方面做一件小事。`,
        dimension: dim,
        priority: 2,
        sources: [...new Set(traits.map(t => t.source))],
        resonanceScore: traits.length * 30,
      });
    }
  }

  return advice.sort((a, b) => a.priority - b.priority);
}

// ====== 工具函數 ======

function getSystemChinese(system: string): string {
  const names: Record<string, string> = {
    bazi: '八字',
    ziwei: '紫微斗數',
    astro: '西洋占星',
    iching: '易經',
    qimen: '奇門遁甲',
    name: '姓名學',
    numerology: '數字易經',
    zeri: '擇日',
    liuyao: '六爻',
    meihua: '梅花易數',
    fengshui: '風水',
    tarot: '塔羅',
    humandesign: '人類圖',
    rainbow: '彩虹人生',
    mbti: 'MBTI',
  };
  return names[system] || system;
}

function generateAdviceContent(conclusion: string, dimension: LifeDimension): string {
  const templates: Record<LifeDimension, string> = {
    career: `在事業方面，${conclusion}。建議：找到一個能發揮這項天賦的工作環境或創業方向。每週花 2 小時研究相關領域的成功案例。`,
    wealth: `在財運方面，${conclusion}。建議：根據你的特質選擇適合的理財方式。你適合的不一定是最熱門的，而是最適合你節奏的。`,
    relationship: `在感情方面，${conclusion}。建議：了解自己在關係中的模式，找到能互補的伴侶類型。不是改變自己，是找到對的人。`,
    health: `在健康方面，${conclusion}。建議：根據你的體質特點制定運動和飲食計畫。身體是造命的本錢。`,
    family: `在家庭方面，${conclusion}。建議：理解家人也有各自的「命盤」，用同理心去溝通。`,
    social: `在人際方面，${conclusion}。建議：找到你的「黃金人脈」——那些跟你命盤互補的人。一個對的朋友勝過一百個泛泛之交。`,
    study: `在學習方面，${conclusion}。建議：根據你的天賦特質選擇學習方式。不是所有人都適合同一種學法。`,
    spiritual: `在心靈成長方面，${conclusion}。建議：每天留 15 分鐘給自己——冥想、寫日記、或只是安靜地想想。造命從內在開始。`,
  };
  return templates[dimension] || `${conclusion}。建議：從今天開始，每天在這方面做一件小事。`;
}

// ====== 導出 ======

export {
  DIMENSION_NAMES,
  DIMENSION_EMOJIS,
  getSystemChinese,
};
