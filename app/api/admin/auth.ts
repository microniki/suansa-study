const COOKIE_NAME = "suansa_admin";
const SESSION_SECONDS = 60 * 60 * 8;

function bytes(value: string) {
  return new TextEncoder().encode(value);
}

function hex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", bytes(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, bytes(value)));
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
}

function env(name: string) {
  return process.env[name] ?? "";
}

export async function credentialsAreValid(username: string, password: string) {
  return Boolean(
    env("ADMIN_USERNAME") &&
      env("ADMIN_PASSWORD") &&
      safeEqual(username, env("ADMIN_USERNAME")) &&
      safeEqual(password, env("ADMIN_PASSWORD")),
  );
}

export async function createSessionToken() {
  const secret = env("ADMIN_SESSION_SECRET");
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured.");
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `admin.${expires}`;
  const signature = await hmac(payload, secret);
  return `${payload}.${signature}`;
}

export function createSessionCookie(token: string) {
  return `${COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

export async function isAdmin(request: Request) {
  const secret = env("ADMIN_SESSION_SECRET");
  if (!secret) return false;
  const bearer = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  const token = bearer ?? (cookie ? cookie.slice(COOKIE_NAME.length + 1) : null);
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "admin") return false;
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires <= Math.floor(Date.now() / 1000)) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const signature = await hmac(payload, secret);
  return safeEqual(parts[2], signature);
}

export async function requireAdmin(request: Request) {
  if (await isAdmin(request)) return null;
  return Response.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
}
