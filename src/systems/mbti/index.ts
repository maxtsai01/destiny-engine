/**
 * 造命 ZaoMing — MBTI 命盤推算模組
 * 
 * 不是問卷，是從命盤數據「反推」MBTI 傾向
 * 八字五行 × 紫微主星 × 占星星座 × 生命靈數 → MBTI 四維度
 * 
 * 這是造命的獨家功能：用命理推算性格，再跟 MBTI 對照
 */

import type { SystemAnalysis, Trait, LifeDimension, BirthInfo } from '../../core/types';

// ====== MBTI 四維度 ======

interface MBTIDimension {
  axis: string;
  left: { code: string; name: string; score: number };
  right: { code: string; name: string; score: number };
}

interface MBTIResult {
  type: string;           // e.g. "ENTJ"
  title: string;          // e.g. "指揮官"
  description: string;
  strengths: string[];
  weaknesses: string[];
  career: string;
  dimensions: MBTIDimension[];
  confidence: number;     // 推算信心度
}

// ====== MBTI 16 型 ======

const MBTI_PROFILES: Record<string, { title: string; desc: string; career: string }> = {
  'INTJ': { title: '策略家', desc: '獨立思考，善於規劃長期策略，追求效率和完美', career: '策略顧問、架構師、研究員、投資分析師' },
  'INTP': { title: '邏輯學家', desc: '好奇心強，熱愛分析和理論，追求真理', career: '科學家、程式設計師、哲學家、數據分析師' },
  'ENTJ': { title: '指揮官', desc: '天生領導者，果斷高效，善於組織和決策', career: 'CEO、企業家、律師、高管、政治家' },
  'ENTP': { title: '辯論家', desc: '聰明機智，喜歡挑戰現狀，善於即興發揮', career: '創業家、行銷、律師、發明家、顧問' },
  'INFJ': { title: '提倡者', desc: '理想主義，深思熟慮，關心他人的成長', career: '諮商師、作家、教育家、非營利組織' },
  'INFP': { title: '調解者', desc: '忠於價值觀，富有創造力，追求意義', career: '藝術家、作家、心理師、社工、設計師' },
  'ENFJ': { title: '主角', desc: '魅力領袖，善於激勵他人，重視和諧', career: '教師、教練、公關、人資、社會運動家' },
  'ENFP': { title: '競選者', desc: '熱情洋溢，創意無限，善於連結人與想法', career: '行銷、記者、演員、創業家、教練' },
  'ISTJ': { title: '物流師', desc: '務實可靠，注重細節和規則，責任感強', career: '會計師、軍人、公務員、工程師、審計師' },
  'ISFJ': { title: '守護者', desc: '溫暖細心，默默付出，重視傳統和穩定', career: '護理師、教師、社工、行政管理、客服' },
  'ESTJ': { title: '總經理', desc: '組織力強，重視秩序和效率，天生的管理者', career: '管理者、軍官、法官、項目經理、財務長' },
  'ESFJ': { title: '執政官', desc: '關懷他人，善於社交，重視團隊和諧', career: '銷售、醫療、教育、活動企劃、人資' },
  'ISTP': { title: '鑑賞家', desc: '冷靜務實，善於解決問題，喜歡動手操作', career: '工程師、技師、飛行員、偵探、運動員' },
  'ISFP': { title: '探險家', desc: '藝術敏感，活在當下，追求美感和自由', career: '設計師、攝影師、廚師、音樂家、園藝師' },
  'ESTP': { title: '企業家', desc: '行動派，善於把握機會，喜歡刺激和冒險', career: '業務、企業家、運動員、急診醫師、特技演員' },
  'ESFP': { title: '表演者', desc: '活潑熱情，享受生活，天生的娛樂家', career: '演員、銷售、導遊、活動主持、美髮師' },
};

// ====== 從命盤推算 MBTI ======

/**
 * 五行 → MBTI 維度映射
 */
