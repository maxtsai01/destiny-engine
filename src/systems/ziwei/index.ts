/**
 * 紫微斗數模組
 * 基於 iztro 開源庫
 */

import type { BirthInfo, SystemAnalysis, Trait, LifeDimension } from '../../core/types';
// @ts-ignore
import { astro } from 'iztro';

// 宮位 → 人生維度映射
const PALACE_DIMENSION_MAP: Record<string, LifeDimension> = {
  '命宮': 'spiritual',
  '兄弟': 'social',
  '夫妻': 'relationship',
  '子女': 'family',
  '財帛': 'wealth',
  '疾厄': 'health',
  '遷移': 'career',
  '僕役': 'social',
  '官祿': 'career',
  '田宅': 'family',
  '福德': 'spiritual',
  '父母': 'family',
};

// 主星特質描述
const MAJOR_STAR_TRAITS: Record<string, { trait: string; strength: string; weakness: string }> = {
  '紫微': { trait: '領導者', strength: '有領袖氣質，天生的管理者', weakness: '容易驕傲，不夠接地氣' },
  '天機': { trait: '智者', strength: '聰明善變，思維敏捷', weakness: '想太多，行動力不足' },
  '太陽': { trait: '光明使者', strength: '正直熱情，樂於助人', weakness: '過度付出，忽略自己' },
  '武曲': { trait: '實幹家', strength: '果斷剛毅，財運好', weakness: '過於剛硬，缺乏柔性' },
  '天同': { trait: '和平者', strength: '溫和樂觀，人緣好', weakness: '缺乏企圖心，容易安逸' },
  '廉貞': { trait: '開拓者', strength: '多才多藝，敢於冒險', weakness: '情緒化，容易衝動' },
  '天府': { trait: '穩定器', strength: '穩重保守，理財能力強', weakness: '過於保守，錯失機會' },
  '太陰': { trait: '感性者', strength: '細膩敏感，藝術天分', weakness: '多愁善感，容易內耗' },
  '貪狼': { trait: '多面手', strength: '興趣廣泛，社交能力強', weakness: '貪多嚼不爛，不夠專注' },
  '巨門': { trait: '分析師', strength: '口才好，分析能力強', weakness: '好辯，容易得罪人' },
  '天相': { trait: '協調者', strength: '公正客觀，善於協調', weakness: '缺乏主見，容易受影響' },
  '天梁': { trait: '導師', strength: '正直有原則，適合教育', weakness: '過於固執，不夠靈活' },
  '七殺': { trait: '戰士', strength: '勇敢果斷，執行力超強', weakness: '衝動好鬥，不夠圓融' },
  '破軍': { trait: '革新者', strength: '勇於改變，打破常規', weakness: '破壞力強，不善維護' },
};

export interface ZiweiResult {
  /** 命盤 12 宮 */
  palaces: {
    name: string;
    majorStars: string[];
    minorStars: string[];
    dimension: LifeDimension;
  }[];
  /** 命宮主星 */
  lifePalaceStars: string[];
  /** 身宮位置 */
  bodyPalace: string;
  /** 四化 */
  siHua: { star: string; type: string }[];
}

export function calculateZiwei(input: BirthInfo): ZiweiResult {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const genderStr = input.gender === 'male' ? '男' : '女';
  
  // 時辰轉 iztro 格式（0-12）
  const iztroHour = input.hour === 23 ? 0 : Math.floor((input.hour + 1) / 2);
  
  const astrolabe = astro.bySolar(
    `${year}-${month}-${day}`,
    iztroHour,
    genderStr,
    true,
    'zh-TW'
  );
  
  const palaces: ZiweiResult['palaces'] = [];
  const siHua: ZiweiResult['siHua'] = [];
  let lifePalaceStars: string[] = [];
  let bodyPalace = '';
  
  if (astrolabe.palaces) {
    astrolabe.palaces.forEach((palace: any) => {
      const majorStars = palace.majorStars
        ?.filter((s: any) => s.type === 'major')
        ?.map((s: any) => s.name) || [];
      
      const minorStars = palace.minorStars
        ?.map((s: any) => s.name) || [];
      
      palaces.push({
        name: palace.name,
        majorStars,
        minorStars,
        dimension: PALACE_DIMENSION_MAP[palace.name] || 'spiritual',
      });
      
      if (palace.name === '命宮') {
        lifePalaceStars = majorStars;
      }
      
      // 收集四化
      palace.majorStars?.forEach((star: any) => {
        if (star.mutagen) {
          siHua.push({ star: star.name, type: star.mutagen });
        }
      });
    });
  }
  
  return {
    palaces,
    lifePalaceStars,
    bodyPalace,
    siHua,
  };
}

// ====== 轉為統一格式 ======

export function ziweiToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const ziwei = calculateZiwei(input);
  const traits: Trait[] = [];
  
  // 命宮主星分析
  ziwei.lifePalaceStars.forEach(star => {
    const starInfo = MAJOR_STAR_TRAITS[star];
    if (starInfo) {
      traits.push({
        label: `命宮${star} — ${starInfo.trait}`,
        dimension: 'spiritual',
        type: 'strength',
        score: 80,
        source: 'ziwei',
        description: starInfo.strength,
      });
      traits.push({
        label: `${star}的盲區`,
        dimension: 'spiritual',
        type: 'weakness',
        score: 40,
        source: 'ziwei',
        description: starInfo.weakness,
      });
    }
  });
  
  // 各宮位分析
  ziwei.palaces.forEach(palace => {
    if (palace.majorStars.length === 0) {
      // 空宮
      traits.push({
        label: `${palace.name}空宮`,
        dimension: palace.dimension,
        type: 'neutral',
        score: 30,
        source: 'ziwei',
        description: `${palace.name}為空宮，代表此領域需要借助外力或對宮星曜的力量`,
      });
    } else {
      palace.majorStars.forEach(star => {
        const starInfo = MAJOR_STAR_TRAITS[star];
        if (starInfo) {
          traits.push({
            label: `${palace.name}有${star}`,
            dimension: palace.dimension,
            type: 'strength',
            score: 70,
            source: 'ziwei',
            description: `${palace.name}坐${star}，在${getDimensionCN(palace.dimension)}方面${starInfo.strength}`,
          });
        }
      });
    }
  });
  
  // 四化分析
  ziwei.siHua.forEach(sh => {
    const typeScore = sh.type === '化祿' ? 80 : sh.type === '化權' ? 75 : sh.type === '化科' ? 70 : 30;
    const isPositive = sh.type !== '化忌';
    traits.push({
      label: `${sh.star}${sh.type}`,
      dimension: 'career',
      type: isPositive ? 'strength' : 'weakness',
      score: typeScore,
      source: 'ziwei',
      description: `${sh.star}${sh.type}，${isPositive ? '為吉化，帶來助力' : '為忌化，需注意相關領域的挑戰'}`,
    });
  });
  
  return {
    system: 'ziwei',
    systemName: '紫微斗數',
    rawData: ziwei as unknown as Record<string, unknown>,
    traits,
    timing: [],
    advice: ziwei.lifePalaceStars.map(star => {
      const info = MAJOR_STAR_TRAITS[star];
      return info ? `命宮${star}：善用「${info.strength}」的天賦，注意「${info.weakness}」的盲區` : '';
    }).filter(Boolean),
  };
}

function getDimensionCN(dim: LifeDimension): string {
  const map: Record<LifeDimension, string> = {
    career: '事業', wealth: '財運', relationship: '感情',
    health: '健康', family: '家庭', social: '人際',
    study: '學習', spiritual: '心靈',
  };
  return map[dim];
}
