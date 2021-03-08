const IGCParser = require('igc-parser');
const fs = require('fs');
const {
  scoring,
  solver
} = require('igc-xc-score');

var score_flight = IGCParser.parse(fs.readFileSync('marcourt.igc', 'utf8'), {
  lenient: true
});

var result_ffvl = solver(score_flight, scoring.FFVL).next().value;
var result_xcontest = solver(score_flight, scoring.XContest).next().value;