/**
 * 造命 ZaoMing — 測字學模組
 * 拆字解意：中文字形 → 五行/吉凶分析
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const RADICAL_ELEMENTS: Record<string, { element: string; meaning: string }> = {
  '氵': { element: '水', meaning: '流動、智慧、財運' }, '水': { element: '水', meaning: '潤澤、靈活' },
  '火': { element: '火', meaning: '光明、熱情、動力' }, '灬': { element: '火', meaning: '變化、能量' },
  '木': { element: '木', meaning: '生長、仁慈、發展' }, '艹': { element: '木', meaning: '生機、希望' },
  '金': { element: '金', meaning: '堅毅、果斷、收穫' }, '钅': { element: '金', meaning: '鋒利、精準' },
  '土': { element: '土', meaning: '穩重、包容、基礎' }, '山': { element: '土', meaning: '穩固、高遠' },
  '口': { element: '土', meaning: '表達、溝通' }, '日': { element: '火', meaning: '光明、領導' },
  '月': { element: '水', meaning: '陰柔、情感' }, '心': { element: '火', meaning: '情感、意志' },
  '人': { element: '木', meaning: '人際、社交' }, '手': { element: '金', meaning: '行動、技能' },
  '石': { element: '土', meaning: '堅固、永恆' }, '田': { element: '土', meaning: '財產、根基' },
  '目': { element: '木', meaning: '觀察、洞察' }, '耳': { element: '水', meaning: '傾聽、智慧' },
  '足': { element: '木', meaning: '行動、前進' }, '力': { element: '金', meaning: '力量、執行' },
  '女': { element: '水', meaning: '柔美、陰性' }, '子': { element: '水', meaning: '新生、傳承' },
  '宀': { element: '土', meaning: '家庭、庇護' }, '门': { element: '木', meaning: '門戶、機會' },
};

const STROKE_LUCK = [
  { range: '1-2', luck: '太極之數，萬物開泰', score: 80 },
  { range: '3-4', luck: '陰陽之數，進退保守', score: 65 },
  { range: '5-6', luck: '福祿之數，循環超達', score: 85 },
  { range: '7-8', luck: '精悍之數，進取如意', score: 80 },
  { range: '9-10', luck: '終結之數，暗藏兇危', score: 50 },
  { range: '11-12', luck: '旱苗逢雨，陰陽和合', score: 90 },
  { range: '13-14', luck: '才藝之數，智能超群', score: 85 },
  { range: '15-16', luck: '福壽之數，圓滿吉祥', score: 95 },
  { range: '17-18', luck: '堅操之數，突破萬難', score: 75 },
  { range: '19-20', luck: '多難之數，進退維谷', score: 45 },
  { range: '21+', luck: '首領之數，風光長久', score: 88 },
];

function analyzeChar(char: string, seed: number) {
  // 模擬筆畫（實際需字典）
  const strokeEstimate = ((char.charCodeAt(0) - 0x4e00) % 20) + 1;
  const luckEntry = STROKE_LUCK.find((_, i) => strokeEstimate <= (i + 1) * 2) || STROKE_LUCK[STROKE_LUCK.length - 1];

  // 部首五行（簡化）
  const radicalKeys = Object.keys(RADICAL_ELEMENTS);
  const radicalIdx = (char.charCodeAt(0) + seed) % radicalKeys.length;
  const radical = RADICAL_ELEMENTS[radicalKeys[radicalIdx]];

  return { char, strokes: strokeEstimate, radical: radicalKeys[radicalIdx], element: radical.element, meaning: radical.meaning, luck: luckEntry.luck, score: luckEntry.score };
}

export function calculateCezi(input: BirthInfo, name?: string) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const seed = year + month + day + input.hour;
  const nameChars = name ? name.split('') : ['命', '運', '造'];

  const analysis = nameChars.map(c => analyzeChar(c, seed));
  const elements = analysis.map(a => a.element);
  const uniqueElements = [...new Set(elements)];
  const elementBalance = uniqueElements.length >= 3 ? '五行均衡' : uniqueElements.length === 2 ? '五行偏旺' : '五行單一';
  const avgScore = Math.round(analysis.reduce((s, a) => s + a.score, 0) / analysis.length);

  return { analysis, elementBalance, avgScore };
}

export function ceziToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateCezi(input, input.name);
  const traits: Trait[] = r.analysis.map(a => ({
    label: `「${a.char}」${a.strokes}畫（${a.element}）`, description: `${a.meaning}。${a.luck}`,
    score: a.score, type: a.score >= 60 ? 'strength' as const : 'weakness' as const,
    dimension: 'spiritual', source: 'cezi',
  }));
  traits.push({ label: `測字五行：${r.elementBalance}`, description: `平均${r.avgScore}/100`, score: r.avgScore, type: 'strength', dimension: 'spiritual', source: 'cezi' });
  return { system: 'cezi', systemName: '測字學', rawData: r, traits, timing: [] };
}
