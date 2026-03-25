/**
 * 造命 ZaoMing — 梅花易數模組
 * 即時起卦：時間/數字/文字都能算
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const BAGUA = ['乾', '兌', '離', '震', '巽', '坎', '艮', '坤'] as const;
const BAGUA_NATURE = ['天', '澤', '火', '雷', '風', '水', '山', '地'] as const;
const BAGUA_ELEMENT = ['金', '金', '火', '木', '木', '水', '土', '土'] as const;
const BAGUA_SYMBOL = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'] as const;

function getRelation(el1: string, el2: string): { type: string; score: number } {
  const sheng: Record<string, string> = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' };
  const ke: Record<string, string> = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };
  if (el1 === el2) return { type: '比和', score: 70 };
  if (sheng[el1] === el2) return { type: `${el1}生${el2}（體生用，洩氣）`, score: 55 };
  if (sheng[el2] === el1) return { type: `${el2}生${el1}（用生體，吉）`, score: 90 };
  if (ke[el1] === el2) return { type: `${el1}剋${el2}（體剋用，小吉）`, score: 75 };
  if (ke[el2] === el1) return { type: `${el2}剋${el1}（用剋體，凶）`, score: 30 };
  return { type: '未知', score: 50 };
}

export function castMeihua(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const hour = input.hour;
  const upperIdx = (year + month + day) % 8;
  const lowerIdx = (year + month + day + hour) % 8;
  const changingLine = ((year + month + day + hour) % 6) + 1;
  const upper = { idx: upperIdx, name: BAGUA[upperIdx], symbol: BAGUA_SYMBOL[upperIdx], element: BAGUA_ELEMENT[upperIdx], nature: BAGUA_NATURE[upperIdx] };
  const lower = { idx: lowerIdx, name: BAGUA[lowerIdx], symbol: BAGUA_SYMBOL[lowerIdx], element: BAGUA_ELEMENT[lowerIdx], nature: BAGUA_NATURE[lowerIdx] };
  const changedIdx = changingLine <= 3 ? (lowerIdx + changingLine) % 8 : (upperIdx + changingLine) % 8;
  const changed = { idx: changedIdx, name: BAGUA[changedIdx], symbol: BAGUA_SYMBOL[changedIdx], element: BAGUA_ELEMENT[changedIdx] };
  const tiGua = changingLine <= 3 ? upper.element : lower.element;
  const yongGua = changingLine <= 3 ? lower.element : upper.element;
  const relation = getRelation(yongGua, tiGua);
  const hexagramName = upper.idx === lower.idx ? `${upper.name}為${upper.nature}` : `${upper.nature}${lower.nature}${upper.name}${lower.name}`;
  let advice = '';
  if (relation.score >= 80) advice = '用生體，大吉。外在環境助力你，把握機會主動出擊。';
  else if (relation.score >= 70) advice = '體剋用或比和，小吉。你掌握主動權，穩步前進即可。';
  else if (relation.score >= 55) advice = '體生用，洩氣。你在付出能量，注意不要過度消耗。';
  else advice = '用剋體，凶。外在壓力大，建議暫緩行動，等待時機。';
  return { method: '時間起卦', upperGua: upper, lowerGua: lower, changingLine, changedGua: changed, tiGua, yongGua, relation, hexagramName, advice };
}

export function meihuaToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = castMeihua(input);
  return {
    system: 'meihua', systemName: '梅花易數', rawData: r, timing: [],
    traits: [
      { label: `梅花易數：${r.hexagramName}`, description: `體卦${r.tiGua}、用卦${r.yongGua}。${r.relation.type}`, score: r.relation.score, type: r.relation.score >= 60 ? 'strength' : 'weakness', dimension: 'career', source: 'meihua' },
      { label: `梅花斷卦`, description: r.advice, score: r.relation.score, type: r.relation.score >= 60 ? 'strength' : 'weakness', dimension: 'spiritual', source: 'meihua' },
    ],
  };
}
