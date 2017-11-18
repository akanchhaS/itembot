const CREDS = require('./creds');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: CREDS.emailuser,
    pass: CREDS.emailpw
  }
});


module.exports = {
    send: function (senderEmail, receiverEmail, subject, text) { 
        var mailOptions = {
            from: senderEmail,
            to: receiverEmail,
            subject: subject,
            text: text
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        }); 
    } 
}