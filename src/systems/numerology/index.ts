/**
 * 造命 ZaoMing — 數字易經 + 生命靈數模組
 * 
 * 1. 生命靈數（Pythagorean Numerology）— 從生日算出 1-9 主命數
 * 2. 數字易經 — 手機號/車牌等數字組合對應易經卦象
 * 3. 生日九宮格 — 圈數分布看天賦缺陷
 */

import type { SystemAnalysis, Trait, LifeDimension, BirthInfo } from '../../core/types';

// ====== 生命靈數 ======

/**
 * 計算生命靈數（主命數）
 * 把生日所有數字加到剩一位
 * 例：1993-08-07 → 1+9+9+3+0+8+0+7 = 37 → 3+7 = 10 → 1+0 = 1
 * 特殊：11, 22, 33 是大師數，不再化簡
 */
export function calculateLifeNumber(dateStr: string): { lifeNumber: number; masterNumber: boolean; chain: number[] } {
  const digits = dateStr.replace(/\D/g, '').split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  const chain = [sum];
  
  while (sum > 9) {
    // 檢查大師數
    if (sum === 11 || sum === 22 || sum === 33) {
      return { lifeNumber: sum, masterNumber: true, chain };
    }
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
    chain.push(sum);
  }
  
  return { lifeNumber: sum, masterNumber: false, chain };
}

/**
 * 生命靈數解讀
 */
const LIFE_NUMBER_MEANING: Record<number, {
  title: string;
  keyword: string;
  strength: string;
  weakness: string;
  career: string;
  relationship: string;
  element: string;
}> = {
  1: {
    title: '領導者',
    keyword: '獨立、創新、開創',
    strength: '天生的領導力，獨立思考，勇於開創新局面',
    weakness: '太過自我，不善合作，容易孤獨',
    career: '創業家、CEO、獨立工作者、發明家',
    relationship: '需要自由空間的伴侶，不喜歡被控制',
    element: '火',
  },
  2: {
    title: '協調者',
    keyword: '合作、敏感、外交',
    strength: '善於協調，細膩敏感，是天生的和平使者',
    weakness: '優柔寡斷，太在意別人，容易受傷',
    career: '諮詢師、外交官、調解人、藝術家',
    relationship: '重視伴侶感受，需要情感安全感',
    element: '水',
  },
  3: {
    title: '表達者',
    keyword: '創意、社交、樂觀',
    strength: '天生的表演家，創意豐富，感染力強',
    weakness: '注意力分散，虎頭蛇尾，太過樂觀',
    career: '演員、作家、行銷、設計師、講師',
    relationship: '浪漫有趣，但需要學習深入承諾',
    element: '火',
  },
  4: {
    title: '建築師',
    keyword: '穩定、務實、紀律',
    strength: '腳踏實地，組織能力強，值得信賴',
    weakness: '固執保守，缺乏彈性，太注重規則',
    career: '工程師、會計師、建築師、管理者',
    relationship: '忠誠可靠，但需要學習表達感情',
    element: '土',
  },
  5: {
    title: '冒險家',
    keyword: '自由、變化、適應',
    strength: '適應力超強，喜歡冒險，多才多藝',
    weakness: '不安定，逃避責任，容易沉迷',
    career: '旅行家、業務、記者、自由工作者',
    relationship: '需要自由和刺激，害怕被綁住',
    element: '金',
  },
  6: {
    title: '照顧者',
    keyword: '責任、愛、和諧',
    strength: '富有愛心，責任感強，重視家庭和美',
    weakness: '控制欲強，犧牲自我，過度干涉',
    career: '醫療、教育、社工、室內設計、美業',
    relationship: '全心投入，但需要學習不過度付出',
    element: '土',
  },
  7: {
    title: '思想家',
    keyword: '分析、直覺、靈性',
    strength: '深度思考，直覺敏銳，追求真理',
    weakness: '孤僻封閉，過度分析，不信任他人',
    career: '研究員、心理師、作家、科學家、命理師',
    relationship: '需要心靈連結，不喜歡膚淺的互動',
    element: '水',
  },
  8: {
    title: '企業家',
    keyword: '權力、財富、成就',
    strength: '商業頭腦，執行力強，天生的企業家',
    weakness: '太重物質，工作狂，忽略情感',
    career: '企業家、投資人、高管、律師、政治家',
    relationship: '需要事業有成的伴侶，門當戶對',
    element: '金',
  },
  9: {
    title: '人道主義者',
    keyword: '慈悲、智慧、完成',
    strength: '胸懷大志，慈悲智慧，影響力廣泛',
    weakness: '好高騖遠，情緒化，難以放下',
    career: '慈善家、藝術家、教育家、靈性導師',
    relationship: '大愛精神，但需要學習一對一的親密',
    element: '火',
  },
  11: {
    title: '靈感大師',
    keyword: '直覺、啟發、理想',
    strength: '超強直覺，能啟發他人，理想主義者',
    weakness: '過度敏感，壓力大，理想與現實落差',
    career: '靈性導師、發明家、藝術家、領袖',
    relationship: '靈魂伴侶型，需要深層心靈共鳴',
    element: '風',
  },
  22: {
    title: '建造大師',
    keyword: '實現、大格局、務實理想',
    strength: '能把宏大願景落地成現實，超強組織力',
    weakness: '壓力巨大，自我要求太高，容易崩潰',
    career: '建築師、企業帝國、政治領袖、改革者',
    relationship: '需要能理解其使命的伴侶',
    element: '土',
  },
  33: {
    title: '療癒大師',
    keyword: '療癒、服務、大愛',
    strength: '最高層次的愛和服務，能療癒群體',
    weakness: '犧牲過度，承擔太多，忽略自我',
    career: '療癒師、精神領袖、大型公益組織',
    relationship: '無條件的愛，但需要學習自愛',
    element: '水',
  },
};

