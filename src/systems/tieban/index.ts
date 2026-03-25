/**
 * 造命 ZaoMing — 鐵板神數模組
 * 公認最精準命理系統，用生辰數理推算人生大事時間軸
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const ENTRIES = [
  { n: 1001, cat: '性格', text: '心性聰明，做事果斷，有領導之才' },
  { n: 1002, cat: '性格', text: '為人正直，不善巧言，重義輕財' },
  { n: 1003, cat: '性格', text: '心思細密，善於謀劃，但多疑慮' },
  { n: 1004, cat: '性格', text: '性情剛烈，不服輸，適合開創事業' },
  { n: 1005, cat: '性格', text: '才華橫溢，多才多藝，但恐不專一' },
  { n: 2001, cat: '事業', text: '白手起家之命，中年後漸入佳境', age: '35-45' },
  { n: 2002, cat: '事業', text: '適合與人合夥，獨行不如結伴', age: '25-35' },
  { n: 2003, cat: '事業', text: '宜從事口才、文字、教育相關行業' },
  { n: 2004, cat: '事業', text: '一生多變動，三十歲後方定下來', age: '30' },
  { n: 2005, cat: '事業', text: '有貴人相助，但須自己把握機會', age: '28-40' },
  { n: 2006, cat: '事業', text: '事業起伏大，宜穩不宜急' },
  { n: 2007, cat: '事業', text: '適合管理、策劃、顧問類工作' },
  { n: 2008, cat: '事業', text: '創業宜在三十歲後，之前宜學習積累', age: '30+' },
  { n: 3001, cat: '財運', text: '早年辛苦，中年後財運漸旺', age: '35+' },
  { n: 3002, cat: '財運', text: '正財穩定，偏財不宜強求' },
  { n: 3003, cat: '財運', text: '一生不缺錢用，但難大富' },
  { n: 3004, cat: '財運', text: '投資宜保守，不宜投機' },
  { n: 3005, cat: '財運', text: '財來財去，守財不易，宜置產' },
  { n: 4001, cat: '婚姻', text: '晚婚為佳，早婚恐不順', age: '28+' },
  { n: 4002, cat: '婚姻', text: '宜找互補型伴侶，同類型易衝突' },
  { n: 4003, cat: '婚姻', text: '感情路波折，但終能遇到對的人' },
  { n: 4004, cat: '婚姻', text: '婚後家庭和睦，子女運佳' },
  { n: 4005, cat: '婚姻', text: '對象宜年長或成熟穩重者' },
  { n: 5001, cat: '健康', text: '注意肺部和呼吸系統', age: '40+' },
  { n: 5002, cat: '健康', text: '肝膽宜保養，少熬夜少飲酒' },
  { n: 5003, cat: '健康', text: '脾胃較弱，飲食宜清淡規律' },
  { n: 5004, cat: '健康', text: '一生少病，但中年後注意心血管', age: '45+' },
  { n: 5005, cat: '健康', text: '腎水不足，注意補腎養精' },
  { n: 6001, cat: '流年', text: '二十五歲有重大轉折', age: '25' },
  { n: 6002, cat: '流年', text: '三十歲前後事業起步', age: '28-32' },
  { n: 6003, cat: '流年', text: '三十三歲有貴人提攜', age: '33' },
  { n: 6004, cat: '流年', text: '三十六歲注意健康', age: '36' },
  { n: 6005, cat: '流年', text: '四十歲事業高峰期', age: '38-42' },
  { n: 6006, cat: '流年', text: '四十五歲後宜守成', age: '45+' },
  { n: 6007, cat: '流年', text: '五十歲享清福之象', age: '50+' },
] as { n: number; cat: string; text: string; age?: string }[];

export function calculateTieban(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const seed = year * 10000 + month * 100 + day;
  const hour = input.hour;
  const categories = ['性格', '事業', '財運', '婚姻', '健康', '流年'];
  const selected: typeof ENTRIES[number][] = [];

  for (const cat of categories) {
    const catEntries = ENTRIES.filter(e => e.cat === cat);
    const idx1 = (seed + hour + cat.charCodeAt(0)) % catEntries.length;
    selected.push(catEntries[idx1]);
    if (cat === '事業' || cat === '流年') {
      const idx2 = (seed + hour * 3 + cat.charCodeAt(1)) % catEntries.length;
      if (idx2 !== idx1) selected.push(catEntries[idx2]);
    }
  }

  const summary = categories.map(cat => ({ category: cat, text: selected.filter(e => e.cat === cat).map(e => e.text).join('；') }));
  const pathTypes = ['先苦後甜型 — 前半生打底，後半生收穫', '穩步上升型 — 每個階段都在進步', '大器晚成型 — 四十歲後才真正綻放', '起伏波折型 — 高低起伏，但終歸平穩', '貴人助力型 — 關鍵時刻總有人幫'];
  return { entries: selected, summary, lifePath: pathTypes[(seed + hour) % pathTypes.length], score: 70 + (seed % 20) };
}

export function tiebanToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateTieban(input);
  const dimMap: Record<string, string> = { '事業': 'career', '財運': 'wealth', '婚姻': 'relationship', '健康': 'health' };
  const traits: Trait[] = r.summary.map(s => ({ label: `鐵板神數【${s.category}】`, description: s.text, score: r.score, type: 'strength' as const, dimension: dimMap[s.category] || 'spiritual', source: 'tieban' }));
  traits.push({ label: `人生路徑：${r.lifePath.split('—')[0].trim()}`, description: r.lifePath, score: r.score, type: 'strength', dimension: 'career', source: 'tieban' });
  return { system: 'tieban', systemName: '鐵板神數', rawData: r, traits, timing: [] };
}
