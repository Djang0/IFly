const fs = require('fs');
const IGCParser = require('igc-parser');
const {
  scoring,
  solver
} = require('igc-xc-score');
const flight = IGCParser.parse(fs.readFileSync('test.igc', 'utf8'), {
  lenient: true
});
const result = solver(flight, scoring.FFVL).next().value;

//console.log(JSON.stringify(result));
console.log('score ' + result.score);

console.log('distance ' + result.scoreInfo.distance);