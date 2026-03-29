/**
 * 造命 ZaoMing — 奇門遁甲（正宗時家奇門·飛盤式置閏法）
 * 
 * 理論源頭：
 * - 《奇門遁甲統宗》：明代整理的奇門經典
 * - 《煙波釣叟歌》：奇門起局口訣
 * - 轉盤派（主流）：地盤固定，天盤轉動
 * 
 * 核心結構：
 * - 天盤（九星）：天蓬天芮天沖天輔天禽天心天柱天任天英
 * - 地盤（八門）：休生傷杜景死驚開
 * - 人盤（八神）：值符螣蛇太陰六合白虎玄武九地九天
 * - 三奇六儀：甲（遁入六儀）+ 乙丙丁（三奇）+ 戊己庚辛壬癸（六儀）
 * - 十八格局：吉格9 + 凶格9
 * 
 * 排局步驟：
 * 1. 定陽遁/陰遁（冬至後陽遁，夏至後陰遁）
 * 2. 用節氣+置閏法定局數（1-18局）
 * 3. 旬首遁甲入六儀
 * 4. 值符值使隨時干轉動
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

// @ts-ignore
import { Solar } from 'lunar-javascript';

// ============================================================
// 一、基礎數據
// ============================================================

// 九星（天盤）
const NINE_STARS = [
  { num: 1, name: '天蓬', element: '水', nature: '智謀多端', palace: '坎一', timely: '智慧過人、善於策劃', untimely: '好色淫慾、陰險狡詐' },
  { num: 2, name: '天芮', element: '土', nature: '厚重包容', palace: '坤二', timely: '醫者仁心、厚德載物', untimely: '疾病纏身、陰晦不明' },
  { num: 3, name: '天沖', element: '木', nature: '果敢衝鋒', palace: '震三', timely: '勇猛果斷、開拓進取', untimely: '衝動魯莽、是非口舌' },
  { num: 4, name: '天輔', element: '木', nature: '文昌善教', palace: '巽四', timely: '文章蓋世、學識淵博', untimely: '固執己見、虛浮不實' },
  { num: 5, name: '天禽', element: '土', nature: '中宮坐鎮', palace: '中五', timely: '運籌帷幄、掌控大局', untimely: '五黃煞、災禍不斷' },
  { num: 6, name: '天心', element: '金', nature: '醫藥救人', palace: '乾六', timely: '領導力強、正氣浩然', untimely: '固執專制、孤高自傲' },
  { num: 7, name: '天柱', element: '金', nature: '口才犀利', palace: '兌七', timely: '辯才無礙、以口為業', untimely: '口舌是非、陰謀詭計' },
  { num: 8, name: '天任', element: '土', nature: '穩重持家', palace: '艮八', timely: '誠實守信、穩步上升', untimely: '保守遲緩、錯失良機' },
  { num: 9, name: '天英', element: '火', nature: '光明智慧', palace: '離九', timely: '才華橫溢、名聲遠播', untimely: '虛榮浮華、衝動急躁' },
];

// 八門（地盤）
const EIGHT_GATES = [
  { name: '休門', element: '水', palace: 1, nature: '休養生息', luck: '吉', action: '宜休養、謀劃、暗中準備、求貴人' },
  { name: '生門', element: '土', palace: 8, nature: '生機蓬勃', luck: '大吉', action: '宜創業、投資、開始新事物、求財' },
  { name: '傷門', element: '木', palace: 3, nature: '傷害破壞', luck: '凶', action: '宜競爭、打官司、拆除舊物、索債' },
  { name: '杜門', element: '木', palace: 4, nature: '杜塞阻隔', luck: '凶', action: '宜隱藏、防守、保密、躲避' },
  { name: '景門', element: '火', palace: 9, nature: '光明正大', luck: '中', action: '宜考試、面試、發表、宣傳、血光' },
  { name: '死門', element: '土', palace: 2, nature: '死氣沈沈', luck: '大凶', action: '宜弔喪、結束、埋葬、修墓。百事不宜' },
  { name: '驚門', element: '金', palace: 7, nature: '驚恐不安', luck: '凶', action: '宜示警、驚嚇、律師、偵查' },
  { name: '開門', element: '金', palace: 6, nature: '開通順達', luck: '大吉', action: '宜開業、求職、拜訪、出行、嫁娶' },
];

// 八神（人盤）
const EIGHT_GODS = [
  { name: '值符', nature: '貴人星、百事皆吉', luck: 95 },
  { name: '螣蛇', nature: '驚恐怪異、虛驚一場', luck: 35 },
  { name: '太陰', nature: '陰私暗助、貴人隱形', luck: 78 },
  { name: '六合', nature: '和合共贏、合作順利', luck: 88 },
  { name: '白虎', nature: '兇險威猛、血光刑傷', luck: 25 },
  { name: '玄武', nature: '暗中欺詐、盜賊小人', luck: 20 },
  { name: '九地', nature: '穩重守成、堅守不動', luck: 72 },
  { name: '九天', nature: '高遠進取、大膽行動', luck: 82 },
];

// 三奇六儀
const SAN_QI = ['乙', '丙', '丁'] as const; // 三奇
const LIU_YI = ['戊', '己', '庚', '辛', '壬', '癸'] as const; // 六儀
// 排列順序（陽遁）：戊己庚辛壬癸丁丙乙
const YANG_DUN_ORDER = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];
// 排列順序（陰遁）：反轉
const YIN_DUN_ORDER = ['乙', '丙', '丁', '癸', '壬', '辛', '庚', '己', '戊'];

// ============================================================
// 二、二十四節氣定局
// ============================================================

// 每個節氣對應的局數（陽遁用上元，陰遁用上元）
// 陽遁：冬至→芒種（1-9局遞增）
// 陰遁：夏至→大雪（9-1局遞減）
interface JieQiJu {
  name: string;
  yangDun: boolean;
  upperJu: number;    // 上元局數
  middleJu: number;   // 中元局數
  lowerJu: number;    // 下元局數
}

const JIEQI_JU: JieQiJu[] = [
  // 陽遁（冬至起）
  { name: '冬至', yangDun: true, upperJu: 1, middleJu: 7, lowerJu: 4 },
  { name: '小寒', yangDun: true, upperJu: 2, middleJu: 8, lowerJu: 5 },
  { name: '大寒', yangDun: true, upperJu: 3, middleJu: 9, lowerJu: 6 },
  { name: '立春', yangDun: true, upperJu: 8, middleJu: 5, lowerJu: 2 },
  { name: '雨水', yangDun: true, upperJu: 9, middleJu: 6, lowerJu: 3 },
  { name: '驚蟄', yangDun: true, upperJu: 1, middleJu: 7, lowerJu: 4 },
  { name: '春分', yangDun: true, upperJu: 3, middleJu: 9, lowerJu: 6 },
  { name: '清明', yangDun: true, upperJu: 4, middleJu: 1, lowerJu: 7 },
  { name: '穀雨', yangDun: true, upperJu: 5, middleJu: 2, lowerJu: 8 },
  { name: '立夏', yangDun: true, upperJu: 4, middleJu: 1, lowerJu: 7 },
  { name: '小滿', yangDun: true, upperJu: 5, middleJu: 2, lowerJu: 8 },
  { name: '芒種', yangDun: true, upperJu: 6, middleJu: 3, lowerJu: 9 },
  // 陰遁（夏至起）
  { name: '夏至', yangDun: false, upperJu: 9, middleJu: 3, lowerJu: 6 },
  { name: '小暑', yangDun: false, upperJu: 8, middleJu: 2, lowerJu: 5 },
  { name: '大暑', yangDun: false, upperJu: 7, middleJu: 1, lowerJu: 4 },
  { name: '立秋', yangDun: false, upperJu: 2, middleJu: 5, lowerJu: 8 },
  { name: '處暑', yangDun: false, upperJu: 1, middleJu: 4, lowerJu: 7 },
  { name: '白露', yangDun: false, upperJu: 9, middleJu: 3, lowerJu: 6 },
  { name: '秋分', yangDun: false, upperJu: 7, middleJu: 1, lowerJu: 4 },
  { name: '寒露', yangDun: false, upperJu: 6, middleJu: 9, lowerJu: 3 },
  { name: '霜降', yangDun: false, upperJu: 5, middleJu: 8, lowerJu: 2 },
  { name: '立冬', yangDun: false, upperJu: 6, middleJu: 9, lowerJu: 3 },
  { name: '小雪', yangDun: false, upperJu: 5, middleJu: 8, lowerJu: 2 },
  { name: '大雪', yangDun: false, upperJu: 4, middleJu: 7, lowerJu: 1 },
];

// ============================================================
// 三、十八格局（吉格9 + 凶格9）
// ============================================================

interface QimenPattern {
  name: string;
  type: 'ji' | 'xiong'; // 吉/凶
  condition: string;
  description: string;
  score: number;
}

const QIMEN_PATTERNS: QimenPattern[] = [
  // 九大吉格
  { name: '乙奇得使', type: 'ji', condition: '乙+開門', description: '玉女守門，百事皆吉', score: 92 },
  { name: '丙奇得使', type: 'ji', condition: '丙+休門', description: '威權顯赫、官運亨通', score: 90 },
  { name: '丁奇得使', type: 'ji', condition: '丁+生門', description: '文昌貴人、考試大吉', score: 88 },
  { name: '天遁', type: 'ji', condition: '丙+生門+天輔', description: '天遁吉格、百事大吉', score: 95 },
  { name: '地遁', type: 'ji', condition: '乙+開門+九地', description: '地遁吉格、宜守不宜攻', score: 85 },
  { name: '人遁', type: 'ji', condition: '丁+休門+太陰', description: '人遁吉格、貴人暗助', score: 88 },
  { name: '神遁', type: 'ji', condition: '丙+九天+生門', description: '神遁吉格、如有神助', score: 93 },
  { name: '龍遁', type: 'ji', condition: '乙+休門+六合', description: '龍遁吉格、合作大吉', score: 90 },
  { name: '虎遁', type: 'ji', condition: '辛+生門+太陰', description: '虎遁吉格、威猛成功', score: 85 },
  // 九大凶格
  { name: '青龍逃走', type: 'xiong', condition: '乙+死門', description: '乙奇入死門、百事皆凶', score: 15 },
  { name: '白虎猖狂', type: 'xiong', condition: '庚+開門/生門', description: '白虎猖狂、血光之災', score: 12 },
  { name: '螣蛇夭矯', type: 'xiong', condition: '丁+驚門+螣蛇', description: '虛驚不實、驚恐不安', score: 20 },
  { name: '太白入熒', type: 'xiong', condition: '庚+景門', description: '太白入熒、奸人陷害', score: 18 },
  { name: '熒入太白', type: 'xiong', condition: '丙+死門+白虎', description: '火入金鄉、兵敗財破', score: 15 },
  { name: '大格', type: 'xiong', condition: '庚+壬', description: '大格凶星、行人不歸', score: 22 },
  { name: '小格', type: 'xiong', condition: '庚+癸', description: '小格凶星、陰人暗害', score: 25 },
  { name: '刑格', type: 'xiong', condition: '庚+己', description: '刑格凶星、官司牢獄', score: 20 },
  { name: '悖格', type: 'xiong', condition: '辛+壬', description: '悖格凶星、悖逆失序', score: 22 },
];

// ============================================================
// 四、排局核心
// ============================================================

// 六十甲子旬首
const XUN_SHOU = [
  { start: '甲子', hide: '戊', range: ['甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳'] },
  { start: '甲戌', hide: '己', range: ['甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯'] },
  { start: '甲申', hide: '庚', range: ['甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑'] },
  { start: '甲午', hide: '辛', range: ['甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥'] },
  { start: '甲辰', hide: '壬', range: ['甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉'] },
  { start: '甲寅', hide: '癸', range: ['甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未'] },
];

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function getGanZhi(ganIdx: number, zhiIdx: number): string {
  return TIAN_GAN[ganIdx % 10] + DI_ZHI[zhiIdx % 12];
}

function findXunShou(timeGanZhi: string) {
  const ganIdx = TIAN_GAN.indexOf(timeGanZhi[0]);
  const zhiIdx = DI_ZHI.indexOf(timeGanZhi[1]);
  // 往回推到甲X
  const diff = ganIdx; // 距離甲幾步
  const xunGanIdx = 0; // 甲
  const xunZhiIdx = ((zhiIdx - diff) % 12 + 12) % 12;
  const xunShou = '甲' + DI_ZHI[xunZhiIdx];
  
  for (const xun of XUN_SHOU) {
    if (xun.start === xunShou) return xun;
  }
  return XUN_SHOU[0];
}

export interface QimenResult {
  yangDun: boolean;           // 陽遁/陰遁
  juNumber: number;           // 局數
  jieQi: string;              // 所在節氣
  timeGanZhi: string;         // 時干支
  xunShou: string;            // 旬首
  dunJia: string;             // 遁甲（甲遁入哪個儀）
  star: typeof NINE_STARS[number];    // 值符（九星）
  gate: typeof EIGHT_GATES[number];   // 值使（八門）
  god: typeof EIGHT_GODS[number];     // 八神
  sanQiLiuYi: string;        // 時干所帶的奇儀
  patterns: QimenPattern[];   // 匹配到的格局
  palaceChart: { palace: number; star: string; gate: string; god: string; tiangan: string }[];
  overallScore: number;
  advice: string;
}

export function calculateQimen(input: BirthInfo): QimenResult {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const hour = input.hour;
  
  // 用 lunar-javascript 取節氣信息
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  
  // 取當前節氣
  let currentJieQi = '大暑'; // 預設
  let jqIdx = 0;
  try {
    const jq = lunar.getPrevJieQi();
    if (jq) currentJieQi = jq.getName();
  } catch {}
  
  // 找到對應的局數配置
  let juConfig = JIEQI_JU.find(j => j.name === currentJieQi);
  if (!juConfig) {
    // fallback：用月份估算
    const monthIdx = month - 1;
    juConfig = JIEQI_JU[monthIdx * 2 % 24];
  }
  
  const yangDun = juConfig.yangDun;
  
  // 置閏法定上中下元：距離前一節氣的天數，每 5 天一元
  let diffDays = 0;
  try {
    const prevJQ = lunar.getPrevQi(); // 用「氣」（春分、穀雨等）
    if (prevJQ && prevJQ.getSolar()) {
      const jqSolar = prevJQ.getSolar();
      diffDays = Math.floor(solar.getJulianDay() - Solar.fromYmd(
        jqSolar.getYear(), jqSolar.getMonth(), jqSolar.getDay()
      ).getJulianDay());
    }
  } catch {
    // fallback
    diffDays = (day - 1) % 15;
  }
  const yuan = diffDays < 5 ? 'upper' : diffDays < 10 ? 'middle' : 'lower';
  const juNumber = yuan === 'upper' ? juConfig.upperJu 
    : yuan === 'middle' ? juConfig.middleJu 
    : juConfig.lowerJu;
  
  // 時干支
  const eightChar = lunar.getEightChar();
  const dayGanIdx = TIAN_GAN.indexOf(eightChar.getDayGan());
  const hourZhiIdx = Math.floor(hour / 2) % 12;
  const hourGanIdx = (dayGanIdx % 5 * 2 + hourZhiIdx) % 10;
  const timeGanZhi = TIAN_GAN[hourGanIdx] + DI_ZHI[hourZhiIdx];
  
  // 找旬首
  const xun = findXunShou(timeGanZhi);
  
  // 遁甲：甲遁入的六儀
  const dunJia = xun.hide;
  
  // 時干在九宮的位置（根據局數和陽遁/陰遁排列）
  const order = yangDun ? YANG_DUN_ORDER : YIN_DUN_ORDER;
  const timeGan = timeGanZhi[0];
  
  // 值符（跟隨時干的九星）
  // 值符原則：旬首所在宮的九星為值符
  const dunJiaIdx = order.indexOf(dunJia);
  const startPalace = (juNumber - 1 + dunJiaIdx) % 9; // 遁甲落宮
  const zhiFuStar = NINE_STARS[startPalace];
  
  // 值使（跟隨時干的八門）
  const zhiShiGate = EIGHT_GATES[startPalace % 8];
  
  // 八神（根據時干陰陽決定順逆）
  const isYangGan = hourGanIdx % 2 === 0;
  const godIdx = isYangGan ? (startPalace % 8) : ((8 - startPalace % 8) % 8);
  const zhiGod = EIGHT_GODS[godIdx];
  
  // 排九宮盤
  const palaceChart = [];
  for (let i = 0; i < 9; i++) {
    const starIdx = yangDun ? (juNumber - 1 + i) % 9 : ((juNumber - 1 - i + 18) % 9);
    const gateIdx = yangDun ? (juNumber - 1 + i) % 8 : ((juNumber - 1 - i + 16) % 8);
    const gIdx = isYangGan ? (i % 8) : ((8 - i) % 8);
    palaceChart.push({
      palace: i + 1,
      star: NINE_STARS[starIdx].name,
      gate: EIGHT_GATES[gateIdx].name,
      god: EIGHT_GODS[gIdx].name,
      tiangan: order[i] || '戊',
    });
  }

  // 三奇六儀
  const timeGanInOrder = order.indexOf(timeGan);
  const sanQiLiuYi = timeGan + (SAN_QI.includes(timeGan as any) ? '（三奇）' : '（六儀）');
  
  // 格局判斷
  const matchedPatterns: QimenPattern[] = [];
  
  // 簡化格局匹配
  for (const p of QIMEN_PATTERNS) {
    if (p.condition.includes(timeGan) && p.condition.includes(zhiShiGate.name)) {
      matchedPatterns.push(p);
    }
    if (p.condition.includes(timeGan) && p.condition.includes(zhiFuStar.name)) {
      matchedPatterns.push(p);
    }
    if (p.condition.includes(timeGan) && p.condition.includes(zhiGod.name)) {
      matchedPatterns.push(p);
    }
  }
  
  // 計算總分
  let baseScore = 50;
  
  // 吉門加分
  if (['休門', '生門', '開門'].includes(zhiShiGate.name)) baseScore += 15;
  if (['景門'].includes(zhiShiGate.name)) baseScore += 5;
  if (['死門', '驚門', '傷門'].includes(zhiShiGate.name)) baseScore -= 15;
  
  // 值符加分
  if (zhiGod.luck >= 80) baseScore += 10;
  if (zhiGod.luck <= 30) baseScore -= 10;
  
  // 三奇加分
  if (SAN_QI.includes(timeGan as any)) baseScore += 10;
  
  // 格局加分
  for (const p of matchedPatterns) {
    baseScore += p.type === 'ji' ? 10 : -10;
  }
  
  const overallScore = Math.max(10, Math.min(100, baseScore));
  
  // 建議
  const advice = generateAdvice(zhiFuStar, zhiShiGate, zhiGod, matchedPatterns, overallScore);
  
  return {
    yangDun, juNumber, jieQi: currentJieQi, timeGanZhi, 
    xunShou: xun.start, dunJia,
    star: zhiFuStar, gate: zhiShiGate, god: zhiGod,
    sanQiLiuYi, patterns: matchedPatterns, palaceChart,
    overallScore, advice,
  };
}

function generateAdvice(star: any, gate: any, god: any, patterns: QimenPattern[], score: number): string {
  const parts: string[] = [];
  
  parts.push(`值符${star.name}（${star.element}）：${score >= 60 ? star.timely : star.untimely}`);
  parts.push(`值使${gate.name}：${gate.action}`);
  
  if (patterns.length > 0) {
    const jiPatterns = patterns.filter(p => p.type === 'ji');
    const xiongPatterns = patterns.filter(p => p.type === 'xiong');
    if (jiPatterns.length > 0) parts.push(`吉格：${jiPatterns.map(p => p.name).join('、')} — ${jiPatterns[0].description}`);
    if (xiongPatterns.length > 0) parts.push(`凶格：${xiongPatterns.map(p => p.name).join('、')} — ${xiongPatterns[0].description}`);
  }
  
  return parts.join('。');
}

// ============================================================
// 五、轉為統一格式
// ============================================================

export function qimenToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateQimen(input);
  const traits: Trait[] = [];
  
  // 基本局資訊
  traits.push({
    label: `${r.yangDun ? '陽' : '陰'}遁${r.juNumber}局（${r.jieQi}）`,
    description: `時干支：${r.timeGanZhi}，旬首：${r.xunShou}，遁甲入${r.dunJia}`,
    score: r.overallScore,
    type: 'neutral',
    dimension: 'spiritual',
    source: 'qimen',
  });

  // 值符九星
  traits.push({
    label: `值符：${r.star.name}（${r.star.element}）`,
    description: r.overallScore >= 60 ? r.star.timely : r.star.untimely,
    score: r.overallScore >= 60 ? 80 : 40,
    type: r.overallScore >= 60 ? 'strength' : 'weakness',
    dimension: 'career',
    source: 'qimen',
  });

  // 值使八門
  traits.push({
    label: `值使：${r.gate.name}（${r.gate.luck}）`,
    description: `${r.gate.nature}。${r.gate.action}`,
    score: r.gate.luck === '大吉' ? 90 : r.gate.luck === '吉' ? 80 : r.gate.luck === '中' ? 60 : 30,
    type: r.gate.luck === '大吉' || r.gate.luck === '吉' ? 'strength' : 'weakness',
    dimension: 'career',
    source: 'qimen',
  });

  // 八神
  traits.push({
    label: `八神：${r.god.name}`,
    description: r.god.nature,
    score: r.god.luck,
    type: r.god.luck >= 65 ? 'strength' : 'weakness',
    dimension: 'social',
    source: 'qimen',
  });

  // 三奇六儀
  traits.push({
    label: `時干：${r.sanQiLiuYi}`,
    description: SAN_QI.includes(r.timeGanZhi[0] as any) ? '得三奇，天助之象' : '六儀配局',
    score: SAN_QI.includes(r.timeGanZhi[0] as any) ? 85 : 55,
    type: SAN_QI.includes(r.timeGanZhi[0] as any) ? 'strength' : 'neutral',
    dimension: 'spiritual',
    source: 'qimen',
  });

  // 格局
  if (r.patterns.length > 0) {
    for (const p of r.patterns) {
      traits.push({
        label: `格局：${p.name}（${p.type === 'ji' ? '吉' : '凶'}）`,
        description: p.description,
        score: p.score,
        type: p.type === 'ji' ? 'strength' : 'weakness',
        dimension: 'career',
        source: 'qimen',
      });
    }
  }

  return {
    system: 'qimen',
    systemName: '奇門遁甲（正宗時家奇門·飛盤式置閏法）',
    rawData: r,
    traits,
    timing: [],
  };
}
