/**
 * 造命 ZaoMing AI — 完整報告生成器
 * 
 * 8 系統同時排盤 → 交叉驗證 → AI 解讀 → 儀式引導
 * 一個輸入，八個維度，一份報告。
 */

import type { BirthInfo } from './core/types';
import { calculateBazi, baziToSystemAnalysis } from './systems/bazi/index';
import { calculateZiwei, ziweiToSystemAnalysis } from './systems/ziwei/index';
import { calculateAstro, astroToSystemAnalysis } from './systems/astro/index';
import { calculateName, nameToSystemAnalysis } from './systems/name/index';
import { numerologyToSystemAnalysis, calculateLifeNumber, calculateBirthdayGrid, analyzeGridLines } from './systems/numerology/index';
import { ichingToSystemAnalysis, calculateLifeHexagram } from './systems/iching/index';
import { calculateMBTI, mbtiToSystemAnalysis } from './systems/mbti/index';
import { crossValidate } from './ai/cross-validation';
import { generateOfflineInterpretation, generateGrowthAdvice, DIMENSION_NAMES, DIMENSION_EMOJIS } from './ai/interpreter';
import { generateOpeningRitual, generateDeclaration, generateDailyFocus } from './ai/ritual';

// ====== Allison 蔡寅衍 ======

const allison: BirthInfo = {
  solarDate: '1993-08-07',
  hour: 9,
  gender: 'male',
  name: '蔡寅衍',
};

console.log(`
╔══════════════════════════════════════════════════════════╗
║  🔮 造命 ZaoMing AI — 完整命盤報告                      ║
║  不認命，用 AI 逆天改命。                                ║
╚══════════════════════════════════════════════════════════╝
`);

console.log(`📋 姓名：${allison.name}`);
console.log(`📅 生辰：${allison.solarDate} ${allison.hour}:46`);
console.log(`👤 性別：男`);
console.log(`\n${'═'.repeat(58)}\n`);

// ====== 1. 八字 ======
console.log('① 八字四柱');
console.log('─'.repeat(40));
const bazi = calculateBazi(allison);
console.log(`  日主：${bazi.dayMaster}（${bazi.dayMasterWuXing}）`);
console.log(`  四柱：${bazi.yearPillar.gan}${bazi.yearPillar.zhi} ${bazi.monthPillar.gan}${bazi.monthPillar.zhi} ${bazi.dayPillar.gan}${bazi.dayPillar.zhi} ${bazi.hourPillar.gan}${bazi.hourPillar.zhi}`);
console.log(`  用神：${bazi.yongShen.wuXing}（${bazi.yongShen.reason}）`);
const wuxingCN: Record<string, string> = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
const strongest = Object.entries(bazi.wuXingCount).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
const weakest = Object.entries(bazi.wuXingCount).sort((a, b) => (a[1] as number) - (b[1] as number))[0];
console.log(`  最強：${wuxingCN[strongest[0]] || strongest[0]}（${strongest[1]}）| 最弱：${wuxingCN[weakest[0]] || weakest[0]}（${weakest[1]}）`);

// ====== 2. 紫微斗數 ======
console.log('\n② 紫微斗數');
console.log('─'.repeat(40));
try {
  const ziwei = calculateZiwei(allison);
  const mingGong = ziwei.palaces?.find((p: any) => p.name === '命宮');
  console.log(`  命宮主星：${mingGong?.mainStar || '空宮'}`);
  const sihua = ziwei.siHua;
  if (sihua) {
    console.log(`  四化：${sihua.lu || '?'}祿 ${sihua.quan || '?'}權 ${sihua.ke || '?'}科 ${sihua.ji || '?'}忌`);
  }
} catch (e: any) { console.log(`  ⚠️ ${e.message}`); }

