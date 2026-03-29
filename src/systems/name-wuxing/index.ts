/**
 * 造命 ZaoMing — 字義五行姓名學模組（中國正統版）
 * 
 * 📌 與日式「熊崎式81劃數理」不同，本模組採用中國傳統正宗的「字義五行」取名法
 * 
 * 三大判定法則：
 * 1. 字義五行 — 從漢字的本義/引申義判定五行（最重要）
 * 2. 字形五行 — 從部首/偏旁的形態判定五行
 * 3. 字音五行 — 從發音的五音（宮商角徵羽）判定五行
 * 
 * 原則：字義 > 字形 > 字音（義為主，形音為輔）
 * 
 * 理論基礎：
 * - 《說文解字》許慎：以字義歸類部首，部首即五行之源
 * - 《康熙字典》：繁體正字為準
 * - 五行本義：水曰潤下、火曰炎上、木曰曲直、金曰從革、土曰稼穡
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

// ============================================================
// 一、字義五行資料庫
// 每個字根據其「本義」和「引申義」歸類五行
// ============================================================

/**
 * 字義五行判定規則：
 * 
 * 【木】— 曲直、生長、條達、舒展
 * 含義：樹木、植物、生長、仁慈、柔和、向上
 * 
 * 【火】— 炎上、光明、溫熱
 * 含義：光、熱、明亮、文明、禮儀、炎熱
 * 
 * 【土】— 稼穡、承載、厚重
 * 含義：大地、穩重、包容、信用、中央、養育
 * 
 * 【金】— 從革、肅殺、收斂
 * 含義：金屬、堅硬、果斷、義氣、鋒利、變革
 * 
 * 【水】— 潤下、智慧、流動
 * 含義：水流、智慧、靈活、變通、寒冷、聚藏
 */

