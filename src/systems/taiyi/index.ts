/**
 * 造命 ZaoMing — 太乙神數（三式之三）
 * 推算國運、大勢、時代機遇 + 人生六階段
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const PALACES = [
  { name: '坎宮', element: '水', theme: '隱伏蓄力' }, { name: '坤宮', element: '土', theme: '厚積薄發' },
  { name: '震宮', element: '木', theme: '雷厲風行' }, { name: '巽宮', element: '木', theme: '風行草偃' },
  { name: '中宮', element: '土', theme: '坐鎮中央' }, { name: '乾宮', element: '金', theme: '剛健進取' },
  { name: '兌宮', element: '金', theme: '收穫喜悅' }, { name: '艮宮', element: '土', theme: '止而後行' },
  { name: '離宮', element: '火', theme: '光明在前' },
];
const GODS = [
  { name: '太乙', nature: '至尊之神，統領萬物', luck: 95 }, { name: '文昌', nature: '主文運、考試、升遷', luck: 90 },
  { name: '始擊', nature: '主開創、進攻、行動', luck: 75 }, { name: '地主', nature: '主地產、穩定、守成', luck: 70 },
  { name: '大武', nature: '主軍事、競爭、武力', luck: 65 }, { name: '大簇', nature: '主聚集、團隊、合作', luck: 80 },
  { name: '陰德', nature: '主暗助、貴人、陰德', luck: 85 }, { name: '天道', nature: '主正義、法律、公道', luck: 80 },
  { name: '和德', nature: '主和諧、外交、協調', luck: 85 }, { name: '天乙', nature: '主貴人、機遇、吉祥', luck: 90 },
  { name: '呂申', nature: '主刑罰、制約、壓力', luck: 40 }, { name: '四神', nature: '主變化、不穩、波動', luck: 50 },
];

export function calculateTaiyi(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const seed = year + month + day + input.hour;
  const palace = PALACES[seed % 9];
  const mainGod = GODS[(seed * 3 + year) % 12];
  const currentYear = new Date().getFullYear();
  const yearGod = GODS[(currentYear * 7 + month) % 12];
  const yearPalace = PALACES[currentYear % 9];
  const eras = ['數位轉型時代 — 科技與傳統的碰撞', 'AI 爆發元年 — 人工智能改變一切', '個人品牌時代 — 人人是媒體', '知識經濟時代 — 知識變現，教育即商機'];
  const eraFortune = eras[(year + currentYear) % eras.length];
  const age = currentYear - year;
  const phases = [
    { age: '0-12', theme: '學習奠基期', score: 70 }, { age: '13-24', theme: '探索成長期', score: 65 },
    { age: '25-36', theme: '衝刺創業期', score: 80 }, { age: '37-48', theme: '收穫穩定期', score: 90 },
    { age: '49-60', theme: '傳承影響期', score: 85 }, { age: '61+', theme: '圓滿享福期', score: 80 },
  ];
  const idx = Math.min(5, Math.floor(age / 12));
  phases[idx].theme = '👉 ' + phases[idx].theme;
  return { palace, mainGod, eraFortune, currentYear: { year: currentYear, god: yearGod, palace: yearPalace }, lifePhases: phases };
}

export function taiyiToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateTaiyi(input);
  return {
    system: 'taiyi', systemName: '太乙神數', rawData: r, timing: [],
    traits: [
      { label: `太乙本命宮：${r.palace.name}（${r.palace.element}）`, description: r.palace.theme, score: 80, type: 'strength', dimension: 'spiritual', source: 'taiyi' },
      { label: `太乙主神：${r.mainGod.name}`, description: r.mainGod.nature, score: r.mainGod.luck, type: r.mainGod.luck >= 60 ? 'strength' : 'weakness', dimension: 'career', source: 'taiyi' },
      { label: `時代運勢`, description: r.eraFortune, score: 82, type: 'strength', dimension: 'career', source: 'taiyi' },
      { label: `${r.currentYear.year}年運：${r.currentYear.god.name}`, description: r.currentYear.god.nature, score: r.currentYear.god.luck, type: r.currentYear.god.luck >= 60 ? 'strength' : 'weakness', dimension: 'career', source: 'taiyi' },
    ],
  };
}
