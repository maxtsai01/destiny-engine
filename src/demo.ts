/**
 * 🔮 Destiny Engine v0.1.0 — 完整 Demo
 * 
 * 輸入生辰 → 三系統同時排盤 → 交叉驗證 → 整合報告
 */

import { WUXING_CN, type WuXing } from './core/index';
import { calculateBazi, baziToSystemAnalysis } from './systems/bazi/index';
import { calculateZiwei, ziweiToSystemAnalysis } from './systems/ziwei/index';
import { calculateAstro, astroToSystemAnalysis } from './systems/astro/index';
import { crossValidate } from './ai/cross-validation';
import type { BirthInfo } from './core/types';

// ====== 測試用例 ======
const testInput: BirthInfo = {
  solarDate: '1990-08-07',
  hour: 14,       // 下午2點 = 未時
  gender: 'male',
};

console.log('🔮 Destiny Engine v0.1.0 — 命理 × AI 整合引擎');
console.log('═'.repeat(60));
console.log(`\n📋 輸入資訊：${testInput.solarDate}  ${testInput.hour}:00  ${testInput.gender === 'male' ? '男' : '女'}`);
console.log('═'.repeat(60));

// ====== 八字四柱 ======

console.log('\n\n🏮 【八字四柱】');
console.log('─'.repeat(40));

try {
  const bazi = calculateBazi(testInput);
  
  console.log(`\n  年柱: ${bazi.yearPillar.gan}${bazi.yearPillar.zhi}`);
  console.log(`  月柱: ${bazi.monthPillar.gan}${bazi.monthPillar.zhi}`);
  console.log(`  日柱: ${bazi.dayPillar.gan}${bazi.dayPillar.zhi}  ← 日主`);
  console.log(`  時柱: ${bazi.hourPillar.gan}${bazi.hourPillar.zhi}`);
  
  console.log(`\n  日主: ${bazi.dayMaster}（${WUXING_CN[bazi.dayMasterWuXing]}）`);
  console.log(`  納音: ${bazi.naYin}`);
  
  console.log(`\n  五行統計:`);
  Object.entries(bazi.wuXingCount).forEach(([wx, count]) => {
    const bar = '█'.repeat(Math.round(count * 3));
    console.log(`    ${WUXING_CN[wx as WuXing]}  ${bar} ${count.toFixed(1)}`);
  });
  
  console.log(`\n  用神: ${WUXING_CN[bazi.yongShen.wuXing]}（${bazi.yongShen.reason}）`);
  
  console.log(`\n  十神:`);
  bazi.shiShen.forEach(ss => {
    console.log(`    ${ss.position}: ${ss.shiShen}`);
  });
  
  if (bazi.daYun.length > 0) {
    console.log(`\n  大運:`);
    bazi.daYun.forEach(dy => {
      console.log(`    ${dy.startAge}歲: ${dy.ganZhi}（${WUXING_CN[dy.wuXing]}）`);
    });
  }
} catch (err: any) {
  console.log(`  ⚠️ 八字計算錯誤: ${err.message}`);
}

// ====== 紫微斗數 ======

console.log('\n\n🌟 【紫微斗數】');
console.log('─'.repeat(40));

try {
  const ziwei = calculateZiwei(testInput);
  
  console.log(`\n  命宮主星: ${ziwei.lifePalaceStars.join('、') || '（空宮）'}`);
  
  console.log(`\n  十二宮:`);
  ziwei.palaces.forEach(p => {
    const stars = p.majorStars.length > 0 ? p.majorStars.join('、') : '（空宮）';
    console.log(`    ${p.name.padEnd(4, '　')}: ${stars}`);
  });
  
  if (ziwei.siHua.length > 0) {
    console.log(`\n  四化:`);
    ziwei.siHua.forEach(sh => {
      console.log(`    ${sh.star} → ${sh.type}`);
    });
  }
} catch (err: any) {
  console.log(`  ⚠️ 紫微計算錯誤: ${err.message}`);
}

// ====== 西洋占星 ======

console.log('\n\n⭐ 【西洋占星】');
console.log('─'.repeat(40));

try {
  const astroResult = calculateAstro(testInput);
  
  console.log(`\n  太陽星座: ${astroResult.sunSign.name}（${astroResult.sunSign.en}）`);
  console.log(`  元素: ${astroResult.sunSign.element} | 特質: ${astroResult.sunSign.quality}`);
  console.log(`  上升星座: ${astroResult.ascendant.name}（${astroResult.ascendant.en}）`);
  
  console.log(`\n  天賦:`);
  astroResult.traits.strengths.forEach(s => console.log(`    ✅ ${s}`));
  
  console.log(`\n  盲區:`);
  astroResult.traits.weaknesses.forEach(w => console.log(`    ⚠️ ${w}`));
  
  console.log(`\n  事業: ${astroResult.traits.career}`);
  console.log(`  感情: ${astroResult.traits.relationship}`);
} catch (err: any) {
  console.log(`  ⚠️ 占星計算錯誤: ${err.message}`);
}

// ====== 交叉驗證 ======

