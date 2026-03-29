/**
 * 造命 ZaoMing — 玄空飛星風水（正宗風水）
 * 
 * 理論基礎：蔣大鴻《地理辨正》、沈竹礽《沈氏玄空學》
 * 
 * 核心概念：
 * - 三元九運：上元(1-3運)、中元(4-6運)、下元(7-9運)，每運20年
 * - 九宮飛星：洛書九星飛布九宮
 * - 山星（丁星）：管人丁健康
 * - 水星（財星）：管財運事業
 * - 向星 + 山星 + 運星 三盤疊加
 * 
 * 與八宅的差異：
 * - 八宅只看人的命卦，不考慮時間 → 簡化版
 * - 玄空考慮「時間 × 空間 × 方位」三維交互 → 完整版
 * - 同一棟房子，不同年運能量完全不同
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

// ============================================================
// 一、三元九運
// ============================================================

interface YunPeriod {
  yun: number;        // 幾運
  yuan: string;       // 上/中/下元
  startYear: number;
  endYear: number;
  centralStar: number; // 入中宮之星
  element: string;     // 五行
  description: string;
}

const SAN_YUAN_JIU_YUN: YunPeriod[] = [
  { yun: 1, yuan: '上元', startYear: 1864, endYear: 1883, centralStar: 1, element: '水', description: '一白貪狼（水）— 文昌發跡' },
  { yun: 2, yuan: '上元', startYear: 1884, endYear: 1903, centralStar: 2, element: '土', description: '二黑巨門（土）— 坤母當權' },
  { yun: 3, yuan: '上元', startYear: 1904, endYear: 1923, centralStar: 3, element: '木', description: '三碧祿存（木）— 震動變革' },
  { yun: 4, yuan: '中元', startYear: 1924, endYear: 1943, centralStar: 4, element: '木', description: '四綠文曲（木）— 文運昌盛' },
  { yun: 5, yuan: '中元', startYear: 1944, endYear: 1963, centralStar: 5, element: '土', description: '五黃廉貞（土）— 帝星居中' },
  { yun: 6, yuan: '中元', startYear: 1964, endYear: 1983, centralStar: 6, element: '金', description: '六白武曲（金）— 武將得勢' },
  { yun: 7, yuan: '下元', startYear: 1984, endYear: 2003, centralStar: 7, element: '金', description: '七赤破軍（金）— 口舌是非' },
  { yun: 8, yuan: '下元', startYear: 2004, endYear: 2023, centralStar: 8, element: '土', description: '八白左輔（土）— 艮土當令' },
  { yun: 9, yuan: '下元', startYear: 2024, endYear: 2043, centralStar: 9, element: '火', description: '九紫右弼（火）— 離火文明' },
];

// ============================================================
// 二、九星資料
// ============================================================

interface StarInfo {
  number: number;
  name: string;
  color: string;
  element: string;
  nature: string;       // 吉凶屬性
  timely: string;       // 當令特性
  untimely: string;     // 失令特性
  direction: string;    // 對應方位
}

const NINE_STARS: StarInfo[] = [
  { number: 1, name: '貪狼', color: '一白', element: '水', nature: '吉', direction: '北（坎）',
    timely: '官星顯達、文才出眾、桃花旺', untimely: '耳疾、腎病、桃花劫' },
  { number: 2, name: '巨門', color: '二黑', element: '土', nature: '凶', direction: '西南（坤）',
    timely: '田產豐厚、母儀天下', untimely: '病符星、腸胃病、寡婦當家' },
  { number: 3, name: '祿存', color: '三碧', element: '木', nature: '凶', direction: '東（震）',
    timely: '出武將、有魄力', untimely: '是非星、官非口舌、盜賊' },
  { number: 4, name: '文曲', color: '四綠', element: '木', nature: '半吉', direction: '東南（巽）',
    timely: '文昌星、考試升遷、桃花', untimely: '風疾、桃花劫、精神疾病' },
  { number: 5, name: '廉貞', color: '五黃', element: '土', nature: '大凶', direction: '中宮',
    timely: '帝星、至尊（極少數情況）', untimely: '五黃煞、大病大災、血光之災' },
  { number: 6, name: '武曲', color: '六白', element: '金', nature: '吉', direction: '西北（乾）',
    timely: '武貴、權威、偏財運', untimely: '頭疾、孤寡、刑傷' },
  { number: 7, name: '破軍', color: '七赤', element: '金', nature: '凶', direction: '西（兌）',
    timely: '口才好、以口為業', untimely: '口舌是非、盜賊、火災' },
  { number: 8, name: '左輔', color: '八白', element: '土', nature: '大吉', direction: '東北（艮）',
    timely: '大財星、置業旺丁', untimely: '小兒疾病、關節問題' },
  { number: 9, name: '右弼', color: '九紫', element: '火', nature: '吉', direction: '南（離）',
    timely: '喜慶、目光遠大、未來吉星', untimely: '心臟病、眼疾、火災' },
];

// ============================================================
// 三、飛星軌跡（洛書飛星順序）
// ============================================================

// 洛書九宮位置（中→乾→兌→艮→離→坎→坤→震→巽）
// 飛星順序：中宮→西北→西→東北→南→北→西南→東→東南
const FLY_ORDER = [4, 8, 2, 6, 7, 3, 1, 9, 5]; // 宮位index: 0=中,1=乾NW,2=兌W,3=艮NE,4=離S,5=坎N,6=坤SW,7=震E,8=巽SE

const PALACE_NAMES = ['中宮', '乾(西北)', '兌(西)', '艮(東北)', '離(南)', '坎(北)', '坤(西南)', '震(東)', '巽(東南)'];

// 順飛：數字遞增
// 逆飛：數字遞減
function flyStars(centralNumber: number, forward: boolean = true): number[] {
  const result = new Array(9);
  result[0] = centralNumber; // 中宮

  // 飛星路徑：中→乾→兌→艮→離→坎→坤→震→巽
  const path = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // 宮位順序

  for (let i = 1; i < 9; i++) {
    if (forward) {
      result[path[i]] = ((centralNumber - 1 + i) % 9) + 1;
    } else {
      result[path[i]] = ((centralNumber - 1 - i + 90) % 9) + 1;
    }
  }

  return result;
}

// ============================================================
// 四、24 山向對照表
// ============================================================

interface MountainDirection {
  name: string;
  degrees: [number, number];
  palace: number;   // 所在宮位 index
  element: string;
}

const TWENTY_FOUR_MOUNTAINS: MountainDirection[] = [
  // 北方三山（坎宮）
  { name: '壬', degrees: [337.5, 352.5], palace: 5, element: '水' },
  { name: '子', degrees: [352.5, 7.5], palace: 5, element: '水' },
  { name: '癸', degrees: [7.5, 22.5], palace: 5, element: '水' },
  // 東北三山（艮宮）
  { name: '丑', degrees: [22.5, 37.5], palace: 3, element: '土' },
  { name: '艮', degrees: [37.5, 52.5], palace: 3, element: '土' },
  { name: '寅', degrees: [52.5, 67.5], palace: 3, element: '木' },
  // 東方三山（震宮）
  { name: '甲', degrees: [67.5, 82.5], palace: 7, element: '木' },
  { name: '卯', degrees: [82.5, 97.5], palace: 7, element: '木' },
  { name: '乙', degrees: [97.5, 112.5], palace: 7, element: '木' },
  // 東南三山（巽宮）
  { name: '辰', degrees: [112.5, 127.5], palace: 8, element: '土' },
  { name: '巽', degrees: [127.5, 142.5], palace: 8, element: '木' },
  { name: '巳', degrees: [142.5, 157.5], palace: 8, element: '火' },
  // 南方三山（離宮）
  { name: '丙', degrees: [157.5, 172.5], palace: 4, element: '火' },
  { name: '午', degrees: [172.5, 187.5], palace: 4, element: '火' },
  { name: '丁', degrees: [187.5, 202.5], palace: 4, element: '火' },
  // 西南三山（坤宮）
  { name: '未', degrees: [202.5, 217.5], palace: 6, element: '土' },
  { name: '坤', degrees: [217.5, 232.5], palace: 6, element: '土' },
  { name: '申', degrees: [232.5, 247.5], palace: 6, element: '金' },
  // 西方三山（兌宮）
  { name: '庚', degrees: [247.5, 262.5], palace: 2, element: '金' },
  { name: '酉', degrees: [262.5, 277.5], palace: 2, element: '金' },
  { name: '辛', degrees: [277.5, 292.5], palace: 2, element: '金' },
  // 西北三山（乾宮）
  { name: '戌', degrees: [292.5, 307.5], palace: 1, element: '土' },
  { name: '乾', degrees: [307.5, 322.5], palace: 1, element: '金' },
  { name: '亥', degrees: [322.5, 337.5], palace: 1, element: '水' },
];

// ============================================================
// 五、玄空飛星盤排列
// ============================================================

interface FlyingStarChart {
  yun: number;
  yunStar: number[];     // 運盤（元運星）
  mountainStar: number[]; // 山星（丁星）
  waterStar: number[];    // 向星（財星）
  sitting: string;        // 坐山
  facing: string;         // 朝向
  palaceAnalysis: PalaceAnalysis[];
  specialPattern: string | null;  // 特殊格局
  overallScore: number;
}

interface PalaceAnalysis {
  palace: string;
  yunStar: number;
  mountainStar: number;
  waterStar: number;
  combination: string;
  meaning: string;
  score: number;
}

function getCurrentYun(year: number): YunPeriod {
  for (const yun of SAN_YUAN_JIU_YUN) {
    if (year >= yun.startYear && year <= yun.endYear) return yun;
  }
  // 循環：超過2043年重新算
  const cycleYear = ((year - 1864) % 180) + 1864;
  return getCurrentYun(cycleYear);
}

/**
 * 判斷星的當令/失令
 * 當令星（旺星）= 當運之星
 * 生氣星 = 未來之星
 * 退氣星 = 過去之星
 * 死氣星 = 遠去之星
 * 煞氣星 = 五黃、二黑等凶星
 */
