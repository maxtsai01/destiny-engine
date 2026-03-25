#!/usr/bin/env npx ts-node --transpileOnly
/**
 * 造命 ZaoMing AI — CLI 命盤報告工具
 * 
 * Usage:
 *   npx ts-node src/cli.ts --name 蔡寅衍 --date 1993-08-07 --hour 9 --gender male
 *   npx ts-node src/cli.ts --name 蔡寅衍 --date 1993-08-07 --hour 9 --gender male --phone 0933539019
 *   npx ts-node src/cli.ts --help
 */

import type { BirthInfo } from './core/types';
import { calculateBazi } from './systems/bazi/index';
import { calculateAstro } from './systems/astro/index';
import { calculateName } from './systems/name/index';
import { calculateLifeNumber, calculateBirthdayGrid, analyzeGridLines } from './systems/numerology/index';
import { calculateLifeHexagram } from './systems/iching/index';
import { calculateMBTI } from './systems/mbti/index';
import { calculateQimen } from './systems/qimen/index';
import { calculateHumanDesign } from './systems/humandesign/index';
import { calculateTarot } from './systems/tarot/index';
import { analyzePhone } from './systems/phonenumber/index';
import { calculateFengshui } from './systems/fengshui/index';
import { castLiuYao } from './systems/liuyao/index';
import { calculateRainbow } from './systems/rainbow/index';

// Cross-validation + AI
import { baziToSystemAnalysis } from './systems/bazi/index';
import { astroToSystemAnalysis } from './systems/astro/index';
import { nameToSystemAnalysis } from './systems/name/index';
import { numerologyToSystemAnalysis } from './systems/numerology/index';
import { ichingToSystemAnalysis } from './systems/iching/index';
import { mbtiToSystemAnalysis } from './systems/mbti/index';
import { qimenToSystemAnalysis } from './systems/qimen/index';
import { humanDesignToSystemAnalysis } from './systems/humandesign/index';
import { tarotToSystemAnalysis } from './systems/tarot/index';
import { fengshuiToSystemAnalysis } from './systems/fengshui/index';
import { liuyaoToSystemAnalysis } from './systems/liuyao/index';
import { rainbowToSystemAnalysis } from './systems/rainbow/index';
import { crossValidate } from './ai/cross-validation';
import { generateDeclaration, generateDailyFocus } from './ai/ritual';

// ====== Parse Args ======

function parseArgs(): { name: string; date: string; hour: number; gender: 'male' | 'female'; phone?: string } {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(`
🔮 造命 ZaoMing AI — CLI 命盤報告

Usage:
  npx ts-node src/cli.ts --name <姓名> --date <YYYY-MM-DD> --hour <0-23> --gender <male|female> [--phone <號碼>]

Example:
  npx ts-node src/cli.ts --name 蔡寅衍 --date 1993-08-07 --hour 9 --gender male --phone 0933539019

Options:
  --name    姓名（中文）
  --date    出生日期（西曆 YYYY-MM-DD）
  --hour    出生時辰（0-23）
  --gender  性別（male/female）
  --phone   手機號碼（選填）
  --help    顯示此說明
`);
    process.exit(0);
  }

  return {
    name: get('--name') || '造命者',
    date: get('--date') || '1993-08-07',
    hour: parseInt(get('--hour') || '12'),
    gender: (get('--gender') as 'male' | 'female') || 'male',
    phone: get('--phone'),
  };
}

// ====== Main ======