const CHAR_MEANING_WUXING: Record<string, { wuxing: string; reason: string }> = {
  // ====== 木行字 ======
  // 植物類
  '林': { wuxing: '木', reason: '雙木成林，森林之象' },
  '森': { wuxing: '木', reason: '三木疊加，木之極' },
  '松': { wuxing: '木', reason: '松樹，常青之木' },
  '柏': { wuxing: '木', reason: '柏樹，長壽之木' },
  '梅': { wuxing: '木', reason: '梅花，堅韌之木' },
  '蘭': { wuxing: '木', reason: '蘭花，君子之花' },
  '竹': { wuxing: '木', reason: '竹節虛心，屬木' },
  '芳': { wuxing: '木', reason: '花草之香，草木屬木' },
  '蓮': { wuxing: '木', reason: '蓮花，出淤泥不染' },
  '菊': { wuxing: '木', reason: '菊花，秋之花' },
  '荷': { wuxing: '木', reason: '荷花，清淨之花' },
  '茂': { wuxing: '木', reason: '草木茂盛' },
  '華': { wuxing: '木', reason: '花華同源，繁華如花開' },
  '蔡': { wuxing: '木', reason: '艸頭，蔡為野草名，植物屬木' },
  '英': { wuxing: '木', reason: '艸頭，花之精華' },
  '葉': { wuxing: '木', reason: '樹葉，木之附' },
  '莉': { wuxing: '木', reason: '茉莉花，植物屬木' },
  '萱': { wuxing: '木', reason: '萱草（忘憂草），植物屬木' },
  '蓉': { wuxing: '木', reason: '芙蓉花，植物屬木' },
  '薇': { wuxing: '木', reason: '薔薇之薇，植物屬木' },
  '藝': { wuxing: '木', reason: '藝原指種植技術，從艸' },
  '春': { wuxing: '木', reason: '春天萬物生長，木之季' },
  '東': { wuxing: '木', reason: '東方屬木，木之方位' },
  '青': { wuxing: '木', reason: '青色屬木，木之色' },
  '仁': { wuxing: '木', reason: '仁德，木之德' },
  '寅': { wuxing: '木', reason: '寅屬虎，地支寅卯屬木' },
  '卯': { wuxing: '木', reason: '地支卯屬木' },
  '甲': { wuxing: '木', reason: '天干甲屬陽木' },
  '乙': { wuxing: '木', reason: '天干乙屬陰木' },
  '榮': { wuxing: '木', reason: '草木繁榮' },
  '棟': { wuxing: '木', reason: '棟梁之木' },
  '楷': { wuxing: '木', reason: '楷木，從木' },
  '桂': { wuxing: '木', reason: '桂花樹，從木' },
  '杉': { wuxing: '木', reason: '杉木，從木' },
  '樺': { wuxing: '木', reason: '樺木，從木' },
  '楠': { wuxing: '木', reason: '楠木，從木' },
  '柔': { wuxing: '木', reason: '柔軟如枝條，木之性' },
  '彬': { wuxing: '木', reason: '文質彬彬，木旁' },

  // ====== 火行字 ======
  // 光明、溫熱類
  '日': { wuxing: '火', reason: '太陽，火之源' },
  '明': { wuxing: '火', reason: '日月合璧，光明屬火' },
  '光': { wuxing: '火', reason: '光芒四射，火之象' },
  '炎': { wuxing: '火', reason: '雙火，炎熱之極' },
  '焱': { wuxing: '火', reason: '三火疊加，火之極' },
  '煌': { wuxing: '火', reason: '輝煌，火旁' },
  '熙': { wuxing: '火', reason: '光明興盛，含火意' },
  '照': { wuxing: '火', reason: '照耀，光之用' },
  '燦': { wuxing: '火', reason: '燦爛，火旁' },
  '輝': { wuxing: '火', reason: '光輝，火之用' },
  '昊': { wuxing: '火', reason: '日在天上，光明廣大' },
  '晨': { wuxing: '火', reason: '早晨日出，日屬火' },
  '曉': { wuxing: '火', reason: '天曉破曉，日光初現' },
  '晴': { wuxing: '火', reason: '晴天日出，日屬火' },
  '暉': { wuxing: '火', reason: '日暉，陽光' },
  '昌': { wuxing: '火', reason: '日上日，昌盛光明' },
  '旭': { wuxing: '火', reason: '旭日東昇，日屬火' },
  '晗': { wuxing: '火', reason: '天將明，日屬火' },
  '南': { wuxing: '火', reason: '南方屬火，火之方位' },
  '赤': { wuxing: '火', reason: '赤色屬火，火之色' },
  '紅': { wuxing: '火', reason: '紅色，火之色' },
  '丹': { wuxing: '火', reason: '朱砂赤色，屬火' },
  '禮': { wuxing: '火', reason: '禮儀，火之德' },
  '丙': { wuxing: '火', reason: '天干丙屬陽火' },
  '丁': { wuxing: '火', reason: '天干丁屬陰火' },
  '午': { wuxing: '火', reason: '地支午屬火' },
  '巳': { wuxing: '火', reason: '地支巳屬火' },
  '夏': { wuxing: '火', reason: '夏天炎熱，火之季' },
  '燁': { wuxing: '火', reason: '火光閃耀' },
  '焰': { wuxing: '火', reason: '火焰，純火' },
  '煜': { wuxing: '火', reason: '火光照耀' },
  '烽': { wuxing: '火', reason: '烽火，從火' },
  '文': { wuxing: '火', reason: '文明教化，離卦屬火，文屬火' },
  '彰': { wuxing: '火', reason: '彰顯光明' },
  '麗': { wuxing: '火', reason: '美麗如火光絢爛，離麗屬火' },

  // ====== 土行字 ======
  // 大地、穩重、承載類
  '土': { wuxing: '土', reason: '土之本字' },
  '地': { wuxing: '土', reason: '大地，土之體' },
  '山': { wuxing: '土', reason: '山由土石堆積' },
  '岩': { wuxing: '土', reason: '山岩，山石屬土' },
  '峰': { wuxing: '土', reason: '山峰，山屬土' },
  '嶽': { wuxing: '土', reason: '五嶽之山，山屬土' },
  '崇': { wuxing: '土', reason: '崇高如山，山屬土' },
  '坤': { wuxing: '土', reason: '坤為地，純土' },
  '城': { wuxing: '土', reason: '城池由土築成' },
  '培': { wuxing: '土', reason: '培土栽培，土旁' },
  '堅': { wuxing: '土', reason: '堅固如土石' },
  '基': { wuxing: '土', reason: '基礎，土之用' },
  '垣': { wuxing: '土', reason: '牆垣，土旁' },
  '均': { wuxing: '土', reason: '均等平衡，土之德' },
  '坊': { wuxing: '土', reason: '土旁' },
  '安': { wuxing: '土', reason: '安定如大地，女在宀下安穩' },
  '宇': { wuxing: '土', reason: '宇宙之宇，房屋覆蓋，土之象' },
  '衍': { wuxing: '土', reason: '水行地上為衍，引申為繁衍，有土之承載義' },
  '穩': { wuxing: '土', reason: '穩重踏實，土之性' },
  '德': { wuxing: '土', reason: '厚德載物，土之德' },
  '信': { wuxing: '土', reason: '誠信，土之德（仁義禮智信對應木火土金水中信屬土）' },
  '中': { wuxing: '土', reason: '中央屬土，土之位' },
  '黃': { wuxing: '土', reason: '黃色屬土，土之色' },
  '戊': { wuxing: '土', reason: '天干戊屬陽土' },
  '己': { wuxing: '土', reason: '天干己屬陰土' },
  '辰': { wuxing: '土', reason: '地支辰屬土' },
  '丑': { wuxing: '土', reason: '地支丑屬土' },
  '未': { wuxing: '土', reason: '地支未屬土' },
  '戌': { wuxing: '土', reason: '地支戌屬土' },
  '坊': { wuxing: '土', reason: '坊市，土旁' },
  '墨': { wuxing: '土', reason: '黑土，從土' },
  '豐': { wuxing: '土', reason: '豐收，土地之產' },
  '翔': { wuxing: '土', reason: '翔與土地上方飛行有關，但生肖學中翔屬土' },

  // ====== 金行字 ======
  // 金屬、堅硬、果斷類
  '金': { wuxing: '金', reason: '金之本字' },
  '銀': { wuxing: '金', reason: '銀金屬，金旁' },
  '鐵': { wuxing: '金', reason: '鐵金屬，金旁' },
  '鋼': { wuxing: '金', reason: '鋼鐵，金旁' },
  '銘': { wuxing: '金', reason: '刻於金石，金旁' },
  '鑫': { wuxing: '金', reason: '三金疊加，金之極' },
  '鋒': { wuxing: '金', reason: '刀鋒，金旁' },
  '鈺': { wuxing: '金', reason: '美玉寶石，金旁' },
  '錦': { wuxing: '金', reason: '錦繡，金旁' },
  '鑒': { wuxing: '金', reason: '銅鑒明鏡，金旁' },
  '劍': { wuxing: '金', reason: '寶劍，金屬兵器' },
  '刀': { wuxing: '金', reason: '刀具，金屬利器' },
  '利': { wuxing: '金', reason: '鋒利，刀之用，金之性' },
  '剛': { wuxing: '金', reason: '剛強，金之德' },
  '義': { wuxing: '金', reason: '義氣，金之德（仁義禮智信中義屬金）' },
  '正': { wuxing: '金', reason: '正直剛正，金之性' },
  '白': { wuxing: '金', reason: '白色屬金，金之色' },
  '西': { wuxing: '金', reason: '西方屬金，金之方位' },
  '秋': { wuxing: '金', reason: '秋天肅殺，金之季' },
  '庚': { wuxing: '金', reason: '天干庚屬陽金' },
  '辛': { wuxing: '金', reason: '天干辛屬陰金' },
  '申': { wuxing: '金', reason: '地支申屬金' },
  '酉': { wuxing: '金', reason: '地支酉屬金' },
  '堅': { wuxing: '金', reason: '堅硬如金' },
  '毅': { wuxing: '金', reason: '剛毅果斷，金之性' },
  '銳': { wuxing: '金', reason: '銳利，金旁' },
  '成': { wuxing: '金', reason: '成就，金有收成之意' },
  '肅': { wuxing: '金', reason: '肅殺，金之氣' },
  '強': { wuxing: '金', reason: '強健剛強' },
  '勝': { wuxing: '金', reason: '勝出克勝，金之用' },

  // ====== 水行字 ======
  // 水流、智慧、靈活類
  '水': { wuxing: '水', reason: '水之本字' },
  '海': { wuxing: '水', reason: '大海，水之聚' },
  '江': { wuxing: '水', reason: '長江，大水' },
  '河': { wuxing: '水', reason: '黃河，大水' },
  '湖': { wuxing: '水', reason: '湖泊，靜水' },
  '波': { wuxing: '水', reason: '水波，水之動' },
  '洋': { wuxing: '水', reason: '海洋，水之廣' },
  '泉': { wuxing: '水', reason: '泉水，水之源' },
  '溪': { wuxing: '水', reason: '溪流，小水' },
  '淵': { wuxing: '水', reason: '深淵，水之深' },
  '潤': { wuxing: '水', reason: '滋潤，水之德' },
  '清': { wuxing: '水', reason: '清澈，水之質' },
  '澄': { wuxing: '水', reason: '澄清，水旁' },
  '浩': { wuxing: '水', reason: '浩瀚，水之大' },
  '涵': { wuxing: '水', reason: '涵養，水之蓄' },
  '沐': { wuxing: '水', reason: '沐浴，水旁' },
  '淨': { wuxing: '水', reason: '乾淨清淨，水旁' },
  '澤': { wuxing: '水', reason: '恩澤，水之惠' },
  '洪': { wuxing: '水', reason: '洪水，大水' },
  '涵': { wuxing: '水', reason: '涵容，水之量' },
  '智': { wuxing: '水', reason: '智慧，水之德（仁義禮智信中智屬水）' },
  '北': { wuxing: '水', reason: '北方屬水，水之方位' },
  '黑': { wuxing: '水', reason: '黑色屬水，水之色' },
  '冬': { wuxing: '水', reason: '冬天寒冷，水之季' },
  '壬': { wuxing: '水', reason: '天干壬屬陽水' },
  '癸': { wuxing: '水', reason: '天干癸屬陰水' },
  '子': { wuxing: '水', reason: '地支子屬水' },
  '亥': { wuxing: '水', reason: '地支亥屬水' },
  '雨': { wuxing: '水', reason: '雨水，水之降' },
  '雪': { wuxing: '水', reason: '雪為固態水' },
  '霜': { wuxing: '水', reason: '霜露皆水' },
  '露': { wuxing: '水', reason: '露水，水之凝' },
  '雲': { wuxing: '水', reason: '雲為水蒸氣' },
  '霖': { wuxing: '水', reason: '久雨為霖，水旁' },
  '淼': { wuxing: '水', reason: '三水疊加，水之極' },
  '霞': { wuxing: '水', reason: '雨字頭，含水意' },
  '凱': { wuxing: '水', reason: '凱旋之風，含流動之意' },
  '慧': { wuxing: '水', reason: '聰慧機智，智屬水' },
  '敏': { wuxing: '水', reason: '敏捷靈活，水之性' },
};