function wuxingToMBTI(strongElement: string, weakElement: string): { ei: number; sn: number; tf: number; jp: number } {
  // E/I: 火/木偏E，水/金偏I
  // S/N: 土/金偏S，水/木偏N
  // T/F: 金/水偏T，火/木偏F
  // J/P: 土/金偏J，水/火偏P
  
  const scores = { ei: 50, sn: 50, tf: 50, jp: 50 }; // 50 = 中間

  const elementEffect: Record<string, { ei: number; sn: number; tf: number; jp: number }> = {
    '木': { ei: 10, sn: -10, tf: -5, jp: -5 },   // 木：外向、直覺、感性、靈活
    '火': { ei: 15, sn: -5, tf: -10, jp: -10 },   // 火：外向、直覺、感性、靈活
    '土': { ei: -5, sn: 15, tf: 5, jp: 15 },      // 土：中性、實感、理性、規劃
    '金': { ei: -10, sn: 10, tf: 15, jp: 10 },    // 金：內向、實感、理性、規劃
    '水': { ei: -15, sn: -15, tf: 10, jp: -15 },  // 水：內向、直覺、理性、靈活
  };

  // 強五行加分
  if (elementEffect[strongElement]) {
    const e = elementEffect[strongElement];
    scores.ei += e.ei;
    scores.sn += e.sn;
    scores.tf += e.tf;
    scores.jp += e.jp;
  }

  // 弱五行反向（缺什麼就不像什麼）
  if (elementEffect[weakElement]) {
    const e = elementEffect[weakElement];
    scores.ei -= e.ei * 0.3;
    scores.sn -= e.sn * 0.3;
    scores.tf -= e.tf * 0.3;
    scores.jp -= e.jp * 0.3;
  }

  return scores;
}

/**
 * 星座 → MBTI 加分
 */
function zodiacToMBTI(sunSign: string): { ei: number; sn: number; tf: number; jp: number } {
  const zodiacMap: Record<string, { ei: number; sn: number; tf: number; jp: number }> = {
    '牡羊座': { ei: 15, sn: 5, tf: 5, jp: -5 },
    '金牛座': { ei: -5, sn: 15, tf: -5, jp: 15 },
    '雙子座': { ei: 15, sn: -10, tf: 5, jp: -15 },
    '巨蟹座': { ei: -10, sn: 5, tf: -15, jp: 5 },
    '獅子座': { ei: 20, sn: -5, tf: 5, jp: 5 },
    '處女座': { ei: -10, sn: 15, tf: 15, jp: 15 },
    '天秤座': { ei: 10, sn: -5, tf: -10, jp: 5 },
    '天蠍座': { ei: -15, sn: -10, tf: 10, jp: 10 },
    '射手座': { ei: 20, sn: -15, tf: 5, jp: -20 },
    '摩羯座': { ei: -10, sn: 10, tf: 10, jp: 20 },
    '水瓶座': { ei: 5, sn: -20, tf: 15, jp: -10 },
    '雙魚座': { ei: -5, sn: -15, tf: -20, jp: -5 },
  };
  return zodiacMap[sunSign] || { ei: 0, sn: 0, tf: 0, jp: 0 };
}

/**
 * 生命靈數 → MBTI 加分
 */
function lifeNumberToMBTI(lifeNumber: number): { ei: number; sn: number; tf: number; jp: number } {
  const numMap: Record<number, { ei: number; sn: number; tf: number; jp: number }> = {
    1: { ei: 5, sn: 5, tf: 10, jp: 5 },       // 領導者
    2: { ei: -10, sn: 5, tf: -15, jp: 5 },     // 協調者
    3: { ei: 15, sn: -10, tf: -5, jp: -10 },   // 表達者
    4: { ei: -5, sn: 15, tf: 5, jp: 15 },      // 建築師
    5: { ei: 10, sn: -5, tf: 5, jp: -15 },     // 冒險家
    6: { ei: 5, sn: 5, tf: -10, jp: 10 },      // 照顧者
    7: { ei: -20, sn: -15, tf: 15, jp: -5 },   // 思想家
    8: { ei: 10, sn: 10, tf: 15, jp: 10 },     // 企業家
    9: { ei: 10, sn: -10, tf: -10, jp: -5 },   // 人道主義者
  };
  return numMap[lifeNumber] || { ei: 0, sn: 0, tf: 0, jp: 0 };
}

// ====== 主函數 ======

