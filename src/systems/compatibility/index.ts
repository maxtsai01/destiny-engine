/**
 * 造命 ZaoMing — 合盤分析模組
 * 
 * 兩人的命盤交叉比對 → 契合度
 * 八字合婚 + 星座配對 + 靈數配對 + 風水命卦
 */

import type { BirthInfo } from '../../core/types';
import { calculateBazi, BaziResult } from '../bazi/index';
import { calculateAstro } from '../astro/index';
import { calculateLifeNumber } from '../numerology/index';
import { calculateMingGua } from '../fengshui/index';

// ====== 五行相生相剋 ======

const WUXING_RELATION: Record<string, Record<string, { relation: string; score: number }>> = {
  metal: {
    metal: { relation: '比和', score: 70 },
    water: { relation: '相生（金生水）', score: 90 },
    wood: { relation: '相剋（金剋木）', score: 40 },
    fire: { relation: '被剋（火剋金）', score: 35 },
    earth: { relation: '被生（土生金）', score: 85 },
  },
  water: {
    water: { relation: '比和', score: 70 },
    wood: { relation: '相生（水生木）', score: 90 },
    fire: { relation: '相剋（水剋火）', score: 40 },
    earth: { relation: '被剋（土剋水）', score: 35 },
    metal: { relation: '被生（金生水）', score: 85 },
  },
  wood: {
    wood: { relation: '比和', score: 70 },
    fire: { relation: '相生（木生火）', score: 90 },
    earth: { relation: '相剋（木剋土）', score: 40 },
    metal: { relation: '被剋（金剋木）', score: 35 },
    water: { relation: '被生（水生木）', score: 85 },
  },
  fire: {
    fire: { relation: '比和', score: 70 },
    earth: { relation: '相生（火生土）', score: 90 },
    metal: { relation: '相剋（火剋金）', score: 40 },
    water: { relation: '被剋（水剋火）', score: 35 },
    wood: { relation: '被生（木生火）', score: 85 },
  },
  earth: {
    earth: { relation: '比和', score: 70 },
    metal: { relation: '相生（土生金）', score: 90 },
    water: { relation: '相剋（土剋水）', score: 40 },
    wood: { relation: '被剋（木剋土）', score: 35 },
    fire: { relation: '被生（火生土）', score: 85 },
  },
};

// ====== 星座配對 ======

const ZODIAC_COMPAT: Record<string, Record<string, number>> = {
  fire: { fire: 80, earth: 50, air: 90, water: 40 },
  earth: { fire: 50, earth: 75, air: 55, water: 85 },
  air: { fire: 90, earth: 55, air: 75, water: 45 },
  water: { fire: 40, earth: 85, air: 45, water: 80 },
};

// ====== 靈數配對 ======

const LIFE_NUM_COMPAT: Record<string, number[]> = {
  // [最佳夥伴靈數]
  '1': [1, 3, 5, 7],
  '2': [2, 4, 6, 8],
  '3': [1, 3, 5, 9],
  '4': [2, 4, 6, 8],
  '5': [1, 3, 5, 7],
  '6': [2, 4, 6, 9],
  '7': [1, 5, 7],
  '8': [2, 4, 6, 8],
  '9': [3, 6, 9],
};

// ====== 合盤主函數 ======

export interface CompatibilityResult {
  overall: number;
  dimensions: {
    name: string;
    score: number;
    detail: string;
  }[];
  advice: string;
  strengths: string[];
  challenges: string[];
}