function getStarTimeliness(starNum: number, currentYun: number): { status: string; score: number } {
  if (starNum === currentYun) return { status: '當令旺星', score: 95 };

  // 生氣星（未來一兩運）
  const nextYun = (currentYun % 9) + 1;
  const nextNextYun = (nextYun % 9) + 1;
  if (starNum === nextYun) return { status: '生氣星（近未來）', score: 85 };
  if (starNum === nextNextYun) return { status: '生氣星（遠未來）', score: 75 };

  // 退氣星（過去一兩運）
  const prevYun = ((currentYun - 2 + 9) % 9) + 1;
  const prevPrevYun = ((prevYun - 2 + 9) % 9) + 1;
  if (starNum === prevYun) return { status: '退氣星', score: 45 };
  if (starNum === prevPrevYun) return { status: '衰氣星', score: 35 };

  // 凶星
  if (starNum === 5) return { status: '五黃大煞', score: 15 };
  if (starNum === 2) return { status: '病符星', score: 25 };
  if (starNum === 3) return { status: '是非星', score: 30 };
  if (starNum === 7 && currentYun !== 7) return { status: '退運破軍', score: 30 };

  return { status: '平運', score: 55 };
}

/**
 * 分析山星水星組合
 */
function analyzeCombination(mStar: number, wStar: number, currentYun: number): { meaning: string; score: number } {
  // 雙星到向（旺山旺向的一部分）
  if (mStar === currentYun && wStar === currentYun) {
    return { meaning: '雙星到位！旺丁旺財', score: 98 };
  }

  // 合十（山星+水星=10）
  if (mStar + wStar === 10) {
    return { meaning: '合十局，陰陽調和', score: 85 };
  }

  // 一四同宮（文昌）
  if ((mStar === 1 && wStar === 4) || (mStar === 4 && wStar === 1)) {
    return { meaning: '一四同宮，文昌大利考試升遷', score: 88 };
  }

  // 二五交加（大凶）
  if ((mStar === 2 && wStar === 5) || (mStar === 5 && wStar === 2)) {
    return { meaning: '二五交加，大凶！重病損丁', score: 10 };
  }

  // 三七疊加（被劫）
  if ((mStar === 3 && wStar === 7) || (mStar === 7 && wStar === 3)) {
    return { meaning: '三七疊臨，盜賊官非', score: 20 };
  }

  // 六八同宮
  if ((mStar === 6 && wStar === 8) || (mStar === 8 && wStar === 6)) {
    return { meaning: '六八同宮，武貴財旺', score: 85 };
  }

  // 九紫配一白
  if ((mStar === 9 && wStar === 1) || (mStar === 1 && wStar === 9)) {
    return { meaning: '水火既濟，聰明秀發', score: 82 };
  }

  // 當令星在此宮
  const mTimely = getStarTimeliness(mStar, currentYun);
  const wTimely = getStarTimeliness(wStar, currentYun);
  const avgScore = Math.round((mTimely.score + wTimely.score) / 2);

  return { meaning: `山${mStar}(${mTimely.status})+向${wStar}(${wTimely.status})`, score: avgScore };
}

