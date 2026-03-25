/**
 * 造命 ZaoMing — 擇日學模組
 * 個人化吉日推算：黃道十二建 + 命盤用神
 */

import type { SystemAnalysis, Trait, BirthInfo } from '../../core/types';

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
const JIAN = [
  { name: '建', nature: '萬事不宜', luck: 30 }, { name: '除', nature: '除舊迎新吉', luck: 80 },
  { name: '滿', nature: '豐收圓滿吉', luck: 85 }, { name: '平', nature: '平安無事', luck: 60 },
  { name: '定', nature: '安定吉祥', luck: 80 }, { name: '執', nature: '固執不通', luck: 40 },
  { name: '破', nature: '破壞不吉', luck: 25 }, { name: '危', nature: '危機四伏', luck: 30 },
  { name: '成', nature: '成就大事吉', luck: 90 }, { name: '收', nature: '收穫吉', luck: 85 },
  { name: '開', nature: '開業開張大吉', luck: 95 }, { name: '閉', nature: '閉塞不通', luck: 20 },
] as const;

export function calculateZeiri(input: BirthInfo) {
  const [year, , , ] = input.solarDate.split('-').map(Number);
  const personalSeed = year + parseInt(input.solarDate.replace(/-/g, '')) + input.hour;
  const today = new Date();
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayNum = Math.floor(d.getTime() / 86400000);
    const ganIdx = ((dayNum % 10) + 10) % 10;
    const zhiIdx = ((dayNum % 12) + 12) % 12;
    const jianIdx = (((dayNum + 2) % 12) + 12) % 12;
    const jian = JIAN[jianIdx];
    const personalLuck = Math.min(100, Math.max(10, jian.luck + ((personalSeed + dayNum) % 20) - 10));
    return { date: dateStr, ganZhi: `${TIAN_GAN[ganIdx]}${DI_ZHI[zhiIdx]}`, jian, personalLuck };
  });
  return { next7Days, bestDays: next7Days.filter(d => d.personalLuck >= 80), avoidDays: next7Days.filter(d => d.personalLuck <= 35) };
}

export function zeiriToSystemAnalysis(input: BirthInfo): SystemAnalysis {
  const r = calculateZeiri(input);
  const traits: Trait[] = [];
  if (r.bestDays[0]) traits.push({ label: `最佳日：${r.bestDays[0].date}`, description: `${r.bestDays[0].jian.name}日（${r.bestDays[0].jian.nature}）運勢${r.bestDays[0].personalLuck}`, score: 85, type: 'strength', dimension: 'career', source: 'zeiri' });
  if (r.avoidDays[0]) traits.push({ label: `迴避日：${r.avoidDays[0].date}`, description: `${r.avoidDays[0].jian.name}日（${r.avoidDays[0].jian.nature}）`, score: 30, type: 'weakness', dimension: 'health', source: 'zeiri' });
  return { system: 'zeiri', systemName: '擇日學', rawData: r, traits, timing: [] };
}