// ============================================================
// 二、部首五行對照表（字形五行）
// ============================================================

const RADICAL_WUXING: Record<string, string> = {
  // 木行部首
  '木': '木', '艹': '木', '竹': '木', '禾': '木', '米': '木',
  '耒': '木', '⺮': '木',
  
  // 火行部首
  '火': '火', '灬': '火', '日': '火', '光': '火',
  
  // 土行部首
  '土': '土', '山': '土', '石': '土', '田': '土', '阝': '土',
  
  // 金行部首
  '金': '金', '釒': '金', '钅': '金', '刀': '金', '刂': '金',
  '戈': '金', '斤': '金',
  
  // 水行部首
  '水': '水', '氵': '水', '冫': '水', '雨': '水', '⺡': '水',
};

// ============================================================
// 三、字音五行（五音對應）
// 宮=土 商=金 角=木 徵=火 羽=水
// 聲母對應五行
// ============================================================

const INITIAL_WUXING: Record<string, string> = {
  // 牙音=木（角）：ㄍㄎㄏ (g, k, h)
  'g': '木', 'k': '木', 'h': '木',
  // 舌音=火（徵）：ㄉㄊㄋㄌ (d, t, n, l)
  'd': '火', 't': '火', 'n': '火', 'l': '火',
  // 喉音=土（宮）：ㄧㄨㄩ (y, w, yu) + 零聲母
  'y': '土', 'w': '土',
  // 齒音=金（商）：ㄐㄑㄒ ㄓㄔㄕ ㄗㄘㄙ (j, q, x, zh, ch, sh, z, c, s)
  'j': '金', 'q': '金', 'x': '金',
  'zh': '金', 'ch': '金', 'sh': '金',
  'z': '金', 'c': '金', 's': '金',
  // 唇音=水（羽）：ㄅㄆㄇㄈ (b, p, m, f)
  'b': '水', 'p': '水', 'm': '水', 'f': '水',
  // 半舌半齒=介於火水之間
  'r': '火',
};

