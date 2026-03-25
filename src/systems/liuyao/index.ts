/**
 * 造命 ZaoMing — 六爻占卜模組
 * 
 * 六爻 = 易經的實戰應用
 * 從生辰+問事時間 → 起卦 → 裝卦 → 判斷吉凶
 * 
 * 六爻要素：主卦 + 變卦 + 六親 + 世應 + 動爻
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

// ====== 八卦基礎 ======

const BAGUA = {
  qian: { name: '乾', symbol: '☰', lines: [1, 1, 1], element: '金', nature: '天' },
  dui:  { name: '兌', symbol: '☱', lines: [1, 1, 0], element: '金', nature: '澤' },
  li:   { name: '離', symbol: '☲', lines: [1, 0, 1], element: '火', nature: '火' },
  zhen: { name: '震', symbol: '☳', lines: [1, 0, 0], element: '木', nature: '雷' },
  xun:  { name: '巽', symbol: '☴', lines: [0, 1, 1], element: '木', nature: '風' },
  kan:  { name: '坎', symbol: '☵', lines: [0, 1, 0], element: '水', nature: '水' },
  gen:  { name: '艮', symbol: '☶', lines: [0, 0, 1], element: '土', nature: '山' },
  kun:  { name: '坤', symbol: '☷', lines: [0, 0, 0], element: '土', nature: '地' },
} as const;

type BaguaKey = keyof typeof BAGUA;

const BAGUA_KEYS: BaguaKey[] = ['qian', 'dui', 'li', 'zhen', 'xun', 'kan', 'gen', 'kun'];

// ====== 六親 ======

const SIX_RELATIVES = ['父母', '兄弟', '子孫', '妻財', '官鬼'] as const;

// ====== 六獸 ======

const SIX_BEASTS = [
  { name: '青龍', nature: '吉慶', element: '木' },
  { name: '朱雀', nature: '口舌文書', element: '火' },
  { name: '勾陳', nature: '田土遲滯', element: '土' },
  { name: '螣蛇', nature: '虛驚怪異', element: '土' },
  { name: '白虎', nature: '凶險疾病', element: '金' },
  { name: '玄武', nature: '盜賊暗昧', element: '水' },
];

// ====== 卦象判斷 ======

interface LiuYaoResult {
  mainHexagram: { upper: BaguaKey; lower: BaguaKey; name: string };
  changedHexagram: { upper: BaguaKey; lower: BaguaKey; name: string } | null;
  lines: { position: number; value: 0 | 1; moving: boolean; relative: string; beast: string }[];
  shiYao: number;    // 世爻位置 1-6
  yingYao: number;   // 應爻位置 1-6
  overall: { luck: string; score: number; advice: string };
}

function getHexagramName(upper: BaguaKey, lower: BaguaKey): string {
  const u = BAGUA[upper];
  const l = BAGUA[lower];
  if (upper === lower) return `${u.name}為${u.nature}`;
  return `${u.nature}${l.nature}${u.name}${l.name}`;
}

export function castLiuYao(input: BirthInfo, question?: string): LiuYaoResult {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const hour = input.hour;
  
  // 起卦（梅花易數法：用數字推算）
  const seed = year + month * 13 + day * 7 + hour * 11 + (question?.length || 0) * 3;
  
  // 六爻（從下到上）
  const lines: LiuYaoResult['lines'] = [];
  for (let i = 0; i < 6; i++) {
    const hash = (seed * (i + 1) * 17 + i * 31) % 100;
    const value: 0 | 1 = hash >= 50 ? 1 : 0;
    const moving = hash % 4 === 0; // 25% 機率動爻
    const relIdx = (seed + i * 7) % 5;
    const beastIdx = (day + i) % 6;
    
    lines.push({
      position: i + 1,
      value,
      moving,
      relative: SIX_RELATIVES[relIdx],
      beast: SIX_BEASTS[beastIdx].name,
    });
  }

  // 上下卦
  const lowerLines = lines.slice(0, 3).map(l => l.value);
  const upperLines = lines.slice(3, 6).map(l => l.value);
  
  const findGua = (lines: number[]): BaguaKey => {
    for (const key of BAGUA_KEYS) {
      const gua = BAGUA[key];
      if (gua.lines[0] === lines[2] && gua.lines[1] === lines[1] && gua.lines[2] === lines[0]) {
        return key;
      }
    }
    return 'kun';
  };

  const lower = findGua(lowerLines);
  const upper = findGua(upperLines);

  // 變卦（如果有動爻）
  let changedHexagram: LiuYaoResult['changedHexagram'] = null;
  const hasMoving = lines.some(l => l.moving);
  if (hasMoving) {
    const changedLines = lines.map(l => ({
      ...l,
      value: (l.moving ? (1 - l.value) : l.value) as 0 | 1,
    }));
    const cLower = findGua(changedLines.slice(0, 3).map(l => l.value));
    const cUpper = findGua(changedLines.slice(3, 6).map(l => l.value));
    changedHexagram = {
      upper: cUpper,
      lower: cLower,
      name: getHexagramName(cUpper, cLower),
    };
  }

  // 世應
  const shiYao = ((seed * 3 + day) % 6) + 1;
  const yingYao = shiYao <= 3 ? shiYao + 3 : shiYao - 3;

  // 綜合判斷
  const movingCount = lines.filter(l => l.moving).length;
  const yangCount = lines.filter(l => l.value === 1).length;
  
  let luck: string;
  let score: number;
  let advice: string;

  // 世爻是否動
  const shiLine = lines[shiYao - 1];
  const shiMoving = shiLine?.moving || false;
  
  if (yangCount >= 4 && !hasMoving) {
    luck = '大吉'; score = 90;
    advice = '陽氣充足，局勢穩定。主動出擊，把握機會。';
  } else if (yangCount >= 4 && shiMoving) {
    luck = '吉'; score = 80;
    advice = '世爻動，代表你主動出擊會有好結果。時機已到，果斷行動。';
  } else if (movingCount >= 3) {
    luck = '變動大'; score = 55;
    advice = '動爻太多，局勢不穩定。建議等待明確方向再行動。';
  } else if (yangCount <= 2) {
    luck = '偏弱'; score = 45;
    advice = '陰氣偏重，力量不足。建議蓄力等待，或尋求貴人幫助。';
  } else {
    luck = '平'; score = 65;
    advice = '不好不壞，穩步推進即可。注意世爻所臨六親的方向。';
  }

  return {
    mainHexagram: { upper, lower, name: getHexagramName(upper, lower) },
    changedHexagram,
    lines,
    shiYao,
    yingYao,
    overall: { luck, score, advice },
  };
}

// ====== 統一介面 ======

export function liuyaoToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const result = castLiuYao(input);
  
  const traits: Trait[] = [
    {
      label: `六爻主卦：${result.mainHexagram.name}`,
      description: `世爻第${result.shiYao}爻（${result.lines[result.shiYao - 1]?.relative}）`,
      score: result.overall.score,
      type: result.overall.score >= 60 ? 'strength' : 'weakness',
      dimension: 'spiritual',
      source: 'liuyao',
    },
  ];

  if (result.changedHexagram) {
    traits.push({
      label: `六爻變卦：${result.changedHexagram.name}`,
      description: '動爻變化後的發展方向',
      score: result.overall.score,
      type: 'strength',
      dimension: 'career',
      source: 'liuyao',
    });
  }

  traits.push({
    label: `六爻斷卦：${result.overall.luck}`,
    description: result.overall.advice,
    score: result.overall.score,
    type: result.overall.score >= 60 ? 'strength' : 'weakness',
    dimension: 'career',
    source: 'liuyao',
  });

  return {
    system: 'liuyao',
    systemName: '六爻占卜',
    rawData: result,
    traits,
    timing: [],
  };
}

// ====== CLI ======

if (require.main === module) {
  const input: BirthInfo = {
    solarDate: process.argv[2] || '1993-08-07',
    hour: parseInt(process.argv[3] || '9'),
    gender: 'male',
  };

  const result = castLiuYao(input, '事業發展');

  console.log(`\n🎲 六爻占卜：${input.solarDate} ${input.hour}時`);
  console.log(`   問事：事業發展`);
  console.log('═'.repeat(50));
  
  console.log(`\n  主卦：${result.mainHexagram.name}`);
  if (result.changedHexagram) {
    console.log(`  變卦：${result.changedHexagram.name}`);
  }
  console.log(`  世爻：第${result.shiYao}爻 | 應爻：第${result.yingYao}爻`);
  
  console.log('\n  爻位（由上到下）：');
  for (let i = 5; i >= 0; i--) {
    const line = result.lines[i];
    const yinYang = line.value === 1 ? '━━━' : '━ ━';
    const moving = line.moving ? ' ○動' : '';
    const shi = i + 1 === result.shiYao ? ' ◆世' : '';
    const ying = i + 1 === result.yingYao ? ' ◇應' : '';
    console.log(`  ${i + 1} ${yinYang}${moving}${shi}${ying}  ${line.relative} ${line.beast}`);
  }

  console.log(`\n  斷卦：${result.overall.luck}（${result.overall.score}/100）`);
  console.log(`  💡 ${result.overall.advice}`);
}
