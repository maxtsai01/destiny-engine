/**
 * 八字四柱排盤模組
 * 基於 lunar-javascript 計算四柱八字
 */

import type { BirthInfo, SystemAnalysis, Trait, LifeDimension } from '../../core/types.js';
import { TIAN_GAN_WUXING, DI_ZHI_WUXING, WUXING_CN, getWuXingRelation, getNaYin, DI_ZHI_CANG_GAN, hourToDiZhi } from '../../core/wuxing.js';
import type { WuXing, TianGan, DiZhi } from '../../core/wuxing.js';

// @ts-ignore
import { Solar } from 'lunar-javascript';

// ====== 十神 ======

const SHI_SHEN_NAMES = {
  same_yang: '比肩',
  same_yin: '劫財',
  generate_yang: '食神',
  generate_yin: '傷官',
  wealth_yang: '偏財',
  wealth_yin: '正財',
  officer_yang: '七殺',
  officer_yin: '正官',
  resource_yang: '偏印',
  resource_yin: '正印',
} as const;

/** 根據日主和其他天干計算十神 */
function getShiShen(dayMaster: TianGan, target: TianGan): string {
  const dmWx = TIAN_GAN_WUXING[dayMaster];
  const tgWx = TIAN_GAN_WUXING[target];
  const rel = getWuXingRelation(dmWx, tgWx);
  
  // 判斷陰陽是否相同
  const dmIdx = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].indexOf(dayMaster);
  const tgIdx = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].indexOf(target);
  const samePolarity = (dmIdx % 2) === (tgIdx % 2);
  
  switch (rel) {
    case 'same': return samePolarity ? '比肩' : '劫財';
    case 'generate': return samePolarity ? '食神' : '傷官';
    case 'control': return samePolarity ? '偏財' : '正財';
    case 'controlled': return samePolarity ? '七殺' : '正官';
    case 'generated': return samePolarity ? '偏印' : '正印';
    default: return '比肩';
  }
}

// ====== 五行統計 ======

