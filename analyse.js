const IGCAnalyzer = require('igc-analyzer');
const fs = require('fs');

const igcData = fs.readFileSync('test3.igc', 'utf8');

const analyzer = new IGCAnalyzer(igcData);
const analyzedData = analyzer.parse(true, true);

maxpress = 0
maxgps = 0
analyzedData.fixes.forEach((fix, i) => {
  if (fix.pressalt > maxpress) {
    maxpress = fix.pressalt
  }
  if (fix.gpsalt > maxgps) {
    maxgps = fix.gpsalt
  }
});

console.log(maxgps.toString() + " // " + maxpress.toString());