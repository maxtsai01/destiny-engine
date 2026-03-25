/**
 * 造命 ZaoMing — 生日石 + 生日花模組
 * 每個月份對應寶石和花卉，帶有特定能量
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const BIRTHSTONES = [
  { month: 1, stone: '石榴石', en: 'Garnet', color: '深紅', energy: '熱情、信任、友誼', chakra: '海底輪', power: '增強生命力和行動力' },
  { month: 2, stone: '紫水晶', en: 'Amethyst', color: '紫', energy: '智慧、靈性、平靜', chakra: '眉心輪', power: '提升直覺和精神力' },
  { month: 3, stone: '海藍寶', en: 'Aquamarine', color: '淺藍', energy: '勇氣、溝通、保護', chakra: '喉輪', power: '增強表達和溝通能力' },
  { month: 4, stone: '鑽石', en: 'Diamond', color: '透明', energy: '永恆、力量、純淨', chakra: '頂輪', power: '放大所有正面能量' },
  { month: 5, stone: '祖母綠', en: 'Emerald', color: '綠', energy: '愛、重生、智慧', chakra: '心輪', power: '增強愛的能力和治癒力' },
  { month: 6, stone: '珍珠', en: 'Pearl', color: '白', energy: '純潔、智慧、寧靜', chakra: '頂輪', power: '帶來內心平靜和優雅' },
  { month: 7, stone: '紅寶石', en: 'Ruby', color: '紅', energy: '熱情、權力、保護', chakra: '心輪', power: '增強勇氣和領導力' },
  { month: 8, stone: '橄欖石', en: 'Peridot', color: '黃綠', energy: '力量、影響、保護', chakra: '太陽輪', power: '消除負能量、帶來好運' },
  { month: 9, stone: '藍寶石', en: 'Sapphire', color: '藍', energy: '智慧、忠誠、神聖', chakra: '喉輪', power: '提升思維清晰度和忠誠' },
  { month: 10, stone: '蛋白石', en: 'Opal', color: '彩虹', energy: '創造力、靈感、魅力', chakra: '全脈輪', power: '激發創意和想像力' },
  { month: 11, stone: '黃水晶', en: 'Citrine', color: '金黃', energy: '財富、自信、成功', chakra: '太陽輪', power: '招財和增強自信' },
  { month: 12, stone: '綠松石', en: 'Turquoise', color: '藍綠', energy: '保護、療癒、好運', chakra: '喉輪', power: '帶來好運和保護' },
];

const BIRTH_FLOWERS = [
  { month: 1, flower: '康乃馨', meaning: '愛與尊敬' },
  { month: 2, flower: '紫羅蘭', meaning: '忠誠與謙遜' },
  { month: 3, flower: '水仙花', meaning: '新的開始' },
  { month: 4, flower: '雛菊', meaning: '純真與忠誠' },
  { month: 5, flower: '百合', meaning: '純潔與優雅' },
  { month: 6, flower: '玫瑰', meaning: '愛情與美' },
  { month: 7, flower: '飛燕草', meaning: '喜悅與大度' },
  { month: 8, flower: '劍蘭', meaning: '力量與正直' },
  { month: 9, flower: '翠菊', meaning: '智慧與勇氣' },
  { month: 10, flower: '萬壽菊', meaning: '創造力與熱情' },
  { month: 11, flower: '菊花', meaning: '忠誠與友誼' },
  { month: 12, flower: '聖誕紅', meaning: '祝福與喜悅' },
];

export function calculateBirthstone(input: BirthInfo) {
  const month = parseInt(input.solarDate.split('-')[1]);
  const stone = BIRTHSTONES[month - 1];
  const flower = BIRTH_FLOWERS[month - 1];
  return { stone, flower };
}

export function birthstoneToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateBirthstone(input);
  return {
    system: 'birthstone', systemName: '生日石與花', rawData: r, timing: [],
    traits: [
      { label: `生日石：${r.stone.stone}（${r.stone.en}）`, description: `${r.stone.energy}。${r.stone.power}。脈輪：${r.stone.chakra}`, score: 80, type: 'strength', dimension: 'spiritual', source: 'birthstone' },
      { label: `生日花：${r.flower.flower}`, description: `花語：${r.flower.meaning}`, score: 75, type: 'strength', dimension: 'spiritual', source: 'birthstone' },
      { label: `幸運色：${r.stone.color}`, description: `佩戴${r.stone.color}色飾品增強${r.stone.stone}的能量`, score: 78, type: 'strength', dimension: 'health', source: 'birthstone' },
    ],
  };
}