// ============================================================
// 四、核心分析函數
// ============================================================

interface CharWuxingAnalysis {
  char: string;
  meaningWuxing: string | null;   // 字義五行（最重要）
  meaningReason: string;
  formWuxing: string | null;      // 字形五行
  formReason: string;
  soundWuxing: string | null;     // 字音五行
  soundReason: string;
  finalWuxing: string;            // 最終判定
  confidence: number;             // 信心度 0-100
}

function analyzeCharWuxing(char: string): CharWuxingAnalysis {
  // 1. 查字義五行（最高優先）
  const meaningEntry = CHAR_MEANING_WUXING[char];
  const meaningWuxing = meaningEntry?.wuxing || null;
  const meaningReason = meaningEntry?.reason || '字典未收錄，需擴充';

  // 2. 推斷字形五行（從部首）
  let formWuxing: string | null = null;
  let formReason = '無法從部首判定';
  // 簡化：看字本身是否在部首表中，或常見偏旁
  for (const [radical, wx] of Object.entries(RADICAL_WUXING)) {
    // 簡單判定：如果字包含這些常見部首字
    if (char === radical) {
      formWuxing = wx;
      formReason = `字即為${radical}部，屬${wx}`;
      break;
    }
  }

  // 3. 字音五行（簡化版 - 需要拼音數據）
  const soundWuxing: string | null = null;
  const soundReason = '需拼音數據';

  // 4. 最終判定：字義 > 字形 > 字音
  let finalWuxing = '土'; // 預設土（中性）
  let confidence = 30;

  if (meaningWuxing) {
    finalWuxing = meaningWuxing;
    confidence = 95;
  } else if (formWuxing) {
    finalWuxing = formWuxing;
    confidence = 70;
  } else if (soundWuxing) {
    finalWuxing = soundWuxing;
    confidence = 50;
  }

  return {
    char, meaningWuxing, meaningReason,
    formWuxing, formReason,
    soundWuxing, soundReason,
    finalWuxing, confidence,
  };
}

