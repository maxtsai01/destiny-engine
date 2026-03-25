/**
 * Destiny Engine — 統一輸出 Schema
 * 所有命理系統都輸出同一格式，這是交叉驗證的基礎
 */

// ====== 共用輸入 ======

export interface BirthInfo {
  /** 陽曆生日 YYYY-MM-DD */
  solarDate: string;
  /** 出生時辰（0-23 小時，或十二時辰） */
  hour: number;
  /** 性別 */
  gender: 'male' | 'female';
  /** 出生地（西洋占星需要） */
  birthPlace?: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  /** 姓名（姓名學需要） */
  name?: string;
  /** 手機號碼（數字易經需要） */
  phoneNumber?: string;
}

// ====== 統一輸出標籤 ======

/** 人生維度 — 所有系統都要映射到這些維度 */
export type LifeDimension =
  | 'career'      // 事業
  | 'wealth'      // 財運
  | 'relationship' // 感情
  | 'health'      // 健康
  | 'family'      // 家庭
  | 'social'      // 人際
  | 'study'       // 學習
  | 'spiritual';  // 心靈成長

/** 五行 */
export type WuXing = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

/** 陰陽 */
export type YinYang = 'yin' | 'yang';

/** 強度等級 */
export type Strength = 'very_strong' | 'strong' | 'moderate' | 'weak' | 'very_weak';

// ====== 統一分析結果 ======

/** 單項特質 */
export interface Trait {
  /** 特質標籤 */
  label: string;
  /** 相關維度 */
  dimension: LifeDimension;
  /** 是天賦還是盲區 */
  type: 'strength' | 'weakness' | 'neutral';
  /** 強度 0-100 */
  score: number;
  /** 來源系統 */
  source: SystemType;
  /** 詳細說明 */
  description: string;
}

/** 運勢時段 */
export interface TimingForecast {
  /** 時段名稱 */
  period: string;
  /** 開始日期 */
  startDate: string;
  /** 結束日期 */
  endDate: string;
  /** 各維度運勢 */
  dimensions: {
    dimension: LifeDimension;
    score: number; // -100 到 100
    advice: string;
  }[];
  /** 來源系統 */
  source: SystemType;
}

/** 成長建議 */
export interface GrowthAdvice {
  /** 建議標題 */
  title: string;
  /** 建議內容 */
  content: string;
  /** 適用維度 */
  dimension: LifeDimension;
  /** 優先級 1-5 */
  priority: number;
  /** 來源系統 */
  sources: SystemType[];
  /** 共鳴度（多少系統支持） */
  resonanceScore: number;
}

// ====== 系統類型 ======

export type SystemType =
  | 'bazi'         // 八字四柱
  | 'ziwei'        // 紫微斗數
  | 'astro'        // 西洋占星
  | 'iching'       // 易經
  | 'qimen'        // 奇門遁甲
  | 'name'         // 姓名學
  | 'numerology'   // 數字易經/生命靈數
  | 'zeri'         // 擇日
  | 'liuyao'       // 六爻
  | 'meihua'       // 梅花易數
  | 'fengshui'     // 風水
  | 'tarot'        // 塔羅
  | 'humandesign'  // 人類圖
  | 'rainbow'      // 彩虹人生
  | 'mbti';        // MBTI

// ====== 單一系統分析結果 ======

export interface SystemAnalysis {
  /** 系統名稱 */
  system: SystemType;
  /** 系統中文名 */
  systemName: string;
  /** 原始排盤數據 */
  rawData: Record<string, unknown>;
  /** 統一格式的特質分析 */
  traits: Trait[];
  /** 運勢預測 */
  timing: TimingForecast[];
  /** 本系統的建議 */
  advice: string[];
}

// ====== 交叉驗證結果 ======

export interface CrossValidation {
  /** 共鳴分數 0-100 */
  resonanceScore: number;
  /** 多系統一致的結論 */
  agreements: {
    conclusion: string;
    dimension: LifeDimension;
    supportingSystems: SystemType[];
    confidence: number; // 0-100
  }[];
  /** 系統間的矛盾（內在張力） */
  tensions: {
    description: string;
    dimension: LifeDimension;
    systemA: { system: SystemType; view: string };
    systemB: { system: SystemType; view: string };
    interpretation: string; // AI 解讀這個矛盾代表什麼
  }[];
  /** 獨特觀點（只有某系統看到的） */
  unique: {
    system: SystemType;
    insight: string;
    dimension: LifeDimension;
  }[];
}

// ====== 完整報告 ======

export interface DestinyReport {
  /** 報告 ID */
  id: string;
  /** 生成時間 */
  generatedAt: string;
  /** 輸入資訊 */
  input: BirthInfo;
  /** 各系統分析結果 */
  systems: SystemAnalysis[];
  /** 交叉驗證 */
  crossValidation: CrossValidation;
  /** 整合後的成長建議 */
  growthAdvice: GrowthAdvice[];
  /** AI 個人化解讀（自然語言） */
  aiInterpretation: string;
  /** 天賦雷達圖數據 */
  talentRadar: {
    dimension: LifeDimension;
    score: number;
    label: string;
  }[];
}
