/**
 * 造命 ZaoMing — 河洛理數模組
 * 
 * 邵雍所創，用先天八卦 + 數理推演
 * 核心：將生辰轉為河洛數，對應卦象和運勢
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const XIANTIAN_BAGUA = [
  { name: '乾', num: 1, element: '金', nature: '天', trait: '剛健中正，純粹精進' },
  { name: '兌', num: 2, element: '金', nature: '澤', trait: '喜悅通達，口才出眾' },
  { name: '離', num: 3, element: '火', nature: '火', trait: '光明附麗，文明開化' },
  { name: '震', num: 4, element: '木', nature: '雷', trait: '震動奮起，開創進取' },
  { name: '巽', num: 5, element: '木', nature: '風', trait: '順入柔和，善於溝通' },
  { name: '坎', num: 6, element: '水', nature: '水', trait: '智慧深沉，善於變通' },
  { name: '艮', num: 7, element: '土', nature: '山', trait: '穩重踏實，止而後行' },
  { name: '坤', num: 8, element: '土', nature: '地', trait: '厚德載物，包容萬象' },
];

// 河洛數配置
const HELUO_NUMBERS = {
  1: { element: '水', direction: '北', meaning: '智慧之源' },
  2: { element: '火', direction: '南', meaning: '文明之光' },
  3: { element: '木', direction: '東', meaning: '生發之力' },
  4: { element: '金', direction: '西', meaning: '收斂之氣' },
  5: { element: '土', direction: '中', meaning: '中樞之位' },
  6: { element: '水', direction: '北', meaning: '潤澤之德' },
  7: { element: '火', direction: '南', meaning: '明照之輝' },
  8: { element: '木', direction: '東', meaning: '仁慈之心' },
  9: { element: '金', direction: '西', meaning: '義理之道' },
} as Record<number, { element: string; direction: string; meaning: string }>;

// 流年卦
const YEAR_HEXAGRAMS = [
  '元亨利貞，大吉大利', '潛龍勿用，韜光養晦',
  '見龍在田，利見大人', '終日乾乾，夕惕若厲',
  '或躍在淵，進退有據', '飛龍在天，大有作為',
  '亢龍有悔，功成身退', '群龍無首，協同合作',
  '履霜堅冰，循序漸進', '地勢坤，君子以厚德載物',
];

export function calculateHeluo(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const hour = input.hour;

  // 河洛本命數
  const digits = `${year}${month}${day}${hour}`.split('').map(Number);
  let heluoNum = digits.reduce((a, b) => a + b, 0);
  while (heluoNum > 9) heluoNum = String(heluoNum).split('').map(Number).reduce((a, b) => a + b, 0);
  const heluoInfo = HELUO_NUMBERS[heluoNum] || HELUO_NUMBERS[5];

  // 先天卦
  const guaIdx = (year + month + day) % 8;
  const gua = XIANTIAN_BAGUA[guaIdx];

  // 後天運卦
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  const yearHex = YEAR_HEXAGRAMS[age % 10];

  // 十年大運
  const decades = Array.from({ length: 6 }, (_, i) => {
    const startAge = i * 10 + 1;
    const endAge = (i + 1) * 10;
    const decadeGua = XIANTIAN_BAGUA[(guaIdx + i) % 8];
    const score = 60 + ((year + i * 7 + month) % 30);
    return { period: `${startAge}-${endAge}歲`, gua: decadeGua.name, element: decadeGua.element, trait: decadeGua.trait, score };
  });
  // 標記當前
  const currentDecade = Math.floor(age / 10);
  if (currentDecade < decades.length) {
    decades[currentDecade].period = '👉 ' + decades[currentDecade].period;
  }

  return { heluoNum, heluoInfo, gua, yearHex, decades, age };
}

export function heluoToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateHeluo(input);
  const traits: Trait[] = [
    { label: `河洛本命數：${r.heluoNum}（${r.heluoInfo.element}）`, description: `${r.heluoInfo.meaning}，方位${r.heluoInfo.direction}`, score: 80, type: 'strength', dimension: 'spiritual', source: 'heluo' },
    { label: `先天卦：${r.gua.name}卦（${r.gua.nature}）`, description: r.gua.trait, score: 80, type: 'strength', dimension: 'spiritual', source: 'heluo' },
    { label: `今年流年：${r.yearHex}`, description: `${r.age}歲流年卦辭`, score: 75, type: 'strength', dimension: 'career', source: 'heluo' },
  ];
  const current = r.decades.find(d => d.period.startsWith('👉'));
  if (current) {
    traits.push({ label: `當前大運：${current.gua}卦（${current.element}）`, description: `${current.trait}（${current.score}/100）`, score: current.score, type: current.score >= 60 ? 'strength' : 'weakness', dimension: 'career', source: 'heluo' });
  }
  return { system: 'heluo', systemName: '河洛理數', rawData: r, traits, timing: [] };
}
