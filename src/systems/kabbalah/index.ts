/**
 * 造命 ZaoMing — 卡巴拉數字學 (Kabbalah Numerology)
 * 猶太神秘學的數字系統，用名字字母→數字→生命路徑
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

// 卡巴拉字母-數字對照表
const KABBALAH_MAP: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

// 卡巴拉生命之樹 10 個 Sephirot
const SEPHIROT = [
  { num: 1, name: 'Kether（王冠）', meaning: '神聖意志、最高源頭', trait: '天命使命感極強' },
  { num: 2, name: 'Chokmah（智慧）', meaning: '原始智慧、創造力', trait: '直覺敏銳，創意無限' },
  { num: 3, name: 'Binah（理解）', meaning: '深層理解、分析', trait: '邏輯思維強，善於規劃' },
  { num: 4, name: 'Chesed（慈悲）', meaning: '慈愛擴張、給予', trait: '慷慨大方，天生領袖' },
  { num: 5, name: 'Geburah（力量）', meaning: '力量紀律、判斷', trait: '意志堅定，果斷執行' },
  { num: 6, name: 'Tiphareth（美）', meaning: '和諧平衡、美感', trait: '追求完美，藝術天賦' },
  { num: 7, name: 'Netzach（勝利）', meaning: '持久力、情感', trait: '堅持到底，情感豐富' },
  { num: 8, name: 'Hod（榮耀）', meaning: '理性溝通、學問', trait: '善於溝通，學術傾向' },
  { num: 9, name: 'Yesod（基礎）', meaning: '潛意識、夢想', trait: '直覺與夢想的連接者' },
  { num: 10, name: 'Malkuth（王國）', meaning: '物質世界、實現', trait: '落地執行，成果豐碩' },
];

// 22 條路徑對應 22 張塔羅大牌
const PATHS = [
  '愚者（冒險）', '魔術師（創造）', '女祭司（直覺）', '皇后（豐饒）',
  '皇帝（權威）', '教皇（傳統）', '戀人（選擇）', '戰車（意志）',
  '力量（勇氣）', '隱者（智慧）', '命運之輪（轉機）', '正義（平衡）',
  '倒吊人（犧牲）', '死神（轉化）', '節制（調和）', '惡魔（束縛）',
  '塔（崩塌重建）', '星星（希望）', '月亮（幻象）', '太陽（光明）',
  '審判（覺醒）', '世界（完成）',
];

function reduceToSingle(num: number): number {
  while (num > 10) num = String(num).split('').map(Number).reduce((a, b) => a + b, 0);
  return num;
}

export function calculateKabbalah(input: BirthInfo) {
  const name = input.name || 'ALLISON';
  const upperName = name.toUpperCase().replace(/[^A-Z]/g, '');

  const nameValue = upperName.split('').reduce((sum, ch) => sum + (KABBALAH_MAP[ch] || 0), 0);
  const sephira = SEPHIROT[((reduceToSingle(nameValue) || 1) - 1) % 10];

  const [year, month, day] = input.solarDate.split('-').map(Number);
  const birthValue = reduceToSingle(year + month + day);
  const birthSephira = SEPHIROT[((birthValue || 1) - 1) % 10];

  const pathIdx = (nameValue + year + month + day) % 22;
  const lifePath = PATHS[pathIdx];

  // 卡巴拉數的吉凶
  const vowels = upperName.split('').filter(c => 'AEIOU'.includes(c));
  const soulUrge = reduceToSingle(vowels.reduce((s, c) => s + (KABBALAH_MAP[c] || 0), 0));
  const soulSephira = SEPHIROT[((soulUrge || 1) - 1) % 10];

  return { name: upperName, nameValue, sephira, birthSephira, lifePath, soulUrge, soulSephira };
}

export function kabbalahToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateKabbalah(input);
  return {
    system: 'kabbalah', systemName: '卡巴拉數字學', rawData: r, timing: [],
    traits: [
      { label: `名字 Sephira：${r.sephira.name}`, description: `${r.sephira.meaning}。${r.sephira.trait}`, score: 80, type: 'strength', dimension: 'spiritual', source: 'kabbalah' },
      { label: `生辰 Sephira：${r.birthSephira.name}`, description: r.birthSephira.trait, score: 80, type: 'strength', dimension: 'spiritual', source: 'kabbalah' },
      { label: `靈魂渴望：${r.soulSephira.name}`, description: `內心深處追求${r.soulSephira.meaning}`, score: 75, type: 'strength', dimension: 'spiritual', source: 'kabbalah' },
      { label: `生命路徑：${r.lifePath}`, description: '卡巴拉生命之樹的行走路徑', score: 78, type: 'strength', dimension: 'career', source: 'kabbalah' },
    ],
  };
}
