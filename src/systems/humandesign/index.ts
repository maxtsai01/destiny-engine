/**
 * 造命 ZaoMing — 人類圖模組（簡化版）
 * 
 * Human Design = 占星 + 易經 + 脈輪 + 卡巴拉
 * 核心：4 種類型 × 9 個能量中心 × 策略 + 內在權威
 * 
 * 簡化版：從生辰推算類型 + 策略 + 內在權威 + 人生角色
 */

import type { SystemAnalysis, Trait, LifeDimension, BirthInfo } from '../../core/types';

// ====== 四種類型 ======

interface HDType {
  name: string;
  nameEN: string;
  percentage: string;  // 全球占比
  strategy: string;
  notSelf: string;     // 非自己主題
  signature: string;   // 特徵情緒
  description: string;
  career: string;
  strength: string;
  weakness: string;
}

const HD_TYPES: Record<string, HDType> = {
  manifestor: {
    name: '顯示者',
    nameEN: 'Manifestor',
    percentage: '9%',
    strategy: '告知',
    notSelf: '憤怒',
    signature: '平靜',
    description: '天生的開創者，不需要等待允許就能行動。你是火種，點燃方向。',
    career: '創業家、領導者、藝術家、改革者',
    strength: '開創力強，能無中生有，不依賴他人就能啟動',
    weakness: '容易衝動，忽略他人感受，團隊協作需練習',
  },
  generator: {
    name: '生產者',
    nameEN: 'Generator',
    percentage: '37%',
    strategy: '等待回應',
    notSelf: '挫折',
    signature: '滿足',
    description: '世界的建造者，擁有持續不斷的能量。關鍵是做讓你有回應的事。',
    career: '工匠、運動員、建築師、任何需要持久力的工作',
    strength: '能量充沛，持久力強，做對的事時會進入心流',
    weakness: '容易被消耗在不對的事上，需要學會說不',
  },
  manifesting_generator: {
    name: '顯示生產者',
    nameEN: 'Manifesting Generator',
    percentage: '33%',
    strategy: '等待回應，然後告知',
    notSelf: '挫折與憤怒',
    signature: '滿足與平靜',
    description: '最快速的類型，能同時做多件事。你是跳躍式前進的人。',
    career: '多工者、創業家、斜槓、任何需要速度和多樣性的工作',
    strength: '速度快、多才多藝、跳躍式學習、效率極高',
    weakness: '容易跳過步驟、缺乏耐心、需要學會等待回應',
  },
  projector: {
    name: '投射者',
    nameEN: 'Projector',
    percentage: '20%',
    strategy: '等待邀請',
    notSelf: '苦澀',
    signature: '成功',
    description: '天生的引導者和管理者。你不是做事的人，是看見如何做的人。',
    career: '顧問、教練、管理者、治療師、策略師',
    strength: '洞察力強，能看見他人看不見的，天生的引導者',
    weakness: '能量有限，過度工作會崩潰，需要被認可和邀請',
  },
  reflector: {
    name: '反映者',
    nameEN: 'Reflector',
    percentage: '1%',
    strategy: '等待一個月球週期（28天）',
    notSelf: '失望',
    signature: '驚喜',
    description: '最稀有的類型，你是社群的鏡子。你反映環境的健康程度。',
    career: '評論家、裁判、社區領導、環境設計師',
    strength: '極度敏感，能感知環境能量，獨特的觀察視角',
    weakness: '極易受環境影響，需要健康環境才能發揮',
  },
};

// ====== 內在權威 ======

const AUTHORITIES: Record<string, { name: string; description: string; advice: string }> = {
  emotional: { name: '情緒權威', description: '決策需要時間，等情緒波動完再做決定', advice: '不要在情緒高點或低點做重要決定，等波動結束後再說。' },
  sacral: { name: '薦骨權威', description: '聽你的直覺反應——身體的「嗯哼」或「嗯嗯」', advice: '用身體回應來做決定，不要用頭腦分析。' },
  splenic: { name: '脾直覺權威', description: '第一時間的直覺就是答案，不要想第二次', advice: '相信你的第一直覺，它只出現一次。' },
  ego: { name: '意志力權威', description: '問自己「我真的想要嗎？」', advice: '只承諾你真心想做的事，不要為了別人而答應。' },
  self: { name: '自我投射權威', description: '說出來聽聽，在對話中找到答案', advice: '找信任的人聊，聽自己說出的話，答案就在裡面。' },
  lunar: { name: '月亮週期權威', description: '等待 28 天，讓所有角度都看過', advice: '大決定不急，給自己一個月的時間。' },
};

// ====== 人生角色（Profile）======

const PROFILES: Record<string, { name: string; description: string }> = {
  '1/3': { name: '探究的烈士', description: '先深入研究，再從錯誤中學習。你需要穩固的知識基礎。' },
  '1/4': { name: '探究的機會主義者', description: '研究型 + 人脈型。你透過深入研究和人際網絡來成功。' },
  '2/4': { name: '隱士的機會主義者', description: '你有天賦但不自知，需要別人來發現你的才能。' },
  '2/5': { name: '隱士的異端者', description: '天賦型 + 解決問題型。別人會來找你解決問題。' },
  '3/5': { name: '烈士的異端者', description: '透過不斷嘗試和失敗來找到正確的路。你是實驗家。' },
  '3/6': { name: '烈士的榜樣', description: '前半生大量嘗試，後半生成為榜樣。50歲後會大放異彩。' },
  '4/6': { name: '機會主義者的榜樣', description: '人脈型 + 榜樣型。透過關係網絡，最終成為領域權威。' },
  '4/1': { name: '機會主義者的探究者', description: '人脈是你的資源，深度研究是你的武器。' },
  '5/1': { name: '異端者的探究者', description: '別人看你像救世主。你需要用扎實的知識來支撐這個形象。' },
  '5/2': { name: '異端者的隱士', description: '被期待解決問題，但其實你只想安靜做自己的事。' },
  '6/2': { name: '榜樣的隱士', description: '活成榜樣，但需要隱退的空間。三個人生階段。' },
  '6/3': { name: '榜樣的烈士', description: '前期大量試錯，中期休養觀察，後期成為智慧榜樣。' },
};

