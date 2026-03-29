/**
 * 🔮 造命 ZaoMing AI — LINE Bot 報告生成器
 * 
 * 呼叫各命理系統，生成精簡版 LINE 訊息報告
 */

import type { BirthInfo } from '../src/core/types';

// 系統 imports（用 try-catch 包裝，某系統掛了不影響整體）
function safeCall<T>(fn: () => T, fallback: T, systemName: string): T {
  try {
    return fn();
  } catch (err: any) {
    console.warn(`⚠️ ${systemName} 計算失敗: ${err.message}`);
    return fallback;
  }
}

interface ReportInput {
  name: string;
  solarDate: string;
  hour: number;
  gender: 'male' | 'female';
  phone?: string;
}

export function generateReport(input: ReportInput): string {
  const birthInfo: BirthInfo = {
    solarDate: input.solarDate,
    hour: input.hour,
    gender: input.gender,
    name: input.name,
  };

  const sections: string[] = [];
  const genderCn = input.gender === 'male' ? '男' : '女';

  // ====== 標題 ======
  sections.push(
    `🔮 造命 ZaoMing AI — 命理報告`,
    `━━━━━━━━━━━━━━━━━`,
    `📋 ${input.name} | ${input.solarDate} ${input.hour}:00 | ${genderCn}`,
    ``
  );

  // ====== 一、八字四柱 ======
  const baziSection = safeCall(() => {
    const { calculateBazi } = require('../src/systems/bazi/index');
    const { WUXING_CN } = require('../src/core/wuxing');
    const bazi = calculateBazi(birthInfo);
    
    const pillars = `${bazi.yearPillar.gan}${bazi.yearPillar.zhi} ${bazi.monthPillar.gan}${bazi.monthPillar.zhi} ${bazi.dayPillar.gan}${bazi.dayPillar.zhi} ${bazi.hourPillar.gan}${bazi.hourPillar.zhi}`;
    
    // 五行統計
    const wxEntries = Object.entries(bazi.wuXingCount) as [string, number][];
    const wxStr = wxEntries.map(([wx, c]) => `${WUXING_CN[wx]}${(c as number).toFixed(1)}`).join(' ');
    
    return [
      `🏮 八字四柱`,
      `四柱：${pillars}`,
      `日主：${bazi.dayMaster}（${WUXING_CN[bazi.dayMasterWuXing]}）`,
      `納音：${bazi.naYin}`,
      `五行：${wxStr}`,
      `用神：${WUXING_CN[bazi.yongShen.wuXing]}（${bazi.yongShen.reason}）`,
      `格局：${bazi.shiShen.find((s: any) => s.position === '月干')?.shiShen || '待定'}格`,
      ``
    ].join('\n');
  }, '🏮 八字四柱：計算中...\n', '八字');

  sections.push(baziSection);

  // ====== 二、紫微斗數 ======
  const ziweiSection = safeCall(() => {
    const { calculateZiwei } = require('../src/systems/ziwei/index');
    const ziwei = calculateZiwei(birthInfo);
    
    const mainStars = ziwei.lifePalaceStars.length > 0 
      ? ziwei.lifePalaceStars.join('、') 
      : '空宮（百搭命格）';
    
    const sihuaStr = ziwei.siHua.map((sh: any) => `${sh.star}${sh.type}`).join(' ');
    
    return [
      `🌟 紫微斗數`,
      `命宮主星：${mainStars}`,
      `四化：${sihuaStr || '待算'}`,
      ``
    ].join('\n');
  }, '🌟 紫微斗數：計算中...\n', '紫微');

  sections.push(ziweiSection);

  // ====== 三、西洋占星 ======
  const astroSection = safeCall(() => {
    const { calculateAstro } = require('../src/systems/astro/index');
    const astro = calculateAstro(birthInfo);
    
    return [
      `⭐ 西洋占星`,
      `太陽星座：${astro.sunSign.name}（${astro.sunSign.en}）`,
      `上升星座：${astro.ascendant.name}（${astro.ascendant.en}）`,
      `元素：${astro.sunSign.element}`,
      ``
    ].join('\n');
  }, '⭐ 西洋占星：計算中...\n', '占星');

  sections.push(astroSection);

  // ====== 四、生命靈數 ======
  const numSection = safeCall(() => {
    const { calculateLifeNumber } = require('../src/systems/numerology/index');
    const result = calculateLifeNumber(input.solarDate);
    
    const meanings: Record<number, string> = {
      1: '領導者、開創者',
      2: '合作者、調和者',
      3: '表達者、創意人',
      4: '建構者、穩定者',
      5: '冒險者、自由人',
      6: '照顧者、責任人',
      7: '分析者、思考者',
      8: '成就者、掌權者',
      9: '智慧者、奉獻者',
      11: '大師數：靈感者',
      22: '大師數：建築師',
      33: '大師數：導師',
    };
    
    return [
      `🔢 生命靈數`,
      `主命數：${result.lifeNumber}${result.masterNumber ? '（大師數）' : ''}`,
      `含義：${meanings[result.lifeNumber] || '特殊命數'}`,
      ``
    ].join('\n');
  }, '🔢 生命靈數：計算中...\n', '靈數');

  sections.push(numSection);

  // ====== 五、易經 ======
  const ichingSection = safeCall(() => {
    const { calculateLifeHexagram } = require('../src/systems/iching/index');
    const result = calculateLifeHexagram(birthInfo);
    
    return [
      `☯️ 易經本命卦`,
      `卦象：${result.hexagram?.name || result.name}（${result.hexagram?.symbol || result.symbol || ''}）`,
      `卦義：${result.hexagram?.meaning || result.meaning || ''}`,
      ``
    ].join('\n');
  }, '', '易經');

  if (ichingSection) sections.push(ichingSection);

  // ====== 六、姓名學（字義五行）======
  const nameSection = safeCall(() => {
    const mod = require('../src/systems/name-wuxing/index');
    const analyze = mod.analyzeNameWuxing || mod.calculateNameWuxing;
    if (!analyze) return '';
    const result = analyze(input.name);
    
    if (result && result.characters) {
      const charStr = result.characters
        .map((c: any) => `${c.char}（${c.wuxing || c.element}）`)
        .join(' ');
      return [
        `📝 姓名學（字義五行）`,
        `${charStr}`,
        result.summary ? `分析：${result.summary}` : '',
        ``
      ].filter(Boolean).join('\n');
    }
    return '';
  }, '', '姓名學');

  if (nameSection) sections.push(nameSection);

  // ====== 七、MBTI 推算 ======
  const mbtiSection = safeCall(() => {
    const mod = require('../src/systems/mbti/index');
    const calc = mod.calculateMBTI || mod.inferMBTI;
    if (!calc) return '';
    const result = calc(birthInfo);
    
    return [
      `🧠 MBTI 推算`,
      `類型：${result.type || result.mbtiType}（${result.title || result.label || ''}）`,
      result.career ? `適合職業：${result.career}` : '',
      ``
    ].filter(Boolean).join('\n');
  }, '', 'MBTI');

  if (mbtiSection) sections.push(mbtiSection);

  // ====== 八、人類圖 ======
  const hdSection = safeCall(() => {
    const mod = require('../src/systems/humandesign/index');
    const calc = mod.calculateHumanDesign || mod.inferHumanDesign;
    if (!calc) return '';
    const result = calc(birthInfo);
    
    const typeName = typeof result.type === 'object' ? result.type.name : result.type;
    const strategy = typeof result.type === 'object' ? result.type.strategy : (result.strategy || '');
    
    return [
      `🔷 人類圖`,
      `類型：${typeName}`,
      `策略：${strategy}`,
      result.profile ? `人生角色：${typeof result.profile === 'object' ? result.profile.name : result.profile}` : '',
      ``
    ].filter(Boolean).join('\n');
  }, '', '人類圖');

  if (hdSection) sections.push(hdSection);

  // ====== 九、彩虹人生 ======
  const rainbowSection = safeCall(() => {
    const mod = require('../src/systems/rainbow/index');
    const calc = mod.calculateRainbow || mod.inferRainbow;
    if (!calc) return '';
    const result = calc(birthInfo);
    
    return [
      `🌈 彩虹人生`,
      `類型：${result.type || result.colorType}`,
      `動物：${result.animal || result.totem || ''}`,
      ``
    ].join('\n');
  }, '', '彩虹人生');

  if (rainbowSection) sections.push(rainbowSection);

  // ====== 十、九型人格 ======
  const enneagramSection = safeCall(() => {
    const mod = require('../src/systems/enneagram/index');
    const calc = mod.calculateEnneagram || mod.inferEnneagram;
    if (!calc) return '';
    const result = calc(birthInfo);
    
    const mainType = result.mainType || result;
    const num = mainType.num || mainType.type || mainType.number;
    const name = mainType.name || mainType.label || '';
    
    return [
      `🔄 九型人格`,
      `類型：Type ${num}（${name}）`,
      mainType.trait ? `特質：${mainType.trait}` : '',
      ``
    ].filter(Boolean).join('\n');
  }, '', '九型人格');

  if (enneagramSection) sections.push(enneagramSection);

  // ====== 交叉驗證摘要 ======
  const crossSection = safeCall(() => {
    const { baziToSystemAnalysis } = require('../src/systems/bazi/index');
    const { ziweiToSystemAnalysis } = require('../src/systems/ziwei/index');
    const { astroToSystemAnalysis } = require('../src/systems/astro/index');
    const { crossValidate } = require('../src/ai/cross-validation');
    
    const analyses = [
      baziToSystemAnalysis(birthInfo),
      ziweiToSystemAnalysis(birthInfo),
      astroToSystemAnalysis(birthInfo),
    ];
    
    const cv = crossValidate(analyses);
    
    const lines = [
      `━━━━━━━━━━━━━━━━━`,
      `📊 交叉驗證｜共鳴度 ${cv.resonanceScore}/100`,
      ``
    ];
    
    if (cv.agreements.length > 0) {
      lines.push('✅ 多系統共識：');
      cv.agreements.slice(0, 3).forEach((a: any) => {
        lines.push(`• ${a.conclusion}（${a.confidence}%）`);
      });
      lines.push('');
    }
    
    if (cv.tensions.length > 0) {
      lines.push('⚡ 內在張力：');
      cv.tensions.slice(0, 2).forEach((t: any) => {
        lines.push(`• ${t.description}`);
        lines.push(`  💡 ${t.interpretation}`);
      });
      lines.push('');
    }
    
    return lines.join('\n');
  }, '', '交叉驗證');

  if (crossSection) sections.push(crossSection);

  // ====== 結尾 ======
  sections.push(
    `━━━━━━━━━━━━━━━━━`,
    `🔮 造命 ZaoMing AI v0.5.0`,
    `42 系統 × 190+ 維度 × AI 交叉驗證`,
    `不認命，用 AI 逆天改命。`,
    ``,
    `💡 完整版報告含全部 42 系統分析`,
    `輸入「算命」再算一次`
  );

  return sections.join('\n');
}
