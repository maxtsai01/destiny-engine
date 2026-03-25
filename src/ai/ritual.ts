/**
 * 造命 ZaoMing — AI 儀式引擎
 * 
 * 不是宗教，不是法術。
 * 是「心理學儀式感 × AI 個人化 × 命理數據」的融合。
 * 
 * 四大儀式：
 * 1. 開盤儀式 — 第一次看命盤的引導體驗
 * 2. 宣言儀式 — AI 生成個人化造命宣言
 * 3. 聚運儀式 — 每日/每週推送的聚運行動
 * 4. 復盤儀式 — 每月回顧行動 vs 運勢
 */

import type { SystemAnalysis, Trait, LifeDimension, BirthInfo, CrossValidation } from '../core/types';

// ====== 類型定義 ======

export interface Ritual {
  type: 'opening' | 'declaration' | 'focus' | 'review';
  title: string;
  content: string;
  actions: string[];
  timing?: string;      // 建議執行時間
  duration?: string;     // 建議持續時間
  frequency?: string;    // 頻率
}

export interface DailyFocus {
  date: string;
  dayElement: string;        // 當日五行
  luckyDirection: string;    // 吉方
  luckyColor: string;        // 吉色
  focusAction: string;       // 今日聚運行動
  affirmation: string;       // 今日宣言
  avoidance: string;         // 注意事項
}

// ====== 開盤儀式 ======

/**
 * 生成「開盤儀式」— 用戶第一次看命盤的引導文
 */
export function generateOpeningRitual(
  name: string,
  systems: SystemAnalysis[],
  resonanceScore: number
): Ritual {
  const allStrengths = systems.flatMap(s => s.traits.filter(t => t.type === 'strength'));
  const topStrength = allStrengths.sort((a, b) => b.score - a.score)[0];
  
  const systemCount = systems.length;
  const traitCount = systems.reduce((sum, s) => sum + s.traits.length, 0);

  return {
    type: 'opening',
    title: '🔮 造命開盤儀式',
    content: `${name}，歡迎來到你的造命時刻。

在接下來的幾分鐘裡，${systemCount} 個命理系統將同時為你排盤。
${traitCount} 個維度的分析將交叉驗證，找出最真實的你。

這不是算命。這是一面鏡子。
它不會告訴你命中注定什麼，它會告訴你——
你手上有什麼牌，以及怎麼打最好。

深呼吸。
準備好了，就開始你的造命之旅。

───── ✦ ─────

你的命盤共鳴度：${resonanceScore}/100
${topStrength ? `你最亮的天賦：${topStrength.label}` : ''}

記住：命盤不是判決書，是藏寶圖。
不認命，造命。`,
    actions: [
      '深呼吸三次，清空雜念',
      '心中默想一個你最想達成的目標',
      '準備好了，點擊「開啟命盤」',
    ],
    duration: '2 分鐘',
  };
}

// ====== 宣言儀式 ======

/**
 * 根據命盤生成個人化「造命宣言」
 */
export function generateDeclaration(
  name: string,
  dayMaster: string,
  topTraits: Trait[],
  weakTraits: Trait[]
): Ritual {
  const strengths = topTraits.slice(0, 3).map(t => t.label).join('、');
  const growth = weakTraits.slice(0, 2).map(t => t.label).join('、');

  // 根據日主元素選擇宣言基調
  const elementAffirmations: Record<string, string> = {
    '木': '我如大樹，紮根深處，向上生長。',
    '火': '我如烈焰，照亮前方，溫暖身邊的人。',
    '土': '我如大地，穩重厚實，承載萬物。',
    '金': '我如利劍，果斷精準，一擊必中。',
    '水': '我如流水，靈活變通，潤物無聲。',
  };

  const element = dayMaster.includes('甲') || dayMaster.includes('乙') ? '木' :
                  dayMaster.includes('丙') || dayMaster.includes('丁') ? '火' :
                  dayMaster.includes('戊') || dayMaster.includes('己') ? '土' :
                  dayMaster.includes('庚') || dayMaster.includes('辛') ? '金' : '水';

  const baseAffirmation = elementAffirmations[element] || '我掌握自己的命運。';

  return {
    type: 'declaration',
    title: '📜 造命宣言',
    content: `${name}，這是你的造命宣言：

───── ✦ 造命宣言 ✦ ─────

${baseAffirmation}

我知道我的天賦：${strengths}。
我不迴避我的成長空間：${growth}。

我不認命。
我不等待好運降臨。
我用行動造命。

從今天起，
我選擇看見自己的天賦，
我選擇面對自己的盲區，
我選擇每天前進一步。

造命，從此刻開始。

───── ✦ ─────

💡 建議：每天早上朗讀一次，或把這段話設為手機桌布。
當你猶豫的時候，回來看這段話。`,
    actions: [
      '大聲朗讀一次你的造命宣言',
      '截圖保存，設為手機桌布或日記第一頁',
      '在心中設定一個 30 天內想達成的目標',
    ],
    duration: '3 分鐘',
    frequency: '每日早晨',
  };
}

