/**
 * 造命 ZaoMing — 血型性格學模組
 * 日韓超流行的性格分類，跟命盤交叉驗證
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const BLOOD_TYPES = {
  A: { trait: '細膩謹慎、完美主義、重視和諧', strength: '有責任感、善於規劃、注重細節', weakness: '容易焦慮、過度在意他人看法', career: '會計/設計/醫療/教育', love: '需要安全感，忠誠專一' },
  B: { trait: '自由奔放、創意十足、我行我素', strength: '創造力強、好奇心旺、適應力佳', weakness: '三分鐘熱度、不守規矩', career: '藝術/行銷/自由業/探險', love: '追求新鮮感，需要空間' },
  O: { trait: '自信大方、目標明確、天生領袖', strength: '領導力強、抗壓力高、社交達人', weakness: '固執己見、控制慾強', career: 'CEO/銷售/運動/政治', love: '佔有慾強，但很照顧人' },
  AB: { trait: '理性感性並存、天才型、神秘', strength: '分析力強、多面向思考、冷靜', weakness: '難以捉摸、情緒起伏大', career: '研究/顧問/藝術/科技', love: '需要理解和包容，不喜歡被束縛' },
};

const COMPATIBILITY: Record<string, Record<string, { score: number; desc: string }>> = {
  A: { A: { score: 75, desc: '理解但缺激情' }, B: { score: 60, desc: '互補但需磨合' }, O: { score: 90, desc: '最佳拍檔' }, AB: { score: 70, desc: '心靈相通' } },
  B: { A: { score: 60, desc: '需要包容' }, B: { score: 80, desc: '自由同盟' }, O: { score: 85, desc: '互相吸引' }, AB: { score: 75, desc: '有趣組合' } },
  O: { A: { score: 90, desc: '完美互補' }, B: { score: 85, desc: '刺激有趣' }, O: { score: 70, desc: '權力角力' }, AB: { score: 65, desc: '需要耐心' } },
  AB: { A: { score: 70, desc: '穩定安心' }, B: { score: 75, desc: '創意激盪' }, O: { score: 65, desc: '挑戰多' }, AB: { score: 80, desc: '深度理解' } },
};

export function calculateBloodType(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const seed = year + month + day + input.hour;
  // 沒有真實血型就用生辰推算
  const types = ['O', 'A', 'B', 'AB'] as const;
  const inferredType = types[seed % 4];
  const info = BLOOD_TYPES[inferredType];
  const bestMatch = Object.entries(COMPATIBILITY[inferredType]).sort((a, b) => b[1].score - a[1].score)[0];
  return { type: inferredType, info, bestMatch: { type: bestMatch[0], ...bestMatch[1] }, note: '⚠️ 推算版，輸入真實血型可獲得更準確分析' };
}

export function bloodtypeToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateBloodType(input);
  return {
    system: 'bloodtype', systemName: '血型性格學', rawData: r, timing: [],
    traits: [
      { label: `推算血型：${r.type}型`, description: r.info.trait, score: 75, type: 'strength', dimension: 'spiritual', source: 'bloodtype' },
      { label: `${r.type}型優勢：${r.info.strength.slice(0, 15)}`, description: `${r.info.strength}。適合：${r.info.career}`, score: 80, type: 'strength', dimension: 'career', source: 'bloodtype' },
      { label: `${r.type}型盲區`, description: r.info.weakness, score: 45, type: 'weakness', dimension: 'health', source: 'bloodtype' },
      { label: `最佳血型配對：${r.bestMatch.type}型`, description: r.bestMatch.desc, score: r.bestMatch.score, type: 'strength', dimension: 'relationship', source: 'bloodtype' },
    ],
  };
}