// ====== 3. 西洋占星 ======
console.log('\n③ 西洋占星');
console.log('─'.repeat(40));
let sunSignCN = '獅子座';
try {
  const astro = calculateAstro(allison);
  sunSignCN = astro.sunSign?.cn || astro.sunSign?.name || '獅子座';
  console.log(`  太陽：${sunSignCN}（${astro.sunSign?.en || 'Leo'}）`);
  console.log(`  上升：${astro.risingSign?.cn || astro.risingSign?.name || '射手座'}`);
  console.log(`  元素：${astro.sunSign?.element || 'fire'} | 特質：${astro.sunSign?.quality || 'fixed'}`);
} catch (e: any) { console.log(`  ⚠️ ${e.message}`); }

// ====== 4. 姓名學 ======
console.log('\n④ 姓名學（三才五格）');
console.log('─'.repeat(40));
if (allison.name) {
  const nameResult = calculateName(allison.name);
  console.log(`  筆畫：${nameResult.strokes.join(' + ')} = ${nameResult.strokes.reduce((a, b) => a + b, 0)}`);
  for (const ge of nameResult.geAnalysis) {
    const icon = ge.luck === '大吉' ? '🌟' : ge.luck === '吉' ? '✅' : ge.luck === '半吉' ? '⚠️' : '❌';
    console.log(`  ${icon} ${ge.name}: ${ge.number}（${ge.wuxing}）${ge.luck}`);
  }
  console.log(`  三才：${nameResult.sanCai} | 總分：${nameResult.overallScore}/100`);
}

// ====== 5. 生命靈數 ======
console.log('\n⑤ 生命靈數');
console.log('─'.repeat(40));
const { lifeNumber, masterNumber, chain } = calculateLifeNumber(allison.solarDate);
console.log(`  主命數：${lifeNumber} ${masterNumber ? '（大師數）' : ''}`);
console.log(`  計算：${chain.join(' → ')}`);
const { grid, strengths, weaknesses } = calculateBirthdayGrid(allison.solarDate);
const lines = analyzeGridLines(grid);
const completeLines = lines.filter(l => l.complete);
console.log(`  完整連線：${completeLines.map(l => l.name).join('、') || '無'}`);

// ====== 6. 易經 ======
console.log('\n⑥ 易經六十四卦');
console.log('─'.repeat(40));
const iching = calculateLifeHexagram(allison);
const BAGUA_NAMES: Record<string, string> = { qian: '乾', dui: '兌', li: '離', zhen: '震', xun: '巽', kan: '坎', gen: '艮', kun: '坤' };
console.log(`  本命卦：${iching.hexagram?.name || `${BAGUA_NAMES[iching.upper]}${BAGUA_NAMES[iching.lower]}`}`);
if (iching.hexagram) {
  console.log(`  卦義：${iching.hexagram.meaning}`);
  console.log(`  吉凶：${iching.hexagram.score}/100`);
}
console.log(`  變卦：${BAGUA_NAMES[iching.changing]}`);

// ====== 7. MBTI 推算 ======
console.log('\n⑦ MBTI 命盤推算');
console.log('─'.repeat(40));
const mbti = calculateMBTI(wuxingCN[strongest[0]] || strongest[0], wuxingCN[weakest[0]] || weakest[0], sunSignCN, lifeNumber);
console.log(`  推算結果：${mbti.type} — ${mbti.title}`);
console.log(`  ${mbti.description}`);
console.log(`  信心度：${mbti.confidence}%`);
for (const dim of mbti.dimensions) {
  const dominant = dim.left.score >= 50 ? dim.left : dim.right;
  console.log(`  ${dim.axis}：${dominant.code}(${dominant.name}) ${Math.round(dominant.score)}%`);
}

// ====== 8. 交叉驗證 ======
console.log(`\n${'═'.repeat(58)}`);
console.log('⑧ 多系統交叉驗證');
console.log('═'.repeat(58));

const baziSys = baziToSystemAnalysis(allison);
const ziweiSys = ziweiToSystemAnalysis(allison);
const astroSys = astroToSystemAnalysis(allison);
const nameSys = nameToSystemAnalysis(allison);
const numSys = numerologyToSystemAnalysis(allison);
const ichingSys = ichingToSystemAnalysis(allison);
const mbtiSys = mbtiToSystemAnalysis(allison);

