/**
 * 交叉驗證引擎
 * 分析多系統結果的共鳴度、一致性和矛盾
 */

import type { SystemAnalysis, CrossValidation, Trait, LifeDimension, SystemType } from '../core/types.js';

// 每個系統在不同維度的權重
const SYSTEM_WEIGHTS: Record<SystemType, Partial<Record<LifeDimension, number>>> = {
  bazi: { career: 0.9, wealth: 0.9, health: 0.8, spiritual: 0.7, family: 0.6, social: 0.5, study: 0.6, relationship: 0.5 },
  ziwei: { career: 0.8, relationship: 0.9, family: 0.8, wealth: 0.7, spiritual: 0.8, social: 0.7, health: 0.6, study: 0.5 },
  astro: { relationship: 0.8, social: 0.9, spiritual: 0.7, career: 0.6, study: 0.6, health: 0.4, wealth: 0.4, family: 0.5 },
  // 其他系統之後再加
  iching: {}, qimen: {}, name: {}, numerology: {}, zeri: {},
  liuyao: {}, meihua: {}, fengshui: {}, tarot: {},
  humandesign: {}, rainbow: {}, mbti: {},
};

/** 計算兩個特質的相似度 */
function traitSimilarity(a: Trait, b: Trait): number {
  // 同維度 + 同類型（都是天賦或都是盲區）
  if (a.dimension !== b.dimension) return 0;
  if (a.type !== b.type) return -0.5; // 矛盾
  
  // 簡單的文字相似度（關鍵字匹配）
  const aWords = new Set(a.label.split(/[，、—\s]+/));
  const bWords = new Set(b.label.split(/[，、—\s]+/));
  let overlap = 0;
  aWords.forEach(w => { if (bWords.has(w)) overlap++; });
  
  return a.type === b.type ? 0.5 + overlap * 0.1 : -0.3;
}

/** 交叉驗證多個系統的分析結果 */
export function crossValidate(analyses: SystemAnalysis[]): CrossValidation {
  const agreements: CrossValidation['agreements'] = [];
  const tensions: CrossValidation['tensions'] = [];
  const unique: CrossValidation['unique'] = [];
  
  // 按維度分組所有特質
  const dimensionTraits: Record<LifeDimension, { trait: Trait; system: SystemType }[]> = {
    career: [], wealth: [], relationship: [], health: [],
    family: [], social: [], study: [], spiritual: [],
  };
  
  analyses.forEach(analysis => {
    analysis.traits.forEach(trait => {
      dimensionTraits[trait.dimension].push({ trait, system: analysis.system });
    });
  });
  
  // 對每個維度進行交叉比對
  for (const [dimension, traits] of Object.entries(dimensionTraits) as [LifeDimension, typeof dimensionTraits[LifeDimension]][]) {
    if (traits.length === 0) continue;
    
    // 找出天賦共識
    const strengths = traits.filter(t => t.trait.type === 'strength');
    const weaknesses = traits.filter(t => t.trait.type === 'weakness');
    
    // 多系統都指向天賦 → 共識
    if (strengths.length >= 2) {
      const systems = [...new Set(strengths.map(s => s.system))];
      if (systems.length >= 2) {
        const avgScore = strengths.reduce((sum, s) => {
          const weight = SYSTEM_WEIGHTS[s.system]?.[dimension] || 0.5;
          return sum + s.trait.score * weight;
        }, 0) / strengths.length;
        
        agreements.push({
          conclusion: `在${getDimensionCN(dimension)}方面有天賦：${strengths.map(s => s.trait.label).join('；')}`,
          dimension,
          supportingSystems: systems,
          confidence: Math.min(100, Math.round(avgScore * systems.length / 2)),
        });
      }
    }
    
    // 多系統都指向盲區 → 共識
    if (weaknesses.length >= 2) {
      const systems = [...new Set(weaknesses.map(s => s.system))];
      if (systems.length >= 2) {
        agreements.push({
          conclusion: `在${getDimensionCN(dimension)}方面需注意：${weaknesses.map(s => s.trait.label).join('；')}`,
          dimension,
          supportingSystems: systems,
          confidence: Math.min(100, Math.round(weaknesses.length * 30)),
        });
      }
    }
    
    // 一個系統說天賦，另一個說盲區 → 張力
    if (strengths.length > 0 && weaknesses.length > 0) {
      const strengthSystems = [...new Set(strengths.map(s => s.system))];
      const weaknessSystems = [...new Set(weaknesses.map(s => s.system))];
      
      // 確保是不同系統
      const conflicting = strengthSystems.filter(s => !weaknessSystems.includes(s));
      if (conflicting.length > 0 && weaknessSystems.length > 0) {
        tensions.push({
          description: `${getDimensionCN(dimension)}領域存在內在張力`,
          dimension,
          systemA: {
            system: conflicting[0],
            view: strengths.find(s => s.system === conflicting[0])?.trait.label || '',
          },
          systemB: {
            system: weaknessSystems[0],
            view: weaknesses.find(s => s.system === weaknessSystems[0])?.trait.label || '',
          },
          interpretation: `你在${getDimensionCN(dimension)}方面可能有內在的拉扯 — 一方面${strengths[0]?.trait.description}，另一方面${weaknesses[0]?.trait.description}。這不是矛盾，而是你的多面性。`,
        });
      }
    }
    
    // 只有一個系統看到的特質 → 獨特觀點
    const systemCount = new Set(traits.map(t => t.system));
    if (systemCount.size === 1 && traits.length > 0) {
      const t = traits[0];
      unique.push({
        system: t.system,
        insight: t.trait.label,
        dimension,
      });
    }
  }
  
  // 計算總體共鳴分數
  const totalSystems = analyses.length;
  const agreementScore = agreements.length > 0
    ? agreements.reduce((sum, a) => sum + a.confidence, 0) / agreements.length
    : 0;
  const tensionPenalty = tensions.length * 5;
  const resonanceScore = Math.min(100, Math.max(0,
    Math.round(agreementScore + totalSystems * 10 - tensionPenalty)
  ));
  
  return {
    resonanceScore,
    agreements,
    tensions,
    unique,
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