console.log('\n\n🔄 【交叉驗證 — AI 整合分析】');
console.log('═'.repeat(60));

try {
  const baziAnalysis = baziToSystemAnalysis(testInput);
  const ziweiAnalysis = ziweiToSystemAnalysis(testInput);
  const astroAnalysis = astroToSystemAnalysis(testInput);
  
  const cv = crossValidate([baziAnalysis, ziweiAnalysis, astroAnalysis]);
  
  console.log(`\n  📊 共鳴度: ${cv.resonanceScore}/100`);
  
  if (cv.agreements.length > 0) {
    console.log(`\n  ✅ 多系統共識（${cv.agreements.length} 項）:`);
    cv.agreements.forEach((a, i) => {
      console.log(`    ${i + 1}. ${a.conclusion}`);
      console.log(`       支持系統: ${a.supportingSystems.join(', ')} | 信心度: ${a.confidence}%`);
    });
  }
  
  if (cv.tensions.length > 0) {
    console.log(`\n  ⚡ 內在張力（${cv.tensions.length} 項）:`);
    cv.tensions.forEach((t, i) => {
      console.log(`    ${i + 1}. ${t.description}`);
      console.log(`       ${t.systemA.system}: ${t.systemA.view}`);
      console.log(`       ${t.systemB.system}: ${t.systemB.view}`);
      console.log(`       💡 ${t.interpretation}`);
    });
  }
  
  if (cv.unique.length > 0) {
    console.log(`\n  🔍 獨特觀點（${cv.unique.length} 項）:`);
    cv.unique.forEach(u => {
      console.log(`    [${u.system}] ${u.insight}`);
    });
  }
  
  // 天賦雷達圖
  console.log('\n\n  📡 天賦雷達圖:');
  const dimensions = ['career', 'wealth', 'relationship', 'health', 'family', 'social', 'study', 'spiritual'] as const;
  const dimCN: Record<string, string> = {
    career: '事業', wealth: '財運', relationship: '感情', health: '健康',
    family: '家庭', social: '人際', study: '學習', spiritual: '心靈',
  };
  
  dimensions.forEach(dim => {
    const allTraits = [...baziAnalysis.traits, ...ziweiAnalysis.traits, ...astroAnalysis.traits]
      .filter(t => t.dimension === dim);
    
    const avgScore = allTraits.length > 0
      ? Math.round(allTraits.reduce((sum, t) => sum + (t.type === 'strength' ? t.score : 100 - t.score), 0) / allTraits.length)
      : 50;
    
    const bar = '█'.repeat(Math.round(avgScore / 5));
    const label = dimCN[dim].padEnd(4, '　');
    console.log(`    ${label} ${bar} ${avgScore}`);
  });
  
  // ====== 第四部分：AI 解讀報告 ======
  console.log('\n\n' + '─'.repeat(60));
  console.log('📖 第四部分：造命 AI 離線解讀報告');
  console.log('─'.repeat(60));

  const { generateOfflineInterpretation, generateGrowthAdvice, generateInterpretationPrompt, getSystemPrompt } = require('./ai/interpreter');
  
  // 生成成長建議
  const growthAdvice = generateGrowthAdvice(
    [baziAnalysis, ziweiAnalysis, astroAnalysis],
    cv
  );
  
  // 組裝完整報告
  const fullReport = {
    id: 'demo-001',
    generatedAt: new Date().toISOString(),
    input: testInput,
    systems: [baziAnalysis, ziweiAnalysis, astroAnalysis],
    crossValidation: cv,
    growthAdvice,
    aiInterpretation: '',
    talentRadar: dimensions.map((dim: string) => {
      const allTraits = [...baziAnalysis.traits, ...ziweiAnalysis.traits, ...astroAnalysis.traits]
        .filter((t: any) => t.dimension === dim);
      const avgScore = allTraits.length > 0
        ? Math.round(allTraits.reduce((sum: number, t: any) => sum + (t.type === 'strength' ? t.score : 100 - t.score), 0) / allTraits.length)
        : 50;
      return { dimension: dim, score: avgScore, label: dimCN[dim] };
    }),
  };
  
  // 生成離線報告
  const report = generateOfflineInterpretation(fullReport);
  console.log('\n' + report);
  
  // 生成 AI 解讀用的 prompt（展示用）
  console.log('\n\n' + '─'.repeat(60));
  console.log('🧠 AI 解讀 Prompt（接 LLM 時使用）');
  console.log('─'.repeat(60));
  console.log('\n[System Prompt 長度]:', getSystemPrompt().length, '字');
  console.log('[User Prompt 長度]:', generateInterpretationPrompt(fullReport).length, '字');
  console.log('→ 接上 GPT-4 / Claude 就能生成個人化解讀報告！');

} catch (err: any) {
  console.log(`  ⚠️ 錯誤: ${err.message}`);
}

console.log('\n\n' + '═'.repeat(60));
console.log('🔮 造命 ZaoMing AI v0.2.0 — Demo 完成');
console.log('   不認命，用 AI 逆天改命。');
console.log('   GitHub: github.com/maxtsai01/destiny-engine');
console.log('═'.repeat(60) + '\n');
