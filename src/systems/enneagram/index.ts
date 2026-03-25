/**
 * 造命 ZaoMing — 九型人格模組 (Enneagram)
 * 從命盤數據推算九型人格傾向
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const TYPES = [
  { num: 1, name: '完美主義者', trait: '追求完美、有原則、自律嚴格', fear: '害怕犯錯', desire: '成為正確的人', wing: [9, 2], growth: 7, stress: 4 },
  { num: 2, name: '助人者', trait: '慷慨熱心、善解人意、需要被需要', fear: '害怕不被愛', desire: '被愛被需要', wing: [1, 3], growth: 4, stress: 8 },
  { num: 3, name: '成就者', trait: '目標導向、高效務實、追求成功', fear: '害怕失敗', desire: '成為有價值的人', wing: [2, 4], growth: 6, stress: 9 },
  { num: 4, name: '個人主義者', trait: '感性獨特、追求深度、藝術氣質', fear: '害怕平庸', desire: '找到獨特的自己', wing: [3, 5], growth: 1, stress: 2 },
  { num: 5, name: '觀察者', trait: '好奇求知、獨立分析、保持距離', fear: '害怕無能', desire: '成為全知的人', wing: [4, 6], growth: 8, stress: 7 },
  { num: 6, name: '忠誠者', trait: '忠誠可靠、謹慎小心、尋求安全', fear: '害怕不安全', desire: '獲得支持和保障', wing: [5, 7], growth: 9, stress: 3 },
  { num: 7, name: '享樂者', trait: '樂觀積極、多才多藝、追求新鮮', fear: '害怕痛苦', desire: '快樂滿足', wing: [6, 8], growth: 5, stress: 1 },
  { num: 8, name: '挑戰者', trait: '強勢果斷、保護弱小、控制力強', fear: '害怕被控制', desire: '掌控自己的命運', wing: [7, 9], growth: 2, stress: 5 },
  { num: 9, name: '和平者', trait: '溫和包容、避免衝突、追求和諧', fear: '害怕分離', desire: '內心平靜', wing: [8, 1], growth: 3, stress: 6 },
];

const CENTERS = { '本能中心(腹)': [8, 9, 1], '情感中心(心)': [2, 3, 4], '思維中心(腦)': [5, 6, 7] };

export function calculateEnneagram(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const seed = year + month * 13 + day * 7 + input.hour * 11;

  const typeIdx = seed % 9;
  const mainType = TYPES[typeIdx];
  const wingIdx = (seed + 3) % 2;
  const wing = TYPES[mainType.wing[wingIdx] - 1];
  const center = Object.entries(CENTERS).find(([, nums]) => nums.includes(mainType.num))?.[0] || '思維中心';
  const growthType = TYPES[mainType.growth - 1];
  const stressType = TYPES[mainType.stress - 1];

  // 各型分數
  const scores = TYPES.map((t, i) => ({
    type: t.num, name: t.name,
    score: i === typeIdx ? 85 + (seed % 10) : 30 + ((seed + i * 7) % 40),
  })).sort((a, b) => b.score - a.score);

  return { mainType, wing, center, growthType, stressType, scores };
}

export function enneagramToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateEnneagram(input);
  return {
    system: 'enneagram', systemName: '九型人格', rawData: r, timing: [],
    traits: [
      { label: `九型人格：Type ${r.mainType.num} ${r.mainType.name}`, description: `${r.mainType.trait}。核心恐懼：${r.mainType.fear}`, score: 85, type: 'strength', dimension: 'spiritual', source: 'enneagram' },
      { label: `側翼：${r.mainType.num}w${r.wing.num}`, description: `融合${r.wing.name}的特質：${r.wing.trait}`, score: 75, type: 'strength', dimension: 'spiritual', source: 'enneagram' },
      { label: `能量中心：${r.center}`, description: `決策主要依靠${r.center}`, score: 70, type: 'strength', dimension: 'spiritual', source: 'enneagram' },
      { label: `成長方向：→ Type ${r.growthType.num}`, description: `健康時展現${r.growthType.name}的正面特質`, score: 80, type: 'strength', dimension: 'career', source: 'enneagram' },
      { label: `壓力方向：→ Type ${r.stressType.num}`, description: `壓力時退化到${r.stressType.name}的負面模式`, score: 45, type: 'weakness', dimension: 'health', source: 'enneagram' },
    ],
  };
}
