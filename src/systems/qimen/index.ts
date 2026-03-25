/**
 * 造命 ZaoMing — 奇門遁甲模組（簡化版）
 * 
 * 奇門遁甲 = 天盤（九星）+ 地盤（八門）+ 人盤（八神）
 * 用於：擇時、擇方位、行動決策
 * 
 * 簡化版：從生辰算出本命局的天盤九星 + 八門 + 值符值使
 */

import type { SystemAnalysis, Trait, LifeDimension, BirthInfo } from '../../core/types';

// ====== 九星 ======

const NINE_STARS = {
  tianPeng: { name: '天蓬', element: '水', nature: '智慧多謀', career: '策劃、研究、情報', luck: 70 },
  tianRui: { name: '天芮', element: '土', nature: '包容厚重', career: '醫療、教育、農業', luck: 55 },
  tianChong: { name: '天沖', element: '木', nature: '果敢衝鋒', career: '軍事、體育、冒險', luck: 75 },
  tianFu: { name: '天輔', element: '木', nature: '文昌貴人', career: '教育、文化、學術', luck: 85 },
  tianQin: { name: '天禽', element: '土', nature: '中宮主事', career: '管理、協調、中介', luck: 80 },
  tianXin: { name: '天心', element: '金', nature: '醫藥治病', career: '醫療、技術、修復', luck: 80 },
  tianZhu: { name: '天柱', element: '金', nature: '口才犀利', career: '律師、銷售、公關', luck: 65 },
  tianRen: { name: '天任', element: '土', nature: '穩重任事', career: '建築、地產、管理', luck: 75 },
  tianYing: { name: '天英', element: '火', nature: '光明照耀', career: '文藝、傳媒、設計', luck: 70 },
} as const;

type StarKey = keyof typeof NINE_STARS;

// ====== 八門 ======

const EIGHT_GATES = {
  xiuMen: { name: '休門', element: '水', nature: '休養生息', action: '適合休息、謀劃、暗中準備', luck: 85 },
  shengMen: { name: '生門', element: '土', nature: '生機蓬勃', action: '適合創業、投資、開始新事物', luck: 95 },
  shangMen: { name: '傷門', element: '木', nature: '傷害破壞', action: '適合競爭、訴訟、破舊立新', luck: 45 },
  duMen: { name: '杜門', element: '木', nature: '阻塞杜絕', action: '適合隱藏、防守、保密工作', luck: 50 },
  jingMen: { name: '景門', element: '火', nature: '光明正大', action: '適合考試、面試、發表、展示', luck: 80 },
  siMen: { name: '死門', element: '土', nature: '死氣沈沈', action: '適合弔喪、結束、了斷舊事', luck: 25 },
  jingMen2: { name: '驚門', element: '金', nature: '驚恐不安', action: '適合示警、震懾、突擊行動', luck: 40 },
  kaiMen: { name: '開門', element: '金', nature: '開通順達', action: '適合開業、求職、拜訪貴人', luck: 90 },
} as const;

type GateKey = keyof typeof EIGHT_GATES;

// ====== 八神 ======

const EIGHT_GODS = {
  zhiFu: { name: '值符', nature: '貴人相助', luck: 90 },
  tengShe: { name: '螣蛇', nature: '虛驚多疑', luck: 40 },
  taiYin: { name: '太陰', nature: '隱密助力', luck: 75 },
  liuHe: { name: '六合', nature: '合作順利', luck: 85 },
  baiHu: { name: '白虎', nature: '兇險威猛', luck: 35 },
  xuanWu: { name: '玄武', nature: '暗中欺詐', luck: 30 },
  jiuDi: { name: '九地', nature: '穩重守成', luck: 70 },
  jiuTian: { name: '九天', nature: '高遠進取', luck: 80 },
} as const;

type GodKey = keyof typeof EIGHT_GODS;

// ====== 從生辰推算本命局 ======

export interface QimenResult {
  star: typeof NINE_STARS[StarKey];
  gate: typeof EIGHT_GATES[GateKey];
  god: typeof EIGHT_GODS[GodKey];
  palace: number;           // 落宮 1-9
  pattern: string;          // 格局名稱
  overallLuck: number;      // 綜合吉凶
  advice: string;
}