// ====== 生日九宮格 ======

/**
 * 計算生日九宮格
 * 把生日中出現的數字放入九宮格
 * 圈數多 = 天賦強，空格 = 缺失需補
 */
export function calculateBirthdayGrid(dateStr: string): {
  grid: Record<number, number>;
  strengths: string[];
  weaknesses: string[];
} {
  const digits = dateStr.replace(/\D/g, '').split('').map(Number);
  const grid: Record<number, number> = {};
  
  for (let i = 1; i <= 9; i++) grid[i] = 0;
  for (const d of digits) {
    if (d >= 1 && d <= 9) grid[d]++;
  }

  const gridMeaning: Record<number, { area: string; strong: string; weak: string }> = {
    1: { area: '太陽（個人意志）', strong: '意志堅定，獨立自主', weak: '缺乏自信，依賴他人' },
    2: { area: '月亮（情感）', strong: '感性細膩，同理心強', weak: '情感表達困難' },
    3: { area: '木星（創意）', strong: '創意豐富，表達力強', weak: '缺乏想像力和表達' },
    4: { area: '天王星（組織）', strong: '有條理，實際能幹', weak: '缺乏耐心和紀律' },
    5: { area: '水星（溝通）', strong: '溝通高手，適應力強', weak: '溝通不暢，缺乏彈性' },
    6: { area: '金星（愛與美）', strong: '有藝術天賦，重視和諧', weak: '缺乏美感和責任感' },
    7: { area: '海王星（靈性）', strong: '直覺敏銳，追求真理', weak: '缺乏深度思考' },
    8: { area: '土星（財富）', strong: '商業頭腦，理財能力強', weak: '財務管理需加強' },
    9: { area: '火星（行動）', strong: '行動力強，勇於冒險', weak: '缺乏執行力' },
  };

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  for (let i = 1; i <= 9; i++) {
    if (grid[i] >= 2) {
      strengths.push(`${gridMeaning[i].area}：${gridMeaning[i].strong}（${grid[i]}圈）`);
    } else if (grid[i] === 0) {
      weaknesses.push(`${gridMeaning[i].area}：${gridMeaning[i].weak}（空格）`);
    }
  }

  return { grid, strengths, weaknesses };
}

// ====== 連線分析 ======

/**
 * 九宮格連線分析
 * 1-2-3: 思想線  4-5-6: 意志線  7-8-9: 行動線
 * 1-4-7: 人際線  2-5-8: 錢財線  3-6-9: 事業線
 * 1-5-9: 事業貴人線  3-5-7: 人脈桃花線
 */
export function analyzeGridLines(grid: Record<number, number>): { name: string; complete: boolean; description: string }[] {
  const lines = [
    { nums: [1, 2, 3], name: '思想線', desc: '思維活躍，學習能力強', missing: '思考力需加強' },
    { nums: [4, 5, 6], name: '意志線', desc: '意志堅定，堅持到底', missing: '容易半途而廢' },
    { nums: [7, 8, 9], name: '行動線', desc: '行動力強，說做就做', missing: '想太多做太少' },
    { nums: [1, 4, 7], name: '人際線', desc: '人際關係好，善於社交', missing: '人際關係需經營' },
    { nums: [2, 5, 8], name: '錢財線', desc: '財運佳，理財觀念好', missing: '財務觀念需建立' },
    { nums: [3, 6, 9], name: '事業線', desc: '事業心強，有野心', missing: '事業方向需明確' },
    { nums: [1, 5, 9], name: '事業貴人線', desc: '有貴人相助，事業順利', missing: '需主動尋找貴人' },
    { nums: [3, 5, 7], name: '人脈桃花線', desc: '人緣好，桃花旺', missing: '人脈需主動建立' },
  ];

  return lines.map(line => {
    const complete = line.nums.every(n => grid[n] > 0);
    return {
      name: line.name,
      complete,
      description: complete ? line.desc : line.missing,
    };
  });
}

// ====== 統一介面 ======