interface WuXingCount {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

function countWuXing(gans: TianGan[], zhis: DiZhi[]): WuXingCount {
  const count: WuXingCount = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  
  gans.forEach(g => {
    count[TIAN_GAN_WUXING[g]] += 1;
  });
  
  zhis.forEach(z => {
    // 地支本氣算 1，藏干各算 0.5
    const cangGan = DI_ZHI_CANG_GAN[z];
    if (cangGan.length > 0) {
      count[TIAN_GAN_WUXING[cangGan[0]]] += 1; // 本氣
      for (let i = 1; i < cangGan.length; i++) {
        count[TIAN_GAN_WUXING[cangGan[i]]] += 0.5; // 中氣、餘氣
      }
    }
  });
  
  return count;
}

// ====== 用神判斷（簡化版）======

function determineYongShen(dayMasterWx: WuXing, wuXingCount: WuXingCount): { yongShen: WuXing; reason: string } {
  const total = Object.values(wuXingCount).reduce((a, b) => a + b, 0);
  const dayMasterStrength = wuXingCount[dayMasterWx] / total;
  
  if (dayMasterStrength > 0.3) {
    // 日主強 → 用剋洩耗
    const keWx = Object.entries(wuXingCount)
      .filter(([wx]) => getWuXingRelation(dayMasterWx, wx as WuXing) === 'control' || 
                         getWuXingRelation(dayMasterWx, wx as WuXing) === 'generate')
      .sort((a, b) => a[1] - b[1])[0];
    
    return {
      yongShen: (keWx?.[0] as WuXing) || 'water',
      reason: `日主${WUXING_CN[dayMasterWx]}強（${(dayMasterStrength * 100).toFixed(0)}%），需洩耗平衡`
    };
  } else {
    // 日主弱 → 用生扶
    const shengWx = Object.entries(wuXingCount)
      .filter(([wx]) => getWuXingRelation(wx as WuXing, dayMasterWx) === 'generate' || wx === dayMasterWx)
      .sort((a, b) => a[1] - b[1])[0];
    
    return {
      yongShen: (shengWx?.[0] as WuXing) || 'wood',
      reason: `日主${WUXING_CN[dayMasterWx]}弱（${(dayMasterStrength * 100).toFixed(0)}%），需生扶補強`
    };
  }
}

// ====== 主排盤函數 ======

export interface BaziResult {
  /** 年柱 */
  yearPillar: { gan: string; zhi: string };
  /** 月柱 */
  monthPillar: { gan: string; zhi: string };
  /** 日柱 */
  dayPillar: { gan: string; zhi: string };
  /** 時柱 */
  hourPillar: { gan: string; zhi: string };
  /** 日主 */
  dayMaster: string;
  /** 日主五行 */
  dayMasterWuXing: WuXing;
  /** 納音 */
  naYin: string;
  /** 五行統計 */
  wuXingCount: WuXingCount;
  /** 用神 */
  yongShen: { wuXing: WuXing; reason: string };
  /** 十神 */
  shiShen: { position: string; shiShen: string }[];
  /** 大運 */
  daYun: { startAge: number; ganZhi: string; wuXing: WuXing }[];
}

export function calculateBazi(input: BirthInfo): BaziResult {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  
  // 四柱
  const yearGan = eightChar.getYearGan() as TianGan;
  const yearZhi = eightChar.getYearZhi() as DiZhi;
  const monthGan = eightChar.getMonthGan() as TianGan;
  const monthZhi = eightChar.getMonthZhi() as DiZhi;
  const dayGan = eightChar.getDayGan() as TianGan;
  const dayZhi = eightChar.getDayZhi() as DiZhi;
  
  // 時柱
  const hourZhi = hourToDiZhi(input.hour) as DiZhi;
  // 時干需要根據日干推算
  const dayGanIdx = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].indexOf(dayGan);
  const hourZhiIdx = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'].indexOf(hourZhi);
  const hourGanIdx = (dayGanIdx % 5 * 2 + hourZhiIdx) % 10;
  const hourGan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'][hourGanIdx] as TianGan;
  
  // 日主
  const dayMasterWuXing = TIAN_GAN_WUXING[dayGan];
  
  // 納音
  const dayGanZhi = `${dayGan}${dayZhi}`;
  const naYinResult = getNaYin(dayGanZhi);
  
  // 五行統計
  const allGans = [yearGan, monthGan, dayGan, hourGan];
  const allZhis = [yearZhi, monthZhi, dayZhi, hourZhi];
  const wuXingCount = countWuXing(allGans, allZhis);
  
  // 用神
  const yongShen = determineYongShen(dayMasterWuXing, wuXingCount);
  
  // 十神
  const shiShen = [
    { position: '年干', shiShen: getShiShen(dayGan, yearGan) },
    { position: '月干', shiShen: getShiShen(dayGan, monthGan) },
    { position: '時干', shiShen: getShiShen(dayGan, hourGan) },
  ];
  
  // 大運（簡化版 - 取前 8 步大運）
  const daYun: BaziResult['daYun'] = [];
  try {
    const yun = eightChar.getYun(input.gender === 'male' ? 1 : 0);
    const daYunList = yun.getDaYun();
    for (let i = 1; i < Math.min(daYunList.length, 9); i++) {
      const dy = daYunList[i];
      const ganZhi = `${dy.getGanZhi()}`;
      const dyGan = ganZhi[0] as TianGan;
      daYun.push({
        startAge: dy.getStartAge(),
        ganZhi,
        wuXing: TIAN_GAN_WUXING[dyGan],
      });
    }
  } catch {
    // 大運計算失敗不影響主流程
  }
  
  return {
    yearPillar: { gan: yearGan, zhi: yearZhi },
    monthPillar: { gan: monthGan, zhi: monthZhi },
    dayPillar: { gan: dayGan, zhi: dayZhi },
    hourPillar: { gan: hourGan, zhi: hourZhi },
    dayMaster: dayGan,
    dayMasterWuXing,
    naYin: naYinResult?.name || '未知',
    wuXingCount,
    yongShen: { wuXing: yongShen.yongShen, reason: yongShen.reason },
    shiShen,
    daYun,
  };
}