function main() {
  const { name, date, hour, gender, phone } = parseArgs();
  const input: BirthInfo = { solarDate: date, hour, gender, name };

  const wuxingCN: Record<string, string> = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🔮 造命 ZaoMing AI — 15 系統完整命盤報告                ║
║  不認命，用 AI 逆天改命。                                 ║
╚═══════════════════════════════════════════════════════════╝

  📋 姓名：${name}
  📅 生辰：${date} ${hour}:00
  👤 性別：${gender === 'male' ? '男' : '女'}
  ${phone ? `📱 手機：${phone}` : ''}
`);

  const sep = '─'.repeat(55);

  // 1. 八字
  console.log(`① 八字四柱\n${sep}`);
  try {
    const bazi = calculateBazi(input);
    console.log(`  日主：${bazi.dayMaster}（${wuxingCN[bazi.dayMasterWuXing] || bazi.dayMasterWuXing}）`);
    console.log(`  四柱：${bazi.yearPillar.gan}${bazi.yearPillar.zhi} ${bazi.monthPillar.gan}${bazi.monthPillar.zhi} ${bazi.dayPillar.gan}${bazi.dayPillar.zhi} ${bazi.hourPillar.gan}${bazi.hourPillar.zhi}`);
    const strongest = Object.entries(bazi.wuXingCount).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
    const weakest = Object.entries(bazi.wuXingCount).sort((a, b) => (a[1] as number) - (b[1] as number))[0];
    console.log(`  最強：${wuxingCN[strongest[0]]}（${strongest[1]}）| 最弱：${wuxingCN[weakest[0]]}（${weakest[1]}）`);
    console.log(`  用神：${wuxingCN[bazi.yongShen.wuXing] || bazi.yongShen.wuXing}`);

    // Store for later use
    (global as any).__bazi = bazi;
    (global as any).__strongEl = wuxingCN[strongest[0]] || strongest[0];
    (global as any).__weakEl = wuxingCN[weakest[0]] || weakest[0];
  } catch (e: any) { console.log(`  ⚠️ ${e.message}`); }

  // 2. 占星
  console.log(`\n② 西洋占星\n${sep}`);
  let sunSignCN = '獅子座';
  try {
    const astro = calculateAstro(input);
    sunSignCN = astro.sunSign?.cn || astro.sunSign?.name || '未知';
    console.log(`  太陽：${sunSignCN}（${astro.sunSign?.en || '?'}）`);
    console.log(`  上升：${astro.risingSign?.cn || astro.risingSign?.name || '?'}`);
  } catch (e: any) { console.log(`  ⚠️ ${e.message}`); }

  // 3. 姓名學
  if (name && name !== '造命者') {
    console.log(`\n③ 姓名學\n${sep}`);
    try {
      const nameResult = calculateName(name);
      for (const ge of nameResult.geAnalysis) {
        const icon = ge.luck === '大吉' ? '🌟' : ge.luck === '吉' ? '✅' : ge.luck === '半吉' ? '⚠️' : '❌';
        console.log(`  ${icon} ${ge.name}: ${ge.number}（${ge.wuxing}）${ge.luck}`);
      }
      console.log(`  總分：${nameResult.overallScore}/100`);
    } catch (e: any) { console.log(`  ⚠️ ${e.message}`); }
  }

  // 4. 靈數
  console.log(`\n④ 生命靈數\n${sep}`);
  let lifeNum = 1;
  try {
    const { lifeNumber, chain } = calculateLifeNumber(date);
    lifeNum = lifeNumber;
    const { grid } = calculateBirthdayGrid(date);
    const lines = analyzeGridLines(grid);
    const complete = lines.filter(l => l.complete);
    console.log(`  主命數：${lifeNumber}（${chain.join(' → ')}）`);
    console.log(`  完整連線：${complete.map(l => l.name).join('、') || '無'}`);
  } catch (e: any) { console.log(`  ⚠️ ${e.message}`); }

  // 5. 易經
  console.log(`\n⑤ 易經\n${sep}`);
  try {
    const iching = calculateLifeHexagram(input);
    console.log(`  本命卦：${iching.hexagram?.name || '?'}（${iching.hexagram?.score || '?'}/100）`);
    console.log(`  卦義：${iching.hexagram?.meaning || '?'}`);
  } catch (e: any) { console.log(`  ⚠️ ${e.message}`); }

  // 6. MBTI
  console.log(`\n⑥ MBTI 命盤推算\n${sep}`);
  let mbtiType = 'ESTJ';
  try {
    const strong = (global as any).__strongEl || '金';
    const weak = (global as any).__weakEl || '木';
    const mbti = calculateMBTI(strong, weak, sunSignCN, lifeNum);
    mbtiType = mbti.type;
    console.log(`  類型：${mbti.type} — ${mbti.title}（${mbti.confidence}%）`);
    console.log(`  ${mbti.description}`);
  } catch (e: any) { console.log(`  ⚠️ ${e.message}`); }

  // 7. 塔羅
  console.log(`\n⑦ 塔羅本命牌\n${sep}`);
  try {
    const tarot = calculateTarot(date);
    console.log(`  靈魂牌：#${tarot.soulCard.number} ${tarot.soulCard.name}（${tarot.soulCard.score}/100）`);
    console.log(`  個性牌：#${tarot.personalityCard.number} ${tarot.personalityCard.name}`);
    console.log(`  2026流年：#${tarot.yearCard.number} ${tarot.yearCard.name} — ${tarot.yearCard.keyword}`);
  } catch (e: any) { console.log(`  ⚠️ ${e.message}`); }

  // 8. 人類圖
  console.log(`\n⑧ 人類圖\n${sep}`);
  try {
    const hd = calculateHumanDesign(input);
    console.log(`  類型：${hd.type.name}（${hd.type.nameEN}）`);
    console.log(`  策略：${hd.type.strategy}`);
    console.log(`  權威：${hd.authority.name}`);
    console.log(`  角色：${hd.profileCode}（${hd.profile.name}）`);
  } catch (e: any) { console.log(`  ⚠️ ${e.message}`); }

  // 9. 奇門遁甲
  console.log(`\n⑨ 奇門遁甲\n${sep}`);
  try {
    const qm = calculateQimen(input);
    console.log(`  九星：${qm.star.name}（${qm.star.element}）| 八門：${qm.gate.name} | 八神：${qm.god.name}`);
    console.log(`  格局：${qm.pattern}（${qm.overallLuck}/100）`);
  } catch (e: any) { console.log(`  ⚠️ ${e.message}`); }

  // 10. 風水
  console.log(`\n⑩ 八宅風水\n${sep}`);
  try {
    const fs = calculateFengshui(input);
    console.log(`  命卦：${fs.info.name}（${fs.info.group}）`);
    console.log(`  財位：${fs.info.goodDirections[0].direction} | 健康位：${fs.info.goodDirections[1].direction}`);
    console.log(`  ⛔ 絕命位：${fs.info.badDirections[3].direction}`);
  } catch (e: any) { console.log(`  ⚠️ ${e.message}`); }

  // 11. 六爻
  console.log(`\n⑪ 六爻\n${sep}`);
  try {
    const ly = castLiuYao(input);
    console.log(`  主卦：${ly.mainHexagram.name}（${ly.overall.luck} ${ly.overall.score}/100）`);
    if (ly.changedHexagram) console.log(`  變卦：${ly.changedHexagram.name}`);
  } catch (e: any) { console.log(`  ⚠️ ${e.message}`); }

  // 12. 彩虹人生
  console.log(`\n⑫ 彩虹人生\n${sep}`);
  try {
    const strong = (global as any).__strongEl || '金';
    const weak = (global as any).__weakEl || '木';
    const rb = calculateRainbow(strong, weak, sunSignCN, lifeNum, mbtiType);
    console.log(`  類型：${rb.type} ${rb.animal.emoji}`);
    console.log(`  四色：🟡${rb.scores.gold} 🟢${rb.scores.green} 🟠${rb.scores.orange} 🔵${rb.scores.blue}`);
  } catch (e: any) { console.log(`  ⚠️ ${e.message}`); }

  // 13. 數字易經（如果有手機號）
  if (phone) {
    console.log(`\n⑬ 數字易經\n${sep}`);
    try {
      const pa = analyzePhone(phone);
      console.log(`  號碼：${pa.phone}（${pa.overallScore}/100）`);
      console.log(`  ${pa.summary}`);
      for (const pair of pa.pairs.slice(-4)) {
        const icon = pair.star.score >= 80 ? '🟢' : pair.star.score >= 60 ? '🟡' : '🔴';
        console.log(`  ${icon} ${pair.digits} → ${pair.star.name}（${pair.star.nature}）`);
      }
    } catch (e: any) { console.log(`  ⚠️ ${e.message}`); }
  }

  // ====== 交叉驗證 ======
  console.log(`\n${'═'.repeat(55)}`);
  console.log('📊 多系統交叉驗證');
  console.log('═'.repeat(55));
  
  try {
    const allSystems = [
      baziToSystemAnalysis(input),
      astroToSystemAnalysis(input),
      numerologyToSystemAnalysis(input),
      ichingToSystemAnalysis(input),
      mbtiToSystemAnalysis(input),
      qimenToSystemAnalysis(input),
      humanDesignToSystemAnalysis(input),
      tarotToSystemAnalysis(input),
      fengshuiToSystemAnalysis(input),
      liuyaoToSystemAnalysis(input),
      rainbowToSystemAnalysis(input),
    ];

    if (name && name !== '造命者') {
      allSystems.splice(1, 0, nameToSystemAnalysis(input));
    }

    const cv = crossValidate(allSystems);
    const totalTraits = allSystems.reduce((sum, s) => sum + s.traits.length, 0);

    console.log(`\n  共鳴度：${cv.resonanceScore}/100`);
    console.log(`  系統數：${allSystems.length} | 維度：${totalTraits}`);
    console.log(`  共識：${cv.agreements.length} | 張力：${cv.tensions.length} | 獨特：${cv.unique.length}`);

    // 造命宣言
    const allTraits = allSystems.flatMap(s => s.traits);
    const topTraits = allTraits.filter(t => t.type === 'strength').sort((a, b) => b.score - a.score).slice(0, 3);
    const weakTraits = allTraits.filter(t => t.type === 'weakness').sort((a, b) => a.score - b.score).slice(0, 2);
    
    const bazi = (global as any).__bazi;
    const dayMasterStr = bazi ? `${bazi.dayMaster}${wuxingCN[bazi.dayMasterWuXing] || ''}` : '';
    const declaration = generateDeclaration(name, dayMasterStr, topTraits, weakTraits);
    
    console.log(`\n${'═'.repeat(55)}`);
    console.log(declaration.content);

    // 今日聚運
    const today = new Date().toISOString().split('T')[0];
    const dayMasterEl = bazi ? (wuxingCN[bazi.dayMasterWuXing] || '') : '金';
    const godOfUse = bazi ? (wuxingCN[bazi.yongShen.wuXing] || '') : '木';
    const daily = generateDailyFocus(today, dayMasterEl, godOfUse);
    console.log(`${sep}`);
    console.log(`⚡ 今日聚運：${daily.focusAction}`);
    console.log(`  吉方：${daily.luckyDirection} | 吉色：${daily.luckyColor}`);
    console.log(`  📜 ${daily.affirmation}`);

    console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🔮 造命 ZaoMing AI v0.4.0                               ║
║  ${allSystems.length} 系統 × ${totalTraits} 維度 × 共鳴度 ${cv.resonanceScore}/100                  ║
║  github.com/maxtsai01/destiny-engine                      ║
╚═══════════════════════════════════════════════════════════╝
`);
  } catch (e: any) {
    console.log(`  ⚠️ 交叉驗證失敗：${e.message}`);
  }
}

main();
