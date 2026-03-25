/**
 * 造命 ZaoMing — 易經六十四卦模組
 * 
 * 從生辰推算先天本命卦 + 互卦 + 變卦
 * 用途：看人生底層格局和核心課題
 */

import type { SystemAnalysis, Trait, LifeDimension, BirthInfo } from '../../core/types';

// ====== 八卦基礎 ======

const BAGUA = {
  qian:  { name: '乾', symbol: '☰', element: '金', nature: '天', trait: '剛健進取' },
  dui:   { name: '兌', symbol: '☱', element: '金', nature: '澤', trait: '喜悅通達' },
  li:    { name: '離', symbol: '☲', element: '火', nature: '火', trait: '光明附麗' },
  zhen:  { name: '震', symbol: '☳', element: '木', nature: '雷', trait: '震動奮發' },
  xun:   { name: '巽', symbol: '☴', element: '木', nature: '風', trait: '柔順深入' },
  kan:   { name: '坎', symbol: '☵', element: '水', nature: '水', trait: '險陷智慧' },
  gen:   { name: '艮', symbol: '☶', element: '土', nature: '山', trait: '止靜沉穩' },
  kun:   { name: '坤', symbol: '☷', element: '土', nature: '地', trait: '厚德載物' },
} as const;

type BaguaKey = keyof typeof BAGUA;

// 後天八卦數（洛書數）
const BAGUA_NUMBER: Record<BaguaKey, number> = {
  kan: 1, kun: 2, zhen: 3, xun: 4, /* 中5 */ qian: 6, dui: 7, gen: 8, li: 9,
};

// 數字對應八卦（除以8取餘）
const NUMBER_TO_BAGUA: Record<number, BaguaKey> = {
  0: 'kun', 1: 'qian', 2: 'dui', 3: 'li', 4: 'zhen', 5: 'xun', 6: 'kan', 7: 'gen',
};

// ====== 六十四卦 ======

interface Hexagram {
  number: number;
  name: string;
  upper: BaguaKey;
  lower: BaguaKey;
  meaning: string;
  career: string;
  advice: string;
  dimension: LifeDimension;
  score: number; // 1-100 吉凶
}