// ====== 轉為統一格式 ======

export function baziToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const bazi = calculateBazi(input);
  const traits: Trait[] = [];
  
  // 從五行強弱分析天賦和盲區
  const sortedWx = Object.entries(bazi.wuXingCount)
    .sort((a, b) => b[1] - a[1]) as [WuXing, number][];
  
  const wxDimensionMap: Record<WuXing, LifeDimension> = {
    wood: 'study',        // 木 → 學習成長
    fire: 'social',       // 火 → 人際表達
    earth: 'family',      // 土 → 家庭穩定
    metal: 'career',      // 金 → 事業決斷
    water: 'spiritual',   // 水 → 智慧心靈
  };
  
  const wxTraitMap: Record<WuXing, { strength: string; weakness: string }> = {
    wood: { strength: '有創造力和成長動力，善於學習新事物', weakness: '缺乏彈性和變通能力' },
    fire: { strength: '熱情外向，善於表達和社交', weakness: '缺乏熱情和行動力' },
    earth: { strength: '穩重踏實，重視家庭和信用', weakness: '缺乏安全感和歸屬感' },
    metal: { strength: '果斷有魄力，執行力強', weakness: '缺乏決斷力和執行力' },
    water: { strength: '聰明靈活，直覺敏銳', weakness: '思慮過多，容易猶豫不決' },
  };
  
  // 最強的兩個五行 → 天賦
  sortedWx.slice(0, 2).forEach(([wx, count]) => {
    traits.push({
      label: `${WUXING_CN[wx]}行旺 — ${wxTraitMap[wx].strength}`,
      dimension: wxDimensionMap[wx],
      type: 'strength',
      score: Math.min(100, Math.round(count * 20)),
      source: 'bazi',
      description: `五行${WUXING_CN[wx]}的能量較強（${count.toFixed(1)}），代表${wxTraitMap[wx].strength}`,
    });
  });
  
  // 最弱的五行 → 盲區
  const weakest = sortedWx[sortedWx.length - 1];
  traits.push({
    label: `${WUXING_CN[weakest[0]]}行弱 — ${wxTraitMap[weakest[0]].weakness}`,
    dimension: wxDimensionMap[weakest[0]],
    type: 'weakness',
    score: Math.max(10, Math.round(weakest[1] * 20)),
    source: 'bazi',
    description: `五行${WUXING_CN[weakest[0]]}的能量不足（${weakest[1].toFixed(1)}），可能${wxTraitMap[weakest[0]].weakness}`,
  });
  
  // 日主特質
  traits.push({
    label: `日主${bazi.dayMaster}（${WUXING_CN[bazi.dayMasterWuXing]}）— 你的核心本質`,
    dimension: 'spiritual',
    type: 'neutral',
    score: 50,
    source: 'bazi',
    description: `日主為${bazi.dayMaster}，五行屬${WUXING_CN[bazi.dayMasterWuXing]}，納音${bazi.naYin}`,
  });
  
  return {
    system: 'bazi',
    systemName: '八字四柱',
    rawData: bazi as unknown as Record<string, unknown>,
    traits,
    timing: bazi.daYun.map(dy => ({
      period: `${dy.startAge}歲起 — ${dy.ganZhi}大運`,
      startDate: '',
      endDate: '',
      dimensions: [{
        dimension: wxDimensionMap[dy.wuXing],
        score: 50,
        advice: `${dy.ganZhi}大運，${WUXING_CN[dy.wuXing]}行能量增強`,
      }],
      source: 'bazi' as const,
    })),
    advice: [
      `用神為${WUXING_CN[bazi.yongShen.wuXing]}：${bazi.yongShen.reason}`,
      `建議多接觸${WUXING_CN[bazi.yongShen.wuXing]}行相關的活動、顏色、方位`,
    ],
  };
}