/**
 * 判斷特殊格局
 */
function checkSpecialPatterns(chart: number[], mStars: number[], wStars: number[], yun: number): string | null {
  // 旺山旺向：山星到坐山宮位=當運星，向星到朝向宮位=當運星
  // 簡化判斷
  if (mStars[0] === yun && wStars[0] === yun) return '雙星會坐（需化解）';

  // 到山到向
  // 上山下水（凶）：山星跑到向方，向星跑到坐山

  // 令星入囚：當運星飛入中宮
  if (chart[0] === yun) return '令星入囚（運氣受限）';

  return null;
}

// ============================================================
// 六、主計算函數
// ============================================================

export function calculateXuanKong(input: BirthInfo, facingDegree?: number) {
  const currentYear = new Date().getFullYear();
  const yunPeriod = getCurrentYun(currentYear);
  const birthYunPeriod = getCurrentYun(parseInt(input.solarDate.split('-')[0]));

  // 運盤
  const yunStars = flyStars(yunPeriod.centralStar, true);

  // 如果沒有房屋朝向，用出生年推算一個預設分析
  const facing = facingDegree || ((parseInt(input.solarDate.split('-')[1]) * 30 + input.hour * 15) % 360);

  // 找到朝向所在的山
  let facingMountain = TWENTY_FOUR_MOUNTAINS[0];
  for (const m of TWENTY_FOUR_MOUNTAINS) {
    if (facing >= m.degrees[0] && facing < m.degrees[1]) {
      facingMountain = m;
      break;
    }
  }

  // 坐山 = 朝向 + 180
  const sittingDegree = (facing + 180) % 360;
  let sittingMountain = TWENTY_FOUR_MOUNTAINS[0];
  for (const m of TWENTY_FOUR_MOUNTAINS) {
    if (sittingDegree >= m.degrees[0] && sittingDegree < m.degrees[1]) {
      sittingMountain = m;
      break;
    }
  }

  // 山星盤（以坐山宮位的運星為入中星）
  const sittingPalaceYunStar = yunStars[sittingMountain.palace];
  const mountainStars = flyStars(sittingPalaceYunStar, true);

  // 向星盤（以朝向宮位的運星為入中星）
  const facingPalaceYunStar = yunStars[facingMountain.palace];
  const waterStars = flyStars(facingPalaceYunStar, true);

  // 九宮分析
  const palaceAnalysis: PalaceAnalysis[] = [];
  let totalScore = 0;

  for (let i = 0; i < 9; i++) {
    const combo = analyzeCombination(mountainStars[i], waterStars[i], yunPeriod.yun);
    palaceAnalysis.push({
      palace: PALACE_NAMES[i],
      yunStar: yunStars[i],
      mountainStar: mountainStars[i],
      waterStar: waterStars[i],
      combination: `${mountainStars[i]}-${waterStars[i]}`,
      meaning: combo.meaning,
      score: combo.score,
    });
    totalScore += combo.score;
  }

  const overallScore = Math.round(totalScore / 9);
  const specialPattern = checkSpecialPatterns(yunStars, mountainStars, waterStars, yunPeriod.yun);

  return {
    currentYun: yunPeriod,
    birthYun: birthYunPeriod,
    sitting: sittingMountain.name,
    facing: facingMountain.name,
    yunStars,
    mountainStars,
    waterStars,
    palaceAnalysis,
    specialPattern,
    overallScore,
    note: facingDegree ? '使用實際房屋朝向' : '⚠️ 預設推算朝向，請提供實際房屋坐向以獲得精準分析',
  };
}