// ====== 聚運儀式（每日） ======

/**
 * 生成每日聚運指南
 * 根據日主五行 × 當日天干地支 → 生成今日行動建議
 */
export function generateDailyFocus(
  dateStr: string,
  dayMasterElement: string,
  userGodOfUse: string
): DailyFocus {
  // 簡化版：根據日期算出當日五行能量
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  
  // 星期對應五行（簡化）
  const weekElements = ['日(火)', '月(水)', '火(火)', '水(水)', '木(木)', '金(金)', '土(土)'];
  const dayElement = weekElements[dayOfWeek];
  
  // 方位對應
  const directions: Record<string, string> = {
    '木': '東方', '火': '南方', '土': '中央', '金': '西方', '水': '北方',
  };

  // 顏色對應
  const colors: Record<string, string> = {
    '木': '綠色', '火': '紅色', '土': '黃色', '金': '白色', '水': '黑色/藍色',
  };

  // 用神對應的行動建議
  const focusActions: Record<string, string[]> = {
    '木': [
      '今天適合學習新東西 — 看一本書、上一堂課、研究一個新領域',
      '今天適合開始新計畫 — 你拖延的那件事，今天動手',
      '今天適合接觸大自然 — 散步、園藝、或至少看看窗外的綠色',
      '今天適合創新突破 — 用不同的方式做你每天在做的事',
    ],
    '火': [
      '今天適合社交 — 約人吃飯、打電話、主動聯繫一個人',
      '今天適合展現自己 — 發文、直播、站出來說你想說的',
      '今天適合做有激情的事 — 什麼讓你興奮就做什麼',
      '今天適合做決定 — 猶豫很久的事，今天拍板',
    ],
    '土': [
      '今天適合整理和規劃 — 收拾桌面、整理文件、盤點資源',
      '今天適合鞏固基礎 — 複習、回顧、確認細節',
      '今天適合照顧身體 — 好好吃飯、運動、早睡',
      '今天適合經營關係 — 陪家人、回覆該回的訊息',
    ],
    '金': [
      '今天適合做減法 — 砍掉不重要的事，聚焦核心',
      '今天適合談判和成交 — 果斷出手，不要拖',
      '今天適合覆盤和優化 — 哪裡可以做得更好？',
      '今天適合執行 — 不想了，直接做',
    ],
    '水': [
      '今天適合思考和反省 — 安靜下來，想想大方向對不對',
      '今天適合收集資訊 — 研究、閱讀、跟聰明的人聊天',
      '今天適合做靈活的事 — 臨時變化不要抗拒，隨機應變',
      '今天適合休息充電 — 如果累了，今天允許自己放慢',
    ],
  };

  // 根據用神選擇行動
  const godElement = userGodOfUse.includes('木') ? '木' :
                     userGodOfUse.includes('火') ? '火' :
                     userGodOfUse.includes('土') ? '土' :
                     userGodOfUse.includes('金') ? '金' : '水';

  const actions = focusActions[godElement] || focusActions['木'];
  const todayAction = actions[dayOfWeek % actions.length];

  // 宣言
  const affirmations = [
    '今天，我選擇相信自己的天賦。',
    '今天，我用行動代替等待。',
    '今天，我比昨天更靠近目標一步。',
    '今天，我不認命，我造命。',
    '今天，我感謝過去的自己，也為未來的自己鋪路。',
    '今天，我把能量聚焦在最重要的一件事上。',
    '今天，我允許自己不完美，但不允許自己不行動。',
  ];

  return {
    date: dateStr,
    dayElement,
    luckyDirection: directions[godElement] || '東方',
    luckyColor: colors[godElement] || '綠色',
    focusAction: todayAction,
    affirmation: affirmations[dayOfWeek],
    avoidance: dayMasterElement === godElement 
      ? '今天能量充沛，大膽行動！' 
      : `今天${dayElement}能量較強，注意不要太衝動。`,
  };
}