const allSystems = [baziSys, ziweiSys, astroSys, nameSys, numSys, ichingSys, mbtiSys];
const cv = crossValidate(allSystems);

console.log(`\n  📊 共鳴度：${cv.resonanceScore}/100`);
console.log(`  ✅ 共識：${cv.agreements.length} 項`);
console.log(`  ⚡ 張力：${cv.tensions.length} 項`);
console.log(`  🔍 獨特觀點：${cv.unique.length} 項`);
console.log(`  📐 系統數：${allSystems.length}`);

// Top 3 共識
if (cv.agreements.length > 0) {
  console.log('\n  Top 3 高可信度共識：');
  const topAgreements = cv.agreements.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  topAgreements.forEach((a, i) => {
    console.log(`  ${i + 1}. [${a.supportingSystems.length}系統] ${a.conclusion.slice(0, 60)}...（${a.confidence}%）`);
  });
}

// ====== 9. 天賦雷達圖 ======
console.log('\n\n📡 天賦雷達圖（8系統加權平均）');
console.log('─'.repeat(58));
const dimensions = ['career', 'wealth', 'relationship', 'health', 'family', 'social', 'study', 'spiritual'] as const;

const allTraits = allSystems.flatMap(s => s.traits);
dimensions.forEach(dim => {
  const dimTraits = allTraits.filter(t => t.dimension === dim);
  const avgScore = dimTraits.length > 0
    ? Math.round(dimTraits.reduce((sum, t) => sum + (t.type === 'strength' ? t.score : 100 - t.score), 0) / dimTraits.length)
    : 50;
  const bar = '█'.repeat(Math.round(avgScore / 5));
  const space = '░'.repeat(20 - Math.round(avgScore / 5));
  const emoji = DIMENSION_EMOJIS[dim];
  const name = DIMENSION_NAMES[dim];
  console.log(`  ${emoji} ${name.padEnd(4, '　')} ${bar}${space} ${avgScore}`);
});

// ====== 10. 造命宣言 ======
console.log(`\n${'═'.repeat(58)}`);
console.log('📜 你的造命宣言');
console.log('═'.repeat(58));

const topTraits = allTraits.filter(t => t.type === 'strength').sort((a, b) => b.score - a.score).slice(0, 3);
const weakTraits = allTraits.filter(t => t.type === 'weakness').sort((a, b) => a.score - b.score).slice(0, 2);
const declaration = generateDeclaration(allison.name || '造命者', bazi.dayMaster + (wuxingCN[bazi.dayMasterWuXing] || ''), topTraits, weakTraits);
console.log(declaration.content);

// ====== 11. 每日聚運 ======
console.log('─'.repeat(58));
console.log('⚡ 今日聚運');
console.log('─'.repeat(58));
const today = new Date().toISOString().split('T')[0];
const daily = generateDailyFocus(today, wuxingCN[bazi.dayMasterWuXing] || bazi.dayMasterWuXing, wuxingCN[bazi.yongShen.wuXing] || bazi.yongShen.wuXing);
console.log(`  日期：${daily.date}（${daily.dayElement}）`);
console.log(`  吉方：${daily.luckyDirection} | 吉色：${daily.luckyColor}`);
console.log(`  🎯 今日行動：${daily.focusAction}`);
console.log(`  📜 今日宣言：${daily.affirmation}`);

// ====== 結尾 ======
console.log(`
╔══════════════════════════════════════════════════════════╗
║  🔮 造命 ZaoMing AI v0.3.0                              ║
║  不認命，用 AI 逆天改命。                                ║
║                                                          ║
║  ${allSystems.length} 系統 × ${allTraits.length} 維度 × 共鳴度 ${cv.resonanceScore}/100              ║
║  成為世人造命改命的源頭。                                ║
║                                                          ║
║  GitHub: github.com/maxtsai01/destiny-engine              ║
╚══════════════════════════════════════════════════════════╝
`);
