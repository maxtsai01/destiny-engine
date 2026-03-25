/**
 * 造命 ZaoMing — 風水方位模組
 * 
 * 八宅風水：從出生年算出命卦（東四命/西四命）
 * → 吉凶方位 → 辦公桌/床位/大門建議
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

// ====== 九宮 ======

interface GuaInfo {
  name: string;
  group: '東四命' | '西四命';
  element: string;
  direction: string;
  goodDirections: { name: string; direction: string; use: string }[];
  badDirections: { name: string; direction: string; avoid: string }[];
}

const GUA_MAP: Record<number, GuaInfo> = {
  1: {
    name: '坎卦', group: '東四命', element: '水', direction: '北',
    goodDirections: [
      { name: '生氣', direction: '東南', use: '最佳財位，放辦公桌' },
      { name: '天醫', direction: '東', use: '健康位，放臥室' },
      { name: '延年', direction: '南', use: '感情位，適合主臥' },
      { name: '伏位', direction: '北', use: '穩定位，適合大門' },
    ],
    badDirections: [
      { name: '禍害', direction: '西', avoid: '口舌是非' },
      { name: '六煞', direction: '東北', avoid: '桃花糾紛' },
      { name: '五鬼', direction: '西北', avoid: '意外破財' },
      { name: '絕命', direction: '西南', avoid: '最凶方位' },
    ],
  },
  2: {
    name: '坤卦', group: '西四命', element: '土', direction: '西南',
    goodDirections: [
      { name: '生氣', direction: '東北', use: '最佳財位' },
      { name: '天醫', direction: '西', use: '健康位' },
      { name: '延年', direction: '西北', use: '感情位' },
      { name: '伏位', direction: '西南', use: '穩定位' },
    ],
    badDirections: [
      { name: '禍害', direction: '東', avoid: '口舌是非' },
      { name: '六煞', direction: '北', avoid: '桃花糾紛' },
      { name: '五鬼', direction: '東南', avoid: '意外破財' },
      { name: '絕命', direction: '南', avoid: '最凶方位' },
    ],
  },
  3: {
    name: '震卦', group: '東四命', element: '木', direction: '東',
    goodDirections: [
      { name: '生氣', direction: '南', use: '最佳財位' },
      { name: '天醫', direction: '北', use: '健康位' },
      { name: '延年', direction: '東南', use: '感情位' },
      { name: '伏位', direction: '東', use: '穩定位' },
    ],
    badDirections: [
      { name: '禍害', direction: '西南', avoid: '口舌是非' },
      { name: '六煞', direction: '西北', avoid: '桃花糾紛' },
      { name: '五鬼', direction: '東北', avoid: '意外破財' },
      { name: '絕命', direction: '西', avoid: '最凶方位' },
    ],
  },
  4: {
    name: '巽卦', group: '東四命', element: '木', direction: '東南',
    goodDirections: [
      { name: '生氣', direction: '北', use: '最佳財位' },
      { name: '天醫', direction: '南', use: '健康位' },
      { name: '延年', direction: '東', use: '感情位' },
      { name: '伏位', direction: '東南', use: '穩定位' },
    ],
    badDirections: [
      { name: '禍害', direction: '西北', avoid: '口舌是非' },
      { name: '六煞', direction: '西南', avoid: '桃花糾紛' },
      { name: '五鬼', direction: '西', avoid: '意外破財' },
      { name: '絕命', direction: '東北', avoid: '最凶方位' },
    ],
  },
  6: {
    name: '乾卦', group: '西四命', element: '金', direction: '西北',
    goodDirections: [
      { name: '生氣', direction: '西', use: '最佳財位' },
      { name: '天醫', direction: '東北', use: '健康位' },
      { name: '延年', direction: '西南', use: '感情位' },
      { name: '伏位', direction: '西北', use: '穩定位' },
    ],
    badDirections: [
      { name: '禍害', direction: '東南', avoid: '口舌是非' },
      { name: '六煞', direction: '東', avoid: '桃花糾紛' },
      { name: '五鬼', direction: '北', avoid: '意外破財' },
      { name: '絕命', direction: '南', avoid: '最凶方位' },
    ],
  },
  7: {
    name: '兌卦', group: '西四命', element: '金', direction: '西',
    goodDirections: [
      { name: '生氣', direction: '西北', use: '最佳財位' },
      { name: '天醫', direction: '西南', use: '健康位' },
      { name: '延年', direction: '東北', use: '感情位' },
      { name: '伏位', direction: '西', use: '穩定位' },
    ],
    badDirections: [
      { name: '禍害', direction: '南', avoid: '口舌是非' },
      { name: '六煞', direction: '東南', avoid: '桃花糾紛' },
      { name: '五鬼', direction: '東', avoid: '意外破財' },
      { name: '絕命', direction: '北', avoid: '最凶方位' },
    ],
  },
  8: {
    name: '艮卦', group: '西四命', element: '土', direction: '東北',
    goodDirections: [
      { name: '生氣', direction: '西南', use: '最佳財位' },
      { name: '天醫', direction: '西北', use: '健康位' },
      { name: '延年', direction: '西', use: '感情位' },
      { name: '伏位', direction: '東北', use: '穩定位' },
    ],
    badDirections: [
      { name: '禍害', direction: '北', avoid: '口舌是非' },
      { name: '六煞', direction: '南', avoid: '桃花糾紛' },
      { name: '五鬼', direction: '東', avoid: '意外破財' },  
      { name: '絕命', direction: '東南', avoid: '最凶方位' },
    ],
  },
  9: {
    name: '離卦', group: '東四命', element: '火', direction: '南',
    goodDirections: [
      { name: '生氣', direction: '東', use: '最佳財位' },
      { name: '天醫', direction: '東南', use: '健康位' },
      { name: '延年', direction: '北', use: '感情位' },
      { name: '伏位', direction: '南', use: '穩定位' },
    ],
    badDirections: [
      { name: '禍害', direction: '東北', avoid: '口舌是非' },
      { name: '六煞', direction: '西', avoid: '桃花糾紛' },
      { name: '五鬼', direction: '西南', avoid: '意外破財' },
      { name: '絕命', direction: '西北', avoid: '最凶方位' },
    ],
  },
};

// 5 宮（男→坤2，女→艮8）

// ====== 計算命卦 ======

export function calculateMingGua(year: number, gender: 'male' | 'female'): number {
  // 後天八卦命卦公式
  const lastTwo = year % 100;
  const digitSum = Math.floor(lastTwo / 10) + (lastTwo % 10);
  let reduced = digitSum;
  while (reduced > 9) {
    let s = 0;
    for (const d of reduced.toString()) s += parseInt(d);
    reduced = s;
  }

  let gua: number;
  if (gender === 'male') {
    gua = 11 - reduced;
    if (gua > 9) gua -= 9;
  } else {
    gua = reduced + 4;
    if (gua > 9) gua -= 9;
  }

  // 5 宮特殊處理
  if (gua === 5) gua = gender === 'male' ? 2 : 8;

  return gua;
}

export function calculateFengshui(input: BirthInfo): { gua: number; info: GuaInfo } {
  const year = parseInt(input.solarDate.split('-')[0]);
  const gua = calculateMingGua(year, input.gender as 'male' | 'female');
  const info = GUA_MAP[gua] || GUA_MAP[2];
  return { gua, info };
}

// ====== 統一介面 ======

export function fengshuiToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const { gua, info } = calculateFengshui(input);

  const traits: Trait[] = [
    {
      label: `命卦：${info.name}（${info.group}）`,
      description: `五行${info.element}，本位方${info.direction}`,
      score: 80,
      type: 'strength',
      dimension: 'spiritual',
      source: 'fengshui',
    },
  ];

  for (const good of info.goodDirections) {
    traits.push({
      label: `吉方 ${good.name}：${good.direction}`,
      description: good.use,
      score: 85,
      type: 'strength',
      dimension: good.name === '生氣' ? 'wealth' : good.name === '天醫' ? 'health' : 'relationship',
      source: 'fengshui',
    });
  }

  for (const bad of info.badDirections) {
    traits.push({
      label: `凶方 ${bad.name}：${bad.direction}`,
      description: bad.avoid,
      score: 25,
      type: 'weakness',
      dimension: 'health',
      source: 'fengshui',
    });
  }

  return {
    system: 'fengshui',
    systemName: '八宅風水',
    rawData: { gua, info },
    traits,
    timing: [],
  };
}

// ====== CLI ======

if (require.main === module) {
  const input: BirthInfo = {
    solarDate: process.argv[2] || '1993-08-07',
    hour: 9,
    gender: (process.argv[3] as 'male' | 'female') || 'male',
  };

  const { gua, info } = calculateFengshui(input);

  console.log(`\n🏠 八宅風水分析：${input.solarDate}（${input.gender === 'male' ? '男' : '女'}）`);
  console.log('═'.repeat(50));
  console.log(`\n  命卦：${gua} — ${info.name}（${info.group}）`);
  console.log(`  五行：${info.element} | 本位：${info.direction}`);
  console.log('\n  ✅ 吉方：');
  for (const g of info.goodDirections) {
    console.log(`    ${g.name}：${g.direction} — ${g.use}`);
  }
  console.log('\n  ❌ 凶方：');
  for (const b of info.badDirections) {
    console.log(`    ${b.name}：${b.direction} — ${b.avoid}`);
  }
  console.log(`\n  💡 建議：辦公桌朝${info.goodDirections[0].direction}（生氣位），床頭朝${info.goodDirections[1].direction}（天醫位）`);
}
