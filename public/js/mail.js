const nodemailer = require("nodemailer");

module.exports = {
  sendMail: function (mailOptions) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ketakinderemd@gmail.com",
        pass: "ZodiDDDNA*t99_Qcj2K!mg-FjxiLKbdGyGd3M.ynJg*HKMuG.cH2VMFD!7umQgJZ84eZtVf.DJ!Hsx4c*T*ruf@k44bQ9xUr@Go_",
      },
    });

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      }
    });
  },
};