// ====== 復盤儀式（每月） ======

/**
 * 生成月度復盤模板
 */
export function generateMonthlyReview(
  month: string,
  name: string,
  topGoal: string
): Ritual {
  return {
    type: 'review',
    title: `📊 ${month} 造命復盤`,
    content: `${name}，${month} 的造命復盤時間到了。

回顧這個月：
- 你設定的目標是「${topGoal}」
- 你實際做了哪些行動？
- 哪些天你感覺「順」？哪些天「卡」？
- 回頭看命盤的提醒，是否驗證了？

───── ✦ 復盤問題 ✦ ─────

1️⃣ 這個月最驕傲的一件事是什麼？
2️⃣ 這個月最後悔沒做的一件事是什麼？
3️⃣ 命盤說你的天賦是 ____，你有用到嗎？
4️⃣ 下個月，你要把能量聚焦在哪一件事上？

───── ✦ ─────

記住：造命不是一次性的，是每個月都在調整的過程。
你不需要完美，只需要每個月比上個月多造一步。`,
    actions: [
      '花 10 分鐘回答上面 4 個問題',
      '寫下下個月的「造命目標」（只要一個）',
      '更新你的造命宣言（如果需要）',
    ],
    duration: '15 分鐘',
    frequency: '每月最後一天',
  };
}

// ====== CLI 測試 ======

if (require.main === module) {
  console.log('\n🔮 造命 AI 儀式引擎 Demo\n');
  console.log('═'.repeat(50));

  // 1. 開盤儀式
  const opening = generateOpeningRitual('蔡寅衍', [], 83);
  console.log(`\n${opening.title}\n`);
  console.log(opening.content);
  console.log('\n行動步驟：');
  opening.actions.forEach((a, i) => console.log(`  ${i + 1}. ${a}`));

  // 2. 宣言儀式
  console.log('\n' + '─'.repeat(50));
  const declaration = generateDeclaration(
    '蔡寅衍',
    '庚金',
    [
      { label: '果斷有魄力', description: '', score: 90, type: 'strength', dimension: 'career' as LifeDimension, source: 'bazi' },
      { label: '天生領導者', description: '', score: 85, type: 'strength', dimension: 'career' as LifeDimension, source: 'astro' },
      { label: '行動力強', description: '', score: 80, type: 'strength', dimension: 'career' as LifeDimension, source: 'numerology' },
    ],
    [
      { label: '情感表達', description: '', score: 30, type: 'weakness', dimension: 'relationship' as LifeDimension, source: 'numerology' },
      { label: '人際經營', description: '', score: 35, type: 'weakness', dimension: 'social' as LifeDimension, source: 'name' },
    ]
  );
  console.log(`\n${declaration.title}\n`);
  console.log(declaration.content);

  // 3. 每日聚運
  console.log('\n' + '─'.repeat(50));
  const today = new Date().toISOString().split('T')[0];
  const daily = generateDailyFocus(today, '金', '木');
  console.log(`\n⚡ ${today} 每日聚運\n`);
  console.log(`日期五行：${daily.dayElement}`);
  console.log(`吉方：${daily.luckyDirection}`);
  console.log(`吉色：${daily.luckyColor}`);
  console.log(`\n🎯 今日行動：${daily.focusAction}`);
  console.log(`📜 今日宣言：${daily.affirmation}`);
  console.log(`⚠️ 注意：${daily.avoidance}`);

  // 4. 月度復盤
  console.log('\n' + '─'.repeat(50));
  const review = generateMonthlyReview('2026年3月', '蔡寅衍', '完成造命 AI MVP');
  console.log(`\n${review.title}\n`);
  console.log(review.content);
}