// 精選重要卦（64卦完整版太長，先做核心 + 常見卦）
const HEXAGRAMS: Record<string, Hexagram> = {
  'qian-qian': { number: 1, name: '乾為天', upper: 'qian', lower: 'qian', meaning: '剛健中正，自強不息', career: '適合當領導、創業、獨當一面', advice: '龍行天下，但記得韜光養晦', dimension: 'career', score: 95 },
  'kun-kun': { number: 2, name: '坤為地', upper: 'kun', lower: 'kun', meaning: '厚德載物，包容萬象', career: '適合輔助角色、團隊合作、教育', advice: '含章可貞，用柔順的方式達成目標', dimension: 'career', score: 85 },
  'kan-zhen': { number: 3, name: '水雷屯', upper: 'kan', lower: 'zhen', meaning: '萬事起頭難，但充滿生機', career: '創業初期會辛苦，但值得堅持', advice: '不要急，穩步前進', dimension: 'career', score: 60 },
  'gen-kan': { number: 4, name: '山水蒙', upper: 'gen', lower: 'kan', meaning: '蒙昧初開，需要學習', career: '適合學習期，找好老師很重要', advice: '保持謙虛，主動求教', dimension: 'study', score: 65 },
  'kan-qian': { number: 5, name: '水天需', upper: 'kan', lower: 'qian', meaning: '等待時機，養精蓄銳', career: '時機未到，先充實自己', advice: '需要耐心，好事多磨', dimension: 'career', score: 70 },
  'qian-kan': { number: 6, name: '天水訟', upper: 'qian', lower: 'kan', meaning: '爭訟之象，宜和解', career: '注意合約糾紛，能和則和', advice: '退一步海闊天空', dimension: 'social', score: 40 },
  'kun-kan': { number: 7, name: '地水師', upper: 'kun', lower: 'kan', meaning: '師出有名，領導群眾', career: '適合帶團隊、管理、組織', advice: '以德服人，紀律為先', dimension: 'career', score: 80 },
  'kan-kun': { number: 8, name: '水地比', upper: 'kan', lower: 'kun', meaning: '親近團結，互助合作', career: '適合合夥、結盟、人脈經營', advice: '找到志同道合的人', dimension: 'social', score: 85 },
  'xun-qian': { number: 9, name: '風天小畜', upper: 'xun', lower: 'qian', meaning: '小有積蓄，循序漸進', career: '先小規模驗證，再放大', advice: '密雲不雨，再等等', dimension: 'wealth', score: 65 },
  'qian-dui': { number: 10, name: '天澤履', upper: 'qian', lower: 'dui', meaning: '如履薄冰，謹慎前行', career: '大膽嘗試但要小心風險', advice: '履虎尾，不咥人，亨', dimension: 'career', score: 70 },
  'kun-qian': { number: 11, name: '地天泰', upper: 'kun', lower: 'qian', meaning: '天地交泰，萬事亨通', career: '大吉！所有計畫都能順利推進', advice: '好運到了，大膽行動', dimension: 'career', score: 95 },
  'qian-kun': { number: 12, name: '天地否', upper: 'qian', lower: 'kun', meaning: '天地不交，閉塞不通', career: '遇到瓶頸，暫時退守', advice: '否極泰來，耐心等待轉機', dimension: 'career', score: 30 },
  'qian-li': { number: 13, name: '天火同人', upper: 'qian', lower: 'li', meaning: '志同道合，共同前進', career: '適合社群經營、合作項目', advice: '找到理念相同的人一起做', dimension: 'social', score: 85 },
  'li-qian': { number: 14, name: '火天大有', upper: 'li', lower: 'qian', meaning: '大有所獲，豐收之象', career: '收穫期！之前的努力開始回報', advice: '居高思危，保持謙虛', dimension: 'wealth', score: 90 },
  'kun-gen': { number: 15, name: '地山謙', upper: 'kun', lower: 'gen', meaning: '謙虛受益，滿招損', career: '低調做事，高調成果', advice: '謙謙君子，用涉大川，吉', dimension: 'spiritual', score: 90 },
  'zhen-kun': { number: 16, name: '雷地豫', upper: 'zhen', lower: 'kun', meaning: '歡樂豫悅，順勢而為', career: '順勢而為的好時機', advice: '建立團隊，激勵士氣', dimension: 'career', score: 80 },
  'li-li': { number: 30, name: '離為火', upper: 'li', lower: 'li', meaning: '光明照耀，附麗正道', career: '適合媒體、教育、品牌傳播', advice: '保持光明正大，自然吸引人', dimension: 'career', score: 80 },
  'kan-kan': { number: 29, name: '坎為水', upper: 'kan', lower: 'kan', meaning: '重重險阻，但有智慧', career: '挑戰重重，但你有能力克服', advice: '習坎，維心亨，行有尚', dimension: 'spiritual', score: 50 },
  'zhen-zhen': { number: 51, name: '震為雷', upper: 'zhen', lower: 'zhen', meaning: '震動驚醒，奮發有為', career: '大變化來臨，準備迎接', advice: '震來虩虩，笑言啞啞', dimension: 'career', score: 70 },
  'gen-gen': { number: 52, name: '艮為山', upper: 'gen', lower: 'gen', meaning: '止靜沉穩，適可而止', career: '該停下來思考了', advice: '知止不殆，適時收手', dimension: 'spiritual', score: 65 },
  'xun-xun': { number: 57, name: '巽為風', upper: 'xun', lower: 'xun', meaning: '柔順深入，無孔不入', career: '適合行銷、溝通、滲透市場', advice: '以柔克剛，潤物無聲', dimension: 'career', score: 75 },
  'dui-dui': { number: 58, name: '兌為澤', upper: 'dui', lower: 'dui', meaning: '喜悅和樂，人緣極佳', career: '適合銷售、公關、娛樂業', advice: '和悅待人，自然成事', dimension: 'social', score: 85 },
  'xun-li': { number: 37, name: '風火家人', upper: 'xun', lower: 'li', meaning: '家庭和睦，內外兼顧', career: '先顧好家庭再拼事業', advice: '齊家治國平天下', dimension: 'family', score: 80 },
  'li-xun': { number: 50, name: '火風鼎', upper: 'li', lower: 'xun', meaning: '革故鼎新，大器晚成', career: '適合做變革、創新的事', advice: '鼎新之象，去舊迎新', dimension: 'career', score: 85 },
  'dui-xun': { number: 61, name: '風澤中孚', upper: 'xun', lower: 'dui', meaning: '誠信感化，心誠則靈', career: '用真誠打動人', advice: '中孚以利貞，信及豚魚', dimension: 'social', score: 80 },
};

// ====== 本命卦計算 ======

/**
 * 從生辰計算本命卦
 * 方法：年月日時各取數，上卦下卦分別算
 */
