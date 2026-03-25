/**
 * 五行系統 — 所有中國命理的共用基礎
 */

import type { WuXing, YinYang } from './types';

// ====== 天干 ======

export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export type TianGan = typeof TIAN_GAN[number];

export const TIAN_GAN_WUXING: Record<TianGan, WuXing> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water',
};

export const TIAN_GAN_YINYANG: Record<TianGan, YinYang> = {
  '甲': 'yang', '乙': 'yin',
  '丙': 'yang', '丁': 'yin',
  '戊': 'yang', '己': 'yin',
  '庚': 'yang', '辛': 'yin',
  '壬': 'yang', '癸': 'yin',
};

// ====== 地支 ======

export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export type DiZhi = typeof DI_ZHI[number];

export const DI_ZHI_WUXING: Record<DiZhi, WuXing> = {
  '子': 'water', '丑': 'earth',
  '寅': 'wood', '卯': 'wood',
  '辰': 'earth', '巳': 'fire',
  '午': 'fire', '未': 'earth',
  '申': 'metal', '酉': 'metal',
  '戌': 'earth', '亥': 'water',
};

export const DI_ZHI_YINYANG: Record<DiZhi, YinYang> = {
  '子': 'yang', '丑': 'yin',
  '寅': 'yang', '卯': 'yin',
  '辰': 'yang', '巳': 'yin',
  '午': 'yang', '未': 'yin',
  '申': 'yang', '酉': 'yin',
  '戌': 'yang', '亥': 'yin',
};

// 地支藏干
export const DI_ZHI_CANG_GAN: Record<DiZhi, TianGan[]> = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

// 地支對應時辰
export const DI_ZHI_HOURS: Record<DiZhi, [number, number]> = {
  '子': [23, 1],  '丑': [1, 3],   '寅': [3, 5],
  '卯': [5, 7],   '辰': [7, 9],   '巳': [9, 11],
  '午': [11, 13], '未': [13, 15], '申': [15, 17],
  '酉': [17, 19], '戌': [19, 21], '亥': [21, 23],
};

// ====== 五行關係 ======

/** 五行相生：木→火→土→金→水→木 */
export const WUXING_SHENG: Record<WuXing, WuXing> = {
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
  metal: 'water',
  water: 'wood',
};

/** 五行相剋：木→土→水→火→金→木 */
export const WUXING_KE: Record<WuXing, WuXing> = {
  wood: 'earth',
  earth: 'water',
  water: 'fire',
  fire: 'metal',
  metal: 'wood',
};

/** 判斷兩個五行的關係 */
export function getWuXingRelation(a: WuXing, b: WuXing): 
  'same' | 'generate' | 'generated' | 'control' | 'controlled' {
  if (a === b) return 'same';
  if (WUXING_SHENG[a] === b) return 'generate';   // a 生 b
  if (WUXING_SHENG[b] === a) return 'generated';   // b 生 a
  if (WUXING_KE[a] === b) return 'control';        // a 剋 b
  if (WUXING_KE[b] === a) return 'controlled';     // b 剋 a
  return 'same'; // fallback
}

/** 五行中文名 */
export const WUXING_CN: Record<WuXing, string> = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水',
};

/** 五行顏色 */
export const WUXING_COLOR: Record<WuXing, string> = {
  wood: '#4CAF50', fire: '#F44336', earth: '#FF9800', metal: '#FFD700', water: '#2196F3',
};

// ====== 六十甲子 ======

export function getSixtyJiaZi(): string[] {
  const result: string[] = [];
  for (let i = 0; i < 60; i++) {
    result.push(`${TIAN_GAN[i % 10]}${DI_ZHI[i % 12]}`);
  }
  return result;
}

// ====== 納音五行 ======

const NA_YIN_TABLE: [string, string, WuXing][] = [
  ['甲子', '乙丑', 'metal'],   // 海中金
  ['丙寅', '丁卯', 'fire'],    // 爐中火
  ['戊辰', '己巳', 'wood'],    // 大林木
  ['庚午', '辛未', 'earth'],   // 路旁土
  ['壬申', '癸酉', 'metal'],   // 劍鋒金
  ['甲戌', '乙亥', 'fire'],    // 山頭火
  ['丙子', '丁丑', 'water'],   // 澗下水
  ['戊寅', '己卯', 'earth'],   // 城頭土
  ['庚辰', '辛巳', 'metal'],   // 白蠟金
  ['壬午', '癸未', 'wood'],    // 楊柳木
  ['甲申', '乙酉', 'water'],   // 泉中水
  ['丙戌', '丁亥', 'earth'],   // 屋上土
  ['戊子', '己丑', 'fire'],    // 霹靂火
  ['庚寅', '辛卯', 'wood'],    // 松柏木
  ['壬辰', '癸巳', 'water'],   // 長流水
  ['甲午', '乙未', 'metal'],   // 砂中金
  ['丙申', '丁酉', 'fire'],    // 山下火
  ['戊戌', '己亥', 'wood'],    // 平地木
  ['庚子', '辛丑', 'earth'],   // 壁上土
  ['壬寅', '癸卯', 'metal'],   // 金箔金
  ['甲辰', '乙巳', 'fire'],    // 覆燈火
  ['丙午', '丁未', 'water'],   // 天河水
  ['戊申', '己酉', 'earth'],   // 大驛土
  ['庚戌', '辛亥', 'metal'],   // 釵釧金
  ['壬子', '癸丑', 'wood'],    // 桑拓木
  ['甲寅', '乙卯', 'water'],   // 大溪水
  ['丙辰', '丁巳', 'earth'],   // 沙中土
  ['戊午', '己未', 'fire'],    // 天上火
  ['庚申', '辛酉', 'wood'],    // 石榴木
  ['壬戌', '癸亥', 'water'],   // 大海水
];

const NA_YIN_NAMES: string[] = [
  '海中金', '爐中火', '大林木', '路旁土', '劍鋒金', '山頭火',
  '澗下水', '城頭土', '白蠟金', '楊柳木', '泉中水', '屋上土',
  '霹靂火', '松柏木', '長流水', '砂中金', '山下火', '平地木',
  '壁上土', '金箔金', '覆燈火', '天河水', '大驛土', '釵釧金',
  '桑拓木', '大溪水', '沙中土', '天上火', '石榴木', '大海水',
];

/** 查詢納音五行 */
export function getNaYin(ganZhi: string): { wuxing: WuXing; name: string } | null {
  for (let i = 0; i < NA_YIN_TABLE.length; i++) {
    if (NA_YIN_TABLE[i][0] === ganZhi || NA_YIN_TABLE[i][1] === ganZhi) {
      return { wuxing: NA_YIN_TABLE[i][2], name: NA_YIN_NAMES[i] };
    }
  }
  return null;
}

// ====== 十二長生 ======

export const TWELVE_STAGES = ['長生', '沐浴', '冠帶', '臨官', '帝旺', '衰', '病', '死', '墓', '絕', '胎', '養'] as const;
export type TwelveStage = typeof TWELVE_STAGES[number];

/** 小時轉地支 */
export function hourToDiZhi(hour: number): DiZhi {
  // 23:00-00:59 = 子, 01:00-02:59 = 丑, ...
  const idx = hour === 23 ? 0 : Math.floor((hour + 1) / 2) % 12;
  return DI_ZHI[idx];
}
