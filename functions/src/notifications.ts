import * as fetch from "node-fetch";
import {Response} from "node-fetch";
import * as nodemailer from "nodemailer";
import {Transporter, SendMailOptions} from "nodemailer";

export const sendMessage = function(message: string, numbers: Array<string>) {
  const [plivoKey, plivoSecret] = ["dummy", "dummy"];
  // process.env.PLIVO_KEY?.split(':') || [];

  const url = `https://api.plivo.com/v1/Account/${plivoKey}/Message/`;
  const auth = Buffer.from(`${plivoKey}:${plivoSecret}`).toString("base64");

  return fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      src: "+16788536005",
      dst: numbers.join("<"),
      text: message,
    }),
  })
    .then((resp: Response) => {
      if (!resp.ok) {
        console.log(`Error: ${resp.status}`, resp.statusText);
        throw new Error(`HTTP error! status: ${resp.status}`);
      }
      return "OK";
    })
    .catch((err: Error) => {
      console.log("Error:", err);
      throw err;
    });

  // const apikey =  process.env.TEXTLOCAL_KEY;
  // const form = {
  //     apikey,
  //     message,
  //     numbers: numbers.join(", "),
  //     sender: "OCTVES"
  // };
//   console.log(form);
  // return request.post({
  //   url: "https://api.textlocal.in/send/",
  //   form: form
  // }, (err: any, resp: any, body: any) => {
  //   // console.log(body);
  //   return "OK";
  // });
};

interface SendMailParams {
  from?: string;
  to: string;
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
  icalEvent?: any;
}

export const sendEmail = async function({
  to,
  subject,
  body,
  cc,
  bcc,
  from = "MyFitWave <noreply@myfitwave.com>",
  icalEvent,
}: SendMailParams): Promise<nodemailer.SentMessageInfo> {
  const [smtpUser, smtpPassword] = process.env.SMTP_KEY?.split(":") || [];
  const transporter: Transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });

  const mailOptions: SendMailOptions = {
    from,
    to: to.split(","),
    cc,
    bcc,
    subject,
    html: body,
    icalEvent,
  };

  return await transporter.sendMail(mailOptions);
};

// export const sendPaymentSMS = function(
// student: string, nClasses: number, date: Date, numbers: Array<string>) {
//   const dateStr = date.toISOString().split("T")[0];
//   const message = `${student} has purchased
// ${nClasses} classes on ${dateStr}.
//   return sendMessage(message, numbers);
// }

export const sendWelcomeEmailToMember = async function(
  memberName: string,
  memberEmail: string,
  memberPassword: string,
  trainerName: string,
) {
  const body = `<html>
  <head>
    <meta charset="UTF-8">
    <title>Welcome to MyfitWave!</title>
    <style>
      body { 
        font-family: Arial, sans-serif; 
        color: #333; 
        background-color: #f7f7f7; 
        margin: 0; 
        padding: 0; 
      }
      .container { 
        width: 100%; 
        max-width: 600px; 
        margin: auto; 
        background-color: #ffffff; 
        padding: 20px; 
        border-radius: 10px; 
      }
      .header { text-align: center; }
      .header img { 
        width: 100px; 
        margin-bottom: 10px; 
      }
      .button {
        background-color: #4CAF50;
        color: white;
        padding: 14px 20px;
        margin: 20px 0;
        border: none;
        border-radius: 5px;
        text-align: center;
        display: inline-block;
        text-decoration: none;
        font-weight: bold;
      }
      .features, .bonus { margin-top: 20px; }
      .footer { 
        text-align: center; 
        font-size: 12px; 
        color: #888; 
        margin-top: 30px; 
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://www.myfitwave.com/assets/images/logo_with_text_1024.png" 
             alt="MyfitWave Logo">
        <h2>Welcome to <span style="color:#4CAF50;">MyFitWave</span>!</h2>
        <p>You're officially on board</p>🎉
      </div>

      <p>Hi <strong>${memberName}</strong>,</p>

      <p>Your personal trainer <strong>${trainerName}</strong> has invited
         you to join <strong>MyFitWave</strong> – your all-in-one app for
         tracking workouts, chatting with your trainer, and staying on top
         of your progress.</p>

      <h3>Your Login Details</h3>
      <p><strong>Username:</strong> ${memberEmail} <br>
         <strong>Password:</strong> ${memberPassword}</p>

      <a class="button" href="https://app.myfitwave.com/login" target="_blank">
        Log In Now
      </a>

      <div class="features">
        <h3>🔥 Core Features</h3>
        <ul>
          <li>💬 <strong>Trainer Chat</strong> – Stay connected & ask questions 
              anytime</li>
          <li>📅 <strong>Workout Plan</strong> – View and track your daily 
              workouts</li>
          <li>📷 <strong>AI Form Feedback</strong> – Upload videos/images and
              get posture tips</li>
          <li>📊 <strong>Personal Progress Reports</strong> – Track what's 
              improving</li>
        </ul>
      </div>

      <div class="bonus">
        <h3>🎁 Bonus Features</h3>
        <ul>
          <li>🪞 <strong>Mirror Moment</strong> – Upload your best mirror selfies
              & track visual gains</li>
          <li>📈 <strong>Habit Tracker</strong> – Build habits that power your 
              transformation</li>
        </ul>
      </div>

      <p>If you have any questions, just reply to this email. We're excited to 
         support you every rep of the way 💪</p>

      <div class="footer">
        <p>Made with ❤️ by MyFitWave • 
           <a href="https://myfitwave.com">myfitwave.com</a></p>
        <p>Follow us on 
           <a href="https://instagram.com/yourapp">Instagram</a> | 
           <a href="mailto:support@myfitwave.com">Support</a></p>
      </div>
    </div>
  </body>
  </html>`;

  return sendEmail({
    to: memberEmail,
    subject: "Welcome to MyFitWave!",
    body,
    from: "MyFitWave Support<support@myfitwave.com>",
  });
};
