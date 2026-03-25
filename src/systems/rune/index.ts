/**
 * 造命 ZaoMing — 北歐符文占卜 (Elder Futhark Runes)
 * 24 個古日耳曼符文，每個對應一種能量
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const RUNES = [
  { name: 'Fehu ᚠ', cn: '財富', meaning: '財富、豐盛、新的開始', score: 85 },
  { name: 'Uruz ᚢ', cn: '野牛', meaning: '力量、健康、原始能量', score: 80 },
  { name: 'Thurisaz ᚦ', cn: '巨人', meaning: '保護、防禦、突破障礙', score: 65 },
  { name: 'Ansuz ᚨ', cn: '神諭', meaning: '智慧、溝通、神的訊息', score: 90 },
  { name: 'Raidho ᚱ', cn: '旅程', meaning: '旅行、節奏、正確的道路', score: 75 },
  { name: 'Kenaz ᚲ', cn: '火炬', meaning: '知識、創造力、啟示', score: 85 },
  { name: 'Gebo ᚷ', cn: '禮物', meaning: '慷慨、夥伴、平衡', score: 80 },
  { name: 'Wunjo ᚹ', cn: '喜悅', meaning: '快樂、和諧、成就', score: 90 },
  { name: 'Hagalaz ᚺ', cn: '冰雹', meaning: '破壞後重建、考驗', score: 40 },
  { name: 'Nauthiz ᚾ', cn: '需要', meaning: '困境、耐心、自律', score: 50 },
  { name: 'Isa ᛁ', cn: '冰', meaning: '停滯、等待、內在平靜', score: 45 },
  { name: 'Jera ᛃ', cn: '收穫', meaning: '豐收、循環、耐心的回報', score: 88 },
  { name: 'Eihwaz ᛇ', cn: '紫杉', meaning: '堅韌、保護、生死轉化', score: 70 },
  { name: 'Perthro ᛈ', cn: '命運', meaning: '命運、神秘、未知', score: 65 },
  { name: 'Algiz ᛉ', cn: '保護', meaning: '神聖保護、直覺、守護', score: 85 },
  { name: 'Sowilo ᛊ', cn: '太陽', meaning: '成功、活力、勝利', score: 95 },
  { name: 'Tiwaz ᛏ', cn: '戰神', meaning: '正義、勇氣、犧牲', score: 80 },
  { name: 'Berkano ᛒ', cn: '樺樹', meaning: '成長、新生、母性', score: 82 },
  { name: 'Ehwaz ᛖ', cn: '馬', meaning: '合作、信任、進步', score: 78 },
  { name: 'Mannaz ᛗ', cn: '人類', meaning: '自我認知、社群、智慧', score: 75 },
  { name: 'Laguz ᛚ', cn: '水', meaning: '直覺、情感、流動', score: 72 },
  { name: 'Ingwaz ᛜ', cn: '豐饒神', meaning: '完成、解脫、新階段', score: 88 },
  { name: 'Dagaz ᛞ', cn: '黎明', meaning: '突破、覺醒、光明', score: 92 },
  { name: 'Othala ᛟ', cn: '家園', meaning: '傳承、家族、根基', score: 78 },
];

export function calculateRune(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const seed = year + month * 13 + day * 7 + input.hour;
  const birthRune = RUNES[seed % 24];
  const yearRune = RUNES[(seed + new Date().getFullYear()) % 24];
  const challengeRune = RUNES[(seed + 12) % 24];
  return { birthRune, yearRune, challengeRune };
}

export function runeToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateRune(input);
  return {
    system: 'rune', systemName: '北歐符文', rawData: r, timing: [],
    traits: [
      { label: `本命符文：${r.birthRune.name}（${r.birthRune.cn}）`, description: r.birthRune.meaning, score: r.birthRune.score, type: r.birthRune.score >= 60 ? 'strength' : 'weakness', dimension: 'spiritual', source: 'rune' },
      { label: `年度符文：${r.yearRune.name}（${r.yearRune.cn}）`, description: r.yearRune.meaning, score: r.yearRune.score, type: r.yearRune.score >= 60 ? 'strength' : 'weakness', dimension: 'career', source: 'rune' },
      { label: `挑戰符文：${r.challengeRune.name}（${r.challengeRune.cn}）`, description: r.challengeRune.meaning, score: r.challengeRune.score, type: 'weakness', dimension: 'spiritual', source: 'rune' },
    ],
  };
}
