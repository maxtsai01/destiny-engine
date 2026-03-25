/**
 * 造命 ZaoMing — 天使數字模組 (Angel Numbers)
 * 生辰中反覆出現的數字模式 → 天使訊息
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const ANGEL_NUMBERS: Record<string, { message: string; guidance: string; score: number }> = {
  '111': { message: '新的開始即將到來', guidance: '保持正面思維，你的想法正在快速顯化', score: 90 },
  '222': { message: '信任過程，一切都在正軌', guidance: '保持耐心和信心，合作關係會帶來好結果', score: 85 },
  '333': { message: '大師在你身邊', guidance: '你的創造力正在被支持，大膽表達自己', score: 88 },
  '444': { message: '天使在保護你', guidance: '你的根基穩固，繼續努力，成功近在咫尺', score: 90 },
  '555': { message: '重大變化即將發生', guidance: '擁抱改變，放下舊的迎接新的', score: 75 },
  '666': { message: '重新平衡物質與精神', guidance: '不要過度追求物質，關注內在成長', score: 60 },
  '777': { message: '你走在正確的道路上', guidance: '好運降臨，繼續保持，奇蹟即將發生', score: 95 },
  '888': { message: '財富和豐盛正在流向你', guidance: '財運大開，投資和事業都有好結果', score: 92 },
  '999': { message: '一個階段即將結束', guidance: '準備好迎接新的人生篇章', score: 80 },
  '000': { message: '無限可能', guidance: '你與宇宙完全對齊，一切皆有可能', score: 88 },
  '1111': { message: '顯化之門大開', guidance: '你的想法正在以極快速度成為現實', score: 95 },
  '1234': { message: '循序漸進', guidance: '一步一步來，你正在正確的軌道上', score: 82 },
};

const BIRTH_ANGELS = [
  { num: 1, angel: 'Michael（米迦勒）', domain: '保護、勇氣、正義', message: '你有戰士的靈魂' },
  { num: 2, angel: 'Gabriel（加百列）', domain: '溝通、創造、新生', message: '你是訊息的傳遞者' },
  { num: 3, angel: 'Raphael（拉斐爾）', domain: '療癒、旅行、智慧', message: '你有療癒他人的天賦' },
  { num: 4, angel: 'Uriel（烏列爾）', domain: '智慧、光明、轉化', message: '你是光的引導者' },
  { num: 5, angel: 'Chamuel（查穆爾）', domain: '愛、和平、尋找', message: '你能找到一切失落的事物' },
  { num: 6, angel: 'Jophiel（約斐爾）', domain: '美、智慧、啟示', message: '你能看見事物的美好面' },
  { num: 7, angel: 'Zadkiel（薩基爾）', domain: '寬恕、慈悲、轉化', message: '你擁有寬恕和轉化的力量' },
  { num: 8, angel: 'Raziel（拉齊爾）', domain: '秘密、智慧、奧秘', message: '你能看穿表象，理解深層真相' },
  { num: 9, angel: 'Metatron（麥達昶）', domain: '神聖幾何、生命之花', message: '你與更高維度有特殊連結' },
];

export function calculateAngel(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const dateStr = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;

  // 找生日中的天使數字模式
  const patterns: string[] = [];
  for (const key of Object.keys(ANGEL_NUMBERS)) {
    if (dateStr.includes(key.slice(0, 2))) patterns.push(key);
  }
  if (patterns.length === 0) patterns.push('444'); // default protection

  const mainPattern = ANGEL_NUMBERS[patterns[0]];

  // 守護天使
  const lifeNum = String(year + month + day).split('').map(Number).reduce((a, b) => a + b, 0) % 9;
  const guardian = BIRTH_ANGELS[lifeNum];

  // 今年天使訊息
  const currentYear = new Date().getFullYear();
  const yearNum = (currentYear + month + day) % Object.keys(ANGEL_NUMBERS).length;
  const yearKey = Object.keys(ANGEL_NUMBERS)[yearNum];
  const yearMessage = ANGEL_NUMBERS[yearKey];

  return { mainPattern: { number: patterns[0], ...mainPattern }, guardian, yearMessage: { number: yearKey, ...yearMessage }, allPatterns: patterns };
}

export function angelToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateAngel(input);
  return {
    system: 'angel', systemName: '天使數字', rawData: r, timing: [],
    traits: [
      { label: `天使數字：${r.mainPattern.number}`, description: `${r.mainPattern.message}。${r.mainPattern.guidance}`, score: r.mainPattern.score, type: 'strength', dimension: 'spiritual', source: 'angel' },
      { label: `守護天使：${r.guardian.angel}`, description: `${r.guardian.domain}。${r.guardian.message}`, score: 85, type: 'strength', dimension: 'spiritual', source: 'angel' },
      { label: `今年訊息：${r.yearMessage.number}`, description: `${r.yearMessage.message}。${r.yearMessage.guidance}`, score: r.yearMessage.score, type: r.yearMessage.score >= 60 ? 'strength' : 'weakness', dimension: 'career', source: 'angel' },
    ],
  };
}
