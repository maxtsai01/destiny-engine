/**
 * 造命 ZaoMing — 手相學模組（生辰推算版）
 * 目前：基於生辰推算手相特徵
 * 未來：接入 CV 模型，拍手掌照片做 AI 分析
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const LINES = [
  { name: '生命線', domain: '體力、健康、生命力', strong: '生命線深長：體力充沛，精力旺盛，長壽之相', weak: '生命線短淺：需注意養生，但不代表壽短' },
  { name: '智慧線', domain: '思維、判斷、才能', strong: '智慧線清晰深長：思維敏捷，決策果斷', weak: '智慧線分叉：多才多藝但容易分心' },
  { name: '感情線', domain: '感情、人際、情緒', strong: '感情線深長上彎：感情豐富，重情重義', weak: '感情線短直：理性大於感性，不易表達情感' },
  { name: '事業線', domain: '事業、成就、社會地位', strong: '事業線從掌底直上：事業心強，白手起家', weak: '事業線中斷又起：事業有波折但終會成功' },
  { name: '太陽線', domain: '名聲、藝術、財運', strong: '太陽線明顯：有才華有名氣，藝術天賦', weak: '太陽線不明：需靠實力而非運氣' },
  { name: '婚姻線', domain: '婚姻、親密關係', strong: '婚姻線一條深長：感情專一，婚姻穩定', weak: '婚姻線多條：感情經歷豐富，晚婚為佳' },
];

const MOUNTS = [
  { name: '木星丘（食指下）', meaning: '野心、領導力、自信', high: '飽滿：天生領袖，有野心有行動力', flat: '平坦：謙虛低調，不愛出風頭' },
  { name: '土星丘（中指下）', meaning: '紀律、責任、深思', high: '飽滿：嚴謹踏實，適合研究/管理', flat: '平坦：隨性自由，不喜束縛' },
  { name: '太陽丘（無名指下）', meaning: '創造力、名聲、藝術', high: '飽滿：有藝術天賦，容易成名', flat: '平坦：實務導向，不追求虛名' },
  { name: '水星丘（小指下）', meaning: '溝通、商業、口才', high: '飽滿：口才好，商業頭腦佳', flat: '平坦：內向沉穩，適合幕後工作' },
];

export function calculatePalmistry(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const seed = year + month * 13 + day * 7 + input.hour * 11;
  
  const lines = LINES.map((line, i) => {
    const isStrong = ((seed + i * 5) % 3) !== 0;
    return { ...line, status: isStrong ? 'strong' : 'weak', reading: isStrong ? line.strong : line.weak, score: isStrong ? 75 + (seed + i) % 15 : 45 + (seed + i) % 15 };
  });

  const mounts = MOUNTS.map((mount, i) => {
    const isHigh = ((seed + i * 3) % 3) !== 0;
    return { ...mount, status: isHigh ? 'high' : 'flat', reading: isHigh ? mount.high : mount.flat, score: isHigh ? 80 + (seed + i) % 10 : 55 + (seed + i) % 10 };
  });

  const dominantHand = input.gender === 'male' ? '左手（先天）+ 右手（後天）' : '右手（先天）+ 左手（後天）';
  const avgScore = Math.round((lines.reduce((s, l) => s + l.score, 0) + mounts.reduce((s, m) => s + m.score, 0)) / (lines.length + mounts.length));

  return { lines, mounts, dominantHand, avgScore, note: '⚠️ 生辰推算版，上傳手掌照片可獲得 AI 手相分析（開發中）' };
}

export function palmistryToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculatePalmistry(input);
  const traits: Trait[] = r.lines.slice(0, 4).map(l => ({
    label: `${l.name}`, description: l.reading, score: l.score,
    type: l.status === 'strong' ? 'strength' as const : 'weakness' as const,
    dimension: l.name === '事業線' ? 'career' : l.name === '感情線' ? 'relationship' : 'health', source: 'palmistry',
  }));
  return { system: 'palmistry', systemName: '手相學', rawData: r, traits, timing: [] };
}