// ====== 從生辰推算 ======

export function calculateHumanDesign(input: BirthInfo): {
  type: HDType;
  authority: typeof AUTHORITIES[string];
  profile: typeof PROFILES[string];
  profileCode: string;
  definedCenters: string[];
  undefinedCenters: string[];
} {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const hour = input.hour;
  
  // 類型推算（簡化：用日期數字分布）
  const typeSum = (year + month * 13 + day * 7 + hour * 3) % 100;
  let typeKey: string;
  if (typeSum < 9) typeKey = 'manifestor';
  else if (typeSum < 46) typeKey = 'generator';
  else if (typeSum < 79) typeKey = 'manifesting_generator';
  else if (typeSum < 99) typeKey = 'projector';
  else typeKey = 'reflector';

  // 內在權威
  const authKeys = Object.keys(AUTHORITIES);
  const authIdx = (year + month + day * 3) % authKeys.length;
  const authority = AUTHORITIES[authKeys[authIdx]];

  // 人生角色
  const profileKeys = Object.keys(PROFILES);
  const profileIdx = (year * 2 + month * 5 + day) % profileKeys.length;
  const profileCode = profileKeys[profileIdx];
  const profile = PROFILES[profileCode];

  // 能量中心（9 個，簡化推算哪些有定義）
  const allCenters = ['頭腦', '邏輯', '喉嚨', '自我', '心臟', '薦骨', '脾', '情緒', '根'];
  const defined: string[] = [];
  const undefined_: string[] = [];
  
  allCenters.forEach((center, i) => {
    const hash = (year + month * (i + 1) + day * (i + 3) + hour * (i + 7)) % 3;
    if (hash > 0) defined.push(center);
    else undefined_.push(center);
  });

  return {
    type: HD_TYPES[typeKey],
    authority,
    profile,
    profileCode,
    definedCenters: defined,
    undefinedCenters: undefined_,
  };
}

// ====== 統一介面 ======

export function humanDesignToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const result = calculateHumanDesign(input);
  
  const traits: Trait[] = [
    {
      label: `人類圖類型：${result.type.name}（${result.type.nameEN}）`,
      description: result.type.description,
      score: 80,
      type: 'strength',
      dimension: 'career',
      source: 'humandesign',
    },
    {
      label: `策略：${result.type.strategy}`,
      description: `你的正確運作方式是「${result.type.strategy}」。當你遵循策略時，會感到${result.type.signature}。`,
      score: 85,
      type: 'strength',
      dimension: 'spiritual',
      source: 'humandesign',
    },
    {
      label: `內在權威：${result.authority.name}`,
      description: `${result.authority.description}。${result.authority.advice}`,
      score: 80,
      type: 'strength',
      dimension: 'spiritual',
      source: 'humandesign',
    },
    {
      label: `人生角色：${result.profileCode}（${result.profile.name}）`,
      description: result.profile.description,
      score: 75,
      type: 'strength',
      dimension: 'spiritual',
      source: 'humandesign',
    },
    {
      label: `天賦：${result.type.strength}`,
      description: `${result.type.name}的核心優勢`,
      score: 85,
      type: 'strength',
      dimension: 'career',
      source: 'humandesign',
    },
    {
      label: `盲區：${result.type.weakness}`,
      description: `${result.type.name}需要注意的地方`,
      score: 35,
      type: 'weakness',
      dimension: 'spiritual',
      source: 'humandesign',
    },
  ];

  return {
    system: 'humandesign',
    systemName: '人類圖',
    rawData: result,
    traits,
    timing: [],
  };
}

// ====== CLI ======

if (require.main === module) {
  const input: BirthInfo = {
    solarDate: process.argv[2] || '1993-08-07',
    hour: parseInt(process.argv[3] || '9'),
    gender: 'male',
  };

  const result = calculateHumanDesign(input);

  console.log(`\n🔷 人類圖分析：${input.solarDate} ${input.hour}時`);
  console.log('═'.repeat(50));
  console.log(`\n  類型：${result.type.name}（${result.type.nameEN}）— 全球${result.type.percentage}`);
  console.log(`  ${result.type.description}`);
  console.log(`\n  策略：${result.type.strategy}`);
  console.log(`  非自己主題：${result.type.notSelf}`);
  console.log(`  特徵情緒：${result.type.signature}`);
  console.log(`\n  內在權威：${result.authority.name}`);
  console.log(`  ${result.authority.advice}`);
  console.log(`\n  人生角色：${result.profileCode}（${result.profile.name}）`);
  console.log(`  ${result.profile.description}`);
  console.log(`\n  有定義中心（${result.definedCenters.length}/9）：${result.definedCenters.join('、')}`);
  console.log(`  未定義中心（${result.undefinedCenters.length}/9）：${result.undefinedCenters.join('、')}`);
  console.log(`\n  💼 適合：${result.type.career}`);
  console.log(`  ✨ 天賦：${result.type.strength}`);
  console.log(`  ⚠️ 盲區：${result.type.weakness}`);
}
