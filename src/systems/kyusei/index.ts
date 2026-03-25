/**
 * 造命 ZaoMing — 九星氣學模組 (Japanese Kyusei Ki)
 * 日本命理系統，源自中國洛書九宮
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const NINE_STARS = [
  { num: 1, name: '一白水星', element: '水', trait: '柔軟適應、社交能力強、善於協調', career: '外交、服務、諮詢', color: '白' },
  { num: 2, name: '二黑土星', element: '土', trait: '踏實穩重、勤勞刻苦、重視家庭', career: '農業、不動產、照護', color: '黑' },
  { num: 3, name: '三碧木星', element: '木', trait: '積極進取、充滿活力、開創性強', career: '媒體、音樂、IT', color: '碧' },
  { num: 4, name: '四綠木星', element: '木', trait: '溫和優雅、人緣好、善於溝通', career: '貿易、旅遊、設計', color: '綠' },
  { num: 5, name: '五黃土星', element: '土', trait: '帝王之星、領導力強、但易極端', career: '政治、經營、管理', color: '黃' },
  { num: 6, name: '六白金星', element: '金', trait: '正義感強、完美主義、責任心重', career: '政府、法律、金融', color: '白' },
  { num: 7, name: '七赤金星', element: '金', trait: '社交達人、口才好、享受生活', career: '餐飲、娛樂、銷售', color: '赤' },
  { num: 8, name: '八白土星', element: '土', trait: '意志堅定、有主見、善於蓄積', career: '銀行、建築、倉儲', color: '白' },
  { num: 9, name: '九紫火星', element: '火', trait: '才華洋溢、直覺強、追求美感', career: '藝術、美容、教育', color: '紫' },
];

// 月命星
const MONTH_STARS_MALE = [
  [8, 7, 6, 5, 4, 3, 2, 1, 9, 8, 7, 6], // 1白年
  [5, 4, 3, 2, 1, 9, 8, 7, 6, 5, 4, 3], // 4綠年
  [2, 1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 9], // 7赤年
];

export function calculateKyusei(input: BirthInfo) {
  const [year, month] = input.solarDate.split('-').map(Number);

  // 本命星計算（男女同）
  const yearSum = String(year).split('').map(Number).reduce((a, b) => a + b, 0);
  let reduced = yearSum;
  while (reduced > 9) reduced = String(reduced).split('').map(Number).reduce((a, b) => a + b, 0);
  const starIdx = (11 - reduced) % 9;
  const mainStar = NINE_STARS[starIdx];

  // 月命星（簡化）
  const monthGroup = starIdx % 3;
  const monthStarNum = MONTH_STARS_MALE[monthGroup][(month - 1) % 12];
  const monthStar = NINE_STARS[monthStarNum - 1];

  // 今年運勢（年飛星）
  const currentYear = new Date().getFullYear();
  const cySum = String(currentYear).split('').map(Number).reduce((a, b) => a + b, 0);
  let cyReduced = cySum;
  while (cyReduced > 9) cyReduced = String(cyReduced).split('').map(Number).reduce((a, b) => a + b, 0);
  const yearStarIdx = (11 - cyReduced) % 9;
  const yearStar = NINE_STARS[yearStarIdx];

  // 相性
  const compat = mainStar.element === yearStar.element ? '同氣（平穩）'
    : (mainStar.element === '水' && yearStar.element === '木') || (mainStar.element === '木' && yearStar.element === '火') || (mainStar.element === '火' && yearStar.element === '土') || (mainStar.element === '土' && yearStar.element === '金') || (mainStar.element === '金' && yearStar.element === '水') ? '相生（順利）'
    : '相剋（需注意）';

  return { mainStar, monthStar, yearStar, compat };
}

export function kyuseiToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateKyusei(input);
  return {
    system: 'kyusei', systemName: '九星氣學', rawData: r, timing: [],
    traits: [
      { label: `本命星：${r.mainStar.name}`, description: `${r.mainStar.trait}。適合：${r.mainStar.career}`, score: 80, type: 'strength', dimension: 'career', source: 'kyusei' },
      { label: `月命星：${r.monthStar.name}`, description: r.monthStar.trait, score: 75, type: 'strength', dimension: 'spiritual', source: 'kyusei' },
      { label: `今年運星：${r.yearStar.name}`, description: `今年與本命${r.compat}`, score: r.compat.includes('順') ? 85 : r.compat.includes('平') ? 70 : 50, type: r.compat.includes('剋') ? 'weakness' : 'strength', dimension: 'career', source: 'kyusei' },
    ],
  };
}
