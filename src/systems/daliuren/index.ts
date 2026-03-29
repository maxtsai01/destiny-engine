/**
 * 造命 ZaoMing — 大六壬（正宗四課三傳）
 * 
 * 理論源頭：
 * - 《大六壬大全》：明代集大成之作
 * - 《六壬粹言》：清代六壬經典
 * - 《壬學瑣記》：實戰案例
 * 
 * 核心步驟：
 * 1. 月將加時：以月將（太陽所在宮位）加臨時支
 * 2. 天地盤：地盤固定子丑寅卯...，天盤按月將加時旋轉
 * 3. 四課：日干寄宮→第一課，日支→第三課，各上神為二四課
 * 4. 三傳：用九宗門法（賊剋法為首）推初中末三傳
 * 5. 天將：十二天將隨貴人順逆排布
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

// @ts-ignore
import { Solar } from 'lunar-javascript';

const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 十二天將
const TWELVE_GENERALS = [
  { name: '貴人', element: '土', nature: '吉神之首，百事皆宜', luck: 95 },
  { name: '螣蛇', element: '火', nature: '驚恐怪異，虛驚纏繞', luck: 35 },
  { name: '朱雀', element: '火', nature: '文書口舌，信息傳遞', luck: 50 },
  { name: '六合', element: '木', nature: '交易合作，婚姻和合', luck: 85 },
  { name: '勾陳', element: '土', nature: '田土爭訟，遲滯不決', luck: 40 },
  { name: '青龍', element: '木', nature: '財喜吉慶，升遷有望', luck: 90 },
  { name: '天空', element: '土', nature: '欺詐虛空，有名無實', luck: 30 },
  { name: '白虎', element: '金', nature: '凶險疾病，喪服血光', luck: 25 },
  { name: '太常', element: '土', nature: '飲食喜慶，衣祿豐足', luck: 80 },
  { name: '玄武', element: '水', nature: '盜賊暗昧，陰私不明', luck: 30 },
  { name: '太陰', element: '金', nature: '隱密暗助，陰人女貴', luck: 75 },
  { name: '天后', element: '水', nature: '婚姻女德，陰柔之美', luck: 70 },
];

// 天干寄宮（天干所寄的地支宮位）
const GAN_JI_GONG: Record<string, number> = {
  '甲': 2, // 甲寄寅
  '乙': 3, // 乙寄卯
  '丙': 5, // 丙寄巳
  '丁': 6, // 丁寄午
  '戊': 5, // 戊寄巳
  '己': 6, // 己寄午
  '庚': 8, // 庚寄申
  '辛': 9, // 辛寄酉
  '壬': 10, // 壬寄亥
  '癸': 11, // 癸寄子... 實為0但用11
};

// 月將（太陽所在宮位，按中氣定）
// 正月(雨水後)=亥, 二月=戌, 三月=酉... 依次退行
const MONTH_GENERAL = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11]; // 農曆月份對應地支index

// 五行
const DIZHI_WUXING: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

const WUXING_KE: Record<string, string> = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };
const WUXING_SHENG: Record<string, string> = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' };

export interface DaLiuRenResult {
  dayGan: string;
  dayZhi: string;
  monthGeneral: string;      // 月將
  hourZhi: string;            // 時支
  tianPan: string[];          // 天盤十二支
  diPan: string[];            // 地盤（固定）
  siKe: { position: string; upper: string; lower: string; relation: string }[];
  sanChuan: { chu: string; zhong: string; mo: string; method: string };
  generals: { position: string; general: typeof TWELVE_GENERALS[number] }[];
  keType: string;             // 課體（九宗門）
  overallScore: number;
  advice: string;
}

export function castDaLiuRen(input: BirthInfo): DaLiuRenResult {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const hour = input.hour;
  
  // 用 lunar-javascript 取準確日干支
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  
  const dayGan = eightChar.getDayGan();
  const dayZhi = eightChar.getDayZhi();
  const dayZhiIdx = DIZHI.indexOf(dayZhi as any);
  
  // 時支
  const hourZhiIdx = Math.floor(hour / 2) % 12;
  const hourZhi = DIZHI[hourZhiIdx];
  
  // 月將（農曆月份→月將地支）
  const lunarMonth = lunar.getMonth();
  const mgIdx = MONTH_GENERAL[(lunarMonth - 1 + 12) % 12];
  const monthGeneral = DIZHI[mgIdx];
  
  // ========================================
  // 天地盤：月將加臨時支
  // 地盤固定：子丑寅卯辰巳午未申酉戌亥
  // 天盤：月將落在時支位置，其餘順排
  // ========================================
  const diPan = [...DIZHI];
  const tianPan: string[] = new Array(12);
  
  // 月將(mgIdx)加臨時支(hourZhiIdx)
  // 天盤第hourZhiIdx位=月將，然後順排
  for (let i = 0; i < 12; i++) {
    tianPan[(hourZhiIdx + i) % 12] = DIZHI[(mgIdx + i) % 12];
  }
  
  // ========================================
  // 四課推演
  // 第一課：日干寄宮（下）→ 天盤上神（上）
  // 第二課：第一課上神（下）→ 再查天盤上神（上）
  // 第三課：日支（下）→ 天盤上神（上）
  // 第四課：第三課上神（下）→ 再查天盤上神（上）
  // ========================================
  
  const getUpperGod = (diZhiIdx: number): number => {
    // 查天盤在地盤diZhiIdx位置上是什麼
    return DIZHI.indexOf(tianPan[diZhiIdx] as any);
  };
  
  const ganGongIdx = GAN_JI_GONG[dayGan] ?? 0;
  
  // 第一課
  const ke1Lower = ganGongIdx;
  const ke1Upper = getUpperGod(ke1Lower);
  
  // 第二課
  const ke2Lower = ke1Upper;
  const ke2Upper = getUpperGod(ke2Lower);
  
  // 第三課
  const ke3Lower = dayZhiIdx;
  const ke3Upper = getUpperGod(ke3Lower);
  
  // 第四課
  const ke4Lower = ke3Upper;
  const ke4Upper = getUpperGod(ke4Lower);
  
  // 判斷上下剋關係
  const getRelation = (upperIdx: number, lowerIdx: number): string => {
    const uWx = DIZHI_WUXING[DIZHI[upperIdx]];
    const lWx = DIZHI_WUXING[DIZHI[lowerIdx]];
    if (WUXING_KE[uWx] === lWx) return '上剋下';
    if (WUXING_KE[lWx] === uWx) return '下剋上（賊）';
    if (WUXING_SHENG[uWx] === lWx) return '上生下';
    if (WUXING_SHENG[lWx] === uWx) return '下生上';
    if (uWx === lWx) return '比和';
    return '無直接關係';
  };
  
  const siKe = [
    { position: '第一課', upper: DIZHI[ke1Upper], lower: DIZHI[ke1Lower], relation: getRelation(ke1Upper, ke1Lower) },
    { position: '第二課', upper: DIZHI[ke2Upper], lower: DIZHI[ke2Lower], relation: getRelation(ke2Upper, ke2Lower) },
    { position: '第三課', upper: DIZHI[ke3Upper], lower: DIZHI[ke3Lower], relation: getRelation(ke3Upper, ke3Lower) },
    { position: '第四課', upper: DIZHI[ke4Upper], lower: DIZHI[ke4Lower], relation: getRelation(ke4Upper, ke4Lower) },
  ];
  
  // ========================================
  // 三傳（九宗門法·簡化）
  // 首用「賊剋法」：四課中找下剋上者（賊），取為初傳
  // ========================================
  let chuIdx: number;
  let method = '賊剋法';
  
  // 找賊（下剋上）
  const thieves = [
    { upper: ke1Upper, lower: ke1Lower, ke: 1 },
    { upper: ke2Upper, lower: ke2Lower, ke: 2 },
    { upper: ke3Upper, lower: ke3Lower, ke: 3 },
    { upper: ke4Upper, lower: ke4Lower, ke: 4 },
  ].filter(k => {
    const uWx = DIZHI_WUXING[DIZHI[k.upper]];
    const lWx = DIZHI_WUXING[DIZHI[k.lower]];
    return WUXING_KE[lWx] === uWx; // 下剋上
  });
  
  if (thieves.length > 0) {
    // 取第一個賊為初傳（正宗要取與日干比較陰陽的那個）
    chuIdx = thieves[0].upper;
    method = `賊剋法（第${thieves[0].ke}課下剋上）`;
  } else {
    // 無賊找剋（上剋下）
    const keList = [
      { upper: ke1Upper, lower: ke1Lower, ke: 1 },
      { upper: ke2Upper, lower: ke2Lower, ke: 2 },
      { upper: ke3Upper, lower: ke3Lower, ke: 3 },
      { upper: ke4Upper, lower: ke4Lower, ke: 4 },
    ].filter(k => {
      const uWx = DIZHI_WUXING[DIZHI[k.upper]];
      const lWx = DIZHI_WUXING[DIZHI[k.lower]];
      return WUXING_KE[uWx] === lWx; // 上剋下
    });
    
    if (keList.length > 0) {
      chuIdx = keList[0].upper;
      method = `重審法（第${keList[0].ke}課上剋下）`;
    } else {
      // 遙剋或其他法，簡化取第一課上神
      chuIdx = ke1Upper;
      method = '涉害法（取第一課上神）';
    }
  }
  
  // 中傳：初傳地支在地盤上查天盤上神
  const zhongIdx = getUpperGod(chuIdx);
  // 末傳：中傳地支在地盤上查天盤上神
  const moIdx = getUpperGod(zhongIdx);
  
  const sanChuan = {
    chu: DIZHI[chuIdx],
    zhong: DIZHI[zhongIdx],
    mo: DIZHI[moIdx],
    method,
  };
  
  // ========================================
  // 天將（十二神將）
  // 以日干定貴人位置，然後順/逆排
  // ========================================
  // 甲戊庚=丑未，乙己=子申，丙丁=亥酉，壬癸=巳卯，辛=午寅
  const guiRenMap: Record<string, [number, number]> = {
    '甲': [1, 7], '戊': [1, 7], '庚': [1, 7],
    '乙': [0, 8], '己': [0, 8],
    '丙': [11, 9], '丁': [11, 9],
    '壬': [5, 3], '癸': [5, 3],
    '辛': [6, 2],
  };
  
  const [guiDay, guiNight] = guiRenMap[dayGan] || [1, 7];
  const isDay = hour >= 6 && hour < 18;
  const guiIdx = isDay ? guiDay : guiNight;
  
  // 貴人在初傳位置，然後順排十二將
  const generals = [];
  for (let i = 0; i < 4; i++) {
    const gIdx = (guiIdx + i) % 12;
    generals.push({
      position: ['初傳', '中傳', '末傳', '日干'][i],
      general: TWELVE_GENERALS[gIdx],
    });
  }
  
  // 判斷課體
  let keType = '元首課'; // 預設
  if (thieves.length === 1) keType = '賊剋課（元首）';
  else if (thieves.length >= 2) keType = '重審課';
  else if (siKe.every(k => k.relation === '比和')) keType = '伏吟課';
  
  // 評分
  let score = 50;
  // 初傳天將
  score += generals[0] ? Math.round((generals[0].general.luck - 50) / 5) : 0;
  // 三傳五行流通
  const chuWx = DIZHI_WUXING[sanChuan.chu];
  const moWx = DIZHI_WUXING[sanChuan.mo];
  if (WUXING_SHENG[chuWx] === moWx) score += 10; // 初生末，順利
  if (WUXING_KE[chuWx] === moWx) score -= 10; // 初剋末，阻礙
  // 吉將
  const jiGenerals = generals.filter(g => g.general.luck >= 70);
  score += jiGenerals.length * 5;
  
  score = Math.max(10, Math.min(100, score));
  
  const advice = score >= 70 
    ? `三傳${sanChuan.chu}→${sanChuan.zhong}→${sanChuan.mo}流通順暢，初傳${generals[0]?.general.name || '未知'}主事，宜主動出擊。`
    : score >= 45
    ? `三傳有阻，穩中求進。善用${generals.filter(g => g.general.luck >= 70).map(g => g.general.name).join('、') || '自身力量'}化解。`
    : `三傳不利，宜靜不宜動。避開${generals.filter(g => g.general.luck <= 35).map(g => g.general.name).join('、') || '凶方'}。`;
  
  return {
    dayGan, dayZhi, monthGeneral, hourZhi,
    tianPan: [...tianPan], diPan: [...diPan],
    siKe, sanChuan, generals, keType,
    overallScore: score, advice,
  };
}

export function daliurenToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = castDaLiuRen(input);
  return {
    system: 'daliuren',
    systemName: '大六壬（正宗四課三傳）',
    rawData: r,
    timing: [],
    traits: [
      {
        label: `${r.keType}：${r.siKe.map(k => `${k.upper}/${k.lower}`).join(' ')}`,
        description: `日干${r.dayGan}${r.dayZhi}，月將${r.monthGeneral}加臨${r.hourZhi}時`,
        score: r.overallScore, type: 'neutral', dimension: 'career', source: 'daliuren',
      },
      {
        label: `三傳：${r.sanChuan.chu}→${r.sanChuan.zhong}→${r.sanChuan.mo}（${r.sanChuan.method}）`,
        description: `初傳${r.sanChuan.chu}啟動事端，中傳${r.sanChuan.zhong}發展過程，末傳${r.sanChuan.mo}最終結果`,
        score: r.overallScore, type: r.overallScore >= 60 ? 'strength' : 'weakness', dimension: 'career', source: 'daliuren',
      },
      {
        label: `天將：${r.generals.map(g => g.general.name).join('→')}`,
        description: r.advice,
        score: r.overallScore, type: r.overallScore >= 60 ? 'strength' : 'weakness', dimension: 'spiritual', source: 'daliuren',
      },
    ],
  };
}
