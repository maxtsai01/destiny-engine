/**
 * 造命 ZaoMing — 面相學 AI 模組（框架）
 * 
 * 目前：基於生辰推算面相特徵（理論推導）
 * 未來：接入 CV 模型，上傳照片做真實面相分析
 * 
 * 面相五官對應五行：
 * 額頭(火) / 鼻子(土) / 左顴(木) / 右顴(金) / 下巴(水)
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const FACE_PARTS = [
  { part: '額頭（官祿宮）', element: '火', high: '額頭飽滿：早年運佳，智慧出眾，宜文職', low: '額頭窄小：早年辛苦，但後天努力可補' },
  { part: '眉毛（兄弟宮）', element: '木', high: '眉毛濃密有型：人緣好，兄弟朋友助力多', low: '眉毛稀疏散亂：獨立性強，但人脈需經營' },
  { part: '眼睛（監察官）', element: '火', high: '眼神有光，目大有神：洞察力強，適合管理', low: '眼神飄忽：心思多變，需培養專注力' },
  { part: '鼻子（財帛宮）', element: '土', high: '鼻樑挺直，鼻頭圓潤：財運佳，40歲後旺', low: '鼻樑低平：財運靠自己打拼，不宜投機' },
  { part: '嘴巴（出納官）', element: '水', high: '唇形飽滿，口型方正：口才好，適合業務/教學', low: '嘴唇薄小：言辭犀利，但需注意口舌是非' },
  { part: '耳朵（採聽官）', element: '水', high: '耳大貼腦，耳垂厚：福氣深厚，長壽之相', low: '耳小外翻：獨立思考，不隨波逐流' },
  { part: '下巴（地閣）', element: '水', high: '下巴圓厚：晚年運好，家庭穩固', low: '下巴尖削：晚年需提早規劃，注意存錢' },
  { part: '顴骨（權力宮）', element: '金', high: '顴骨適中有肉：有權力有魄力，適合領導', low: '顴骨過高無肉：有野心但易樹敵，需圓滑' },
] as const;

const FACE_SHAPES = [
  { shape: '甲字臉（上寬下窄）', trait: '聰明但實踐力不足，適合策劃幕僚', element: '火' },
  { shape: '國字臉（方正）', trait: '意志堅定，執行力強，適合管理者', element: '土' },
  { shape: '圓字臉（圓潤）', trait: '人緣極佳，親和力強，適合服務業', element: '水' },
  { shape: '目字臉（長型）', trait: '思維深邃，適合研究/技術/專業領域', element: '木' },
  { shape: '由字臉（下寬上窄）', trait: '晚年運旺，越老越有福，大器晚成', element: '金' },
];

export function calculateFace(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const hour = input.hour;
  const seed = year + month * 13 + day * 7 + hour * 11;

  // 面型推斷
  const faceShape = FACE_SHAPES[seed % 5];

  // 五官特徵推斷（基於五行強弱）
  const parts = FACE_PARTS.map((fp, i) => {
    const isStrong = ((seed + i * 7) % 3) !== 0; // 2/3 機率強
    return {
      ...fp,
      status: isStrong ? 'strong' : 'weak',
      reading: isStrong ? fp.high : fp.low,
      score: isStrong ? 75 + (seed + i) % 15 : 45 + (seed + i) % 15,
    };
  });

  // 三停（上停額/中停鼻/下停下巴）
  const sanTing = {
    upper: parts[0].score, // 額頭 = 早年 (1-30)
    middle: parts[3].score, // 鼻子 = 中年 (31-50)
    lower: parts[6].score, // 下巴 = 晚年 (51+)
    analysis: '',
  };
  const best = sanTing.upper >= sanTing.middle && sanTing.upper >= sanTing.lower ? '上停最旺：早年運最好'
    : sanTing.middle >= sanTing.lower ? '中停最旺：中年事業高峰' : '下停最旺：晚年享福';
  sanTing.analysis = best;

  const avgScore = Math.round(parts.reduce((s, p) => s + p.score, 0) / parts.length);

  return { faceShape, parts, sanTing, avgScore, note: '⚠️ 目前為生辰推算版，上傳照片可獲得 AI 面相分析（開發中）' };
}

export function faceToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateFace(input);
  const traits: Trait[] = [
    { label: `面型：${r.faceShape.shape}`, description: r.faceShape.trait, score: 75, type: 'strength', dimension: 'career', source: 'face' },
    { label: `三停分析：${r.sanTing.analysis}`, description: `上停${r.sanTing.upper} / 中停${r.sanTing.middle} / 下停${r.sanTing.lower}`, score: r.avgScore, type: 'strength', dimension: 'spiritual', source: 'face' },
  ];
  r.parts.slice(0, 4).forEach(p => {
    traits.push({ label: `${p.part}`, description: p.reading, score: p.score, type: p.status === 'strong' ? 'strength' : 'weakness', dimension: 'health', source: 'face' });
  });
  return { system: 'face', systemName: '面相學', rawData: r, traits, timing: [] };
}
