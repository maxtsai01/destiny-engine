/**
 * 造命 ZaoMing — 印度占星 Jyotish (Vedic Astrology)
 * 恆星黃道（比西洋退約23°），以月亮星座為主
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const RASHIS = [
  { name: '白羊', en: 'Mesha', ruler: '火星', element: '火', trait: '勇猛開創、行動力強' },
  { name: '金牛', en: 'Vrishabha', ruler: '金星', element: '土', trait: '穩重務實、重視物質' },
  { name: '雙子', en: 'Mithuna', ruler: '水星', element: '風', trait: '聰明善變、好奇心強' },
  { name: '巨蟹', en: 'Karka', ruler: '月亮', element: '水', trait: '情感豐富、重視家庭' },
  { name: '獅子', en: 'Simha', ruler: '太陽', element: '火', trait: '王者風範、自信領導' },
  { name: '處女', en: 'Kanya', ruler: '水星', element: '土', trait: '分析精確、追求完美' },
  { name: '天秤', en: 'Tula', ruler: '金星', element: '風', trait: '追求平衡、重視和諧' },
  { name: '天蠍', en: 'Vrischika', ruler: '火星', element: '水', trait: '深沉神秘、意志堅定' },
  { name: '射手', en: 'Dhanu', ruler: '木星', element: '火', trait: '追求真理、樂觀冒險' },
  { name: '摩羯', en: 'Makara', ruler: '土星', element: '土', trait: '務實進取、責任感強' },
  { name: '水瓶', en: 'Kumbha', ruler: '土星', element: '風', trait: '獨立創新、人道主義' },
  { name: '雙魚', en: 'Meena', ruler: '木星', element: '水', trait: '直覺敏銳、慈悲為懷' },
];
const NAVAGRAHA = [
  { name: 'Surya（太陽）', domain: '靈魂、自我、權威', nature: '吉' },
  { name: 'Chandra（月亮）', domain: '心智、情感、母親', nature: '吉' },
  { name: 'Mangal（火星）', domain: '能量、勇氣、兄弟', nature: '凶' },
  { name: 'Budha（水星）', domain: '智慧、溝通、商業', nature: '中' },
  { name: 'Guru（木星）', domain: '福報、智慧、導師', nature: '大吉' },
  { name: 'Shukra（金星）', domain: '愛情、藝術、財富', nature: '吉' },
  { name: 'Shani（土星）', domain: '業力、考驗、紀律', nature: '凶' },
  { name: 'Rahu（羅睺）', domain: '野心、執念、世俗', nature: '凶' },
  { name: 'Ketu（計都）', domain: '解脫、靈性、前世', nature: '凶' },
];
const NAKSHATRAS = ['Ashwini馬頭', 'Bharani死神', 'Krittika昴宿', 'Rohini金牛', 'Mrigashira獵首', 'Ardra暴風', 'Punarvasu復歸', 'Pushya花星', 'Ashlesha蛇宿', 'Magha王座', 'PurvaPhalguni前幸', 'UttaraPhalguni後幸', 'Hasta手宿', 'Chitra珠宿', 'Swati獨行', 'Vishakha分枝', 'Anuradha友誼', 'Jyeshtha長老', 'Mula根宿', 'PurvaAshadha前勝', 'UttaraAshadha後勝', 'Shravana聽宿', 'Dhanishtha財星', 'Shatabhisha百醫', 'PurvaBhadrapada前福', 'UttaraBhadrapada後福', 'Revati富饒'];

export function calculateJyotish(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const hour = input.hour;
  const westernIdx = Math.floor((month * 30 + day - 21) / 30) % 12;
  const siderealIdx = (westernIdx + 11) % 12;
  const moonSign = RASHIS[(siderealIdx + Math.floor(hour / 2)) % 12];
  const sunSign = RASHIS[siderealIdx];
  const ascendant = RASHIS[(siderealIdx + Math.floor(hour / 2) + 3) % 12];
  const nakshatra = NAKSHATRAS[(year + month * 3 + day * 7 + hour) % 27];
  const rulingPlanet = NAVAGRAHA[(year + month + day) % 9];
  const dashas = ['Ketu大運(7年)—靈性覺醒', 'Venus大運(20年)—愛情物質', 'Sun大運(6年)—權威自我', 'Moon大運(10年)—情感直覺', 'Mars大運(7年)—行動競爭', 'Rahu大運(18年)—野心世俗', 'Jupiter大運(16年)—智慧福報', 'Saturn大運(19年)—業力考驗', 'Mercury大運(17年)—智慧商業'];
  const age = new Date().getFullYear() - year;
  return { moonSign, sunSign, ascendant, nakshatra, rulingPlanet, dashaPhase: dashas[Math.floor(age / 10) % 9] };
}

export function jyotishToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateJyotish(input);
  const luckMap: Record<string, number> = { '大吉': 90, '吉': 80, '中': 65, '凶': 45 };
  return {
    system: 'jyotish', systemName: '印度占星', rawData: r, timing: [],
    traits: [
      { label: `印度月亮星座：${r.moonSign.name}（${r.moonSign.en}）`, description: `${r.moonSign.trait}。主管：${r.moonSign.ruler}`, score: 80, type: 'strength', dimension: 'spiritual', source: 'jyotish' },
      { label: `Nakshatra：${r.nakshatra}`, description: '印度二十七宿', score: 75, type: 'strength', dimension: 'spiritual', source: 'jyotish' },
      { label: `主宰星：${r.rulingPlanet.name}`, description: `${r.rulingPlanet.domain}（${r.rulingPlanet.nature}）`, score: luckMap[r.rulingPlanet.nature] || 65, type: r.rulingPlanet.nature.includes('凶') ? 'weakness' : 'strength', dimension: 'spiritual', source: 'jyotish' },
      { label: `大運：${r.dashaPhase.split('—')[0]}`, description: r.dashaPhase, score: 75, type: 'strength', dimension: 'career', source: 'jyotish' },
    ],
  };
}
