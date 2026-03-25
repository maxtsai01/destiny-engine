/**
 * 造命 ZaoMing — 周公解夢模組
 * 基於夢境關鍵字 → 吉凶分析 + 五行對應
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const DREAM_CATEGORIES = [
  {
    category: '動物',
    dreams: [
      { keyword: '龍', meaning: '大貴之象，事業將有重大突破', score: 95, element: '土' },
      { keyword: '蛇', meaning: '財運將至，但需提防小人', score: 70, element: '火' },
      { keyword: '魚', meaning: '年年有餘，財運亨通', score: 85, element: '水' },
      { keyword: '虎', meaning: '有貴人相助，但需控制脾氣', score: 75, element: '木' },
      { keyword: '鳥', meaning: '消息傳來，有好事發生', score: 80, element: '金' },
      { keyword: '狗', meaning: '朋友忠誠，人際關係良好', score: 78, element: '土' },
      { keyword: '貓', meaning: '需注意身邊暗藏的競爭者', score: 55, element: '木' },
    ],
  },
  {
    category: '自然',
    dreams: [
      { keyword: '水', meaning: '情感豐沛，可能有新的感情機會', score: 75, element: '水' },
      { keyword: '火', meaning: '熱情高漲，但需注意衝動', score: 65, element: '火' },
      { keyword: '山', meaning: '有障礙需克服，但終將成功', score: 70, element: '土' },
      { keyword: '花', meaning: '桃花運旺，或有喜事', score: 85, element: '木' },
      { keyword: '雨', meaning: '洗淨煩惱，苦盡甘來', score: 80, element: '水' },
      { keyword: '太陽', meaning: '光明在前，好運降臨', score: 90, element: '火' },
      { keyword: '月亮', meaning: '思念之情，注意情緒變化', score: 65, element: '水' },
    ],
  },
  {
    category: '人物',
    dreams: [
      { keyword: '父母', meaning: '思鄉或家庭有變化', score: 70, element: '土' },
      { keyword: '嬰兒', meaning: '新的開始，好兆頭', score: 88, element: '水' },
      { keyword: '老人', meaning: '智慧指引，聽長輩的話', score: 80, element: '土' },
      { keyword: '陌生人', meaning: '生命中將出現新的貴人', score: 75, element: '木' },
    ],
  },
  {
    category: '場景',
    dreams: [
      { keyword: '飛', meaning: '志向高遠，即將突破限制', score: 85, element: '金' },
      { keyword: '掉落', meaning: '缺乏安全感，需穩定根基', score: 45, element: '土' },
      { keyword: '考試', meaning: '對自己的能力有焦慮', score: 55, element: '金' },
      { keyword: '結婚', meaning: '人生進入新階段', score: 82, element: '火' },
      { keyword: '死亡', meaning: '舊事結束新事開始，脫胎換骨', score: 75, element: '水' },
    ],
  },
];

export function interpretDream(keyword: string) {
  for (const cat of DREAM_CATEGORIES) {
    const found = cat.dreams.find(d => keyword.includes(d.keyword) || d.keyword.includes(keyword));
    if (found) return { ...found, category: cat.category };
  }
  return { keyword, meaning: '此夢境含義需結合個人命盤詳細解讀', score: 60, element: '土', category: '其他' };
}

// 根據生辰推算「本命夢境傾向」
export function calculateDreamProfile(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const seed = year + month + day + input.hour;

  const allDreams = DREAM_CATEGORIES.flatMap(c => c.dreams.map(d => ({ ...d, category: c.category })));
  const luckyDream = allDreams[(seed * 3) % allDreams.length];
  const warningDream = allDreams[(seed * 7 + 5) % allDreams.length];

  const dreamElement = ['水', '火', '木', '金', '土'][seed % 5];
  const dreamTendency = dreamElement === '水' ? '情感型：夢境多與水、情感、人際有關'
    : dreamElement === '火' ? '行動型：夢境多與競爭、目標、熱情有關'
    : dreamElement === '木' ? '成長型：夢境多與自然、植物、新事物有關'
    : dreamElement === '金' ? '理性型：夢境多與工作、考試、秩序有關'
    : '穩定型：夢境多與家庭、土地、安全有關';

  return { luckyDream, warningDream, dreamElement, dreamTendency, totalDreams: allDreams.length };
}

export function dreamToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateDreamProfile(input);
  return {
    system: 'dream', systemName: '周公解夢', rawData: r, timing: [],
    traits: [
      { label: `夢境傾向：${r.dreamTendency.split('：')[0]}`, description: r.dreamTendency, score: 75, type: 'strength', dimension: 'spiritual', source: 'dream' },
      { label: `吉夢：夢見${r.luckyDream.keyword}`, description: r.luckyDream.meaning, score: r.luckyDream.score, type: 'strength', dimension: 'spiritual', source: 'dream' },
      { label: `警夢：夢見${r.warningDream.keyword}`, description: r.warningDream.meaning, score: r.warningDream.score, type: r.warningDream.score >= 60 ? 'strength' : 'weakness', dimension: 'health', source: 'dream' },
    ],
  };
}
