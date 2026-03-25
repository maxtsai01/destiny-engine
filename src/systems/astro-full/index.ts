/**
 * 造命 ZaoMing — 西洋占星深度版（十大行星 + 十二宮位 + 相位）
 * 
 * 基礎版只用太陽星座，深度版加入：
 * 月亮、水星、金星、火星、木星、土星、天王、海王、冥王
 * + 上升點 + 宮位 + 主要相位
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const SIGNS = ['白羊', '金牛', '雙子', '巨蟹', '獅子', '處女', '天秤', '天蠍', '射手', '摩羯', '水瓶', '雙魚'];
const ELEMENTS = ['火', '土', '風', '水', '火', '土', '風', '水', '火', '土', '風', '水'];

const PLANETS = [
  { name: '太陽☀️', domain: '自我、意志、人生目標', speed: 1 },
  { name: '月亮🌙', domain: '情感、直覺、內在需求', speed: 13 },
  { name: '水星☿', domain: '思維、溝通、學習方式', speed: 1.2 },
  { name: '金星♀', domain: '愛情、美感、價值觀', speed: 0.8 },
  { name: '火星♂', domain: '行動力、慾望、競爭', speed: 0.5 },
  { name: '木星♃', domain: '幸運、擴張、哲學', speed: 0.08 },
  { name: '土星♄', domain: '責任、限制、成熟', speed: 0.03 },
  { name: '天王星♅', domain: '變革、自由、創新', speed: 0.012 },
  { name: '海王星♆', domain: '夢想、靈性、幻覺', speed: 0.006 },
  { name: '冥王星♇', domain: '轉化、權力、重生', speed: 0.004 },
];

const HOUSES = [
  '第1宮（自我）', '第2宮（財富）', '第3宮（溝通）', '第4宮（家庭）',
  '第5宮（創造）', '第6宮（健康）', '第7宮（伴侶）', '第8宮（轉化）',
  '第9宮（哲學）', '第10宮（事業）', '第11宮（社群）', '第12宮（靈性）',
];

interface PlanetPlacement {
  planet: string;
  sign: string;
  element: string;
  house: string;
  interpretation: string;
}

const ASPECTS = [
  { name: '合相(0°)', nature: '強化', effect: '能量融合，力量加倍' },
  { name: '六分相(60°)', nature: '和諧', effect: '機會與天賦' },
  { name: '四分相(90°)', nature: '緊張', effect: '挑戰帶來成長' },
  { name: '三分相(120°)', nature: '和諧', effect: '天生的才能與幸運' },
  { name: '對分相(180°)', nature: '緊張', effect: '對立面的整合' },
];

export function calculateAstroFull(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const hour = input.hour;
  const sunIdx = Math.floor((month * 30 + day - 21) / 30) % 12;
  const seed = year + month + day + hour;

  const placements: PlanetPlacement[] = PLANETS.map((planet, i) => {
    const signIdx = (sunIdx + Math.round(seed * planet.speed + i * 3)) % 12;
    const houseIdx = (signIdx + Math.floor(hour / 2) + i) % 12;
    const sign = SIGNS[signIdx];
    return {
      planet: planet.name,
      sign,
      element: ELEMENTS[signIdx],
      house: HOUSES[houseIdx],
      interpretation: `${planet.name}在${sign}${HOUSES[houseIdx]}：${planet.domain}受${sign}座能量影響`,
    };
  });

  // 上升星座
  const ascIdx = (sunIdx + Math.floor(hour / 2)) % 12;
  const ascendant = SIGNS[ascIdx];

  // 主要相位
  const aspects = [];
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 5; j++) {
      const diff = Math.abs(
        SIGNS.indexOf(placements[i].sign) - SIGNS.indexOf(placements[j].sign)
      );
      const normalizedDiff = Math.min(diff, 12 - diff);
      let aspect = null;
      if (normalizedDiff === 0) aspect = ASPECTS[0];
      else if (normalizedDiff === 2) aspect = ASPECTS[1];
      else if (normalizedDiff === 3) aspect = ASPECTS[2];
      else if (normalizedDiff === 4) aspect = ASPECTS[3];
      else if (normalizedDiff === 6) aspect = ASPECTS[4];
      if (aspect) {
        aspects.push({ planets: `${placements[i].planet} ↔ ${placements[j].planet}`, ...aspect });
      }
    }
  }

  // 元素分布
  const elementCount = { '火': 0, '土': 0, '風': 0, '水': 0 };
  placements.forEach(p => { if (elementCount[p.element as keyof typeof elementCount] !== undefined) elementCount[p.element as keyof typeof elementCount]++; });
  const dominant = Object.entries(elementCount).sort((a, b) => b[1] - a[1])[0];

  return { placements, ascendant, aspects, elementCount, dominantElement: dominant[0], dominantCount: dominant[1] };
}

export function astroFullToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateAstroFull(input);
  const traits: Trait[] = [
    { label: `上升星座：${r.ascendant}`, description: '外在表現和第一印象', score: 80, type: 'strength', dimension: 'spiritual', source: 'astro-full' },
    { label: `主導元素：${r.dominantElement}（${r.dominantCount}/10）`, description: `星盤以${r.dominantElement}元素為主`, score: 75, type: 'strength', dimension: 'spiritual', source: 'astro-full' },
  ];
  r.placements.slice(0, 5).forEach(p => {
    traits.push({ label: `${p.planet}在${p.sign}`, description: p.interpretation, score: 75, type: 'strength', dimension: 'spiritual', source: 'astro-full' });
  });
  r.aspects.slice(0, 3).forEach(a => {
    traits.push({ label: `${a.planets}：${a.name}`, description: a.effect, score: a.nature === '和諧' ? 85 : 60, type: a.nature === '和諧' ? 'strength' : 'weakness', dimension: 'spiritual', source: 'astro-full' });
  });
  return { system: 'astro-full', systemName: '西洋占星（深度版）', rawData: r, traits, timing: [] };
}
