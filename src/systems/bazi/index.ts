/**
 * 八字四柱排盤模組
 * 基於 lunar-javascript 計算四柱八字
 */

import type { BirthInfo, SystemAnalysis, Trait, LifeDimension } from '../../core/types';
import { TIAN_GAN_WUXING, DI_ZHI_WUXING, WUXING_CN, getWuXingRelation, getNaYin, DI_ZHI_CANG_GAN, hourToDiZhi } from '../../core/wuxing';
import type { WuXing, TianGan, DiZhi } from '../../core/wuxing';

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

// ====== 用神判斷（正宗三法合一）======
// 理論源頭：
// 1. 扶抑法 — 《子平真詮》沈孝瞻：日主強則抑之，弱則扶之
// 2. 調候法 — 《窮通寶鑑》余春台：以月令寒暖燥濕為先
// 3. 格局法 — 《淵海子平》徐大升：以月支所藏透出定格局
// 
// 優先級：調候 > 格局 > 扶抑（三者綜合考量）

/**
 * 調候用神表（《窮通寶鑑》核心）
 * key = 日主天干 + 月支（生月）
 * 調候：夏天太熱需水潤，冬天太冷需火暖
 */
const TIAO_HOU_TABLE: Record<string, { yongShen: WuXing; reason: string }> = {
  // ===== 甲木 =====
  '甲子': { yongShen: 'fire', reason: '甲木冬月，木凍需丁火解凍' },
  '甲丑': { yongShen: 'fire', reason: '甲木臘月，寒木向陽，需丁火' },
  '甲寅': { yongShen: 'fire', reason: '甲木初春，餘寒未盡，需丙火暖身' },
  '甲卯': { yongShen: 'water', reason: '甲木仲春，木旺需癸水滋潤' },
  '甲辰': { yongShen: 'metal', reason: '甲木季春，土旺木折，需庚金剋制' },
  '甲巳': { yongShen: 'water', reason: '甲木初夏，火旺木焚，需癸水救' },
  '甲午': { yongShen: 'water', reason: '甲木盛夏，火炎土燥，急需壬水' },
  '甲未': { yongShen: 'water', reason: '甲木季夏，土燥火炎，需癸水潤' },
  '甲申': { yongShen: 'fire', reason: '甲木初秋，金旺剋木，需丁火制金' },
  '甲酉': { yongShen: 'fire', reason: '甲木仲秋，金旺木殘，需丁火救' },
  '甲戌': { yongShen: 'water', reason: '甲木季秋，木氣衰退，需壬水生' },
  '甲亥': { yongShen: 'fire', reason: '甲木初冬，進氣之水，需丁火溫暖' },
  
  // ===== 乙木 =====
  '乙子': { yongShen: 'fire', reason: '乙木冬月，花木凋零，需丙火暖' },
  '乙丑': { yongShen: 'fire', reason: '乙木臘月，寒花需陽，丙火為先' },
  '乙寅': { yongShen: 'water', reason: '乙木初春，根基漸穩，需癸水滋潤' },
  '乙卯': { yongShen: 'metal', reason: '乙木仲春，木旺需庚金修剪' },
  '乙辰': { yongShen: 'water', reason: '乙木季春，需癸水滋潤' },
  '乙巳': { yongShen: 'water', reason: '乙木初夏，烈日灼花，需癸水救' },
  '乙午': { yongShen: 'water', reason: '乙木盛夏，花木焦枯，急需壬癸水' },
  '乙未': { yongShen: 'water', reason: '乙木季夏，暑氣未退，需壬水' },
  '乙申': { yongShen: 'water', reason: '乙木初秋，金旺剋木，需癸水通關' },
  '乙酉': { yongShen: 'fire', reason: '乙木仲秋，金重木折，需丙丁火制' },
  '乙戌': { yongShen: 'water', reason: '乙木季秋，需癸水生木' },
  '乙亥': { yongShen: 'fire', reason: '乙木初冬，水旺木浮，需丙火暖' },

  // ===== 丙火 =====
  '丙子': { yongShen: 'wood', reason: '丙火冬月，火氣微弱，需甲木生火' },
  '丙丑': { yongShen: 'wood', reason: '丙火臘月，寒火需甲木引燃' },
  '丙寅': { yongShen: 'water', reason: '丙火初春，木火漸旺，需壬水制衡' },
  '丙卯': { yongShen: 'water', reason: '丙火仲春，木旺火相，需壬水' },
  '丙辰': { yongShen: 'water', reason: '丙火季春，火氣漸升，需壬水' },
  '丙巳': { yongShen: 'water', reason: '丙火初夏，火旺極盛，急需壬水' },
  '丙午': { yongShen: 'water', reason: '丙火盛夏，烈日當空，非壬水不可' },
  '丙未': { yongShen: 'water', reason: '丙火季夏，暑氣蒸騰，需壬水' },
  '丙申': { yongShen: 'wood', reason: '丙火初秋，火氣漸收，需甲木扶' },
  '丙酉': { yongShen: 'wood', reason: '丙火仲秋，金旺火衰，需甲木助' },
  '丙戌': { yongShen: 'wood', reason: '丙火季秋，甲木引火' },
  '丙亥': { yongShen: 'wood', reason: '丙火初冬，水旺火微，急需甲木' },

  // ===== 丁火 =====
  '丁子': { yongShen: 'wood', reason: '丁火冬月，燭光微弱，需甲木生火' },
  '丁丑': { yongShen: 'wood', reason: '丁火臘月，需甲木引燃' },
  '丁寅': { yongShen: 'wood', reason: '丁火初春，甲木為引，庚金劈甲' },
  '丁卯': { yongShen: 'metal', reason: '丁火仲春，木多火塞，需庚金劈甲引丁' },
  '丁辰': { yongShen: 'wood', reason: '丁火季春，甲木為用' },
  '丁巳': { yongShen: 'water', reason: '丁火初夏，火旺需壬水制' },
  '丁午': { yongShen: 'water', reason: '丁火盛夏，火炎需壬水' },
  '丁未': { yongShen: 'wood', reason: '丁火季夏，甲木為先' },
  '丁申': { yongShen: 'wood', reason: '丁火初秋，甲木扶弱' },
  '丁酉': { yongShen: 'wood', reason: '丁火仲秋，甲木為用' },
  '丁戌': { yongShen: 'wood', reason: '丁火季秋，甲木為先' },
  '丁亥': { yongShen: 'wood', reason: '丁火初冬，甲木不離' },

  // ===== 戊土 =====
  '戊子': { yongShen: 'fire', reason: '戊土冬月，土寒需丙火暖' },
  '戊丑': { yongShen: 'fire', reason: '戊土臘月，凍土需丙火解凍' },
  '戊寅': { yongShen: 'fire', reason: '戊土初春，餘寒猶存，丙火為先' },
  '戊卯': { yongShen: 'fire', reason: '戊土仲春，木旺剋土，需丙火通關' },
  '戊辰': { yongShen: 'wood', reason: '戊土季春，比劫重重，需甲木疏' },
  '戊巳': { yongShen: 'water', reason: '戊土初夏，火多土焦，需壬水潤' },
  '戊午': { yongShen: 'water', reason: '戊土盛夏，土燥需壬水' },
  '戊未': { yongShen: 'water', reason: '戊土季夏，燥土需壬水潤' },
  '戊申': { yongShen: 'fire', reason: '戊土初秋，金旺洩土，需丙火' },
  '戊酉': { yongShen: 'fire', reason: '戊土仲秋，需丙火暖身' },
  '戊戌': { yongShen: 'wood', reason: '戊土季秋，土重需甲木疏土' },
  '戊亥': { yongShen: 'fire', reason: '戊土初冬，水旺土崩，需丙火' },

  // ===== 己土 =====
  '己子': { yongShen: 'fire', reason: '己土冬月，田園凍裂，丙火為先' },
  '己丑': { yongShen: 'fire', reason: '己土臘月，凍田需丙火暖' },
  '己寅': { yongShen: 'fire', reason: '己土初春，寒土喜陽，丙火為先' },
  '己卯': { yongShen: 'fire', reason: '己土仲春，甲己合化需丙火' },
  '己辰': { yongShen: 'fire', reason: '己土季春，需丙火暖' },
  '己巳': { yongShen: 'water', reason: '己土初夏，燥土需癸水潤' },
  '己午': { yongShen: 'water', reason: '己土盛夏，烈日焦田，需癸水' },
  '己未': { yongShen: 'water', reason: '己土季夏，需癸水滋潤' },
  '己申': { yongShen: 'fire', reason: '己土初秋，需丙火暖身' },
  '己酉': { yongShen: 'fire', reason: '己土仲秋，需丙火暖' },
  '己戌': { yongShen: 'fire', reason: '己土季秋，需甲丙配合' },
  '己亥': { yongShen: 'fire', reason: '己土初冬，水旺土流，需丙火' },

  // ===== 庚金 =====
  '庚子': { yongShen: 'fire', reason: '庚金冬月，金寒水冷，需丁火溫' },
  '庚丑': { yongShen: 'fire', reason: '庚金臘月，寒金需丁火鍛' },
  '庚寅': { yongShen: 'fire', reason: '庚金初春，金弱需丙丁火鍛造' },
  '庚卯': { yongShen: 'fire', reason: '庚金仲春，木旺金缺，需丁火' },
  '庚辰': { yongShen: 'wood', reason: '庚金季春，土旺金埋，需甲木疏' },
  '庚巳': { yongShen: 'water', reason: '庚金初夏，火旺鍛金太過，需壬水' },
  '庚午': { yongShen: 'water', reason: '庚金盛夏，烈火鍛金，急需壬水救' },
  '庚未': { yongShen: 'water', reason: '庚金季夏，需壬水' },
  '庚申': { yongShen: 'fire', reason: '庚金初秋，金旺需丁火鍛造成器' },
  '庚酉': { yongShen: 'fire', reason: '庚金仲秋，金極旺，需丁火鍛' },
  '庚戌': { yongShen: 'wood', reason: '庚金季秋，土旺金埋，需甲木疏' },
  '庚亥': { yongShen: 'fire', reason: '庚金初冬，水旺金寒，需丁火暖' },

  // ===== 辛金 =====
  '辛子': { yongShen: 'fire', reason: '辛金冬月，金水太寒，需丙火暖' },
  '辛丑': { yongShen: 'fire', reason: '辛金臘月，需丙火解凍' },
  '辛寅': { yongShen: 'fire', reason: '辛金初春，己土丙火兼用' },
  '辛卯': { yongShen: 'water', reason: '辛金仲春，壬水洗淘為先' },
  '辛辰': { yongShen: 'water', reason: '辛金季春，需壬水洗淘' },
  '辛巳': { yongShen: 'water', reason: '辛金初夏，壬水淘洗為先' },
  '辛午': { yongShen: 'water', reason: '辛金盛夏，壬水己土並用' },
  '辛未': { yongShen: 'water', reason: '辛金季夏，需壬水淘洗' },
  '辛申': { yongShen: 'water', reason: '辛金初秋，壬水淘洗為用' },
  '辛酉': { yongShen: 'water', reason: '辛金仲秋，壬水為先' },
  '辛戌': { yongShen: 'water', reason: '辛金季秋，需壬水甲木' },
  '辛亥': { yongShen: 'fire', reason: '辛金初冬，水旺金寒，需丙火暖' },

  // ===== 壬水 =====
  '壬子': { yongShen: 'earth', reason: '壬水冬月，水旺無制，需戊土堤防' },
  '壬丑': { yongShen: 'fire', reason: '壬水臘月，天寒水凍，需丙火解凍' },
  '壬寅': { yongShen: 'earth', reason: '壬水初春，水勢猶旺，需戊土' },
  '壬卯': { yongShen: 'earth', reason: '壬水仲春，需戊土制水' },
  '壬辰': { yongShen: 'wood', reason: '壬水季春，甲木疏土為用' },
  '壬巳': { yongShen: 'metal', reason: '壬水初夏，火旺水乾，需辛金發源' },
  '壬午': { yongShen: 'metal', reason: '壬水盛夏，火炎水涸，急需庚辛金' },
  '壬未': { yongShen: 'metal', reason: '壬水季夏，需辛金生水' },
  '壬申': { yongShen: 'fire', reason: '壬水初秋，金旺水相，需丁火' },
  '壬酉': { yongShen: 'wood', reason: '壬水仲秋，金多水濁，需甲木' },
  '壬戌': { yongShen: 'wood', reason: '壬水季秋，需甲木制土疏水' },
  '壬亥': { yongShen: 'earth', reason: '壬水初冬，水旺之極，需戊土堤防' },

  // ===== 癸水 =====
  '癸子': { yongShen: 'fire', reason: '癸水冬月，雨露成冰，需丙火解凍' },
  '癸丑': { yongShen: 'fire', reason: '癸水臘月，天寒地凍，需丙火' },
  '癸寅': { yongShen: 'metal', reason: '癸水初春，木旺洩水，需辛金發源' },
  '癸卯': { yongShen: 'metal', reason: '癸水仲春，木旺水竭，需庚辛金' },
  '癸辰': { yongShen: 'fire', reason: '癸水季春，需丙火配辛金' },
  '癸巳': { yongShen: 'metal', reason: '癸水初夏，火旺水涸，需辛金' },
  '癸午': { yongShen: 'metal', reason: '癸水盛夏，火炎水乾，庚辛金救' },
  '癸未': { yongShen: 'metal', reason: '癸水季夏，需庚辛金發水源' },
  '癸申': { yongShen: 'fire', reason: '癸水初秋，金旺水相，需丁火' },
  '癸酉': { yongShen: 'fire', reason: '癸水仲秋，金多水濁，需丙火' },
  '癸戌': { yongShen: 'metal', reason: '癸水季秋，需辛金發源' },
  '癸亥': { yongShen: 'fire', reason: '癸水初冬，水旺需丙火暖局' },
};

