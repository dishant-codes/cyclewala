/* Emails to the shop owner: a new customer account, a new order and a new service booking.
 *
 * Sent through any SMTP mailbox. For Gmail (cyclewalastore@gmail.com) turn on 2-step verification, create an
 * "App password" (Google Account -> Security -> App passwords) and set:
 *
 *   SMTP_USER=cyclewalastore@gmail.com
 *   SMTP_PASS=<the 16-letter app password>        (never the normal Gmail password)
 *
 * Optional: NOTIFY_EMAIL (where the mails go, default cyclewalastore@gmail.com), SMTP_HOST / SMTP_PORT for a
 * provider other than Gmail, MAIL_DRY_RUN=true to print the mails to the server log instead of sending.
 *
 * A mail that fails to send is logged and nothing else: it can never make an order, a booking or a sign-up fail,
 * and it is sent after the customer's response, so it never makes them wait.
 */
import nodemailer from "nodemailer";
import { after } from "next/server";
import type { Order } from "@/lib/orders";
import type { Booking } from "@/lib/bookings";

const TO = () => process.env.NOTIFY_EMAIL?.trim() || "cyclewalastore@gmail.com";
const dryRun = () => process.env.MAIL_DRY_RUN === "true";
export const mailConfigured = () => dryRun() || !!(process.env.SMTP_USER && process.env.SMTP_PASS);

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST";
const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

