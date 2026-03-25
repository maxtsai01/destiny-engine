const input = { solarDate: '1993-08-07', hour: 9, gender: 'male', name: '蔡寅衍' };

const all: [string, string][] = [
  ['bazi','baziToSystemAnalysis'],['ziwei','ziweiToSystemAnalysis'],['astro','astroToSystemAnalysis'],
  ['name','nameToSystemAnalysis'],['numerology','numerologyToSystemAnalysis'],['iching','ichingToSystemAnalysis'],
  ['mbti','mbtiToSystemAnalysis'],['qimen','qimenToSystemAnalysis'],['humandesign','humanDesignToSystemAnalysis'],
  ['tarot','tarotToSystemAnalysis'],['fengshui','fengshuiToSystemAnalysis'],
  ['rainbow','rainbowToSystemAnalysis'],['liuyao','liuyaoToSystemAnalysis'],
  ['meihua','meihuaToSystemAnalysis'],['daliuren','daliurenToSystemAnalysis'],
  ['tieban','tiebanToSystemAnalysis'],['qizheng','qizhengToSystemAnalysis'],
  ['taiyi','taiyiToSystemAnalysis'],['zeiri','zeiriToSystemAnalysis'],['jyotish','jyotishToSystemAnalysis'],
  ['ziwei-flying','ziweiFlyingToSystemAnalysis'],['face','faceToSystemAnalysis'],
  ['astro-full','astroFullToSystemAnalysis'],['heluo','heluoToSystemAnalysis'],
  ['shengxiao','shengxiaoToSystemAnalysis'],['palmistry','palmistryToSystemAnalysis'],
  ['cezi','ceziToSystemAnalysis'],['dream','dreamToSystemAnalysis'],
  ['kabbalah','kabbalahToSystemAnalysis'],['mayan','mayanToSystemAnalysis'],
  ['enneagram','enneagramToSystemAnalysis'],['kyusei','kyuseiToSystemAnalysis'],
  ['bigfive','bigfiveToSystemAnalysis'],['color','colorToSystemAnalysis'],
];

let totalSys = 0, totalDims = 0;
const results: string[] = [];

for (const [dir, fn] of all) {
  try {
    const mod = require(`./src/systems/${dir}`);
    const r = mod[fn](input);
    totalSys++;
    totalDims += r.traits.length;
    results.push(`✅ ${r.systemName}（${r.traits.length}維）`);
    for (const t of r.traits) {
      results.push(`   ${t.type === 'strength' ? '🟢' : '🔴'} ${t.label} — ${t.score}/100`);
    }
  } catch (e: any) {
    results.push(`❌ ${dir} — ${e.message?.slice(0, 50)}`);
  }
}

results.push(`\n🏆 蔡寅衍完整命盤：${totalSys} 系統 × ${totalDims} 維度`);
console.log(results.join('\n'));