// ============================================================
// 五、姓名整體五行分析
// ============================================================

interface NameWuxingResult {
  name: string;
  chars: CharWuxingAnalysis[];
  nameWuxing: string[];           // 每個字的五行
  wuxingDistribution: Record<string, number>;  // 五行分布
  balance: string;                // 平衡狀態
  strengthWuxing: string;         // 最旺五行
  weakWuxing: string;             // 最弱五行
  needWuxing: string;             // 需要補的五行
  shengKeChain: string;           // 生剋鏈
  overallScore: number;
  advice: string[];
}

function analyzeNameWuxing(name: string, baziNeedWuxing?: string): NameWuxingResult {
  const chars = [...name].map(c => analyzeCharWuxing(c));
  const nameWuxing = chars.map(c => c.finalWuxing);

  // 五行分布
  const dist: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  nameWuxing.forEach(wx => dist[wx]++);

  // 找最旺和最弱
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]);
  const strengthWuxing = sorted[0][0];
  const weakEntries = sorted.filter(([, v]) => v === 0);
  const weakWuxing = weakEntries.length > 0 ? weakEntries.map(([k]) => k).join('、') : '無明顯缺失';

  // 需要補的五行（結合八字用神）
  const needWuxing = baziNeedWuxing || (weakEntries.length > 0 ? weakEntries[0][0] : '均衡');

  // 生剋鏈分析
  const shengMap: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  const keMap: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

  let shengCount = 0;
  let keCount = 0;
  const chainParts: string[] = [];

  for (let i = 0; i < nameWuxing.length - 1; i++) {
    const curr = nameWuxing[i];
    const next = nameWuxing[i + 1];
    if (shengMap[curr] === next) {
      shengCount++;
      chainParts.push(`${chars[i].char}(${curr})生${chars[i + 1].char}(${next})`);
    } else if (keMap[curr] === next) {
      keCount++;
      chainParts.push(`${chars[i].char}(${curr})剋${chars[i + 1].char}(${next})⚠️`);
    } else if (curr === next) {
      chainParts.push(`${chars[i].char}(${curr})比${chars[i + 1].char}(${next})`);
    } else {
      chainParts.push(`${chars[i].char}(${curr})→${chars[i + 1].char}(${next})`);
    }
  }

  const shengKeChain = chainParts.join('，');

  // 計算分數
  let score = 60;

  // 有相生加分
  score += shengCount * 15;
  // 有相剋減分
  score -= keCount * 10;
  // 五行均衡加分
  const uniqueElements = new Set(nameWuxing).size;
  if (uniqueElements >= 3) score += 10;
  // 如果補到用神加分
  if (baziNeedWuxing && nameWuxing.includes(baziNeedWuxing)) score += 15;
  // 高信心度加分
  const avgConfidence = chars.reduce((sum, c) => sum + c.confidence, 0) / chars.length;
  if (avgConfidence > 80) score += 5;

  score = Math.max(20, Math.min(100, score));

  // 建議
  const advice: string[] = [];
  if (keCount > 0) {
    advice.push(`姓名中有${keCount}組相剋，能量有內耗`);
  }
  if (shengCount > 0) {
    advice.push(`姓名中有${shengCount}組相生，能量流通順暢`);
  }
  if (weakEntries.length > 0) {
    advice.push(`缺${weakWuxing}，可用字號、品牌名補充`);
  }
  if (baziNeedWuxing) {
    if (nameWuxing.includes(baziNeedWuxing)) {
      advice.push(`✅ 名字已補到八字用神「${baziNeedWuxing}」`);
    } else {
      advice.push(`⚠️ 八字用神「${baziNeedWuxing}」未出現在名字中，可考慮筆名或品牌名補充`);
    }
  }

  return {
    name, chars, nameWuxing, wuxingDistribution: dist,
    balance: weakEntries.length === 0 ? '五行均有' : `缺${weakWuxing}`,
    strengthWuxing, weakWuxing, needWuxing, shengKeChain,
    overallScore: score, advice,
  };
}