export function calculateMBTI(
  strongElement: string,
  weakElement: string,
  sunSign: string,
  lifeNumber: number
): MBTIResult {
  // 合併所有來源的分數
  const wuxing = wuxingToMBTI(strongElement, weakElement);
  const zodiac = zodiacToMBTI(sunSign);
  const numScore = lifeNumberToMBTI(lifeNumber);

  const final = {
    ei: wuxing.ei + zodiac.ei + numScore.ei,
    sn: wuxing.sn + zodiac.sn + numScore.sn,
    tf: wuxing.tf + zodiac.tf + numScore.tf,
    jp: wuxing.jp + zodiac.jp + numScore.jp,
  };

  // 決定類型
  const e_or_i = final.ei >= 50 ? 'E' : 'I';
  const s_or_n = final.sn >= 50 ? 'S' : 'N';
  const t_or_f = final.tf >= 50 ? 'T' : 'F';
  const j_or_p = final.jp >= 50 ? 'J' : 'P';
  const type = `${e_or_i}${s_or_n}${t_or_f}${j_or_p}`;

  const profile = MBTI_PROFILES[type] || { title: '未知', desc: '', career: '' };

  // 信心度 = 各維度偏離中心的平均幅度
  const deviations = [
    Math.abs(final.ei - 50),
    Math.abs(final.sn - 50),
    Math.abs(final.tf - 50),
    Math.abs(final.jp - 50),
  ];
  const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
  const confidence = Math.min(95, Math.round(50 + avgDeviation));

  const dimensions: MBTIDimension[] = [
    {
      axis: '能量方向',
      left: { code: 'E', name: '外向', score: final.ei },
      right: { code: 'I', name: '內向', score: 100 - final.ei },
    },
    {
      axis: '認知方式',
      left: { code: 'S', name: '實感', score: final.sn },
      right: { code: 'N', name: '直覺', score: 100 - final.sn },
    },
    {
      axis: '決策方式',
      left: { code: 'T', name: '思考', score: final.tf },
      right: { code: 'F', name: '感受', score: 100 - final.tf },
    },
    {
      axis: '生活方式',
      left: { code: 'J', name: '判斷', score: final.jp },
      right: { code: 'P', name: '感知', score: 100 - final.jp },
    },
  ];

  return {
    type,
    title: profile.title,
    description: profile.desc,
    strengths: [],
    weaknesses: [],
    career: profile.career,
    dimensions,
    confidence,
  };
}

export function mbtiToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  // 預設值（實際使用時應從其他系統取得）
  const result = calculateMBTI('金', '木', '獅子座', 1);
  
  const traits: Trait[] = [
    {
      label: `命盤推算 MBTI：${result.type}（${result.title}）`,
      description: result.description,
      score: result.confidence,
      type: 'strength',
      dimension: 'career',
      source: 'mbti',
    },
    {
      label: `MBTI 適合職業`,
      description: result.career,
      score: 75,
      type: 'strength',
      dimension: 'career',
      source: 'mbti',
    },
  ];

  for (const dim of result.dimensions) {
    const dominant = dim.left.score >= 50 ? dim.left : dim.right;
    traits.push({
      label: `${dim.axis}：${dominant.code}（${dominant.name}）${dominant.score}%`,
      description: `在${dim.axis}維度上偏向${dominant.name}`,
      score: dominant.score,
      type: 'strength',
      dimension: 'spiritual',
      source: 'mbti',
    });
  }

  return {
    system: 'mbti',
    systemName: 'MBTI 命盤推算',
    rawData: result,
    traits,
    timing: [],
  };
}

// ====== CLI ======

if (require.main === module) {
  console.log('\n🧠 MBTI 命盤推算（蔡寅衍）');
  console.log('═'.repeat(50));
  console.log('數據來源：八字（金強木弱）+ 獅子座 + 靈數1\n');

  const result = calculateMBTI('金', '木', '獅子座', 1);
  
  console.log(`🎯 推算結果：${result.type} — ${result.title}`);
  console.log(`📝 ${result.description}`);
  console.log(`💼 適合職業：${result.career}`);
  console.log(`📊 推算信心度：${result.confidence}%\n`);

  console.log('四維度分析：');
  for (const dim of result.dimensions) {
    const leftBar = '█'.repeat(Math.round(dim.left.score / 5));
    const rightBar = '█'.repeat(Math.round(dim.right.score / 5));
    console.log(`  ${dim.axis}：`);
    console.log(`    ${dim.left.code}(${dim.left.name}) ${leftBar} ${dim.left.score}% | ${dim.right.score}% ${rightBar} ${dim.right.code}(${dim.right.name})`);
  }
}
