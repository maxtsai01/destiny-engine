/**
 * 造命 ZaoMing — 姓名學模組
 * 
 * 基於三才五格姓名學：
 * - 天格（姓氏筆畫+1）
 * - 人格（姓氏+名字第一字）
 * - 地格（名字全部筆畫+1或相加）
 * - 外格（天格+地格-人格）
 * - 總格（全部筆畫相加）
 * 
 * 搭配五行、吉凶判斷
 */

import type { SystemAnalysis, Trait, LifeDimension, BirthInfo } from '../../core/types';

// ====== 康熙字典筆畫（姓名學用繁體筆畫）======

const KANGXI_STROKES: Record<string, number> = {
  // 常見姓氏
  '蔡': 17, '王': 4, '李': 7, '張': 11, '劉': 15, '陳': 16, '楊': 13,
  '黃': 12, '趙': 14, '吳': 7, '周': 8, '徐': 10, '孫': 10, '馬': 10,
  '胡': 11, '朱': 6, '郭': 15, '林': 8, '何': 7, '高': 10, '鄭': 19,
  '羅': 20, '梁': 11, '宋': 7, '唐': 10, '許': 11, '鄧': 19, '韓': 17,
  '馮': 12, '曹': 11, '彭': 12, '曾': 12, '蕭': 18, '田': 5, '董': 15,
  '潘': 16, '袁': 10, '蔣': 17, '方': 4, '石': 5, '廖': 14, '紀': 9,
  
  // 常見名字用字
  '寅': 11, '衍': 9, '宇': 6, '軒': 10, '明': 8, '杰': 12, '凱': 12,
  '德': 15, '志': 7, '偉': 11, '俊': 9, '建': 9, '文': 4, '華': 14,
  '國': 11, '強': 11, '民': 5, '家': 10, '豪': 14, '嘉': 14, '瑋': 14,
  '翔': 12, '龍': 16, '鳳': 14, '玉': 5, '美': 9, '麗': 19, '芳': 10,
  '英': 11, '秀': 7, '雲': 12, '霞': 17, '春': 9, '冬': 5, '夏': 10,
  '秋': 9, '海': 11, '山': 3, '江': 7, '河': 9, '天': 4, '地': 6,
  '日': 4, '月': 4, '星': 9, '光': 6, '雨': 8, '風': 9, '雷': 13,
  '電': 13, '火': 4, '水': 4, '木': 4, '金': 8, '土': 3, '石': 5,
  '心': 4, '愛': 13, '信': 9, '義': 13, '禮': 18, '智': 12, '仁': 4,
  '忠': 8, '孝': 7, '勇': 9, '誠': 14, '正': 5, '安': 6, '平': 5,
  '福': 14, '祿': 13, '壽': 14, '喜': 12, '財': 10, '富': 12,
  '成': 7, '功': 5, '業': 13, '達': 16, '進': 15, '昌': 8, '盛': 12,
  '興': 16, '旺': 8, '發': 12, '貴': 12, '榮': 14,
};

/**
 * 取得康熙筆畫數（查表，未找到用估算）
 */
function getStrokes(char: string): number {
  if (KANGXI_STROKES[char]) return KANGXI_STROKES[char];
  // 未找到的字，返回 0 並標記
  console.warn(`⚠️ 字典未收錄「${char}」，請手動補充康熙筆畫`);
  return 0;
}

// ====== 五格計算 ======

export interface NameAnalysis {
  name: string;
  surname: string;
  givenName: string;
  strokes: number[];          // 每個字的筆畫
  tianGe: number;             // 天格
  renGe: number;              // 人格
  diGe: number;               // 地格
  waiGe: number;              // 外格
  zongGe: number;             // 總格
  tianGeWuxing: string;       // 天格五行
  renGeWuxing: string;        // 人格五行
  diGeWuxing: string;         // 地格五行
  waiGeWuxing: string;        // 外格五行
  zongGeWuxing: string;       // 總格五行
  sanCai: string;             // 三才配置
  sanCaiWuxing: string;       // 三才五行
  geAnalysis: GeAnalysis[];   // 各格分析
  overallScore: number;       // 總分
}

