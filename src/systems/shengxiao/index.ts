/**
 * 造命 ZaoMing — 生肖深度模組
 * 
 * 不只是基本生肖，還包括：
 * 六合 / 三合 / 相沖 / 相害 / 相刑 + 年份運勢
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

interface ZodiacAnimal {
  name: string;
  emoji: string;
  element: string;
  trait: string;
  sanhe: string[];  // 三合
  liuhe: string;    // 六合
  chong: string;    // 相沖
  hai: string;      // 相害
}

const ANIMALS: ZodiacAnimal[] = [
  { name: '鼠', emoji: '🐭', element: '水', trait: '聰明機敏、靈活善變、社交能力強', sanhe: ['龍', '猴'], liuhe: '牛', chong: '馬', hai: '羊' },
  { name: '牛', emoji: '🐂', element: '土', trait: '穩重踏實、勤奮刻苦、忍耐力強', sanhe: ['蛇', '雞'], liuhe: '鼠', chong: '羊', hai: '馬' },
  { name: '虎', emoji: '🐯', element: '木', trait: '勇猛果斷、自信有魄力、天生領導者', sanhe: ['馬', '狗'], liuhe: '豬', chong: '猴', hai: '蛇' },
  { name: '兔', emoji: '🐰', element: '木', trait: '溫和善良、心思細膩、藝術天賦', sanhe: ['羊', '豬'], liuhe: '狗', chong: '雞', hai: '龍' },
  { name: '龍', emoji: '🐲', element: '土', trait: '氣勢磅礴、有大志向、天生貴氣', sanhe: ['鼠', '猴'], liuhe: '雞', chong: '狗', hai: '兔' },
  { name: '蛇', emoji: '🐍', element: '火', trait: '深思熟慮、直覺強、神秘有魅力', sanhe: ['牛', '雞'], liuhe: '猴', chong: '豬', hai: '虎' },
  { name: '馬', emoji: '🐴', element: '火', trait: '熱情奔放、行動力強、追求自由', sanhe: ['虎', '狗'], liuhe: '羊', chong: '鼠', hai: '牛' },
  { name: '羊', emoji: '🐑', element: '土', trait: '溫柔體貼、有藝術感、善解人意', sanhe: ['兔', '豬'], liuhe: '馬', chong: '牛', hai: '鼠' },
  { name: '猴', emoji: '🐵', element: '金', trait: '機智聰穎、多才多藝、反應靈敏', sanhe: ['鼠', '龍'], liuhe: '蛇', chong: '虎', hai: '豬' },
  { name: '雞', emoji: '🐔', element: '金', trait: '勤勞踏實、精打細算、觀察力強', sanhe: ['牛', '蛇'], liuhe: '龍', chong: '兔', hai: '狗' },
  { name: '狗', emoji: '🐶', element: '土', trait: '忠誠正直、有義氣、重情重義', sanhe: ['虎', '馬'], liuhe: '兔', chong: '龍', hai: '雞' },
  { name: '豬', emoji: '🐷', element: '水', trait: '善良寬厚、樂觀知足、有福氣', sanhe: ['兔', '羊'], liuhe: '虎', chong: '蛇', hai: '猴' },
];

export function calculateShengxiao(input: BirthInfo) {
  const [year] = input.solarDate.split('-').map(Number);
  const idx = (year - 4) % 12; // 鼠年基準
  const animal = ANIMALS[idx];

  const currentYear = new Date().getFullYear();
  const currentIdx = (currentYear - 4) % 12;
  const currentAnimal = ANIMALS[currentIdx];

  // 今年與本命的關係
  let yearRelation = '';
  let yearScore = 70;
  if (animal.name === currentAnimal.name) { yearRelation = '本命年（太歲當頭）'; yearScore = 40; }
  else if (animal.sanhe.includes(currentAnimal.name)) { yearRelation = `三合（${animal.name}+${currentAnimal.name}）大吉`; yearScore = 90; }
  else if (animal.liuhe === currentAnimal.name) { yearRelation = `六合（${animal.name}+${currentAnimal.name}）大吉`; yearScore = 95; }
  else if (animal.chong === currentAnimal.name) { yearRelation = `相沖（${animal.name}沖${currentAnimal.name}）需謹慎`; yearScore = 35; }
  else if (animal.hai === currentAnimal.name) { yearRelation = `相害（${animal.name}害${currentAnimal.name}）小人防範`; yearScore = 45; }
  else { yearRelation = `一般（${animal.name}與${currentAnimal.name}無特殊關係）`; yearScore = 65; }

  // 最佳合作夥伴
  const bestPartners = [animal.liuhe, ...animal.sanhe];
  const avoidPartners = [animal.chong, animal.hai];

  return { animal, currentAnimal, yearRelation, yearScore, bestPartners, avoidPartners, age: currentYear - year };
}

export function shengxiaoToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateShengxiao(input);
  return {
    system: 'shengxiao', systemName: '生肖運勢', rawData: r, timing: [],
    traits: [
      { label: `生肖：${r.animal.emoji}${r.animal.name}（${r.animal.element}）`, description: r.animal.trait, score: 80, type: 'strength', dimension: 'spiritual', source: 'shengxiao' },
      { label: `${new Date().getFullYear()}年：${r.yearRelation}`, description: `今年${r.currentAnimal.emoji}${r.currentAnimal.name}年（${r.yearScore}/100）`, score: r.yearScore, type: r.yearScore >= 60 ? 'strength' : 'weakness', dimension: 'career', source: 'shengxiao' },
      { label: `最佳拍檔：${r.bestPartners.join('、')}`, description: `六合${r.animal.liuhe} + 三合${r.animal.sanhe.join('、')}`, score: 85, type: 'strength', dimension: 'relationship', source: 'shengxiao' },
      { label: `注意迴避：${r.avoidPartners.join('、')}`, description: `相沖${r.animal.chong}、相害${r.animal.hai}`, score: 40, type: 'weakness', dimension: 'relationship', source: 'shengxiao' },
    ],
  };
}