export function calculateLifeHexagram(input: BirthInfo): {
  upper: BaguaKey;
  lower: BaguaKey;
  hexagram: Hexagram | null;
  changing: BaguaKey; // 變卦（動爻對應的卦）
} {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const hour = input.hour;

  // 上卦 = (年 + 月 + 日) % 8
  const upperNum = (year + month + day) % 8;
  // 下卦 = (年 + 月 + 日 + 時) % 8
  const lowerNum = (year + month + day + hour) % 8;
  // 動爻 = (年 + 月 + 日 + 時) % 6 → 決定變卦
  const changingLine = (year + month + day + hour) % 6;

  const upper = NUMBER_TO_BAGUA[upperNum];
  const lower = NUMBER_TO_BAGUA[lowerNum];
  
  // 變卦：動爻所在的卦（上三爻或下三爻）發生變化
  const changingGua = changingLine < 3 ? 
    NUMBER_TO_BAGUA[(lowerNum + changingLine + 1) % 8] : 
    NUMBER_TO_BAGUA[(upperNum + changingLine - 2) % 8];

  const key = `${upper}-${lower}`;
  const hexagram = HEXAGRAMS[key] || null;

  return { upper, lower, hexagram, changing: changingGua };
}

/**
 * 轉換為 SystemAnalysis 格式
 */
export function ichingToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const { upper, lower, hexagram, changing } = calculateLifeHexagram(input);
  const upperInfo = BAGUA[upper];
  const lowerInfo = BAGUA[lower];
  const changingInfo = BAGUA[changing];

  const traits: Trait[] = [];

  // 上卦特質
  traits.push({
    label: `上卦 ${upperInfo.name}（${upperInfo.symbol}${upperInfo.nature}）`,
    description: `外在表現：${upperInfo.trait}，五行屬${upperInfo.element}`,
    score: 70,
    type: 'strength',
    dimension: 'social',
    source: 'iching',
  });

  // 下卦特質
  traits.push({
    label: `下卦 ${lowerInfo.name}（${lowerInfo.symbol}${lowerInfo.nature}）`,
    description: `內在本質：${lowerInfo.trait}，五行屬${lowerInfo.element}`,
    score: 70,
    type: 'strength',
    dimension: 'spiritual',
    source: 'iching',
  });

  if (hexagram) {
    // 本命卦解讀
    traits.push({
      label: `本命卦：${hexagram.name}`,
      description: hexagram.meaning,
      score: hexagram.score,
      type: hexagram.score >= 60 ? 'strength' : 'weakness',
      dimension: hexagram.dimension,
      source: 'iching',
    });

    // 事業建議
    traits.push({
      label: `易經事業指引`,
      description: hexagram.career,
      score: hexagram.score,
      type: 'strength',
      dimension: 'career',
      source: 'iching',
    });
  }

  // 變卦方向
  traits.push({
    label: `變卦方向：${changingInfo.name}（${changingInfo.symbol}）`,
    description: `未來發展趨勢：往${changingInfo.trait}方向變化，五行${changingInfo.element}`,
    score: 65,
    type: 'strength',
    dimension: 'spiritual',
    source: 'iching',
  });

  return {
    system: 'iching',
    systemName: '易經六十四卦',
    rawData: { upper: upperInfo, lower: lowerInfo, hexagram, changing: changingInfo },
    traits,
    timing: [],
  };
}

// ====== CLI ======

if (require.main === module) {
  const dateStr = process.argv[2] || '1993-08-07';
  const hour = parseInt(process.argv[3] || '9');
  
  const input: BirthInfo = { solarDate: dateStr, hour, gender: 'male' };
  const { upper, lower, hexagram, changing } = calculateLifeHexagram(input);
  const upperInfo = BAGUA[upper];
  const lowerInfo = BAGUA[lower];
  const changingInfo = BAGUA[changing];

  console.log(`\n☰ 易經本命卦分析：${dateStr} ${hour}時`);
  console.log('═'.repeat(50));
  
  console.log(`\n上卦：${upperInfo.symbol} ${upperInfo.name}（${upperInfo.nature}）— ${upperInfo.trait}`);
  console.log(`下卦：${lowerInfo.symbol} ${lowerInfo.name}（${lowerInfo.nature}）— ${lowerInfo.trait}`);
  
  if (hexagram) {
    console.log(`\n🔮 本命卦：第 ${hexagram.number} 卦 — ${hexagram.name}`);
    console.log(`卦義：${hexagram.meaning}`);
    console.log(`事業：${hexagram.career}`);
    console.log(`建議：${hexagram.advice}`);
    console.log(`吉凶：${hexagram.score}/100`);
  } else {
    console.log(`\n本命卦：${upperInfo.name}${lowerInfo.name}（卦辭待補充）`);
  }
  
  console.log(`\n🔄 變卦方向：${changingInfo.symbol} ${changingInfo.name}（${changingInfo.nature}）`);
  console.log(`未來趨勢：${changingInfo.trait}`);
}
