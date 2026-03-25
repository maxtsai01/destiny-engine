/**
 * 造命 ZaoMing — 大五人格模組 (Big Five / OCEAN)
 * 從命盤數據推算五大人格特質分布
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

interface BigFiveDimension {
  name: string;
  nameEN: string;
  code: string;
  high: string;
  low: string;
  career: string;
}

const DIMENSIONS: BigFiveDimension[] = [
  { name: '開放性', nameEN: 'Openness', code: 'O', high: '好奇心強、愛創新、想像力豐富', low: '務實保守、偏好傳統、注重穩定', career: '高→創意/研發/藝術；低→會計/行政/品管' },
  { name: '盡責性', nameEN: 'Conscientiousness', code: 'C', high: '自律嚴格、組織力強、目標明確', low: '隨性靈活、彈性高、即興應變', career: '高→管理/法律/醫療；低→自由業/創業' },
  { name: '外向性', nameEN: 'Extraversion', code: 'E', high: '社交活躍、精力充沛、善於表達', low: '獨立思考、深度工作、偏好獨處', career: '高→銷售/公關/教學；低→研究/寫作/程式' },
  { name: '親和性', nameEN: 'Agreeableness', code: 'A', high: '善解人意、樂於合作、重視和諧', low: '獨立果斷、直言不諱、競爭導向', career: '高→HR/諮商/護理；低→律師/談判/投資' },
  { name: '情緒穩定性', nameEN: 'Neuroticism(inv)', code: 'N', high: '冷靜沉穩、抗壓力強、情緒平穩', low: '敏感細膩、情緒起伏大、共感力強', career: '高→危機處理/外科；低→藝術/心理學' },
];

export function calculateBigFive(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const seed = year + month * 13 + day * 7 + input.hour * 11;

  const scores = DIMENSIONS.map((dim, i) => {
    const rawScore = 30 + ((seed + i * 17) % 50); // 30-80 range
    const isHigh = rawScore >= 55;
    return {
      ...dim, score: rawScore, level: isHigh ? 'high' : 'low',
      description: isHigh ? dim.high : dim.low,
    };
  });

  const dominantTrait = scores.reduce((a, b) => a.score > b.score ? a : b);
  const weakestTrait = scores.reduce((a, b) => a.score < b.score ? a : b);

  // OCEAN 代碼
  const oceanCode = scores.map(s => s.level === 'high' ? s.code.toUpperCase() : s.code.toLowerCase()).join('');

  return { scores, dominantTrait, weakestTrait, oceanCode };
}

export function bigfiveToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateBigFive(input);
  const traits: Trait[] = r.scores.map(s => ({
    label: `${s.name}（${s.nameEN}）：${s.score}/100`,
    description: `${s.description}。${s.career}`,
    score: s.score, type: s.score >= 55 ? 'strength' as const : 'weakness' as const,
    dimension: 'spiritual', source: 'bigfive',
  }));
  traits.push({ label: `OCEAN 代碼：${r.oceanCode}`, description: `最強：${r.dominantTrait.name} / 最弱：${r.weakestTrait.name}`, score: 75, type: 'strength', dimension: 'career', source: 'bigfive' });
  return { system: 'bigfive', systemName: '大五人格', rawData: r, traits, timing: [] };
}
