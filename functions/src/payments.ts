import {onRequest, onCall} from "firebase-functions/https";
import {updateMemberPlan} from "./members";
import * as notifs from "./notifications";
import * as admin from "firebase-admin";

const subscriptionPlans: any = {
  "member_free": {
    "id": "member_free",
    "name": "Free Membership",
    "role": "member",
    "amount": 0,
    "validityDays": 0,
    "description": "2 weeks of history.",
  },
  "member_1m": {
    "id": "member_1m",
    "name": "Premium Membership",
    "role": "member",
    "amount": 249,
    "validityDays": 31,
    "description": "Unlimited history!!",
  },
  "member_3m": {
    "id": "member_3m",
    "name": "Premium Membership",
    "role": "member",
    "amount": 675,
    "validityDays": 93,
    "description": "10% off over monthly plan.",
  },
  "member_12m": {
    "id": "member_12m",
    "name": "Premium Membership",
    "role": "member",
    "amount": 2540,
    "validityDays": 366,
    "description": "15% off over monthly plan.",
  },
  "trainer_free": {
    "id": "trainer_free",
    "name": "Trainer Basic",
    "role": "trainer",
    "amount": 0,
    "validityDays": 0,
    "description": "Upto 3 clients.",
  },
  "trainer_plus_1m": {
    "id": "trainer_plus_1m",
    "name": "Trainer Plus",
    "role": "trainer",
    "amount": 999,
    "validityDays": 31,
    "description": "Upto 10 clients!",
  },
  "trainer_plus_6m": {
    "id": "trainer_plus_6m",
    "name": "Trainer Plus",
    "role": "trainer",
    "amount": 5399,
    "validityDays": 186,
    "description": "10% off over monthly Trainer Plus plan.",
  },
  "trainer_pro_1m": {
    "id": "trainer_pro_1m",
    "name": "Trainer Pro",
    "role": "trainer",
    "amount": 4999,
    "validityDays": 31,
    "description": "Unlimited clients!!",
  },
  "trainer_pro_6m": {
    "id": "trainer_pro_6m",
    "name": "Trainer Pro",
    "role": "trainer",
    "amount": 26999,
    "validityDays": 366,
    "description": "10% off over monthly Trainer Pro plan.",
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
  const days = subscriptionPlans[billingPlan].validityDays;
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
    console.log(JSON.stringify(req.headers), JSON.stringify(req.body));
    const body = req.body;
    const payment = body.payload.payment.entity;
    const date = new Date(body.created_at * 1000);
    const bp = payment.notes.billingPlan || "";

    if (payment.notes.userId) {
      await markPayment(
        payment.amount/100,
        payment.notes.userId,
        payment.id,
        "RazorPay",
        date,
        bp
      );

      resp.send("OK");

      const validUntil = calculateValidUntil(date, bp);
      await updateMemberPlan(payment.notes.userId, bp, validUntil);

      const emailBody = `<html>userId: ${payment.notes.userId}<br>` +
      `plan: ${bp}<br>` +
      `validUntil: ${validUntil.toISOString()}<br>` +
      `paymentId: ${payment.id}<br>` +
      `amount: ${payment.amount/100}<br>` +
      "<html>";

      await notifs.sendEmail({
        to: "support@myfitwave.com",
        subject: "Payment Successful",
        body: emailBody,
      });
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
    const amount = subscriptionPlans[billingPlan].amount;
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

export const getSubscriptionPlans = onCall(
  {cors: true},
  async (request: any) => {
    return Object.values(subscriptionPlans).filter(
      (plan: any) => plan.role === request.data.role);
  });
