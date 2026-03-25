/**
 * 造命 ZaoMing — 瑪雅曆模組 (Mayan Calendar / 13 Moon)
 * 260天卓爾金曆：20個圖騰 × 13個調性
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const SOLAR_SEALS = [
  { name: '紅龍', en: 'Red Dragon', trait: '創始、滋養、誕生', element: '火', power: '原始創造力' },
  { name: '白風', en: 'White Wind', trait: '溝通、靈感、呼吸', element: '風', power: '靈性溝通' },
  { name: '藍夜', en: 'Blue Night', trait: '夢想、豐盛、直覺', element: '水', power: '豐盛顯化' },
  { name: '黃種子', en: 'Yellow Seed', trait: '目標、覺醒、開花', element: '土', power: '耐心等待成果' },
  { name: '紅蛇', en: 'Red Serpent', trait: '生命力、本能、存活', element: '火', power: '原始生命力' },
  { name: '白世界橋', en: 'White Worldbridger', trait: '平等、機會、死亡重生', element: '風', power: '連接不同世界' },
  { name: '藍手', en: 'Blue Hand', trait: '完成、知識、療癒', element: '水', power: '療癒之手' },
  { name: '黃星星', en: 'Yellow Star', trait: '優雅、藝術、美', element: '土', power: '藝術創造' },
  { name: '紅月', en: 'Red Moon', trait: '淨化、流動、宇宙水', element: '火', power: '情感淨化' },
  { name: '白狗', en: 'White Dog', trait: '愛、忠誠、心', element: '風', power: '無條件的愛' },
  { name: '藍猴', en: 'Blue Monkey', trait: '魔法、幻象、遊戲', element: '水', power: '玩樂創造' },
  { name: '黃人', en: 'Yellow Human', trait: '自由意志、智慧、影響', element: '土', power: '自由選擇' },
  { name: '紅天行者', en: 'Red Skywalker', trait: '探索、空間、覺醒', element: '火', power: '突破限制' },
  { name: '白巫師', en: 'White Wizard', trait: '永恆、魅力、接受', element: '風', power: '時間魔法' },
  { name: '藍鷹', en: 'Blue Eagle', trait: '視野、創造、心智', element: '水', power: '高瞻遠矚' },
  { name: '黃戰士', en: 'Yellow Warrior', trait: '智慧、勇氣、無畏', element: '土', power: '無畏前行' },
  { name: '紅地球', en: 'Red Earth', trait: '進化、導航、同步', element: '火', power: '與地球共振' },
  { name: '白鏡', en: 'White Mirror', trait: '反射、真理、無限', element: '風', power: '照見真實' },
  { name: '藍風暴', en: 'Blue Storm', trait: '催化、能量、自我生成', element: '水', power: '風暴變革' },
  { name: '黃太陽', en: 'Yellow Sun', trait: '開悟、火焰、宇宙之火', element: '土', power: '全然覺醒' },
];

const TONES = [
  { num: 1, name: '磁性', purpose: '吸引、統合、目的' },
  { num: 2, name: '月亮', purpose: '挑戰、極性、穩定' },
  { num: 3, name: '電力', purpose: '服務、啟動、連結' },
  { num: 4, name: '自我存在', purpose: '形式、定義、衡量' },
  { num: 5, name: '超頻', purpose: '賦權、命令、光芒' },
  { num: 6, name: '韻律', purpose: '平等、組織、平衡' },
  { num: 7, name: '共振', purpose: '通道、啟示、調諧' },
  { num: 8, name: '銀河', purpose: '和諧、模範、正直' },
  { num: 9, name: '太陽', purpose: '意圖、脈動、實現' },
  { num: 10, name: '行星', purpose: '顯化、完美、生產' },
  { num: 11, name: '光譜', purpose: '解放、釋放、溶解' },
  { num: 12, name: '水晶', purpose: '合作、奉獻、普遍化' },
  { num: 13, name: '宇宙', purpose: '超越、存在、忍耐' },
];

export function calculateMayan(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  // Tzolkin = (birth date offset from reference) mod 260
  const ref = new Date(2012, 11, 21).getTime(); // 2012-12-21 瑪雅長曆結束
  const birth = new Date(year, month - 1, day).getTime();
  const daysDiff = Math.floor((birth - ref) / 86400000);
  const kin = ((daysDiff % 260) + 260) % 260;

  const sealIdx = kin % 20;
  const toneIdx = kin % 13;
  const seal = SOLAR_SEALS[sealIdx];
  const tone = TONES[toneIdx];

  // 引導、挑戰、隱藏、支持
  const guide = SOLAR_SEALS[(sealIdx + toneIdx * 4) % 20];
  const challenge = SOLAR_SEALS[(sealIdx + 10) % 20];
  const hidden = SOLAR_SEALS[(19 - sealIdx + 20) % 20];

  return { kin: kin + 1, seal, tone, guide, challenge, hidden };
}

export function mayanToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateMayan(input);
  return {
    system: 'mayan', systemName: '瑪雅曆', rawData: r, timing: [],
    traits: [
      { label: `Kin ${r.kin}：${r.tone.name}的${r.seal.name}`, description: `${r.seal.trait}。調性：${r.tone.purpose}`, score: 80, type: 'strength', dimension: 'spiritual', source: 'mayan' },
      { label: `超能力：${r.seal.power}`, description: `${r.seal.en}的核心力量`, score: 85, type: 'strength', dimension: 'career', source: 'mayan' },
      { label: `引導圖騰：${r.guide.name}`, description: `引導你的力量：${r.guide.trait}`, score: 80, type: 'strength', dimension: 'spiritual', source: 'mayan' },
      { label: `挑戰圖騰：${r.challenge.name}`, description: `需要整合的課題：${r.challenge.trait}`, score: 55, type: 'weakness', dimension: 'spiritual', source: 'mayan' },
    ],
  };
}
