/**
 * Destiny Engine — 統一輸出 Schema v1.0
 * 
 * 所有命理系統都必須輸出這個格式，
 * 這是交叉驗證和 AI 整合解讀的基礎。
 * 
 * 設計原則：
 * 1. 每個系統輸出同一結構 → 才能比對
 * 2. 標籤用「人話」不用術語 → AI 解讀才自然
 * 3. 信心度 + 權重 → 避免假共鳴
 */

// ============================================
// 基礎類型
// ============================================

/** 五行 */
export type WuXing = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

/** 陰陽 */
export type YinYang = 'yin' | 'yang';

/** 人生領域 */
export type LifeDomain = 
  | 'career'       // 事業
  | 'wealth'       // 財運
  | 'relationship' // 感情
  | 'health'       // 健康
  | 'family'       // 家庭
  | 'social'       // 人際
  | 'creativity'   // 創意
  | 'wisdom'       // 智慧/學習
  | 'leadership'   // 領導力
  | 'spirituality' // 心靈成長
  ;

/** 時間範圍 */
export interface TimeRange {
  from: string;  // ISO date or age "25歲"
  to: string;
  label: string; // "2026年" / "25-35歲" / "今年春季"
}

// ============================================
// 核心輸出結構
// ============================================

/**
 * 每個命理系統都必須輸出的統一格式
 */
export interface SystemOutput {
  /** 系統識別 */
  system: SystemType;
  
  /** 系統中文名 */
  systemName: string;
  
  /** 輸入資料 */
  input: BirthData;
  
  /** 原始盤面資料（各系統不同，保留完整資訊） */
  rawChart: Record<string, unknown>;
  
  /** === 以下是統一標準化輸出 === */
  
  /** 天賦強項（你天生擅長什麼） */
  strengths: Trait[];
  
  /** 盲區風險（你要注意什麼） */
  risks: Trait[];
  
  /** 性格特質 */
  personality: PersonalityTrait[];
  
  /** 適合的方向（事業、學習、生活方式） */
  suitableDirections: Direction[];
  
  /** 不適合的方向 */
  unsuitableDirections: Direction[];
  
  /** 人際關係傾向 */
  relationships: RelationshipTrait[];
  
  /** 運勢時間軸 */
  timeline: TimelineEntry[];
  
  /** 當前運勢（今年/當前大運） */
  currentFortune: Fortune;
  
  /** 五行平衡（如果適用） */
  elementBalance?: ElementBalance;
  
  /** 該系統的信心度說明 */
  confidenceNote: string;
}

/** 系統類型 */
export type SystemType = 
  | 'bazi'          // 八字四柱
  | 'ziwei'         // 紫微斗數
  | 'astrology'     // 西洋占星
  | 'nameology'     // 姓名學
  | 'numerology'    // 數字易經
  | 'iching'        // 易經
  | 'qimen'         // 奇門遁甲
  | 'liuyao'        // 六爻
  | 'zeji'          // 擇日
  | 'fengshui'      // 風水
  | 'humandesign'   // 人類圖
  | 'tarot'         // 塔羅
  | 'lifenumber'    // 生命靈數
  | 'rainbow'       // 彩虹人生16型
  | 'mbti'          // MBTI
  ;

// ============================================
// 特質 & 方向
// ============================================

export interface Trait {
  /** 人話描述（不要術語） */
  label: string;
  // 好: "天生的領導者，擅長帶團隊"
  // 壞: "紫微星入命宮，會照事業宮"
  
  /** 相關人生領域 */
  domains: LifeDomain[];
  
  /** 強度 0-100 */
  intensity: number;
  
  /** 信心度 0-1（該系統對這個判斷有多確定） */
  confidence: number;
  
  /** 術語原文（給懂的人看） */
  technicalNote?: string;
  
  /** 佐證（從盤面哪裡得出的） */
  evidence?: string;
}

export interface PersonalityTrait {
  /** 特質名（人話） */
  trait: string;
  // "行動派" / "完美主義" / "直覺強"
  
  /** 正面表現 */
  positive: string;
  
  /** 負面表現（過度時） */
  negative: string;
  
  /** 強度 */
  intensity: number;
  
  /** 信心度 */
  confidence: number;
}

export interface Direction {
  /** 方向描述 */
  label: string;
  // "適合自己當老闆，不適合被管"
  // "適合跟人互動的工作，不適合獨自作業"
  
  /** 領域 */
  domain: LifeDomain;
  
  /** 具體建議（越具體越好） */
  specifics: string[];
  // ["行銷", "業務", "教育訓練"]
  
  /** 信心度 */
  confidence: number;
}

export interface RelationshipTrait {
  /** 類型 */
  type: 'romantic' | 'business' | 'family' | 'friendship';
  
  /** 描述 */
  description: string;
  
  /** 適合的對象特質 */
  compatibleWith: string[];
  
  /** 可能的衝突點 */
  conflictPoints: string[];
}

// ============================================
// 運勢時間軸
// ============================================

export interface TimelineEntry {
  /** 時間範圍 */
  period: TimeRange;
  
