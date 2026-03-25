/**
 * 造命 ZaoMing — 大六壬模組
 * 三式之一：天盤十二天將 + 地盤十二地支 + 四課三傳
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const TWELVE_GENERALS = [
  { name: '貴人', element: '土', nature: '吉神之首，貴人相助', luck: 95 },
  { name: '螣蛇', element: '火', nature: '虛驚怪異，口舌纏繞', luck: 35 },
  { name: '朱雀', element: '火', nature: '文書口舌，消息傳遞', luck: 50 },
  { name: '六合', element: '木', nature: '合作交易，婚姻和合', luck: 85 },
  { name: '勾陳', element: '土', nature: '田土爭訟，遲滯不前', luck: 40 },
  { name: '青龍', element: '木', nature: '吉慶財喜，升遷有望', luck: 90 },
  { name: '天空', element: '土', nature: '欺詐虛空，不切實際', luck: 30 },
  { name: '白虎', element: '金', nature: '凶險疾病，血光之災', luck: 25 },
  { name: '太常', element: '土', nature: '宴會喜慶，衣食豐足', luck: 80 },
  { name: '玄武', element: '水', nature: '盜賊暗昧，陰私不明', luck: 30 },
  { name: '太陰', element: '金', nature: '隱密暗助，陰人女貴', luck: 75 },
  { name: '天后', element: '水', nature: '婚姻女性，陰柔之美', luck: 70 },
] as const;

const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

export function castDaLiuRen(input: BirthInfo) {
  const [year, month, day] = input.solarDate.split('-').map(Number);
  const hour = input.hour;
  const ganList = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const dayGan = ganList[(year + month * 3 + day * 5) % 10];
  const dayZhiIdx = (year + month + day) % 12;

  const siKe = Array.from({ length: 4 }, (_, i) => ({
    position: `第${i + 1}課`,
    ganZhi: `${ganList[(year + day + i) % 10]}${DIZHI[(dayZhiIdx + i * 3 + hour) % 12]}`,
    general: TWELVE_GENERALS[(year + month + day + hour + i * 7) % 12],
  }));

  const chuIdx = (year + month + day + hour) % 12;
  const sanChuan = { chu: DIZHI[chuIdx], zhong: DIZHI[(chuIdx + 4) % 12], mo: DIZHI[(chuIdx + 8) % 12] };
  const mainGeneral = TWELVE_GENERALS[(year * 2 + month * 3 + day * 5 + hour * 7) % 12];
  const avgLuck = Math.round((siKe.reduce((s, k) => s + k.general.luck, 0) / 4 + mainGeneral.luck) / 2);

  let luck: string, advice: string;
  if (avgLuck >= 75) { luck = '大吉'; advice = `主天將${mainGeneral.name}，四課多吉神護佑。主動出擊，貴人相助。`; }
  else if (avgLuck >= 55) { luck = '小吉'; advice = `主天將${mainGeneral.name}，吉凶參半。穩中求進。`; }
  else { luck = '偏凶'; advice = `主天將${mainGeneral.name}（${mainGeneral.nature}），需謹慎行事。建議等待更好時機。`; }

  return { dayGan, dayZhi: DIZHI[dayZhiIdx], siKe, sanChuan, mainGeneral, overall: { luck, score: avgLuck, advice } };
}

export function daliurenToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = castDaLiuRen(input);
  return {
    system: 'daliuren', systemName: '大六壬', rawData: r, timing: [],
    traits: [
      { label: `大六壬主將：${r.mainGeneral.name}`, description: `${r.mainGeneral.nature}（${r.mainGeneral.element}行）`, score: r.mainGeneral.luck, type: r.mainGeneral.luck >= 60 ? 'strength' : 'weakness', dimension: 'career', source: 'daliuren' },
      { label: `六壬斷卦：${r.overall.luck}`, description: r.overall.advice, score: r.overall.score, type: r.overall.score >= 60 ? 'strength' : 'weakness', dimension: 'spiritual', source: 'daliuren' },
      { label: `三傳：${r.sanChuan.chu}→${r.sanChuan.zhong}→${r.sanChuan.mo}`, description: `初傳${r.sanChuan.chu}啟動，末傳${r.sanChuan.mo}收局`, score: 70, type: 'strength', dimension: 'career', source: 'daliuren' },
    ],
  };
}
