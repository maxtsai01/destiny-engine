/**
 * 造命 ZaoMing — 七政四餘（中國古典占星）
 * 七政=日月金木水火土，四餘=紫氣月孛羅睺計都
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const PLANETS = [
  { name: '太陽', element: '火', domain: '官貴、父親、丈夫', nature: '光明正大，領導權威' },
  { name: '太陰', element: '水', domain: '財帛、母親、妻子', nature: '陰柔多變，情感豐富' },
  { name: '金星', element: '金', domain: '婚姻、藝術、財富', nature: '愛美和諧，人緣極佳' },
  { name: '木星', element: '木', domain: '福德、學問、宗教', nature: '仁慈寬厚，智慧福氣' },
  { name: '水星', element: '水', domain: '才智、口才、交通', nature: '聰明伶俐，善於溝通' },
  { name: '火星', element: '火', domain: '疾厄、競爭、軍事', nature: '剛勇果斷，但易衝動' },
  { name: '土星', element: '土', domain: '壽命、限制、考驗', nature: '穩重踏實，但多阻礙' },
];
const EXTRAS = [
  { name: '紫氣', nature: '吉星，福氣貴氣', luck: 90 },
  { name: '月孛', nature: '凶星，桃花劫財', luck: 35 },
  { name: '羅睺', nature: '凶星，障礙遮蔽', luck: 30 },
  { name: '計都', nature: '凶星，災厄損傷', luck: 25 },
];
const MANSIONS = [
  { name: '角', animal: '蛟', luck: 75 }, { name: '亢', animal: '龍', luck: 70 }, { name: '氐', animal: '貉', luck: 65 },
  { name: '房', animal: '兔', luck: 85 }, { name: '心', animal: '狐', luck: 50 }, { name: '尾', animal: '虎', luck: 75 },
  { name: '箕', animal: '豹', luck: 60 }, { name: '斗', animal: '獬', luck: 80 }, { name: '牛', animal: '牛', luck: 70 },
  { name: '女', animal: '蝠', luck: 55 }, { name: '虛', animal: '鼠', luck: 60 }, { name: '危', animal: '燕', luck: 50 },
  { name: '室', animal: '豬', luck: 85 }, { name: '壁', animal: '貐', luck: 80 }, { name: '奎', animal: '狼', luck: 65 },
  { name: '婁', animal: '狗', luck: 75 }, { name: '胃', animal: '雉', luck: 60 }, { name: '昴', animal: '雞', luck: 70 },
  { name: '畢', animal: '烏', luck: 75 }, { name: '觜', animal: '猴', luck: 55 }, { name: '參', animal: '猿', luck: 80 },
  { name: '井', animal: '犴', luck: 85 }, { name: '鬼', animal: '羊', luck: 45 }, { name: '柳', animal: '獐', luck: 50 },
  { name: '星', animal: '馬', luck: 80 }, { name: '張', animal: '鹿', luck: 85 }, { name: '翼', animal: '蛇', luck: 60 },
  { name: '軫', animal: '蚓', luck: 70 },
];

export function calculateQizheng(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const seed = year + month * 13 + day * 7 + input.hour * 11;
  const mingPlanet = PLANETS[seed % 7];
  const luPlanet = PLANETS[(seed + 3) % 7];
  const caiPlanet = PLANETS[(seed + 5) % 7];
  const extra = EXTRAS[(seed + day) % 4];
  const mansion = MANSIONS[(seed + month) % 28];
  const score = Math.round((mansion.luck + extra.luck + 70) / 3 + (mingPlanet.element === '木' || mingPlanet.element === '火' ? 5 : 0));
  return { mingPlanet, luPlanet, caiPlanet, extra, mansion, overallScore: score };
}

export function qizhengToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateQizheng(input);
  return {
    system: 'qizheng', systemName: '七政四餘', rawData: r, timing: [],
    traits: [
      { label: `命宮主星：${r.mingPlanet.name}（${r.mingPlanet.element}）`, description: `${r.mingPlanet.nature}。主管：${r.mingPlanet.domain}`, score: 80, type: 'strength', dimension: 'spiritual', source: 'qizheng' },
      { label: `官祿主星：${r.luPlanet.name}`, description: `事業由${r.luPlanet.name}主管。${r.luPlanet.nature}`, score: 75, type: 'strength', dimension: 'career', source: 'qizheng' },
      { label: `本命宿：${r.mansion.name}宿（${r.mansion.animal}）`, description: `吉凶${r.mansion.luck}/100`, score: r.mansion.luck, type: r.mansion.luck >= 60 ? 'strength' : 'weakness', dimension: 'spiritual', source: 'qizheng' },
      { label: `四餘：${r.extra.name}`, description: r.extra.nature, score: r.extra.luck, type: r.extra.luck >= 60 ? 'strength' : 'weakness', dimension: 'spiritual', source: 'qizheng' },
    ],
  };
}