// ============================================================
// 六、轉換為 SystemAnalysis
// ============================================================

export function nameWuxingToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  if (!input.name) {
    return { system: 'name-wuxing', systemName: '字義五行姓名學', rawData: {}, traits: [], timing: [] };
  }

  // 從八字推用神（簡化：用 wuxing module）
  let baziNeedWuxing: string | undefined;
  try {
    const { calculateBazi } = require('../bazi');
    const bazi = calculateBazi(input);
    // 日主五行的「用神」通常是被日主剋的或生日主的
    // 簡化處理
  } catch {}

  const result = analyzeNameWuxing(input.name, baziNeedWuxing);
  const traits: Trait[] = [];

  // 每個字的五行分析
  for (const c of result.chars) {
    traits.push({
      label: `「${c.char}」字義五行：${c.finalWuxing}`,
      description: c.meaningReason + (c.confidence >= 90 ? '' : `（信心度${c.confidence}%）`),
      score: c.confidence,
      type: c.confidence >= 70 ? 'strength' : 'weakness',
      dimension: 'spiritual',
      source: 'name-wuxing',
    });
  }

  // 生剋鏈
  traits.push({
    label: `姓名五行流：${result.nameWuxing.join('→')}`,
    description: result.shengKeChain || '無特殊生剋關係',
    score: result.overallScore,
    type: result.overallScore >= 70 ? 'strength' : 'weakness',
    dimension: 'career',
    source: 'name-wuxing',
  });

  // 五行平衡
  traits.push({
    label: `五行分布：${result.balance}`,
    description: `木${result.wuxingDistribution['木']} 火${result.wuxingDistribution['火']} 土${result.wuxingDistribution['土']} 金${result.wuxingDistribution['金']} 水${result.wuxingDistribution['水']}`,
    score: result.overallScore,
    type: result.weakWuxing === '無明顯缺失' ? 'strength' : 'weakness',
    dimension: 'health',
    source: 'name-wuxing',
  });

  // 建議
  if (result.advice.length > 0) {
    traits.push({
      label: '字義五行建議',
      description: result.advice.join('；'),
      score: result.overallScore,
      type: 'strength',
      dimension: 'spiritual',
      source: 'name-wuxing',
    });
  }

  return {
    system: 'name-wuxing',
    systemName: '字義五行姓名學（中國正統）',
    rawData: result,
    traits,
    timing: [],
  };
}