/**
 * 格局法 — 《子平真詮》
 * 以月支藏干透出天干定格局
 * 十大格局：正官、七殺、正印、偏印、正財、偏財、食神、傷官、（建祿、羊刃）
 */
interface GeJu {
  name: string;
  type: 'official' | 'wealth' | 'resource' | 'food' | 'rob';
  shiShen: string;
  advice: string;
}

function determineGeJu(dayMaster: TianGan, monthZhi: DiZhi): GeJu | null {
  // 月支藏干
  const cangGan = DI_ZHI_CANG_GAN[monthZhi];
  if (!cangGan || cangGan.length === 0) return null;

  // 取月支本氣（第一個藏干）
  const mainGan = cangGan[0] as TianGan;
  const shiShen = getShiShen(dayMaster, mainGan);

  const geJuMap: Record<string, GeJu> = {
    '正官': { name: '正官格', type: 'official', shiShen: '正官', advice: '正官格主名聲地位，宜從政、管理。喜印綬護官、財星生官' },
    '七殺': { name: '七殺格', type: 'official', shiShen: '七殺', advice: '七殺格主權威魄力，宜軍警、創業。需食神制殺或印綬化殺' },
    '正印': { name: '正印格', type: 'resource', shiShen: '正印', advice: '正印格主學問名氣，宜文教、研究。喜官星生印' },
    '偏印': { name: '偏印格', type: 'resource', shiShen: '偏印', advice: '偏印格主奇巧技藝，宜技術、特殊專業。忌食神（梟神奪食）' },
    '正財': { name: '正財格', type: 'wealth', shiShen: '正財', advice: '正財格主穩定收入，宜商業、理財。喜食傷生財' },
    '偏財': { name: '偏財格', type: 'wealth', shiShen: '偏財', advice: '偏財格主投機橫財，宜投資、業務。喜食傷生財，忌比劫爭' },
    '食神': { name: '食神格', type: 'food', shiShen: '食神', advice: '食神格主才華享福，宜創作、餐飲。喜財星流通' },
    '傷官': { name: '傷官格', type: 'food', shiShen: '傷官', advice: '傷官格主聰明叛逆，宜藝術、自由業。傷官見官為禍，需印制' },
    '比肩': { name: '建祿格', type: 'rob', shiShen: '比肩', advice: '建祿格月令透祿，需財官為用，忌比劫重重' },
    '劫財': { name: '羊刃格', type: 'rob', shiShen: '劫財', advice: '羊刃格剛烈果決，需七殺制刃或官星馭��' },
  };

  return geJuMap[shiShen] || null;
}

