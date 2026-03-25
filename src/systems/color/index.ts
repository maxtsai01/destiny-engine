/**
 * 造命 ZaoMing — 色彩心理學模組
 * 從命盤推算個人色彩能量 + 幸運色
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const COLORS = [
  { name: '紅色', en: 'Red', energy: '行動力、熱情、勇氣', chakra: '海底輪', element: '火', personality: '熱血行動派，天生領袖，精力充沛', luckyScene: '重要談判、競賽、面試穿紅色增氣勢' },
  { name: '橙色', en: 'Orange', energy: '創造力、樂觀、社交', chakra: '臍輪', element: '火', personality: '創意無限，社交達人，樂於分享', luckyScene: '社交場合、創意會議、約會穿橙色增魅力' },
  { name: '黃色', en: 'Yellow', energy: '自信、智慧、個人力量', chakra: '太陽神經叢', element: '土', personality: '自信閃耀，邏輯清晰，有影響力', luckyScene: '考試、報告、學習時用黃色增專注' },
  { name: '綠色', en: 'Green', energy: '和諧、成長、療癒', chakra: '心輪', element: '木', personality: '溫和包容，追求平衡，善於療癒', luckyScene: '壓力大時穿綠色放鬆，投資理財用綠色' },
  { name: '藍色', en: 'Blue', energy: '溝通、信任、平靜', chakra: '喉輪', element: '水', personality: '冷靜理性，善於表達，值得信賴', luckyScene: '演講、談判、溝通時穿藍色增說服力' },
  { name: '靛色', en: 'Indigo', energy: '直覺、洞察、第六感', chakra: '眉心輪', element: '水', personality: '直覺敏銳，善於觀察，有靈性天賦', luckyScene: '冥想、重大決策時用靛色增直覺' },
  { name: '紫色', en: 'Purple', energy: '靈性、轉化、高貴', chakra: '頂輪', element: '火', personality: '高貴神秘，追求靈性成長，有藝術天賦', luckyScene: '需要靈感時穿紫色，提升格局' },
  { name: '白色', en: 'White', energy: '純淨、清明、新開始', chakra: '全脈輪', element: '金', personality: '追求完美，心地純淨，有潔癖傾向', luckyScene: '新的開始、轉運時穿白色淨化' },
  { name: '黑色', en: 'Black', energy: '力量、神秘、保護', chakra: '根基', element: '水', personality: '深沉穩重，有權威感，保護意識強', luckyScene: '需要權威感的場合穿黑色' },
];

export function calculateColor(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const seed = year + month * 13 + day * 7 + input.hour;

  const mainColor = COLORS[seed % COLORS.length];
  const subColor = COLORS[(seed + 4) % COLORS.length];
  const luckyColor = COLORS[(seed + 7) % COLORS.length];
  const avoidColor = COLORS[(seed + 2) % COLORS.length];

  // 色彩能量分布
  const distribution = COLORS.map((c, i) => ({
    color: c.name, score: 30 + ((seed + i * 11) % 50),
  })).sort((a, b) => b.score - a.score);

  return { mainColor, subColor, luckyColor, avoidColor, distribution };
}

export function colorToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateColor(input);
  return {
    system: 'color', systemName: '色彩心理學', rawData: r, timing: [],
    traits: [
      { label: `本命色：${r.mainColor.name}`, description: `${r.mainColor.personality}。脈輪：${r.mainColor.chakra}`, score: 85, type: 'strength', dimension: 'spiritual', source: 'color' },
      { label: `副色：${r.subColor.name}`, description: r.subColor.energy, score: 75, type: 'strength', dimension: 'spiritual', source: 'color' },
      { label: `幸運色：${r.luckyColor.name}`, description: r.luckyColor.luckyScene, score: 80, type: 'strength', dimension: 'career', source: 'color' },
      { label: `注意色：${r.avoidColor.name}`, description: `避免過度使用${r.avoidColor.name}`, score: 50, type: 'weakness', dimension: 'health', source: 'color' },
    ],
  };
}
