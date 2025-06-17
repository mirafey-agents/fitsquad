import {onRequest, onCall} from "firebase-functions/https";
import {updateMemberPlan} from "./members";
import * as notifs from "./notifications";
import * as admin from "firebase-admin";

const subcriptionPlans: any = {
  "member_1m": {
    "role": "member",
    "amount": 10,
    "validityDays": 31,
  },
  "member_3m": {
    "role": "member",
    "amount": 30,
    "validityDays": 93,
  },
  "member_12m": {
    "role": "member",
    "amount": 120,
    "validityDays": 365,
  },
  "trainer_1m": {
    "role": "trainer",
    "amount": 10,
    "validityDays": 31,
  },
  "trainer_3m": {
    "role": "trainer",
    "amount": 30,
    "validityDays": 93,
  },
  "trainer_12m": {
    "role": "trainer",
    "amount": 120,
    "validityDays": 365,
  },
};

const markPayment = async function(
  amount: number, userId: string, pgPaymentId: string, pg: string,
  date: Date, billingPlan: string) {
  const paymentId = pg + "_" + pgPaymentId;
  await admin.firestore().collection("payments").doc(paymentId).set({
    amount: amount,
    userId: userId,
    createdAt: new Date(),
    date: date,
    paymentId: paymentId,
    pg: pg,
    billingPlan: billingPlan,
  });
};

const calculateValidUntil = function(
  startDate: Date, billingPlan: string): Date {
  const days = subcriptionPlans[billingPlan].validityDays;
  const validUntil = new Date(startDate);
  validUntil.setDate(validUntil.getDate() + days);
  return validUntil;
};

export const rzpOrderApproved = onRequest(
  {cors: true,
    secrets: ["SMTP_KEY", "SUPABASE_JWT_SECRET", "SUPABASE_SERVICE_KEY"],
  },
  async (req: any, resp: any) => {
    if (req.method !== "POST") {
      resp.send("");
      return;
    }
    console.log(req.body);
    const body = req.body;
    const payment = body.payload.payment.entity;

    if (payment.notes.userId) {
      await markPayment(
        payment.amount/100,
        payment.notes.userId,
        payment.id,
        "RazorPay",
        body.created_at,
        payment.notes.billingPlan || ""
      );

      const startDate = new Date(body.created_at);
      const validUntil = calculateValidUntil(
        startDate, payment.notes.billingPlan
      );
      await updateMemberPlan(
        payment.notes.userId,
        payment.notes.billingPlan,
        validUntil
      );
      const emailBody = `userId: ${payment.notes.userId}\n`+
      `plan: ${payment.notes.billingPlan}\n`+
      `validUntil: ${validUntil.toLocaleString()}`;

      await notifs.sendEmail({
        to: "rahul.sekar@gmail.com",
        subject: "Payment Successful",
        body: emailBody,
      });
      resp.send("OK");
    } else {
      await notifs.sendEmail({
        to: "support@myfitwave.com",
        subject: "Suspense Payment",
        body: JSON.stringify(body),
      }).then(() => {
        resp.send("OK");
      }).catch();
    }
  });

export const rzpCreateOrder = onCall(
  {cors: true, secrets: ["RAZORPAY_KEY"]},
  async (request: any) => {
    const {userId, billingPlan} = request.data;
    const url = "https://api.razorpay.com/v1/orders";
    const rzpKey = process.env.RAZORPAY_KEY || "rzp_test_key";
    const rpHeader = {
      Authorization: "Basic " + Buffer.from(rzpKey).toString("base64"),
    };
    const amount = subcriptionPlans[billingPlan].amount;
    const payload = {
      amount: amount * 100,
      currency: "INR",
      receipt: String(new Date().getTime()),
      payment_capture: "1",
      notes: {
        userId: userId,
        billingPlan: billingPlan,
      },
    };
    const response = await fetch(url, {
      method: "POST",
      headers: rpHeader,
      body: JSON.stringify(payload),
    });
    return response.json();
  });
