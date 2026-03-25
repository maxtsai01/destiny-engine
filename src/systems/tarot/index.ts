/**
 * 造命 ZaoMing — 塔羅本命牌模組
 * 
 * 用生日計算本命牌（靈魂牌 + 個性牌）
 * 22 張大阿爾克那，每張有正位/逆位含義
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

// ====== 22 張大阿爾克那 ======

interface MajorArcana {
  number: number;
  name: string;
  nameEN: string;
  element: string;
  keyword: string;
  upright: string;
  reversed: string;
  career: string;
  love: string;
  advice: string;
  score: number;
}

const MAJOR_ARCANA: MajorArcana[] = [
  { number: 0, name: '愚者', nameEN: 'The Fool', element: '風', keyword: '自由冒險',
    upright: '新開始、純真、自由、無限可能', reversed: '魯莽、不負責任、逃避現實',
    career: '創業、自由業、旅行相關', love: '勇敢追愛，但要注意不要太天真',
    advice: '擁抱未知，勇敢踏出第一步', score: 75 },
  { number: 1, name: '魔術師', nameEN: 'The Magician', element: '水銀', keyword: '創造力',
    upright: '創造力、意志力、技巧、資源充足', reversed: '欺騙、操控、浪費才能',
    career: '行銷、創意、技術、教育', love: '有魅力，能吸引對的人',
    advice: '你擁有所有需要的資源，現在就行動', score: 90 },
  { number: 2, name: '女祭司', nameEN: 'The High Priestess', element: '月', keyword: '直覺',
    upright: '直覺、智慧、神秘、內在知識', reversed: '忽略直覺、隱藏真相',
    career: '研究、諮詢、心理學、靈性工作', love: '深層連結，但要學會表達',
    advice: '相信你的直覺，答案在你心中', score: 80 },
  { number: 3, name: '皇后', nameEN: 'The Empress', element: '地', keyword: '豐盛',
    upright: '豐盛、母性、創造力、感官享受', reversed: '匱乏感、過度依賴、創意枯竭',
    career: '設計、美容、農業、餐飲', love: '深情厚愛，享受關係中的美好',
    advice: '讓自己享受豐盛，你值得', score: 85 },
  { number: 4, name: '皇帝', nameEN: 'The Emperor', element: '火', keyword: '權威',
    upright: '權威、結構、領導力、穩定', reversed: '獨裁、僵化、控制欲過強',
    career: 'CEO、管理者、法律、政治', love: '提供安全感，但注意別太控制',
    advice: '建立秩序和結構，用你的領導力', score: 85 },
  { number: 5, name: '教皇', nameEN: 'The Hierophant', element: '土', keyword: '傳承',
    upright: '傳統、教導、信仰、指導', reversed: '叛逆、打破常規、教條主義',
    career: '教育、宗教、顧問、導師', love: '穩定傳統的關係模式',
    advice: '尊重傳統但不被束縛，找到你的信仰', score: 75 },
  { number: 6, name: '戀人', nameEN: 'The Lovers', element: '風', keyword: '選擇',
    upright: '愛情、和諧、選擇、價值觀', reversed: '失衡、衝突、錯誤選擇',
    career: '公關、藝術、婚禮策劃、調解', love: '靈魂伴侶的可能，但需要做選擇',
    advice: '跟隨你的心，做出一致的選擇', score: 85 },
  { number: 7, name: '戰車', nameEN: 'The Chariot', element: '水', keyword: '意志力',
    upright: '勝利、決心、意志力、克服障礙', reversed: '失控、方向不明、好戰',
    career: '運動、軍事、物流、業務', love: '主動追求，但別太強勢',
    advice: '堅定方向，用意志力衝破一切障礙', score: 90 },
  { number: 8, name: '力量', nameEN: 'Strength', element: '火', keyword: '內在力量',
    upright: '勇氣、耐心、內在力量、慈悲', reversed: '自我懷疑、軟弱、恐懼',
    career: '治療師、教練、動物相關、心理師', love: '溫柔而堅定，用愛化解衝突',
    advice: '真正的力量來自內在，溫柔就是力量', score: 85 },
  { number: 9, name: '隱者', nameEN: 'The Hermit', element: '土', keyword: '內省',
    upright: '智慧、獨處、內省、指引', reversed: '孤立、固執、逃避社交',
    career: '研究員、哲學家、作家、獨立工作者', love: '需要獨處空間的深度連結',
    advice: '向內探索，答案在沉靜中浮現', score: 75 },
  { number: 10, name: '命運之輪', nameEN: 'Wheel of Fortune', element: '木星', keyword: '轉機',
    upright: '命運轉折、好運、週期、機會', reversed: '厄運、抗拒改變、失控',
    career: '投資、博弈、創業、任何需要運氣的', love: '命定的相遇',
    advice: '把握命運轉折的時刻，順勢而為', score: 80 },
  { number: 11, name: '正義', nameEN: 'Justice', element: '風', keyword: '公平',
    upright: '公正、真相、因果、平衡', reversed: '不公、偏見、逃避責任',
    career: '法律、仲裁、人資、社會正義', love: '公平對等的關係',
    advice: '做正確的事，因果不會騙你', score: 80 },
  { number: 12, name: '倒吊人', nameEN: 'The Hanged Man', element: '水', keyword: '放下',
    upright: '犧牲、換角度、放下、等待', reversed: '拖延、不願放手、白白犧牲',
    career: '藝術家、社工、公益、任何需要新視角的', love: '學會放手和等待',
    advice: '有時候放下才能得到，換個角度看世界', score: 65 },
  { number: 13, name: '死神', nameEN: 'Death', element: '水', keyword: '轉化',
    upright: '結束、轉化、重生、放下過去', reversed: '抗拒改變、恐懼結束',
    career: '轉型顧問、心理治療、危機管理', love: '關係的轉化，不是結束',
    advice: '結束是為了更好的開始，勇敢放下', score: 70 },
  { number: 14, name: '節制', nameEN: 'Temperance', element: '火', keyword: '平衡',
    upright: '平衡、耐心、中庸、療癒', reversed: '失衡、過度、缺乏耐心',
    career: '醫療、調解、藝術、中醫', love: '和諧穩定的關係',
    advice: '凡事適度，找到你的平衡點', score: 80 },
  { number: 15, name: '惡魔', nameEN: 'The Devil', element: '土', keyword: '束縛',
    upright: '束縛、慾望、物質、陰暗面', reversed: '解脫、打破限制',
    career: '金融、娛樂、任何跟慾望相關的', love: '小心上癮式的關係',
    advice: '認識你的陰暗面，才能超越它', score: 55 },
  { number: 16, name: '塔', nameEN: 'The Tower', element: '火', keyword: '崩塌重建',
    upright: '突變、崩塌、覺醒、真相揭露', reversed: '逃避改變、內在動盪',
    career: '危機管理、創新破壞、改革', love: '關係的震盪帶來覺醒',
    advice: '崩塌是為了重建更好的，不要怕', score: 50 },
  { number: 17, name: '星星', nameEN: 'The Star', element: '風', keyword: '希望',
    upright: '希望、靈感、療癒、信念', reversed: '失去信心、絕望、沒方向',
    career: '藝術、療癒、靈性、天文', love: '純粹而美好的希望',
    advice: '保持希望，你的星星一直在那裡', score: 90 },
  { number: 18, name: '月亮', nameEN: 'The Moon', element: '水', keyword: '潛意識',
    upright: '直覺、夢境、潛意識、不確定', reversed: '恐懼、幻想、自欺欺人',
    career: '心理學、藝術、偵探、夜班工作', love: '深層情感，但小心投射',
    advice: '信任你的夢境和直覺，但別被恐懼蒙蔽', score: 65 },
  { number: 19, name: '太陽', nameEN: 'The Sun', element: '火', keyword: '成功',
    upright: '成功、快樂、活力、光明', reversed: '過度樂觀、膚淺、曬傷',
    career: '表演、兒童教育、戶外、娛樂', love: '快樂單純的愛情',
    advice: '展現你的光芒，世界需要你的溫暖', score: 95 },
  { number: 20, name: '審判', nameEN: 'Judgement', element: '火', keyword: '覺醒',
    upright: '覺醒、重生、使命召喚、反思', reversed: '自我懷疑、拒絕成長',
    career: '法律、教育、靈性、任何需要判斷力的', love: '關係的重新審視',
    advice: '聽見你的使命在呼喚，是時候回應了', score: 85 },
  { number: 21, name: '世界', nameEN: 'The World', element: '土', keyword: '完成',
    upright: '完成、成就、旅行、整合', reversed: '未完成、缺少收尾',
    career: '國際事務、旅遊、任何全球性的', love: '圓滿的結合',
    advice: '你已經走到這一步了，享受你的成就', score: 95 },
];

// ====== 計算本命牌 ======

export function calculateTarot(birthDate: string): {
  soulCard: MajorArcana;   // 靈魂牌
  personalityCard: MajorArcana;  // 個性牌
  yearCard: MajorArcana;   // 流年牌
  chain: number[];
} {
  const [year, month, day] = birthDate.split('-').map(Number);
  
  // 靈魂牌：生日數字相加到 1-22
  let sum = 0;
  const digits = `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;
  for (const d of digits) sum += parseInt(d);
  
  const chain = [sum];
  while (sum > 22) {
    let newSum = 0;
    for (const d of sum.toString()) newSum += parseInt(d);
    sum = newSum;
    chain.push(sum);
  }
  
  const soulNumber = sum;
  // 個性牌：如果靈魂牌 > 9，再加一次
  let personalityNumber = soulNumber;
  if (soulNumber > 9) {
    let pSum = 0;
    for (const d of soulNumber.toString()) pSum += parseInt(d);
    personalityNumber = pSum;
  }

  // 流年牌
  const currentYear = new Date().getFullYear();
  let yearSum = 0;
  const yearDigits = `${currentYear}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;
  for (const d of yearDigits) yearSum += parseInt(d);
  while (yearSum > 22) {
    let ns = 0;
    for (const d of yearSum.toString()) ns += parseInt(d);
    yearSum = ns;
  }

  return {
    soulCard: MAJOR_ARCANA[soulNumber] || MAJOR_ARCANA[0],
    personalityCard: MAJOR_ARCANA[personalityNumber] || MAJOR_ARCANA[0],
    yearCard: MAJOR_ARCANA[yearSum] || MAJOR_ARCANA[0],
    chain,
  };
}

// ====== 統一介面 ======

export function tarotToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const result = calculateTarot(input.solarDate);

  const traits: Trait[] = [
    {
      label: `靈魂牌：${result.soulCard.number} ${result.soulCard.name}（${result.soulCard.nameEN}）`,
      description: `${result.soulCard.upright}。${result.soulCard.advice}`,
      score: result.soulCard.score,
      type: result.soulCard.score >= 60 ? 'strength' : 'weakness',
      dimension: 'spiritual',
      source: 'tarot',
    },
    {
      label: `個性牌：${result.personalityCard.number} ${result.personalityCard.name}`,
      description: result.personalityCard.upright,
      score: result.personalityCard.score,
      type: 'strength',
      dimension: 'social',
      source: 'tarot',
    },
    {
      label: `2026 流年牌：${result.yearCard.number} ${result.yearCard.name}`,
      description: `今年主題：${result.yearCard.keyword}。${result.yearCard.advice}`,
      score: result.yearCard.score,
      type: result.yearCard.score >= 60 ? 'strength' : 'weakness',
      dimension: 'career',
      source: 'tarot',
    },
    {
      label: `塔羅職業指引`,
      description: result.soulCard.career,
      score: 75,
      type: 'strength',
      dimension: 'career',
      source: 'tarot',
    },
    {
      label: `塔羅感情指引`,
      description: result.soulCard.love,
      score: 70,
      type: 'strength',
      dimension: 'relationship',
      source: 'tarot',
    },
  ];

  return {
    system: 'tarot',
    systemName: '塔羅本命牌',
    rawData: result,
    traits,
    timing: [],
  };
}

// ====== CLI ======

if (require.main === module) {
  const date = process.argv[2] || '1993-08-07';
  const result = calculateTarot(date);

  console.log(`\n🃏 塔羅本命牌分析：${date}`);
  console.log('═'.repeat(50));
  console.log(`\n  靈魂牌：#${result.soulCard.number} ${result.soulCard.name}（${result.soulCard.nameEN}）`);
  console.log(`  關鍵字：${result.soulCard.keyword} | 元素：${result.soulCard.element}`);
  console.log(`  正位：${result.soulCard.upright}`);
  console.log(`  💡 ${result.soulCard.advice}`);
  console.log(`  💼 職業：${result.soulCard.career}`);
  console.log(`  ❤️ 感情：${result.soulCard.love}`);
  console.log(`  🎯 分數：${result.soulCard.score}/100`);
  console.log(`\n  個性牌：#${result.personalityCard.number} ${result.personalityCard.name}（${result.personalityCard.nameEN}）`);
  console.log(`  ${result.personalityCard.upright}`);
  console.log(`\n  2026 流年牌：#${result.yearCard.number} ${result.yearCard.name}（${result.yearCard.nameEN}）`);
  console.log(`  今年主題：${result.yearCard.keyword}`);
  console.log(`  ${result.yearCard.advice}`);
}