export function analyzeCompatibility(
  person1: BirthInfo & { name?: string },
  person2: BirthInfo & { name?: string }
): CompatibilityResult {
  const name1 = person1.name || '甲方';
  const name2 = person2.name || '乙方';

  const dimensions: { name: string; score: number; detail: string }[] = [];
  const strengths: string[] = [];
  const challenges: string[] = [];

  // 1. 八字五行配對
  try {
    const bazi1 = calculateBazi(person1);
    const bazi2 = calculateBazi(person2);
    const rel = WUXING_RELATION[bazi1.dayMasterWuXing]?.[bazi2.dayMasterWuXing];
    if (rel) {
      dimensions.push({
        name: '八字五行',
        score: rel.score,
        detail: `${name1}(${bazi1.dayMaster})${rel.relation}${name2}(${bazi2.dayMaster})`,
      });
      if (rel.score >= 80) strengths.push(`五行${rel.relation}，先天互補`);
      else if (rel.score <= 45) challenges.push(`五行${rel.relation}，需要磨合`);
    }
  } catch { /* skip */ }

  // 2. 星座元素配對
  try {
    const astro1 = calculateAstro(person1);
    const astro2 = calculateAstro(person2);
    const e1 = astro1.sunSign?.element || 'fire';
    const e2 = astro2.sunSign?.element || 'fire';
    const score = ZODIAC_COMPAT[e1]?.[e2] || 60;
    dimensions.push({
      name: '星座元素',
      score,
      detail: `${astro1.sunSign?.cn || '?'}(${e1}) × ${astro2.sunSign?.cn || '?'}(${e2})`,
    });
    if (score >= 80) strengths.push(`星座元素相合，自然吸引`);
    else if (score <= 50) challenges.push(`星座元素衝突，需要包容`);
  } catch { /* skip */ }

  // 3. 靈數配對
  try {
    const ln1 = calculateLifeNumber(person1.solarDate);
    const ln2 = calculateLifeNumber(person2.solarDate);
    const compatible = LIFE_NUM_COMPAT[ln1.lifeNumber.toString()]?.includes(ln2.lifeNumber);
    const score = compatible ? 85 : 55;
    dimensions.push({
      name: '生命靈數',
      score,
      detail: `靈數${ln1.lifeNumber} × 靈數${ln2.lifeNumber}${compatible ? '（互補型）' : '（挑戰型）'}`,
    });
    if (compatible) strengths.push(`靈數互補，溝通順暢`);
    else challenges.push(`靈數組合需要更多理解和包容`);
  } catch { /* skip */ }

  // 4. 風水命卦配對
  try {
    const year1 = parseInt(person1.solarDate.split('-')[0]);
    const year2 = parseInt(person2.solarDate.split('-')[0]);
    const gua1 = calculateMingGua(year1, person1.gender as 'male' | 'female');
    const gua2 = calculateMingGua(year2, person2.gender as 'male' | 'female');
    
    const eastGroup = [1, 3, 4, 9];
    const sameGroup = (eastGroup.includes(gua1) && eastGroup.includes(gua2)) ||
                      (!eastGroup.includes(gua1) && !eastGroup.includes(gua2));
    const score = sameGroup ? 85 : 55;
    const g1 = eastGroup.includes(gua1) ? '東四命' : '西四命';
    const g2 = eastGroup.includes(gua2) ? '東四命' : '西四命';
    dimensions.push({
      name: '風水命卦',
      score,
      detail: `${name1}(${g1}) × ${name2}(${g2})${sameGroup ? '同組' : '異組'}`,
    });
    if (sameGroup) strengths.push(`同屬${g1}，居住風水方位一致`);
    else challenges.push(`東西四命不同組，住家方位要互相遷就`);
  } catch { /* skip */ }

  // 總分
  const overall = dimensions.length > 0
    ? Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length)
    : 50;

  // 建議
  let advice = '';
  if (overall >= 80) {
    advice = `${name1}和${name2}天生契合度極高！多個系統都顯示互補相生。重點是珍惜這份緣分，在彼此的優勢上加倍發力。`;
  } else if (overall >= 65) {
    advice = `${name1}和${name2}整體不錯，有互補也有挑戰。關鍵是認識差異、尊重不同，把挑戰變成成長的機會。`;
  } else if (overall >= 50) {
    advice = `${name1}和${name2}需要更多磨合。不是不行，而是需要雙方都願意投入努力。建議先從理解對方的運作方式開始。`;
  } else {
    advice = `${name1}和${name2}的組合挑戰較大，但不代表不可能。造命的核心是：看見差異，然後選擇如何面對。`;
  }

  return { overall, dimensions, advice, strengths, challenges };
}

// ====== CLI ======

if (require.main === module) {
  const person1: BirthInfo & { name: string } = {
    name: '蔡寅衍',
    solarDate: '1993-08-07',
    hour: 9,
    gender: 'male',
  };
  
  const person2: BirthInfo & { name: string } = {
    name: '測試對象',
    solarDate: '1995-03-15',
    hour: 14,
    gender: 'female',
  };

  const result = analyzeCompatibility(person1, person2);

  console.log(`\n💕 合盤分析：${person1.name} × ${person2.name}`);
  console.log('═'.repeat(50));
  console.log(`\n  總契合度：${result.overall}/100`);
  
  console.log('\n  各維度：');
  for (const dim of result.dimensions) {
    const icon = dim.score >= 80 ? '🟢' : dim.score >= 60 ? '🟡' : '🔴';
    console.log(`  ${icon} ${dim.name}：${dim.score}分 — ${dim.detail}`);
  }

  if (result.strengths.length) {
    console.log('\n  ✨ 優勢：');
    result.strengths.forEach(s => console.log(`    • ${s}`));
  }
  if (result.challenges.length) {
    console.log('\n  ⚡ 挑戰：');
    result.challenges.forEach(c => console.log(`    • ${c}`));
  }
  console.log(`\n  💡 ${result.advice}`);
}
