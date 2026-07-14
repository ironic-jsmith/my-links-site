import { getStore } from "@netlify/blobs";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const SESSION_SECONDS = 60 * 60 * 8;
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers }
});
const cookies = request => Object.fromEntries((request.headers.get("cookie") || "").split(";").map(item => {
  const index = item.indexOf("=");
  return index < 0 ? ["", ""] : [item.slice(0, index).trim(), decodeURIComponent(item.slice(index + 1).trim())];
}));
const sign = value => createHmac("sha256", process.env.DASHBOARD_SESSION_SECRET || "").update(value).digest("base64url");

function authenticated(request) {
  const token = cookies(request).stx_dashboard;
  if (!token || !process.env.DASHBOARD_SESSION_SECRET) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now(); } catch { return false; }
}

function clean(value, limit = 80) {
  return typeof value === "string" ? value.replace(/[<>]/g, "").slice(0, limit) : "";
}

export default async request => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "";

  if (request.method === "POST" && action === "login") {
    const { password = "" } = await request.json().catch(() => ({}));
    const configured = process.env.DASHBOARD_PASSWORD || "";
    if (!configured || !process.env.DASHBOARD_SESSION_SECRET || password.length !== configured.length || !timingSafeEqual(Buffer.from(password), Buffer.from(configured))) {
      return json({ error: "Invalid credentials." }, 401);
    }
    const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_SECONDS * 1000 })).toString("base64url");
    const token = payload + "." + sign(payload);
    return json({ ok: true }, 200, { "Set-Cookie": `stx_dashboard=${token}; Max-Age=${SESSION_SECONDS}; Path=/.netlify/functions/analytics; HttpOnly; Secure; SameSite=Strict` });
  }

  if (request.method === "POST" && action === "logout") {
    return json({ ok: true }, 200, { "Set-Cookie": "stx_dashboard=; Max-Age=0; Path=/.netlify/functions/analytics; HttpOnly; Secure; SameSite=Strict" });
  }

  if (request.method === "POST" && action === "event") {
    const origin = request.headers.get("origin");
    if (origin && origin !== url.origin) return json({ error: "Invalid origin." }, 403);
    const incoming = await request.json().catch(() => null);
    if (!incoming || !["view", "click", "interaction", "scroll"].includes(incoming.kind)) return json({ error: "Invalid event." }, 400);
    const event = {
      kind: incoming.kind, label: clean(incoming.label), title: clean(incoming.title),
      x: Number.isFinite(incoming.x) ? Math.max(0, Math.min(1, incoming.x)) : null,
      y: Number.isFinite(incoming.y) ? Math.max(0, Math.min(1, incoming.y)) : null,
      depth: Number.isFinite(incoming.depth) ? Math.max(0, Math.min(1, incoming.depth)) : null,
      at: new Date().toISOString()
    };
    await getStore("stx-analytics").set(`events/${event.at}-${randomUUID()}.json`, JSON.stringify(event));
    return new Response(null, { status: 204 });
  }

  if (request.method === "GET" && action === "report") {
    if (!authenticated(request)) return json({ error: "Unauthorized." }, 401);
    const store = getStore("stx-analytics");
    const { blobs } = await store.list({ prefix: "events/" });
    const selected = blobs.sort((a, b) => b.key.localeCompare(a.key)).slice(0, 2500);
    const events = (await Promise.all(selected.map(item => store.get(item.key, { type: "json" })))).filter(Boolean);
    return json({ events });
  }

  return json({ error: "Not found." }, 404);
};
