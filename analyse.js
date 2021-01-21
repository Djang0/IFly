const IGCAnalyzer = require('./my-igc-analyzer');
const fs = require('fs');

const igcData = fs.readFileSync('test.igc', 'utf8');

const analyzer = new IGCAnalyzer(igcData);
const analyzedData = analyzer.parse(true, true);
//console.log(analyzedData.track.thermals);
//console.log("-----------------------------");
//console.log(JSON.stringify(analyzedData.track.thermals, null, 4));
maxpress = 0
maxgps = 0

console.log(JSON.stringify(analyzedData, null, 4));