function transport() {
  if (dryRun()) return nodemailer.createTransport({ jsonTransport: true });
  const port = Number(process.env.SMTP_PORT) || 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function send(subject: string, text: string, html: string) {
  if (!mailConfigured()) {
    console.warn("[mail] not configured (set SMTP_USER and SMTP_PASS) — skipped:", subject);
    return;
  }
  try {
    const info = await transport().sendMail({
      from: `"Cycle Wala website" <${process.env.SMTP_USER || "no-reply@cyclewala.shop"}>`,
      to: TO(),
      subject,
      text,
      html,
    });
    if (dryRun()) console.log("[mail:dry-run]", subject, "\n" + text);
    else console.log("[mail] sent:", subject, info.messageId);
  } catch (err) {
    console.error("[mail] could not send:", subject, err);
  }
}

/** send once the response has gone out (falls back to fire-and-forget outside a request) */
function later(subject: string, text: string, html: string) {
  const job = () => send(subject, text, html);
  try {
    after(job);
  } catch {
    void job();
  }
}

/* ---- layout ---- */

const row = (k: string, v: string) =>
  `<tr><td style="padding:6px 14px 6px 0;color:#6b7280;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;color:#111;font-weight:600">${v}</td></tr>`;

const shell = (title: string, body: string, footer = "") =>
  `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:20px;color:#111">
  <div style="background:#0a0a0c;border-radius:14px;padding:16px 20px"><span style="color:#67DD25;font-weight:800;font-size:18px">Cycle Wala</span></div>
  <h2 style="margin:20px 0 10px;font-size:20px">${esc(title)}</h2>
  ${body}
  ${footer ? `<p style="margin-top:22px;color:#6b7280;font-size:13px">${footer}</p>` : ""}
</div>`;

const adminLink = () => {
  const base = siteUrl();
  return base ? `<a href="${esc(base)}/admin/dashboard" style="color:#3c8a24;font-weight:700">Open the admin</a> to manage it.` : "Open the admin to manage it.";
};

/* ---- the three notifications ---- */

export function notifyNewCustomer(c: { name: string; email: string; id?: string; createdAt?: string }) {
  const at = when(c.createdAt || new Date().toISOString());
  const text = `New customer account\n\nName: ${c.name}\nEmail: ${c.email}\n${c.id ? `Account: ${c.id}\n` : ""}Signed up: ${at}\n`;
  const html = shell(
    "New customer account",
    `<table style="border-collapse:collapse;font-size:15px">${row("Name", esc(c.name))}${row("Email", esc(c.email))}${c.id ? row("Account", esc(c.id)) : ""}${row("Signed up", esc(at))}</table>`
  );
  later(`New customer: ${c.name}`, text, html);
}

export function notifyNewOrder(o: Order) {
  const lines = o.items.map((i) => {
    const opts = [i.color, i.size, i.type].filter(Boolean).join(" · ");
    return { name: `${i.brand} ${i.model}`, opts, qty: i.qty, price: i.price };
  });
  const priced = o.items.every((i) => i.price !== null);
  const total = priced ? inr(o.total) : o.total > 0 ? `from ${inr(o.total)} (some items priced on request)` : "price on request";
  const text =
    `NEW ORDER ${o.id}\nTotal: ${total}\nPlaced: ${when(o.createdAt)}\n\n` +
    `Customer: ${o.customer.name}\nPhone: ${o.customer.phone}\nAddress: ${o.customer.address}\n${o.customer.note ? `Note: ${o.customer.note}\n` : ""}` +
    `${o.customerKey ? "Signed-in customer: yes\n" : ""}\nItems:\n` +
    lines.map((l) => `- ${l.name}${l.opts ? ` (${l.opts})` : ""} x ${l.qty}  ${l.price === null ? "price on request" : inr(l.price * l.qty)}`).join("\n") +
    "\n\nPay at store / cash on delivery. Please call the customer to confirm.\n";
  const items = lines
    .map(
      (l) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee"><strong>${esc(l.name)}</strong>${l.opts ? `<br><span style="color:#6b7280;font-size:13px">${esc(l.opts)}</span>` : ""}</td><td style="padding:8px 8px;border-bottom:1px solid #eee;text-align:center">× ${l.qty}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${l.price === null ? "on request" : inr(l.price * l.qty)}</td></tr>`
    )
    .join("");
  const html = shell(
    `New order ${o.id}`,
    `<p style="font-size:26px;font-weight:800;margin:4px 0 14px">${esc(total)}</p>
    <table style="border-collapse:collapse;font-size:15px">${row("Customer", esc(o.customer.name))}${row("Phone", `<a href="tel:${esc(o.customer.phone)}" style="color:#111">${esc(o.customer.phone)}</a>`)}${row("Address", esc(o.customer.address))}${o.customer.note ? row("Note", esc(o.customer.note)) : ""}${row("Placed", esc(when(o.createdAt)))}${o.customerKey ? row("Account", "signed-in customer") : ""}</table>
    <h3 style="margin:20px 0 6px;font-size:16px">Items</h3>
    <table style="border-collapse:collapse;width:100%;font-size:15px">${items}</table>`,
    `Pay at store / cash on delivery — please call the customer to confirm. ${adminLink()}`
  );
  later(`New order ${o.id} — ${priced || o.total > 0 ? total : "price on request"}`, text, html);
}

export function notifyNewBooking(b: Booking) {
  const text =
    `NEW SERVICE BOOKING ${b.id}\n${b.service.title} (${inr(b.service.price)})\nPlaced: ${when(b.createdAt)}\n\n` +
    `Customer: ${b.customer.name}\nPhone: ${b.customer.phone}\n${b.customer.address ? `Address: ${b.customer.address}\n` : ""}${b.customer.cycle ? `Cycle: ${b.customer.cycle}\n` : ""}${b.customer.date ? `Preferred date: ${b.customer.date}\n` : ""}${b.customer.note ? `Note: ${b.customer.note}\n` : ""}`;
  const html = shell(
    `New service booking ${b.id}`,
    `<p style="font-size:20px;font-weight:800;margin:4px 0 14px">${esc(b.service.title)} — ${esc(inr(b.service.price))}</p>
    <table style="border-collapse:collapse;font-size:15px">${row("Customer", esc(b.customer.name))}${row("Phone", `<a href="tel:${esc(b.customer.phone)}" style="color:#111">${esc(b.customer.phone)}</a>`)}${b.customer.address ? row("Address", esc(b.customer.address)) : ""}${b.customer.cycle ? row("Cycle", esc(b.customer.cycle)) : ""}${b.customer.date ? row("Preferred date", esc(b.customer.date)) : ""}${b.customer.note ? row("Note", esc(b.customer.note)) : ""}${row("Placed", esc(when(b.createdAt)))}</table>`,
    `Please call the customer to confirm a time. ${adminLink()}`
  );
  later(`New service booking ${b.id}: ${b.service.title}`, text, html);
}
