import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";

const port = Number(process.env.STRIPE_WEBHOOK_PORT ?? 8787);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const toleranceSeconds = 300;

if (!webhookSecret) {
  console.error(
    "Missing STRIPE_WEBHOOK_SECRET. Add it to .env.local before starting the webhook server.",
  );
  process.exit(1);
}

function parseSignatureHeader(header) {
  const values = new Map();
  for (const part of header.split(",")) {
    const [key, value] = part.split("=", 2);
    if (key && value) values.set(key, value);
  }
  return { timestamp: values.get("t"), signature: values.get("v1") };
}

function verifyStripeSignature(rawBody, header) {
  if (!header) return false;
  const { timestamp, signature } = parseSignatureHeader(header);
  if (!timestamp || !signature) return false;

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber)) return false;
  if (Math.abs(Date.now() / 1000 - timestampNumber) > toleranceSeconds) return false;

  const expected = createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > 1_000_000) {
        reject(new Error("Webhook payload exceeds 1 MB"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true, service: "stripe-webhook-dev" }));
    return;
  }

  if (request.method !== "POST" || request.url !== "/api/stripe/webhook") {
    response.writeHead(404, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  try {
    const rawBody = await readBody(request);
    if (!verifyStripeSignature(rawBody, request.headers["stripe-signature"])) {
      response.writeHead(400, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "Invalid Stripe signature" }));
      return;
    }

    const event = JSON.parse(rawBody);
    console.log(
      JSON.stringify({
        receivedAt: new Date().toISOString(),
        eventId: event.id ?? null,
        type: event.type ?? "unknown",
        paymentIntentId: event.data?.object?.id ?? null,
      }),
    );

    if (event.type === "payment_intent.succeeded" || event.type === "checkout.session.completed") {
      console.log(`Stripe test payment succeeded: ${event.data?.object?.id ?? "unknown"}`);
    }

    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ received: true }));
  } catch (error) {
    console.error(error);
    response.writeHead(400, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Invalid webhook payload" }));
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Stripe webhook receiver listening on http://127.0.0.1:${port}/api/stripe/webhook`);
});