export function numerologyToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const { lifeNumber, masterNumber, chain } = calculateLifeNumber(input.solarDate);
  const meaning = LIFE_NUMBER_MEANING[lifeNumber];
  const { grid, strengths, weaknesses } = calculateBirthdayGrid(input.solarDate);
  const lines = analyzeGridLines(grid);
  
  const traits: Trait[] = [];

  if (meaning) {
    // 主命數天賦
    traits.push({
      label: `生命靈數 ${lifeNumber} — ${meaning.title}`,
      description: meaning.strength,
      score: masterNumber ? 95 : 80,
      type: 'strength',
      dimension: 'career',
      source: 'numerology',
    });

    // 主命數盲區
    traits.push({
      label: `靈數 ${lifeNumber} 盲區`,
      description: meaning.weakness,
      score: 40,
      type: 'weakness',
      dimension: 'spiritual',
      source: 'numerology',
    });

    // 事業方向
    traits.push({
      label: `靈數 ${lifeNumber} 適合職業`,
      description: meaning.career,
      score: 75,
      type: 'strength',
      dimension: 'career',
      source: 'numerology',
    });

    // 感情模式
    traits.push({
      label: `靈數 ${lifeNumber} 感情模式`,
      description: meaning.relationship,
      score: 60,
      type: 'strength',
      dimension: 'relationship',
      source: 'numerology',
    });
  }

  // 九宮格天賦
  for (const s of strengths) {
    traits.push({
      label: `九宮格天賦：${s.split('：')[0]}`,
      description: s,
      score: 80,
      type: 'strength',
      dimension: 'study',
      source: 'numerology',
    });
  }

  // 九宮格缺失
  for (const w of weaknesses) {
    traits.push({
      label: `九宮格缺失：${w.split('：')[0]}`,
      description: w,
      score: 30,
      type: 'weakness',
      dimension: 'study',
      source: 'numerology',
    });
  }

  // 連線
  for (const line of lines) {
    if (line.complete) {
      traits.push({
        label: `${line.name}完整`,
        description: line.description,
        score: 75,
        type: 'strength',
        dimension: line.name.includes('事業') ? 'career' : line.name.includes('錢') ? 'wealth' : 'social',
        source: 'numerology',
      });
    }
  }

  return {
    system: 'numerology',
    systemName: '生命靈數 + 數字易經',
    rawData: { lifeNumber, masterNumber, chain, grid, lines, meaning },
    traits,
    timing: [],
  };
}

// ====== CLI ======

if (require.main === module) {
  const dateStr = process.argv[2] || '1993-08-07';
  
  const { lifeNumber, masterNumber, chain } = calculateLifeNumber(dateStr);
  const meaning = LIFE_NUMBER_MEANING[lifeNumber];
  const { grid, strengths, weaknesses } = calculateBirthdayGrid(dateStr);
  const lines = analyzeGridLines(grid);

  console.log(`\n🔢 生命靈數分析：${dateStr}`);
  console.log('═'.repeat(50));
  
  console.log(`\n計算過程：${chain.join(' → ')}`);
  console.log(`主命數：${lifeNumber} ${masterNumber ? '（大師數）' : ''}`);
  
  if (meaning) {
    console.log(`\n💫 你是「${meaning.title}」`);
    console.log(`關鍵詞：${meaning.keyword}`);
    console.log(`天賦：${meaning.strength}`);
    console.log(`盲區：${meaning.weakness}`);
    console.log(`適合職業：${meaning.career}`);
    console.log(`感情模式：${meaning.relationship}`);
    console.log(`對應元素：${meaning.element}`);
  }

  console.log(`\n📊 生日九宮格：`);
  console.log(`┌───┬───┬───┐`);
  console.log(`│ ${grid[1] || '·'} │ ${grid[2] || '·'} │ ${grid[3] || '·'} │  1=意志 2=情感 3=創意`);
  console.log(`├───┼───┼───┤`);
  console.log(`│ ${grid[4] || '·'} │ ${grid[5] || '·'} │ ${grid[6] || '·'} │  4=組織 5=溝通 6=美感`);
  console.log(`├───┼───┼───┤`);
  console.log(`│ ${grid[7] || '·'} │ ${grid[8] || '·'} │ ${grid[9] || '·'} │  7=靈性 8=財富 9=行動`);
  console.log(`└───┴───┴───┘`);

  if (strengths.length > 0) {
    console.log(`\n✨ 天賦（多圈）：`);
    strengths.forEach(s => console.log(`  ${s}`));
  }
  if (weaknesses.length > 0) {
    console.log(`\n⚠️ 缺失（空格）：`);
    weaknesses.forEach(w => console.log(`  ${w}`));
  }

  console.log(`\n📐 連線分析：`);
  lines.forEach(l => {
    const icon = l.complete ? '✅' : '❌';
    console.log(`  ${icon} ${l.name}：${l.description}`);
  });
}
