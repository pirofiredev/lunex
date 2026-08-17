import { Resend } from "resend";

let resendSingleton: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendSingleton) resendSingleton = new Resend(process.env.RESEND_API_KEY);
  return resendSingleton;
}

export interface OrderEmailPayload {
  orderId: string;
  email: string | null;
  phone: string | null;
  customerName: string | null;
  shippingAddress: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    postalCode: string | null;
    country: string | null;
  } | null;
  lineItems: { name: string; quantity: number }[];
  shippingCHF: number;
  totalCHF: number;
}

function addressBlock(a: OrderEmailPayload["shippingAddress"]) {
  if (!a) return "No shipping address collected.";
  return [a.line1, a.line2, [a.postalCode, a.city].filter(Boolean).join(" "), a.country]
    .filter(Boolean)
    .join("<br/>");
}

function itemsBlock(items: OrderEmailPayload["lineItems"]) {
  return items
    .map(
      (i) =>
        `<tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px;">${i.name}</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; font-size: 14px; text-align: right;">×${i.quantity}</td>
        </tr>`
    )
    .join("");
}

const emailStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
    background-color: #ffffff;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
  }
  .header {
    padding: 40px 32px 32px;
    border-bottom: 1px solid #000000;
  }
  .logo {
    font-family: 'Courier New', Courier, monospace;
    font-size: 24px;
    font-weight: bold;
    letter-spacing: 0.2em;
    color: #000000;
    margin: 0;
  }
  .content {
    padding: 32px;
  }
  .title {
    font-size: 32px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 8px 0;
    color: #000000;
  }
  .order-id {
    font-size: 12px;
    color: #666666;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 32px 0;
  }
  .section {
    margin-bottom: 32px;
  }
  .section-title {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #000000;
    margin: 0 0 12px 0;
  }
  .section-content {
    font-size: 14px;
    line-height: 1.6;
    color: #000000;
  }
  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
  }
  .total-row {
    padding-top: 16px;
    margin-top: 16px;
    border-top: 2px solid #000000;
  }
  .total {
    font-size: 18px;
    font-weight: bold;
    color: #000000;
  }
  .footer {
    padding: 32px;
    border-top: 1px solid #e5e5e5;
    font-size: 12px;
    color: #666666;
    line-height: 1.6;
  }
`;

/**
 * Notifies the store owner (ORDER_NOTIFICATION_EMAIL) that a paid order came
 * in and needs to be shipped. Silently no-ops if RESEND_API_KEY isn't set,
 * since Supabase (the other write in the webhook) already has the order.
 */
export async function sendOrderNotificationEmail(order: OrderEmailPayload) {
  const resend = getResend();
  const to = process.env.ORDER_NOTIFICATION_EMAIL;
  if (!resend || !to) return;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "LUNEX Orders <onboarding@resend.dev>",
    to,
    subject: `New order — ship to ${order.customerName ?? order.email ?? "customer"}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">LUNEX</h1>
            </div>

            <div class="content">
              <h2 class="title">New Order</h2>
              <p class="order-id">Order ${order.orderId}</p>

              <div class="section">
                <h3 class="section-title">Ship To</h3>
                <div class="section-content">
                  ${order.customerName ? `<strong>${order.customerName}</strong><br/>` : ""}
                  ${addressBlock(order.shippingAddress)}
                </div>
              </div>

              <div class="section">
                <h3 class="section-title">Contact</h3>
                <div class="section-content">
                  ${order.email ?? "—"}<br/>
                  ${order.phone ?? "—"}
                </div>
              </div>

              <div class="section">
                <h3 class="section-title">Items</h3>
                <table class="items-table">
                  ${itemsBlock(order.lineItems)}
                </table>
              </div>

              <div class="total-row">
                <table width="100%">
                  <tr>
                    <td style="font-size: 14px; color: #666666;">Shipping</td>
                    <td style="text-align: right; font-size: 14px;">CHF ${order.shippingCHF.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding-top: 8px;"><span class="total">Total</span></td>
                    <td style="text-align: right; padding-top: 8px;"><span class="total">CHF ${order.totalCHF.toFixed(2)}</span></td>
                  </tr>
                </table>
              </div>
            </div>

            <div class="footer">
              This order has been paid via Stripe and is ready to ship.
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

/** Optional order-confirmation email to the customer. Same no-op behavior if unconfigured. */
export async function sendOrderConfirmationEmail(order: OrderEmailPayload) {
  const resend = getResend();
  if (!resend || !order.email) return;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "LUNEX <onboarding@resend.dev>",
    to: order.email,
    subject: "Your LUNEX order is confirmed",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">LUNEX</h1>
            </div>

            <div class="content">
              <h2 class="title">Order Confirmed</h2>
              <p class="order-id">Order ${order.orderId}</p>

              <div class="section">
                <h3 class="section-title">Shipping To</h3>
                <div class="section-content">
                  ${order.customerName ? `<strong>${order.customerName}</strong><br/>` : ""}
                  ${addressBlock(order.shippingAddress)}
                </div>
              </div>

              <div class="section">
                <h3 class="section-title">Items</h3>
                <table class="items-table">
                  ${itemsBlock(order.lineItems)}
                </table>
              </div>

              <div class="total-row">
                <table width="100%">
                  <tr>
                    <td style="font-size: 14px; color: #666666;">Shipping</td>
                    <td style="text-align: right; font-size: 14px;">CHF ${order.shippingCHF.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding-top: 8px;"><span class="total">Total</span></td>
                    <td style="text-align: right; padding-top: 8px;"><span class="total">CHF ${order.totalCHF.toFixed(2)}</span></td>
                  </tr>
                </table>
              </div>
            </div>

            <div class="footer">
              Your order will be shipped from Geneva, Switzerland within 2 business days.<br/>
              Thank you for your order.
            </div>
          </div>
        </body>
      </html>
    `,
  });
}
