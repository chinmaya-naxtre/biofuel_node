const nodemailer = require("nodemailer");
module.exports = {
  sendEmail: async () => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "naxtresmtp@gmail.com", // generated ethereal user
        pass: "naxtre@123", // generated ethereal password
      },
    });
    let currentTime = new Date();
    let mailOpt = {
      from: "naxtresmtp@gmail.com", // sender address
      to: "mukti.naxtre@gmail.com", // list of receivers
      subject: "Cron job testing", // Subject line
      text: "Cron Job success", // plain text body
      html: "<h1>The time is " + currentTime + "</h1>", // html body
    };
    // send mail with defined transport object
    await transporter.sendMail(mailOpt, (err, suc) => {
      let data;
      if (err) {
        console.log(err);
        data = {
          status: 0,
          msg: "Mail Error (1)",
          dev_info: err,
        };
      } else {
        data = {
          status: 1,
          msg: "Email Sent successfully",
          dev_info: suc.response,
        };
      }
      console.log(data);
      res.send(data);
    });
  },
};