// ============================================================
// 七、轉換為 SystemAnalysis
// ============================================================

export function xuankongToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateXuanKong(input);
  const traits: Trait[] = [];

  // 當前大運
  traits.push({
    label: `現在是${r.currentYun.yuan}${r.currentYun.yun}運（${r.currentYun.startYear}-${r.currentYun.endYear}）`,
    description: r.currentYun.description,
    score: 80,
    type: 'strength',
    dimension: 'career',
    source: 'xuankong',
  });

  // 出生大運
  traits.push({
    label: `你出生在${r.birthYun.yuan}${r.birthYun.yun}運`,
    description: r.birthYun.description,
    score: 75,
    type: 'strength',
    dimension: 'spiritual',
    source: 'xuankong',
  });

  // 九運特性（2024-2043）
  traits.push({
    label: '九紫離火運：文化、科技、女性崛起',
    description: '九運屬火，利文化創意、科技創新、美容美學、網紅經濟。女性能量旺，中年女性最受益。南方屬火，南方區位旺。',
    score: 85,
    type: 'strength',
    dimension: 'career',
    source: 'xuankong',
  });

  // 找出最好和最差的宮位
  const sorted = [...r.palaceAnalysis].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  traits.push({
    label: `最旺方位：${best.palace}（${best.combination}）`,
    description: best.meaning,
    score: best.score,
    type: 'strength',
    dimension: 'career',
    source: 'xuankong',
  });

  traits.push({
    label: `需避方位：${worst.palace}（${worst.combination}）`,
    description: worst.meaning,
    score: worst.score,
    type: 'weakness',
    dimension: 'health',
    source: 'xuankong',
  });

  // 特殊格局
  if (r.specialPattern) {
    traits.push({
      label: `特殊格局：${r.specialPattern}`,
      description: '此為玄空特殊格局，需要專業風水師實地勘察',
      score: 40,
      type: 'weakness',
      dimension: 'career',
      source: 'xuankong',
    });
  }

  // 提示
  traits.push({
    label: r.note,
    description: '玄空風水的精準度取決於房屋實際坐向（用羅盤量度）',
    score: 60,
    type: 'strength',
    dimension: 'spiritual',
    source: 'xuankong',
  });

  return {
    system: 'xuankong',
    systemName: '玄空飛星風水（正宗）',
    rawData: r,
    traits,
    timing: [{
      period: `${r.currentYun.startYear}-${r.currentYun.endYear}`,
      description: r.currentYun.description,
      quality: 'positive',
    }],
  };
}