  /** 整體運勢 1-10 */
  overallScore: number;
  
  /** 各領域運勢 */
  domainScores: Partial<Record<LifeDomain, number>>;
  
  /** 關鍵詞 */
  keywords: string[];
  // ["突破", "貴人運", "學習期"]
  
  /** 建議行動 */
  advice: string;
  
  /** 注意事項 */
  caution?: string;
}

export interface Fortune {
  /** 時間 */
  period: TimeRange;
  
  /** 整體評價 */
  summary: string;
  
  /** 最旺的領域 */
  bestDomains: LifeDomain[];
  
  /** 要小心的領域 */
  cautionDomains: LifeDomain[];
  
  /** 具體建議 */
  actionItems: string[];
}

// ============================================
// 五行平衡
// ============================================

export interface ElementBalance {
  wood: number;   // 0-100
  fire: number;
  earth: number;
  metal: number;
  water: number;
  
  /** 最旺的五行 */
  dominant: WuXing;
  
  /** 最弱的五行 */
  weakest: WuXing;
  
  /** 需要補的五行 */
  needsMore: WuXing[];
}

// ============================================
// 輸入資料
// ============================================

export interface BirthData {
  /** 西曆出生日期 */
  date: string; // YYYY-MM-DD
  
  /** 出生時間 */
  time?: string; // HH:mm
  
  /** 性別 */
  gender?: 'male' | 'female';
  
  /** 出生地點（占星需要） */
  birthPlace?: {
    city: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  
  /** 姓名（姓名學需要） */
  name?: {
    lastName: string;
    firstName: string;
  };
  
  /** 手機號碼（數字易經需要） */
  phoneNumber?: string;
  
  /** 用戶自述（AI 個人化解讀用） */
  userContext?: {
    currentConcern: 'career' | 'relationship' | 'health' | 'wealth' | 'general';
    lifeStage: 'student' | 'employee' | 'entrepreneur' | 'retired' | 'other';
    selfPerceivedStrength?: string;
    question?: string;
  };
}

// ============================================
// 交叉驗證結果（AI 整合層用）
// ============================================

export interface CrossValidationResult {
  /** 所有系統的原始輸出 */
  systems: SystemOutput[];
  
  /** 共鳴分析 */
  resonance: {
    /** 總共鳴度 0-100 */
    score: number;
    
    /** 多系統一致同意的結論 */
    agreements: {
      conclusion: string;
      agreeSystems: SystemType[];
      combinedConfidence: number;
      domain: LifeDomain;
    }[];
    
    /** 系統間的矛盾（內在張力） */
    tensions: {
      description: string;
      systemA: { system: SystemType; says: string };
      systemB: { system: SystemType; says: string };
      interpretation: string; // AI 解釋為什麼會矛盾
    }[];
    
    /** 只有某系統看到的獨特觀點 */
    uniqueInsights: {
      system: SystemType;
      insight: string;
      significance: 'high' | 'medium' | 'low';
    }[];
  };
  
  /** 綜合天賦雷達圖 */
  talentRadar: Record<LifeDomain, number>; // 0-100
  
  /** 最終成長建議（Top 3） */
  growthAdvice: {
    priority: number;
    advice: string;
    reason: string;
    supportingSystems: SystemType[];
  }[];
  
  /** 當前最佳行動 */
  currentAction: string;
}

// ============================================
// 系統權重設定
// ============================================

/**
 * 各系統在不同領域的權重
 * 八字在事業判斷 > 星座；星座在人際判斷 > 八字
 */
export const SYSTEM_WEIGHTS: Record<SystemType, Partial<Record<LifeDomain, number>>> = {
  bazi: {
    career: 0.9,
    wealth: 0.9,
    health: 0.7,
    relationship: 0.6,
    leadership: 0.8,
  },
  ziwei: {
    career: 0.85,
    wealth: 0.8,
    relationship: 0.8,
    family: 0.85,
    leadership: 0.75,
  },
  astrology: {
    relationship: 0.9,
    social: 0.85,
    creativity: 0.8,
    spirituality: 0.8,
    career: 0.6,
  },
  nameology: {
    career: 0.4,
    social: 0.5,
    health: 0.3,
  },
  numerology: {
    wealth: 0.5,
    career: 0.4,
  },
  iching: {
    wisdom: 0.8,
    spirituality: 0.9,
  },
  qimen: {
    career: 0.7,
    wealth: 0.7,
  },
  liuyao: {
    wisdom: 0.7,
  },
  zeji: {}, // 擇日不做人格分析
  fengshui: {}, // 風水不做人格分析
  humandesign: {
    career: 0.7,
    social: 0.8,
    leadership: 0.8,
    creativity: 0.7,
  },
  tarot: {
    spirituality: 0.7,
    wisdom: 0.6,
  },
  lifenumber: {
    career: 0.5,
    relationship: 0.5,
    creativity: 0.6,
  },
  rainbow: {
    leadership: 0.85,
    social: 0.85,
    career: 0.7,
    creativity: 0.8,
  },
  mbti: {
    career: 0.6,
    social: 0.7,
    leadership: 0.6,
  },
};
