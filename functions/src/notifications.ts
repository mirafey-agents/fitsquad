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

