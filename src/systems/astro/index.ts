/**
 * 西洋占星模組（簡化版）
 * 基於出生日期計算太陽星座、月亮星座估算、上升星座估算
 */

import type { BirthInfo, SystemAnalysis, Trait, LifeDimension } from '../../core/types.js';

// ====== 12 星座 ======

export const ZODIAC_SIGNS = [
  { name: '牡羊座', en: 'Aries', element: 'fire', quality: 'cardinal', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { name: '金牛座', en: 'Taurus', element: 'earth', quality: 'fixed', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { name: '雙子座', en: 'Gemini', element: 'air', quality: 'mutable', startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
  { name: '巨蟹座', en: 'Cancer', element: 'water', quality: 'cardinal', startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
  { name: '獅子座', en: 'Leo', element: 'fire', quality: 'fixed', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { name: '處女座', en: 'Virgo', element: 'earth', quality: 'mutable', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { name: '天秤座', en: 'Libra', element: 'air', quality: 'cardinal', startMonth: 9, startDay: 23, endMonth: 10, endDay: 23 },
  { name: '天蠍座', en: 'Scorpio', element: 'water', quality: 'fixed', startMonth: 10, startDay: 24, endMonth: 11, endDay: 22 },
  { name: '射手座', en: 'Sagittarius', element: 'fire', quality: 'mutable', startMonth: 11, startDay: 23, endMonth: 12, endDay: 21 },
  { name: '摩羯座', en: 'Capricorn', element: 'earth', quality: 'cardinal', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { name: '水瓶座', en: 'Aquarius', element: 'air', quality: 'fixed', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { name: '雙魚座', en: 'Pisces', element: 'water', quality: 'mutable', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
] as const;

export type ZodiacElement = 'fire' | 'earth' | 'air' | 'water';
export type ZodiacQuality = 'cardinal' | 'fixed' | 'mutable';

// 星座性格描述
const ZODIAC_TRAITS: Record<string, { strengths: string[]; weaknesses: string[]; career: string; relationship: string }> = {
  '牡羊座': {
    strengths: ['勇敢果斷', '充滿行動力', '天生領導者'],
    weaknesses: ['衝動急躁', '缺乏耐心', '容易半途而廢'],
    career: '適合開創型工作、業務、創業',
    relationship: '熱情主動，但需要學習等待和傾聽',
  },
  '金牛座': {
    strengths: ['穩重踏實', '理財能力強', '品味出眾'],
    weaknesses: ['固執己見', '抗拒變化', '過於物質'],
    career: '適合金融、藝術、美食相關行業',
    relationship: '忠誠專一，但佔有慾強',
  },
  '雙子座': {
    strengths: ['口才出眾', '學習力強', '適應力好'],
    weaknesses: ['三心二意', '善變', '不夠深入'],
    career: '適合媒體、行銷、教育、寫作',
    relationship: '需要精神交流，怕無聊',
  },
  '巨蟹座': {
    strengths: ['重視家庭', '直覺敏銳', '富同理心'],
    weaknesses: ['過度敏感', '情緒化', '容易記仇'],
    career: '適合照護、餐飲、房地產',
    relationship: '溫柔體貼，但需要安全感',
  },
  '獅子座': {
    strengths: ['自信大方', '天生的領導者', '慷慨熱心'],
    weaknesses: ['愛面子', '自我中心', '好勝心強'],
    career: '適合管理、表演、創意產業',
    relationship: '浪漫大方，但需要被崇拜',
  },
  '處女座': {
    strengths: ['細心謹慎', '追求完美', '分析能力強'],
    weaknesses: ['吹毛求疵', '過度焦慮', '太挑剔'],
    career: '適合研究、品管、醫療、編輯',
    relationship: '體貼入微，但標準很高',
  },
  '天秤座': {
    strengths: ['公平正義', '社交能力強', '審美出眾'],
    weaknesses: ['優柔寡斷', '害怕衝突', '過度在意他人看法'],
    career: '適合法律、設計、公關、外交',
    relationship: '渴望和諧，害怕獨處',
  },
  '天蠍座': {
    strengths: ['洞察力強', '意志堅定', '重感情'],
    weaknesses: ['控制慾強', '記仇', '不容易信任人'],
    career: '適合研究、心理、偵探、投資',
    relationship: '深情專一，但佔有慾極強',
  },
  '射手座': {
    strengths: ['樂觀開朗', '愛好自由', '視野開闊'],
    weaknesses: ['不夠負責', '說話太直', '承諾困難'],
    career: '適合旅遊、教育、媒體、國際貿易',
    relationship: '需要自由空間，怕被束縛',
  },
  '摩羯座': {
    strengths: ['有責任感', '堅持不懈', '務實穩健'],
    weaknesses: ['過於嚴肅', '工作狂', '不善表達感情'],
    career: '適合管理、金融、政府、建築',
    relationship: '慢熱但忠誠，用行動表達愛',
  },
  '水瓶座': {
    strengths: ['獨立思考', '創新能力強', '人道主義'],
    weaknesses: ['過於理性', '疏離感', '固執己見'],
    career: '適合科技、發明、社會運動、AI',
    relationship: '需要精神獨立，不喜歡被控制',
  },
  '雙魚座': {
    strengths: ['同理心強', '創造力豐富', '直覺敏銳'],
    weaknesses: ['逃避現實', '容易受騙', '界限不清'],
    career: '適合藝術、音樂、療癒、社工',
    relationship: '浪漫多情，但需要學習面對現實',
  },
};

// ====== 計算太陽星座 ======

export function getSunSign(month: number, day: number): typeof ZODIAC_SIGNS[number] {
  for (const sign of ZODIAC_SIGNS) {
    if (sign.startMonth === sign.endMonth) continue; // skip malformed
    
    if (sign.name === '摩羯座') {
      // 跨年特殊處理
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return sign;
    } else {
      if (
        (month === sign.startMonth && day >= sign.startDay) ||
        (month === sign.endMonth && day <= sign.endDay)
      ) return sign;
    }
  }
  return ZODIAC_SIGNS[0]; // fallback
}

// ====== 估算上升星座（簡化版）======

export function estimateAscendant(month: number, day: number, hour: number): typeof ZODIAC_SIGNS[number] {
  // 簡化計算：太陽星座 + 每2小時移動一個星座
  const sunSignIdx = ZODIAC_SIGNS.findIndex(s => s === getSunSign(month, day));
  const hourOffset = Math.floor(hour / 2);
  const ascIdx = (sunSignIdx + hourOffset) % 12;
  return ZODIAC_SIGNS[ascIdx];
}

// ====== 主計算 ======

export interface AstroResult {
  sunSign: { name: string; en: string; element: ZodiacElement; quality: ZodiacQuality };
  ascendant: { name: string; en: string; element: ZodiacElement };
  traits: typeof ZODIAC_TRAITS[string];
}

export function calculateAstro(input: BirthInfo): AstroResult {
  const [_, month, day] = input.solarDate.split('-').map(Number);
  const sunSign = getSunSign(month, day);
  const ascendant = estimateAscendant(month, day, input.hour);
  
  return {
    sunSign: { name: sunSign.name, en: sunSign.en, element: sunSign.element, quality: sunSign.quality },
    ascendant: { name: ascendant.name, en: ascendant.en, element: ascendant.element },
    traits: ZODIAC_TRAITS[sunSign.name] || ZODIAC_TRAITS['牡羊座'],
  };
}

// ====== 轉為統一格式 ======

export function astroToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const result = calculateAstro(input);
  const traits: Trait[] = [];
  
  // 太陽星座天賦
  result.traits.strengths.forEach((s, i) => {
    traits.push({
      label: `${result.sunSign.name} — ${s}`,
      dimension: i === 0 ? 'career' : i === 1 ? 'social' : 'spiritual',
      type: 'strength',
      score: 75 - i * 5,
      source: 'astro',
      description: `太陽${result.sunSign.name}的天賦：${s}`,
    });
  });
  
  // 盲區
  result.traits.weaknesses.forEach((w, i) => {
    traits.push({
      label: `${result.sunSign.name}盲區 — ${w}`,
      dimension: i === 0 ? 'career' : i === 1 ? 'relationship' : 'spiritual',
      type: 'weakness',
      score: 35 + i * 5,
      source: 'astro',
      description: `太陽${result.sunSign.name}需要注意：${w}`,
    });
  });
  
  // 上升星座
  traits.push({
    label: `上升${result.ascendant.name} — 你給人的第一印象`,
    dimension: 'social',
    type: 'neutral',
    score: 60,
    source: 'astro',
    description: `上升${result.ascendant.name}，代表你的外在形象和別人對你的第一印象`,
  });
  
  return {
    system: 'astro',
    systemName: '西洋占星',
    rawData: result as unknown as Record<string, unknown>,
    traits,
    timing: [],
    advice: [
      `事業方向：${result.traits.career}`,
      `感情提醒：${result.traits.relationship}`,
    ],
  };
}
