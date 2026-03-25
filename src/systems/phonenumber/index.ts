/**
 * 造命 ZaoMing — 數字易經模組（手機號碼吉凶）
 * 
 * 後兩位數字 → 八星對照 → 吉凶判斷
 * 常見的「數字能量學」/「數字易經」體系
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

// ====== 八星能量 ======

interface StarEnergy {
  name: string;
  nature: string;
  luck: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  score: number;
  meaning: string;
  business: string;
}

const EIGHT_STARS: Record<string, StarEnergy> = {
  // 天醫 — 大吉
  '13': { name: '天醫', nature: '財富', luck: 'great', score: 95, meaning: '天醫磁場，財富與健康', business: '適合做生意、投資、健康事業' },
  '31': { name: '天醫', nature: '財富', luck: 'great', score: 95, meaning: '天醫磁場，財富與健康', business: '適合做生意、投資、健康事業' },
  '68': { name: '天醫', nature: '財富', luck: 'great', score: 95, meaning: '天醫磁場，財富與健康', business: '適合做生意、投資、健康事業' },
  '86': { name: '天醫', nature: '財富', luck: 'great', score: 95, meaning: '天醫磁場，財富與健康', business: '適合做生意、投資、健康事業' },
  '49': { name: '天醫', nature: '財富', luck: 'great', score: 95, meaning: '天醫磁場，財富與健康', business: '適合做生意、投資、健康事業' },
  '94': { name: '天醫', nature: '財富', luck: 'great', score: 95, meaning: '天醫磁場，財富與健康', business: '適合做生意、投資、健康事業' },
  '27': { name: '天醫', nature: '財富', luck: 'great', score: 95, meaning: '天醫磁場，財富與健康', business: '適合做生意、投資、健康事業' },
  '72': { name: '天醫', nature: '財富', luck: 'great', score: 95, meaning: '天醫磁場，財富與健康', business: '適合做生意、投資、健康事業' },

  // 生氣 — 大吉
  '14': { name: '生氣', nature: '貴人', luck: 'great', score: 90, meaning: '生氣磁場，貴人運旺', business: '適合社交、業務、拓展人脈' },
  '41': { name: '生氣', nature: '貴人', luck: 'great', score: 90, meaning: '生氣磁場，貴人運旺', business: '適合社交、業務、拓展人脈' },
  '67': { name: '生氣', nature: '貴人', luck: 'great', score: 90, meaning: '生氣磁場，貴人運旺', business: '適合社交、業務、拓展人脈' },
  '76': { name: '生氣', nature: '貴人', luck: 'great', score: 90, meaning: '生氣磁場，貴人運旺', business: '適合社交、業務、拓展人脈' },
  '39': { name: '生氣', nature: '貴人', luck: 'great', score: 90, meaning: '生氣磁場，貴人運旺', business: '適合社交、業務、拓展人脈' },
  '93': { name: '生氣', nature: '貴人', luck: 'great', score: 90, meaning: '生氣磁場，貴人運旺', business: '適合社交、業務、拓展人脈' },
  '28': { name: '生氣', nature: '貴人', luck: 'great', score: 90, meaning: '生氣磁場，貴人運旺', business: '適合社交、業務、拓展人脈' },
  '82': { name: '生氣', nature: '貴人', luck: 'great', score: 90, meaning: '生氣磁場，貴人運旺', business: '適合社交、業務、拓展人脈' },

  // 延年 — 吉
  '19': { name: '延年', nature: '感情', luck: 'good', score: 80, meaning: '延年磁場，感情和婚姻順利', business: '適合合作、婚禮、長期關係' },
  '91': { name: '延年', nature: '感情', luck: 'good', score: 80, meaning: '延年磁場，感情和婚姻順利', business: '適合合作、婚禮、長期關係' },
  '78': { name: '延年', nature: '感情', luck: 'good', score: 80, meaning: '延年磁場，感情和婚姻順利', business: '適合合作、婚禮、長期關係' },
  '87': { name: '延年', nature: '感情', luck: 'good', score: 80, meaning: '延年磁場，感情和婚姻順利', business: '適合合作、婚禮、長期關係' },
  '34': { name: '延年', nature: '感情', luck: 'good', score: 80, meaning: '延年磁場，感情和婚姻順利', business: '適合合作、婚禮、長期關係' },
  '43': { name: '延年', nature: '感情', luck: 'good', score: 80, meaning: '延年磁場，感情和婚姻順利', business: '適合合作、婚禮、長期關係' },
  '26': { name: '延年', nature: '感情', luck: 'good', score: 80, meaning: '延年磁場，感情和婚姻順利', business: '適合合作、婚禮、長期關係' },
  '62': { name: '延年', nature: '感情', luck: 'good', score: 80, meaning: '延年磁場，感情和婚姻順利', business: '適合合作、婚禮、長期關係' },

  // 伏位 — 小吉
  '11': { name: '伏位', nature: '穩定', luck: 'good', score: 70, meaning: '伏位磁場，穩定等待', business: '穩中求進，不適合冒險' },
  '22': { name: '伏位', nature: '穩定', luck: 'good', score: 70, meaning: '伏位磁場，穩定等待', business: '穩中求進，不適合冒險' },
  '33': { name: '伏位', nature: '穩定', luck: 'good', score: 70, meaning: '伏位磁場，穩定等待', business: '穩中求進，不適合冒險' },
  '44': { name: '伏位', nature: '穩定', luck: 'good', score: 70, meaning: '伏位磁場，穩定等待', business: '穩中求進，不適合冒險' },
  '66': { name: '伏位', nature: '穩定', luck: 'good', score: 70, meaning: '伏位磁場，穩定等待', business: '穩中求進，不適合冒險' },
  '77': { name: '伏位', nature: '穩定', luck: 'good', score: 70, meaning: '伏位磁場，穩定等待', business: '穩中求進，不適合冒險' },
  '88': { name: '伏位', nature: '穩定', luck: 'good', score: 70, meaning: '伏位磁場，穩定等待', business: '穩中求進，不適合冒險' },
  '99': { name: '伏位', nature: '穩定', luck: 'good', score: 70, meaning: '伏位磁場，穩定等待', business: '穩中求進，不適合冒險' },

  // 禍害 — 小凶
  '17': { name: '禍害', nature: '口舌', luck: 'bad', score: 40, meaning: '禍害磁場，小人口舌是非', business: '注意合約糾紛，慎選合作對象' },
  '71': { name: '禍害', nature: '口舌', luck: 'bad', score: 40, meaning: '禍害磁場，小人口舌是非', business: '注意合約糾紛，慎選合作對象' },
  '89': { name: '禍害', nature: '口舌', luck: 'bad', score: 40, meaning: '禍害磁場，小人口舌是非', business: '注意合約糾紛，慎選合作對象' },
  '98': { name: '禍害', nature: '口舌', luck: 'bad', score: 40, meaning: '禍害磁場，小人口舌是非', business: '注意合約糾紛，慎選合作對象' },
  '46': { name: '禍害', nature: '口舌', luck: 'bad', score: 40, meaning: '禍害磁場，小人口舌是非', business: '注意合約糾紛，慎選合作對象' },
  '64': { name: '禍害', nature: '口舌', luck: 'bad', score: 40, meaning: '禍害磁場，小人口舌是非', business: '注意合約糾紛，慎選合作對象' },
  '23': { name: '禍害', nature: '口舌', luck: 'bad', score: 40, meaning: '禍害磁場，小人口舌是非', business: '注意合約糾紛，慎選合作對象' },
  '32': { name: '禍害', nature: '口舌', luck: 'bad', score: 40, meaning: '禍害磁場，小人口舌是非', business: '注意合約糾紛，慎選合作對象' },

  // 六煞 — 凶
  '16': { name: '六煞', nature: '桃花', luck: 'bad', score: 35, meaning: '六煞磁場，感情糾紛、爛桃花', business: '注意感情影響事業' },
  '61': { name: '六煞', nature: '桃花', luck: 'bad', score: 35, meaning: '六煞磁場，感情糾紛、爛桃花', business: '注意感情影響事業' },
  '47': { name: '六煞', nature: '桃花', luck: 'bad', score: 35, meaning: '六煞磁場，感情糾紛、爛桃花', business: '注意感情影響事業' },
  '74': { name: '六煞', nature: '桃花', luck: 'bad', score: 35, meaning: '六煞磁場，感情糾紛、爛桃花', business: '注意感情影響事業' },
  '38': { name: '六煞', nature: '桃花', luck: 'bad', score: 35, meaning: '六煞磁場，感情糾紛、爛桃花', business: '注意感情影響事業' },
  '83': { name: '六煞', nature: '桃花', luck: 'bad', score: 35, meaning: '六煞磁場，感情糾紛、爛桃花', business: '注意感情影響事業' },
  '29': { name: '六煞', nature: '桃花', luck: 'bad', score: 35, meaning: '六煞磁場，感情糾紛、爛桃花', business: '注意感情影響事業' },
  '92': { name: '六煞', nature: '桃花', luck: 'bad', score: 35, meaning: '六煞磁場，感情糾紛、爛桃花', business: '注意感情影響事業' },

  // 五鬼 — 大凶
  '18': { name: '五鬼', nature: '意外', luck: 'terrible', score: 25, meaning: '五鬼磁場，意外破財', business: '高風險，注意安全和財務' },
  '81': { name: '五鬼', nature: '意外', luck: 'terrible', score: 25, meaning: '五鬼磁場，意外破財', business: '高風險，注意安全和財務' },
  '79': { name: '五鬼', nature: '意外', luck: 'terrible', score: 25, meaning: '五鬼磁場，意外破財', business: '高風險，注意安全和財務' },
  '97': { name: '五鬼', nature: '意外', luck: 'terrible', score: 25, meaning: '五鬼磁場，意外破財', business: '高風險，注意安全和財務' },
  '36': { name: '五鬼', nature: '意外', luck: 'terrible', score: 25, meaning: '五鬼磁場，意外破財', business: '高風險，注意安全和財務' },
  '63': { name: '五鬼', nature: '意外', luck: 'terrible', score: 25, meaning: '五鬼磁場，意外破財', business: '高風險，注意安全和財務' },
  '24': { name: '五鬼', nature: '意外', luck: 'terrible', score: 25, meaning: '五鬼磁場，意外破財', business: '高風險，注意安全和財務' },
  '42': { name: '五鬼', nature: '意外', luck: 'terrible', score: 25, meaning: '五鬼磁場，意外破財', business: '高風險，注意安全和財務' },

  // 絕命 — 大凶
  '12': { name: '絕命', nature: '破敗', luck: 'terrible', score: 15, meaning: '絕命磁場，破敗消耗', business: '避免大額投資和冒險' },
  '21': { name: '絕命', nature: '破敗', luck: 'terrible', score: 15, meaning: '絕命磁場，破敗消耗', business: '避免大額投資和冒險' },
  '69': { name: '絕命', nature: '破敗', luck: 'terrible', score: 15, meaning: '絕命磁場，破敗消耗', business: '避免大額投資和冒險' },
  '96': { name: '絕命', nature: '破敗', luck: 'terrible', score: 15, meaning: '絕命磁場，破敗消耗', business: '避免大額投資和冒險' },
  '48': { name: '絕命', nature: '破敗', luck: 'terrible', score: 15, meaning: '絕命磁場，破敗消耗', business: '避免大額投資和冒險' },
  '84': { name: '絕命', nature: '破敗', luck: 'terrible', score: 15, meaning: '絕命磁場，破敗消耗', business: '避免大額投資和冒險' },
  '37': { name: '絕命', nature: '破敗', luck: 'terrible', score: 15, meaning: '絕命磁場，破敗消耗', business: '避免大額投資和冒險' },
  '73': { name: '絕命', nature: '破敗', luck: 'terrible', score: 15, meaning: '絕命磁場，破敗消耗', business: '避免大額投資和冒險' },
};

// ====== 分析手機號碼 ======

export interface PhoneAnalysis {
  phone: string;
  pairs: { digits: string; star: StarEnergy }[];
  overallScore: number;
  summary: string;
}

export function analyzePhone(phone: string): PhoneAnalysis {
  // 清理號碼（去掉 +886、-、空格等）
  const clean = phone.replace(/[\s\-+]/g, '').replace(/^886/, '0');
  
  // 取後 8 位（跳過區碼）做兩兩配對
  const digits = clean.slice(-8);
  const pairs: { digits: string; star: StarEnergy }[] = [];
  
  for (let i = 0; i < digits.length - 1; i++) {
    const pair = digits[i] + digits[i + 1];
    const star = EIGHT_STARS[pair];
    if (star) {
      pairs.push({ digits: pair, star });
    } else {
      // 含 0 或 5 的組合（伏位處理）
      pairs.push({
        digits: pair,
        star: { name: '伏位', nature: '穩定', luck: 'neutral', score: 60, meaning: '中性磁場', business: '平穩發展' },
      });
    }
  }

  const avgScore = pairs.length > 0
    ? Math.round(pairs.reduce((sum, p) => sum + p.star.score, 0) / pairs.length)
    : 50;

  // 重點看後四位
  const lastFour = pairs.slice(-3);
  const lastFourAvg = lastFour.length > 0
    ? Math.round(lastFour.reduce((sum, p) => sum + p.star.score, 0) / lastFour.length)
    : 50;

  let summary = '';
  if (lastFourAvg >= 80) summary = '號碼能量極佳！後段吉星連連，事業財運都有好磁場。';
  else if (lastFourAvg >= 60) summary = '號碼能量不錯，有吉有平，整體偏正面。';
  else if (lastFourAvg >= 40) summary = '號碼能量一般，建議留意凶星位置的影響。';
  else summary = '號碼能量偏弱，後段有凶星，建議考慮換號或用其他方式化解。';

  return { phone: clean, pairs, overallScore: avgScore, summary };
}

// ====== CLI ======

if (require.main === module) {
  const phone = process.argv[2] || '0973611252';

  console.log(`\n📱 數字易經分析：${phone}`);
  console.log('═'.repeat(50));

  const result = analyzePhone(phone);
  
  console.log(`\n  號碼：${result.phone}`);
  console.log(`  整體分數：${result.overallScore}/100`);
  console.log(`  ${result.summary}\n`);

  console.log('  兩兩配對分析：');
  for (const pair of result.pairs) {
    const icon = pair.star.score >= 80 ? '🟢' : pair.star.score >= 60 ? '🟡' : pair.star.score >= 40 ? '🟠' : '🔴';
    console.log(`  ${icon} ${pair.digits} → ${pair.star.name}（${pair.star.nature}）${pair.star.score}分`);
  }
}
