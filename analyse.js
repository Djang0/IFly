const IGCAnalyzer = require('igc-analyzer');
const fs = require('fs');

const igcData = fs.readFileSync('test.igc', 'utf8');

const analyzer = new IGCAnalyzer(igcData);
const analyzedData = analyzer.parse(true, true);

maxpress = 0
maxgps = 0

console.log(JSON.stringify(analyzedData, null, 4));