interface GeAnalysis {
  name: string;
  number: number;
  wuxing: string;
  luck: '大吉' | '吉' | '半吉' | '凶' | '大凶';
  meaning: string;
  dimension: LifeDimension;
}

/**
 * 數字對應五行
 * 1,2=木  3,4=火  5,6=土  7,8=金  9,0=水
 */
function numberToWuxing(n: number): string {
  const lastDigit = n % 10;
  if (lastDigit === 1 || lastDigit === 2) return '木';
  if (lastDigit === 3 || lastDigit === 4) return '火';
  if (lastDigit === 5 || lastDigit === 6) return '土';
  if (lastDigit === 7 || lastDigit === 8) return '金';
  return '水'; // 9, 0
}

/**
 * 格數吉凶判斷（81 數理基礎版）
 */
function getGeLuck(n: number): { luck: '大吉' | '吉' | '半吉' | '凶' | '大凶'; meaning: string } {
  // 81 數理循環
  const num = n > 81 ? n % 80 : n;
  
  // 大吉數
  const daJi = [1, 3, 5, 6, 7, 8, 11, 13, 15, 16, 17, 18, 21, 23, 24, 25, 29, 31, 32, 33, 35, 37, 39, 41, 45, 47, 48, 52, 57, 61, 63, 65, 67, 68, 81];
  // 吉數
  const ji = [6, 8, 16, 18, 25, 35, 38, 45, 48, 52, 57, 61, 63, 65, 67, 68, 73, 75];
  // 凶數
  const xiong = [2, 4, 9, 10, 12, 14, 19, 20, 22, 26, 27, 28, 30, 34, 36, 40, 42, 43, 44, 46, 49, 50, 53, 54, 55, 56, 58, 59, 60, 62, 64, 66, 69, 70, 71, 72, 74, 76, 77, 78, 79, 80];

  // 經典數理解釋（精選）
  const meanings: Record<number, string> = {
    1: '宇宙起源，天地開泰，萬物創始之象',
    3: '進取如意，增長繁榮，名利雙收',
    5: '福祿長壽，陰陽和合，循環相生',
    7: '精力旺盛，剛毅果斷，獨立權威',
    8: '意志剛健，勤勉發展，富於進取',
    11: '春日花開，萬事如意，平穩發展',
    13: '天賦才藝，智謀超群，善於巧辯',
    15: '福壽圓滿，富貴榮譽，涵養雅量',
    16: '厚重載德，安富尊榮，貴人得助',
    17: '剛柔兼備，突破萬難，事業有成',
    18: '有志竟成，權威顯達，博得名利',
    21: '光風霽月，獨立權威，領導才能',
    23: '旭日東昇，鸞鳳相會，名聞天下',
    24: '錦繡前程，家門餘慶，財源廣進',
    25: '英俊剛毅，資性英敏，才能奇特',
    27: '自我意識強，欲望過高，宜慎獨行',
    28: '家親緣薄，豪傑氣概，終身辛勞',
    29: '智謀超群，財力歸集，成就大業',
    31: '智勇得志，春日花開，名利雙收',
    32: '貴人得助，天賜吉運，平步青雲',
    33: '旭日升天，家門隆昌，才德兼備',
    35: '溫良和順，智達通暢，優雅和平',
    37: '權威顯達，富貴長壽，獨佔鰲頭',
  };

  if (daJi.includes(num)) {
    return { luck: '大吉', meaning: meanings[num] || '吉祥亨通，前途光明' };
  }
  if (ji.includes(num)) {
    return { luck: '吉', meaning: meanings[num] || '平順發展，穩步前進' };
  }
  if (xiong.includes(num)) {
    return { luck: '凶', meaning: meanings[num] || '波折較多，需謹慎行事' };
  }
  return { luck: '半吉', meaning: meanings[num] || '吉凶參半，把握機會' };
}

/**
 * 三才五行相生相剋分析
 */
