var nodemailer = require('nodemailer');
const app_config = JSON.parse(fs.readFileSync('app_config.json'));
var transporter = nodemailer.createTransport({
  service: 'sendgrid',
  auth: {
    user: app_config.mail_user,
    pass: app_config.mail_pws
  }
});

var mailOptions = {
  from: 'lr@upsky.be',
  to: 'ludovic.reenaers@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});