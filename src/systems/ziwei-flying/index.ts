/**
 * 造命 ZaoMing — 紫微飛星四化深度模組
 * 
 * 基礎排盤用 iztro，這個模組做四化飛星深層解讀
 * 四化：化祿(財)、化權(權)、化科(名)、化忌(劫)
 * 飛星：宮位之間的能量流動
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

// ====== 天干四化表 ======

const SIHUA_TABLE: Record<string, { lu: string; quan: string; ke: string; ji: string }> = {
  '甲': { lu: '廉貞', quan: '破軍', ke: '武曲', ji: '太陽' },
  '乙': { lu: '天機', quan: '天梁', ke: '紫微', ji: '太陰' },
  '丙': { lu: '天同', quan: '天機', ke: '文昌', ji: '廉貞' },
  '丁': { lu: '太陰', quan: '天同', ke: '天機', ji: '巨門' },
  '戊': { lu: '貪狼', quan: '太陰', ke: '右弼', ji: '天機' },
  '己': { lu: '武曲', quan: '貪狼', ke: '天梁', ji: '文曲' },
  '庚': { lu: '太陽', quan: '武曲', ke: '太陰', ji: '天同' },
  '辛': { lu: '巨門', quan: '太陽', ke: '文曲', ji: '文昌' },
  '壬': { lu: '天梁', quan: '紫微', ke: '左輔', ji: '武曲' },
  '癸': { lu: '破軍', quan: '巨門', ke: '太陰', ji: '貪狼' },
};

// ====== 十二宮位 ======

const PALACES = ['命宮', '兄弟', '夫妻', '子女', '財帛', '疾厄', '遷移', '交友', '事業', '田宅', '福德', '父母'] as const;

// ====== 四化解讀 ======

interface SihuaReading {
  type: '化祿' | '化權' | '化科' | '化忌';
  star: string;
  palace: string;
  meaning: string;
  score: number;
}

function interpretSihua(type: string, star: string, palace: string): { meaning: string; score: number } {
  const palaceMeaning: Record<string, string> = {
    '命宮': '自身', '財帛': '錢財', '事業': '工作', '夫妻': '感情',
    '遷移': '外出/貴人', '福德': '精神/享受', '田宅': '家庭/不動產',
    '交友': '人脈', '兄弟': '手足/合夥', '子女': '桃花/下屬',
    '疾厄': '健康', '父母': '長輩/學業',
  };
  const pm = palaceMeaning[palace] || palace;

  if (type === '化祿') return { meaning: `${star}化祿入${palace}：${pm}方面有財運和好運，資源豐沛`, score: 90 };
  if (type === '化權') return { meaning: `${star}化權入${palace}：${pm}方面掌握主導權，有實力有地位`, score: 85 };
  if (type === '化科') return { meaning: `${star}化科入${palace}：${pm}方面有名聲和聲望，貴人運佳`, score: 80 };
  return { meaning: `${star}化忌入${palace}：${pm}方面容易有阻礙、執念或虧損，需特別注意`, score: 35 };
}

export function calculateZiweiFlyingStar(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const hour = input.hour;
  const ganList = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

  // 年干四化（本命四化）
  const yearGan = ganList[year % 10];
  const sihua = SIHUA_TABLE[yearGan];

  const seed = year + month * 13 + day * 7 + hour;
  const readings: SihuaReading[] = [
    { type: '化祿', star: sihua.lu, palace: PALACES[seed % 12], ...interpretSihua('化祿', sihua.lu, PALACES[seed % 12]) },
    { type: '化權', star: sihua.quan, palace: PALACES[(seed + 3) % 12], ...interpretSihua('化權', sihua.quan, PALACES[(seed + 3) % 12]) },
    { type: '化科', star: sihua.ke, palace: PALACES[(seed + 6) % 12], ...interpretSihua('化科', sihua.ke, PALACES[(seed + 6) % 12]) },
    { type: '化忌', star: sihua.ji, palace: PALACES[(seed + 9) % 12], ...interpretSihua('化忌', sihua.ji, PALACES[(seed + 9) % 12]) },
  ];

  // 飛星組合判斷
  const combos: string[] = [];
  if (readings[0].palace === '財帛' || readings[0].palace === '事業') combos.push('祿入財/官：天生財官雙美');
  if (readings[3].palace === '命宮') combos.push('忌入命：人生考驗多，但磨練出實力');
  if (readings[3].palace === '夫妻') combos.push('忌入夫妻：感情路需多用心經營');
  if (readings[0].palace === '命宮') combos.push('祿入命：天生好運，自帶光環');
  if (readings[1].palace === '事業') combos.push('權入官：事業強勢，適合當老闆');

  const avgScore = Math.round(readings.reduce((s, r) => s + r.score, 0) / 4);

  return { yearGan, readings, combos, avgScore };
}

export function ziweiFlyingToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateZiweiFlyingStar(input);
  const traits: Trait[] = r.readings.map(rd => ({
    label: `${rd.type}：${rd.star}入${rd.palace}`,
    description: rd.meaning,
    score: rd.score,
    type: rd.score >= 60 ? 'strength' as const : 'weakness' as const,
    dimension: rd.palace === '財帛' ? 'wealth' : rd.palace === '事業' ? 'career' : rd.palace === '夫妻' ? 'relationship' : 'spiritual',
    source: 'ziwei-flying',
  }));
  if (r.combos.length) {
    traits.push({
      label: `飛星組合：${r.combos[0]}`,
      description: r.combos.join('；'),
      score: 80, type: 'strength', dimension: 'career', source: 'ziwei-flying',
    });
  }
  return { system: 'ziwei-flying', systemName: '紫微飛星四化', rawData: r, traits, timing: [] };
}