function analyzeSanCai(tian: string, ren: string, di: string): { score: number; analysis: string } {
  // 五行相生：木→火→土→金→水→木
  const sheng: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  // 五行相剋：木→土→水→火→金→木
  const ke: Record<string, string> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };

  let score = 60;
  let analysis = '';

  // 天→人 關係
  if (sheng[tian] === ren) {
    score += 15;
    analysis += `天格${tian}生人格${ren}，長輩貴人運佳；`;
  } else if (ke[tian] === ren) {
    score -= 10;
    analysis += `天格${tian}剋人格${ren}，早年較辛苦；`;
  } else if (tian === ren) {
    score += 10;
    analysis += `天格人格同為${tian}，自我能量強大；`;
  }

  // 人→地 關係
  if (sheng[ren] === di) {
    score += 15;
    analysis += `人格${ren}生地格${di}，晚年運勢佳；`;
  } else if (ke[ren] === di) {
    score -= 10;
    analysis += `人格${ren}剋地格${di}，下屬/晚輩關係需注意；`;
  } else if (ren === di) {
    score += 10;
    analysis += `人格地格同為${ren}，基礎穩固；`;
  }

  // 天→地 關係
  if (sheng[tian] === di) {
    score += 5;
    analysis += `天地相生，整體運勢順暢。`;
  } else if (ke[tian] === di) {
    score -= 5;
    analysis += `天地相剋，需靠人格調和。`;
  }

  return { score: Math.max(20, Math.min(100, score)), analysis };
}

// ====== 主函數 ======

/**
 * 計算姓名學五格
 */
export function calculateName(fullName: string, surnameLength: number = 1): NameAnalysis {
  const chars = [...fullName];
  const surname = chars.slice(0, surnameLength).join('');
  const givenName = chars.slice(surnameLength).join('');
  
  const strokes = chars.map(c => getStrokes(c));
  const surnameStrokes = strokes.slice(0, surnameLength).reduce((a, b) => a + b, 0);
  const givenStrokes = strokes.slice(surnameLength);
  
  // 五格計算（單姓雙名）
  let tianGe: number, renGe: number, diGe: number, waiGe: number, zongGe: number;
  
  if (surnameLength === 1 && givenName.length === 2) {
    // 單姓雙名（最常見）
    tianGe = surnameStrokes + 1;                              // 姓 + 1
    renGe = surnameStrokes + givenStrokes[0];                 // 姓 + 名1
    diGe = givenStrokes[0] + givenStrokes[1];                 // 名1 + 名2
    zongGe = surnameStrokes + givenStrokes[0] + givenStrokes[1]; // 全部
    waiGe = zongGe - renGe + 1;                               // 總 - 人 + 1
  } else if (surnameLength === 1 && givenName.length === 1) {
    // 單姓單名
    tianGe = surnameStrokes + 1;
    renGe = surnameStrokes + givenStrokes[0];
    diGe = givenStrokes[0] + 1;
    zongGe = surnameStrokes + givenStrokes[0];
    waiGe = 2; // 單名外格固定為 2
  } else if (surnameLength === 2 && givenName.length === 2) {
    // 雙姓雙名
    tianGe = strokes[0] + strokes[1];
    renGe = strokes[1] + strokes[2];
    diGe = strokes[2] + strokes[3];
    zongGe = strokes.reduce((a, b) => a + b, 0);
    waiGe = strokes[0] + strokes[3];
  } else {
    // 其他情況（簡化處理）
    tianGe = surnameStrokes + 1;
    renGe = surnameStrokes + (givenStrokes[0] || 0);
    diGe = givenStrokes.reduce((a, b) => a + b, 0) + (givenName.length === 0 ? 1 : 0);
    zongGe = strokes.reduce((a, b) => a + b, 0);
    waiGe = Math.abs(zongGe - renGe) + 1;
  }

  const tianGeWuxing = numberToWuxing(tianGe);
  const renGeWuxing = numberToWuxing(renGe);
  const diGeWuxing = numberToWuxing(diGe);
  const waiGeWuxing = numberToWuxing(waiGe);
  const zongGeWuxing = numberToWuxing(zongGe);

  // 各格分析
  const geAnalysis: GeAnalysis[] = [
    { name: '天格', number: tianGe, wuxing: tianGeWuxing, ...getGeLuck(tianGe), dimension: 'family' as LifeDimension },
    { name: '人格', number: renGe, wuxing: renGeWuxing, ...getGeLuck(renGe), dimension: 'career' as LifeDimension },
    { name: '地格', number: diGe, wuxing: diGeWuxing, ...getGeLuck(diGe), dimension: 'relationship' as LifeDimension },
    { name: '外格', number: waiGe, wuxing: waiGeWuxing, ...getGeLuck(waiGe), dimension: 'social' as LifeDimension },
    { name: '總格', number: zongGe, wuxing: zongGeWuxing, ...getGeLuck(zongGe), dimension: 'spiritual' as LifeDimension },
  ];

  // 三才分析
  const sanCaiResult = analyzeSanCai(tianGeWuxing, renGeWuxing, diGeWuxing);

  // 總分計算
  const luckScores = { '大吉': 95, '吉': 80, '半吉': 60, '凶': 35, '大凶': 15 };
  const avgGe = geAnalysis.reduce((sum, g) => sum + luckScores[g.luck], 0) / geAnalysis.length;
  const overallScore = Math.round(avgGe * 0.6 + sanCaiResult.score * 0.4);

  return {
    name: fullName,
    surname,
    givenName,
    strokes,
    tianGe, renGe, diGe, waiGe, zongGe,
    tianGeWuxing, renGeWuxing, diGeWuxing, waiGeWuxing, zongGeWuxing,
    sanCai: `${tianGeWuxing}-${renGeWuxing}-${diGeWuxing}`,
    sanCaiWuxing: sanCaiResult.analysis,
    geAnalysis,
    overallScore,
  };
}