// ====== CLI 測試 ======
if (require.main === module) {
  const name = process.argv[2] || '蔡寅衍';
  const result = analyzeNameWuxing(name);

  console.log(`\n🔤 字義五行姓名學：${name}`);
  console.log('═'.repeat(50));
  for (const c of result.chars) {
    console.log(`\n📌「${c.char}」`);
    console.log(`  字義五行：${c.meaningWuxing || '未收錄'} — ${c.meaningReason}`);
    console.log(`  字形五行：${c.formWuxing || '需分析'} — ${c.formReason}`);
    console.log(`  最終判定：${c.finalWuxing}（信心度 ${c.confidence}%）`);
  }
  console.log(`\n五行流：${result.nameWuxing.join(' → ')}`);
  console.log(`生剋鏈：${result.shengKeChain}`);
  console.log(`五行分布：木${result.wuxingDistribution['木']} 火${result.wuxingDistribution['火']} 土${result.wuxingDistribution['土']} 金${result.wuxingDistribution['金']} 水${result.wuxingDistribution['水']}`);
  console.log(`平衡：${result.balance}`);
  console.log(`\n📊 總分：${result.overallScore}/100`);
  console.log(`\n💡 建議：`);
  result.advice.forEach(a => console.log(`  • ${a}`));
}