/**
 * 正宗用神判斷：調候 → 格局 → 扶抑 三法合一
 */
function determineYongShen(
  dayMaster: TianGan, 
  dayMasterWx: WuXing, 
  monthZhi: DiZhi,
  wuXingCount: WuXingCount
): { yongShen: WuXing; method: string; reason: string; geJu: GeJu | null } {
  
  // === 第一步：調候法（《窮通寶鑑》）===
  const tiaoHouKey = `${dayMaster}${monthZhi}`;
  const tiaoHou = TIAO_HOU_TABLE[tiaoHouKey];
  
  // === 第二步：格局法（《子平真詮》）===
  const geJu = determineGeJu(dayMaster, monthZhi);
  
  // === 第三步：扶抑法 ===
  const total = Object.values(wuXingCount).reduce((a, b) => a + b, 0);
  const dayMasterStrength = wuXingCount[dayMasterWx] / total;
  
  // 判斷身強身弱（考慮月令得令否）
  const monthElement = DI_ZHI_WUXING ? DI_ZHI_WUXING[monthZhi] : null;
  const isMonthHelping = monthElement === dayMasterWx || 
    (monthElement && getWuXingRelation(monthElement, dayMasterWx) === 'generate');
  
  const effectiveStrength = isMonthHelping ? dayMasterStrength + 0.1 : dayMasterStrength;
  const isStrong = effectiveStrength > 0.3;

  let fuYiYongShen: WuXing;
  let fuYiReason: string;
  
  if (isStrong) {
    // 身強 → 洩耗（食傷洩秀或財星耗身）
    const wxPriority: WuXing[] = [];
    // 食傷（我生的）
    for (const [wx] of Object.entries(wuXingCount) as [WuXing, number][]) {
      if (getWuXingRelation(dayMasterWx, wx) === 'generate') wxPriority.push(wx);
    }
    // 財星（我剋的）
    for (const [wx] of Object.entries(wuXingCount) as [WuXing, number][]) {
      if (getWuXingRelation(dayMasterWx, wx) === 'control') wxPriority.push(wx);
    }
    // 官殺（剋我的）
    for (const [wx] of Object.entries(wuXingCount) as [WuXing, number][]) {
      if (getWuXingRelation(wx, dayMasterWx) === 'control') wxPriority.push(wx);
    }
    fuYiYongShen = wxPriority[0] || 'water';
    fuYiReason = `日主${WUXING_CN[dayMasterWx]}身強（${(effectiveStrength * 100).toFixed(0)}%${isMonthHelping ? '，得月令' : ''}），需洩耗`;
  } else {
    // 身弱 → 生扶（印綬生身或比劫幫身）
    const wxPriority: WuXing[] = [];
    // 印綬（生我的）
    for (const [wx] of Object.entries(wuXingCount) as [WuXing, number][]) {
      if (getWuXingRelation(wx, dayMasterWx) === 'generate') wxPriority.push(wx);
    }
    // 比劫（同我的）
    wxPriority.push(dayMasterWx);
    fuYiYongShen = wxPriority[0] || 'wood';
    fuYiReason = `日主${WUXING_CN[dayMasterWx]}身弱（${(effectiveStrength * 100).toFixed(0)}%${isMonthHelping ? '，雖得月令' : '，不得月令'}），需生扶`;
  }

  // === 綜合判斷：調候優先 ===
  // 夏月（巳午未）和冬月（亥子丑）調候最重要
  const winterSummer = ['子', '丑', '巳', '午', '未', '亥'];
  const isExtremeMonth = winterSummer.includes(monthZhi);

  if (tiaoHou && isExtremeMonth) {
    return {
      yongShen: tiaoHou.yongShen,
      method: '調候法（《窮通寶鑑》）',
      reason: tiaoHou.reason,
      geJu,
    };
  }

  // 非極端月份或無調候數據 → 格局法輔助扶抑法
  if (tiaoHou) {
    // 有調候但非極端月份 → 調候為主參考扶抑
    return {
      yongShen: tiaoHou.yongShen,
      method: '調候法為主（《窮通寶鑑》），扶抑法為輔',
      reason: `${tiaoHou.reason}；${fuYiReason}`,
      geJu,
    };
  }

  // 無調候數據 → 扶抑法
  return {
    yongShen: fuYiYongShen,
    method: '扶抑法（《子平真詮》）',
    reason: fuYiReason,
    geJu,
  };
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
  yongShen: { wuXing: WuXing; method: string; reason: string };
  /** 格局 */
  geJu: { name: string; type: string; advice: string } | null;
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
  
  // 用神（正宗三法合一）
  const yongShen = determineYongShen(dayGan, dayMasterWuXing, monthZhi, wuXingCount);
  
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
    yongShen: { wuXing: yongShen.yongShen, method: yongShen.method, reason: yongShen.reason },
    geJu: yongShen.geJu ? { name: yongShen.geJu.name, type: yongShen.geJu.type, advice: yongShen.geJu.advice } : null,
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
