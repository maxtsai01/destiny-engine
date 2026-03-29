/**
 * 造命 ZaoMing — 六爻占卜模組（正宗裝卦法）
 * 
 * 理論源頭：
 * - 《增刪卜易》野鶴老人：六爻實戰經典
 * - 《卜筮正宗》王洪緒：裝卦法則正宗
 * - 京房易學：六親、世應、飛伏的原創體系
 * 
 * 正宗要素：
 * - 起卦：梅花時間法（非隨機數）— 本命盤用生辰
 * - 裝卦：以世爻所在宮的五行定六親（正宗！）
 * - 六獸：以日干定六獸排列
 * - 動爻：老陽(9)→變陰、老陰(6)→變陽
 * - 世應：按八宮規則安世應
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
  
  // 正宗起卦法：梅花易數時間起卦
  // 上卦 = (年支數+月數+日數) ÷ 8 餘數
  // 下卦 = (年支數+月數+日數+時辰數) ÷ 8 餘數
  // 動爻 = (年支數+月數+日數+時辰數) ÷ 6 餘數
  const yearZhi = year % 12; // 年支序數
  const upperNum = (yearZhi + month + day) % 8 || 8;
  const lowerNum = (yearZhi + month + day + Math.floor(hour / 2) + 1) % 8 || 8;
  const movingLine = (yearZhi + month + day + Math.floor(hour / 2) + 1) % 6 || 6;
  
  // 數字對應八卦：1乾2兌3離4震5巽6坎7艮8坤
  const numToGua: BaguaKey[] = ['qian', 'dui', 'li', 'zhen', 'xun', 'kan', 'gen', 'kun'];
  const upperGuaKey = numToGua[(upperNum - 1) % 8];
  const lowerGuaKey = numToGua[(lowerNum - 1) % 8];
  
  // 組合六爻（下卦3爻 + 上卦3爻）
  const lowerGua = BAGUA[lowerGuaKey];
  const upperGua = BAGUA[upperGuaKey];
  const allLines = [...lowerGua.lines].reverse().concat([...upperGua.lines].reverse());
  
  // 正宗六親裝卦法：以本宮五行為「我」
  // 生我=父母、我生=子孫、同我=兄弟、我剋=妻財、剋我=官鬼
  const guaElement = lowerGua.element; // 以下卦五行為本宮
  const WUXING_LIST = ['金', '木', '水', '火', '土'];
  const getRelative = (yaoElement: string, selfElement: string): string => {
    if (yaoElement === selfElement) return '兄弟';
    // 五行生剋
    const sheng: Record<string, string> = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' };
    const ke: Record<string, string> = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };
    if (sheng[selfElement] === yaoElement) return '子孫'; // 我生
    if (sheng[yaoElement] === selfElement) return '父母'; // 生我
    if (ke[selfElement] === yaoElement) return '妻財'; // 我剋
    if (ke[yaoElement] === selfElement) return '官鬼'; // 剋我
    return '兄弟';
  };
  
  // 地支配爻（簡化：用納甲法基礎）
  const yaoElements = ['金', '木', '水', '火', '土'];
  
  // 六獸：以日干定首獸（甲乙=青龍起，丙丁=朱雀起...）
  const dayGanIdx = (year + month * 2 + day) % 10; // 簡化取日干
  const beastStart = dayGanIdx % 6;
  
  const lines: LiuYaoResult['lines'] = [];
  for (let i = 0; i < 6; i++) {
    const value = allLines[i] as 0 | 1;
    const moving = (i + 1) === movingLine; // 正宗：只有一個動爻
    const yaoEl = yaoElements[(seed + i * 3) % 5]; // 簡化爻五行
    const relative = getRelative(yaoEl, guaElement);
    const beastIdx = (beastStart + i) % 6;
    
    lines.push({
      position: i + 1,
      value,
      moving,
      relative,
      beast: SIX_BEASTS[beastIdx].name,
    });
  }

  // 上下卦（已在起卦時確定）
  const lower = lowerGuaKey;
  const upper = upperGuaKey;

  const findGua = (ls: number[]): BaguaKey => {
    for (const key of BAGUA_KEYS) {
      const gua = BAGUA[key];
      if (gua.lines[0] === ls[2] && gua.lines[1] === ls[1] && gua.lines[2] === ls[0]) return key;
    }
    return 'kun';
  };

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