export function calculateQimen(input: BirthInfo): QimenResult {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const hour = input.hour;

  // 簡化算法：用生辰數字推算落宮和配置
  const palaceNum = ((year + month + day) % 9) + 1;
  const starIdx = (year + month + day + hour) % 9;
  const gateIdx = (year * 2 + month * 3 + day * 5 + hour) % 8;
  const godIdx = (year + month * 7 + day * 3 + hour * 11) % 8;

  const starKeys = Object.keys(NINE_STARS) as StarKey[];
  const gateKeys = Object.keys(EIGHT_GATES) as GateKey[];
  const godKeys = Object.keys(EIGHT_GODS) as GodKey[];

  const star = NINE_STARS[starKeys[starIdx]];
  const gate = EIGHT_GATES[gateKeys[gateIdx]];
  const god = EIGHT_GODS[godKeys[godIdx]];

  // 格局判斷
  let pattern = '';
  let bonus = 0;
  
  if (gate.luck >= 80 && star.luck >= 80) {
    pattern = '吉門吉星 — 大吉格局';
    bonus = 15;
  } else if (gate.luck >= 80 && god.luck >= 80) {
    pattern = '吉門吉神 — 貴人助力';
    bonus = 10;
  } else if (gate.luck <= 40 && star.luck <= 55) {
    pattern = '凶門凶星 — 需謹慎行事';
    bonus = -15;
  } else if (gate.luck >= 80) {
    pattern = '吉門 — 行動有利';
    bonus = 5;
  } else if (star.luck >= 80) {
    pattern = '吉星 — 天時有利';
    bonus = 5;
  } else {
    pattern = '平局 — 穩步前進';
    bonus = 0;
  }

  const overallLuck = Math.min(100, Math.max(10, 
    Math.round((star.luck + gate.luck + god.luck) / 3 + bonus)
  ));

  // 生成建議
  let advice = '';
  if (overallLuck >= 80) {
    advice = `你的本命局是${pattern}，天時地利人和都到位。${gate.action}。善用${star.name}的${star.nature}能量，配合${god.name}（${god.nature}），大膽行動。`;
  } else if (overallLuck >= 60) {
    advice = `你的本命局${pattern}。${gate.action}。${star.name}給你${star.nature}的能力，但要注意${god.name}（${god.nature}）的影響，穩中求進。`;
  } else {
    advice = `你的本命局${pattern}。建議先觀望，不急於行動。${gate.action}。利用${star.name}（${star.nature}）的長處，避開${god.name}（${god.nature}）的陷阱。`;
  }

  return { star, gate, god, palace: palaceNum, pattern, overallLuck, advice };
}

// ====== 統一介面 ======

export function qimenToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const result = calculateQimen(input);

  const traits: Trait[] = [
    {
      label: `九星：${result.star.name}`,
      description: `${result.star.nature}，五行${result.star.element}。適合：${result.star.career}`,
      score: result.star.luck,
      type: result.star.luck >= 65 ? 'strength' : 'weakness',
      dimension: 'career',
      source: 'qimen',
    },
    {
      label: `八門：${result.gate.name}`,
      description: `${result.gate.nature}。${result.gate.action}`,
      score: result.gate.luck,
      type: result.gate.luck >= 65 ? 'strength' : 'weakness',
      dimension: 'career',
      source: 'qimen',
    },
    {
      label: `八神：${result.god.name}`,
      description: result.god.nature,
      score: result.god.luck,
      type: result.god.luck >= 65 ? 'strength' : 'weakness',
      dimension: 'social',
      source: 'qimen',
    },
    {
      label: `奇門格局：${result.pattern}`,
      description: result.advice,
      score: result.overallLuck,
      type: result.overallLuck >= 60 ? 'strength' : 'weakness',
      dimension: 'spiritual',
      source: 'qimen',
    },
  ];

  return {
    system: 'qimen',
    systemName: '奇門遁甲',
    rawData: result,
    traits,
    timing: [],
  };
}

// ====== CLI ======

if (require.main === module) {
  const input: BirthInfo = {
    solarDate: process.argv[2] || '1993-08-07',
    hour: parseInt(process.argv[3] || '9'),
    gender: 'male',
  };

  const result = calculateQimen(input);

  console.log(`\n🔮 奇門遁甲本命局：${input.solarDate} ${input.hour}時`);
  console.log('═'.repeat(50));
  console.log(`\n  落宮：第 ${result.palace} 宮`);
  console.log(`  九星：${result.star.name}（${result.star.element}）— ${result.star.nature}`);
  console.log(`  八門：${result.gate.name}（${result.gate.element}）— ${result.gate.nature}`);
  console.log(`  八神：${result.god.name} — ${result.god.nature}`);
  console.log(`\n  格局：${result.pattern}`);
  console.log(`  綜合：${result.overallLuck}/100`);
  console.log(`\n  💡 ${result.advice}`);
}