/**
 * 轉換為 SystemAnalysis 格式（統一介面）
 */
export function nameToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  if (!input.name) {
    return {
      system: 'name',
      systemName: '姓名學',
      rawData: {},
      traits: [],
      timing: [],
    };
  }

  const analysis = calculateName(input.name);
  const traits: Trait[] = [];

  for (const ge of analysis.geAnalysis) {
    const isStrength = ge.luck === '大吉' || ge.luck === '吉';
    traits.push({
      label: `${ge.name}${ge.number}（${ge.wuxing}）— ${ge.luck}`,
      description: ge.meaning,
      score: ge.luck === '大吉' ? 90 : ge.luck === '吉' ? 75 : ge.luck === '半吉' ? 55 : 30,
      type: isStrength ? 'strength' : 'weakness',
      dimension: ge.dimension,
      source: 'name',
    });
  }

  // 三才配置作為額外 trait
  traits.push({
    label: `三才配置 ${analysis.sanCai}`,
    description: analysis.sanCaiWuxing,
    score: analysis.overallScore,
    type: analysis.overallScore >= 70 ? 'strength' : 'weakness',
    dimension: 'spiritual',
    source: 'name',
  });

  return {
    system: 'name',
    systemName: '姓名學（三才五格）',
    rawData: analysis,
    traits,
    timing: [],
  };
}

// ====== CLI 測試 ======

if (require.main === module) {
  const name = process.argv[2] || '蔡寅衍';
  const result = calculateName(name);
  
  console.log(`\n🔤 姓名學分析：${name}`);
  console.log('═'.repeat(50));
  console.log(`\n筆畫：${result.strokes.join(' + ')} = ${result.strokes.reduce((a, b) => a + b, 0)}`);
  console.log(`\n五格：`);
  for (const ge of result.geAnalysis) {
    const icon = ge.luck === '大吉' ? '🌟' : ge.luck === '吉' ? '✅' : ge.luck === '半吉' ? '⚠️' : '❌';
    console.log(`  ${icon} ${ge.name}: ${ge.number}（${ge.wuxing}）— ${ge.luck}`);
    console.log(`     ${ge.meaning}`);
  }
  console.log(`\n三才配置：${result.sanCai}`);
  console.log(`三才分析：${result.sanCaiWuxing}`);
  console.log(`\n📊 姓名總分：${result.overallScore}/100`);
}
