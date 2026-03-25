/**
 * 造命 ZaoMing — 彩虹人生 16 型人格整合模組
 * 
 * 彩虹人生四色體系：金（組織力）、綠（創意力）、橙（行動力）、藍（分析力）
 * × 四種動物：老鷹、孔雀、無尾熊、貓頭鷹
 * = 16 種人格類型
 * 
 * 從命盤數據推算彩虹人格傾向（不需問卷）
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

// ====== 四色 ======

interface ColorProfile {
  color: string;
  name: string;
  emoji: string;
  element: string;
  keyword: string;
  strength: string;
  weakness: string;
}

const FOUR_COLORS: Record<string, ColorProfile> = {
  gold: { color: '金色', name: '組織力', emoji: '🟡', element: '土/金', keyword: '秩序、規劃、紀律',
    strength: '組織能力強、守規矩、可靠', weakness: '彈性不足、過度保守' },
  green: { color: '綠色', name: '創意力', emoji: '🟢', element: '木/水', keyword: '創新、理想、突破',
    strength: '創意無限、vision 遠大、敢想', weakness: '不切實際、缺乏執行力' },
  orange: { color: '橙色', name: '行動力', emoji: '🟠', element: '火', keyword: '行動、冒險、自由',
    strength: '行動力爆棚、靈活變通、享受當下', weakness: '衝動、缺乏耐心、不專注' },
  blue: { color: '藍色', name: '分析力', emoji: '🔵', element: '水/金', keyword: '思考、分析、深度',
    strength: '邏輯清晰、追求完美、深思熟慮', weakness: '過度分析、猶豫不決' },
};

// ====== 四動物 ======

interface AnimalProfile {
  animal: string;
  emoji: string;
  style: string;
  trait: string;
}

const FOUR_ANIMALS: Record<string, AnimalProfile> = {
  eagle: { animal: '老鷹', emoji: '🦅', style: '果斷型', trait: '目標導向、掌控全局、不怕衝突' },
  peacock: { animal: '孔雀', emoji: '🦚', style: '社交型', trait: '魅力四射、善於溝通、重視形象' },
  koala: { animal: '無尾熊', emoji: '🐨', style: '穩定型', trait: '溫和穩重、重視和諧、忠誠可靠' },
  owl: { animal: '貓頭鷹', emoji: '🦉', style: '分析型', trait: '精準細膩、追求正確、邏輯導向' },
};

// ====== 從命盤推算彩虹人格 ======

export interface RainbowResult {
  primaryColor: ColorProfile;
  secondaryColor: ColorProfile;
  animal: AnimalProfile;
  scores: { gold: number; green: number; orange: number; blue: number };
  assertiveness: number;  // 果斷力 0-40
  responsiveness: number; // 反應力 0-40
  type: string;           // e.g. "綠色孔雀"
}

export function calculateRainbow(
  strongElement: string,   // 最強五行（中文）
  weakElement: string,     // 最弱五行
  sunSign: string,         // 太陽星座
  lifeNumber: number,      // 生命靈數
  mbtiType: string,        // MBTI 類型
): RainbowResult {
  const scores = { gold: 10, green: 10, orange: 10, blue: 10 };

  // 五行 → 彩虹色
  const wxColorMap: Record<string, string[]> = {
    '金': ['gold', 'blue'],
    '木': ['green', 'orange'],
    '水': ['blue', 'green'],
    '火': ['orange', 'green'],
    '土': ['gold', 'blue'],
  };
  
  const strongColors = wxColorMap[strongElement] || ['gold'];
  const weakColors = wxColorMap[weakElement] || ['green'];
  
  strongColors.forEach(c => (scores as any)[c] += 6);
  weakColors.forEach(c => (scores as any)[c] -= 2);

  // 星座 → 彩虹色
  const signColorMap: Record<string, string> = {
    '牡羊座': 'orange', '金牛座': 'gold', '雙子座': 'green',
    '巨蟹座': 'blue', '獅子座': 'orange', '處女座': 'gold',
    '天秤座': 'green', '天蠍座': 'blue', '射手座': 'orange',
    '摩羯座': 'gold', '水瓶座': 'green', '雙魚座': 'blue',
  };
  const signColor = signColorMap[sunSign];
  if (signColor) (scores as any)[signColor] += 5;

  // 靈數 → 彩虹色
  const numColorMap: Record<number, string> = {
    1: 'orange', 2: 'blue', 3: 'green', 4: 'gold',
    5: 'orange', 6: 'gold', 7: 'blue', 8: 'orange', 9: 'green',
  };
  const numColor = numColorMap[lifeNumber];
  if (numColor) (scores as any)[numColor] += 4;

  // MBTI → 彩虹色
  if (mbtiType.includes('J')) scores.gold += 3;
  if (mbtiType.includes('P')) scores.orange += 3;
  if (mbtiType.includes('N')) scores.green += 3;
  if (mbtiType.includes('S')) scores.gold += 2;
  if (mbtiType.includes('T')) scores.blue += 3;
  if (mbtiType.includes('F')) scores.green += 2;
  if (mbtiType.includes('E')) scores.orange += 2;
  if (mbtiType.includes('I')) scores.blue += 2;

  // 排序找主色和副色
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primaryKey = sorted[0][0];
  const secondaryKey = sorted[1][0];
  const primaryColor = FOUR_COLORS[primaryKey];
  const secondaryColor = FOUR_COLORS[secondaryKey];

  // 果斷力和反應力
  const assertiveness = Math.min(40, Math.round((scores.orange + scores.gold) * 0.8));
  const responsiveness = Math.min(40, Math.round((scores.orange + scores.green) * 0.8));

  // 動物
  let animalKey: string;
  if (assertiveness >= 25 && responsiveness >= 25) animalKey = 'eagle';
  else if (assertiveness < 25 && responsiveness >= 25) animalKey = 'peacock';
  else if (assertiveness < 25 && responsiveness < 25) animalKey = 'koala';
  else animalKey = 'owl';

  const animal = FOUR_ANIMALS[animalKey];
  const type = `${primaryColor.color}${animal.animal}`;

  return { primaryColor, secondaryColor, animal, scores, assertiveness, responsiveness, type };
}

// ====== 統一介面 ======

export function rainbowToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  // 用預設值（實際應從其他系統傳入）
  const result = calculateRainbow('金', '木', '獅子座', 1, 'ESTJ');

  const traits: Trait[] = [
    {
      label: `彩虹人格：${result.type} ${result.animal.emoji}`,
      description: `${result.primaryColor.color}（${result.primaryColor.name}）+ ${result.secondaryColor.color}（${result.secondaryColor.name}）`,
      score: 85,
      type: 'strength',
      dimension: 'spiritual',
      source: 'rainbow',
    },
    {
      label: `主色優勢：${result.primaryColor.strength}`,
      description: `${result.primaryColor.keyword}`,
      score: 85,
      type: 'strength',
      dimension: 'career',
      source: 'rainbow',
    },
    {
      label: `主色盲區：${result.primaryColor.weakness}`,
      description: `弱色：${result.secondaryColor.weakness}`,
      score: 35,
      type: 'weakness',
      dimension: 'spiritual',
      source: 'rainbow',
    },
    {
      label: `行為風格：${result.animal.style}`,
      description: result.animal.trait,
      score: 80,
      type: 'strength',
      dimension: 'social',
      source: 'rainbow',
    },
  ];

  return {
    system: 'rainbow',
    systemName: '彩虹人生',
    rawData: result,
    traits,
    timing: [],
  };
}

// ====== CLI ======

if (require.main === module) {
  // Allison 的數據
  const result = calculateRainbow('金', '木', '獅子座', 1, 'ESTJ');

  console.log(`\n🌈 彩虹人生人格分析`);
  console.log('═'.repeat(50));
  console.log(`\n  類型：${result.type} ${result.animal.emoji}`);
  console.log(`  主色：${result.primaryColor.emoji} ${result.primaryColor.color}（${result.primaryColor.name}）`);
  console.log(`  副色：${result.secondaryColor.emoji} ${result.secondaryColor.color}（${result.secondaryColor.name}）`);
  console.log(`  動物：${result.animal.emoji} ${result.animal.animal}（${result.animal.style}）`);

  console.log('\n  四色分數：');
  console.log(`    🟡 金色（組織力）：${result.scores.gold}`);
  console.log(`    🟢 綠色（創意力）：${result.scores.green}`);
  console.log(`    🟠 橙色（行動力）：${result.scores.orange}`);
  console.log(`    🔵 藍色（分析力）：${result.scores.blue}`);

  console.log(`\n  果斷力：${result.assertiveness}/40`);
  console.log(`  反應力：${result.responsiveness}/40`);
  
  console.log(`\n  ✨ 優勢：${result.primaryColor.strength}`);
  console.log(`  ⚠️ 盲區：${result.primaryColor.weakness}`);
  console.log(`  🎯 風格：${result.animal.trait}`);
}