// ====== CLI 測試 ======
if (require.main === module) {
  const input = { solarDate: '1993-08-07', hour: 9, gender: 'male' as const, name: '蔡寅衍' };
  const r = calculateXuanKong(input);
  
  console.log(`\n🏠 玄空飛星風水分析`);
  console.log('═'.repeat(50));
  console.log(`\n三元九運：${r.currentYun.yuan}${r.currentYun.yun}運（${r.currentYun.startYear}-${r.currentYun.endYear}）`);
  console.log(`運星：${r.currentYun.description}`);
  console.log(`出生運：${r.birthYun.yuan}${r.birthYun.yun}運`);
  console.log(`\n坐：${r.sitting}  向：${r.facing}  ${r.note}`);
  
  console.log(`\n九宮飛星盤：`);
  for (const p of r.palaceAnalysis) {
    const icon = p.score >= 80 ? '🟢' : p.score >= 50 ? '🟡' : '🔴';
    console.log(`  ${icon} ${p.palace}: 運${p.yunStar} 山${p.mountainStar} 向${p.waterStar} — ${p.meaning} (${p.score})`);
  }
  
  if (r.specialPattern) console.log(`\n⚠️ 特殊格局：${r.specialPattern}`);
  console.log(`\n📊 總評：${r.overallScore}/100`);
}
