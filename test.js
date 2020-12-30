var dayjs = require('dayjs');
var duration = require('dayjs/plugin/duration');
dayjs.extend(duration);
sec=3058
hours_real=dayjs.duration(sec,'seconds').asHours();

hours_int=hours_real-parseFloat("0."+hours_real.toString().split('.')[1]);

minutes_real=dayjs.duration(hours_real-hours_int,'hours').asMinutes();

minutes_int=minutes_real-parseFloat("0."+minutes_real.toString().split('.')[1]);

seconds_real=dayjs.duration(minutes_real-minutes_int,'minutes').asSeconds();
console.log(seconds_real);
console.log(seconds_real.toString().split('.')[0]);
seconds_int=seconds_real-parseFloat("0."+seconds_real.toString().split('.')[1]);
console.log(seconds_int);
console.log(hours_int+" h "+minutes_int+" m "+seconds_int+" s ");
