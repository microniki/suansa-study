import { clearSessionCookie, createSessionCookie, createSessionToken, credentialsAreValid, isAdmin } from "./auth";

export async function GET(request: Request) {
  return Response.json({ authenticated: await isAdmin(request) }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { username?: string; password?: string };
    if (!await credentialsAreValid(String(body.username ?? ""), String(body.password ?? ""))) {
      return Response.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }
    const token = await createSessionToken();
    return Response.json({ authenticated: true, token }, { headers: { "set-cookie": createSessionCookie(token), "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "로그인 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE() {
  return Response.json({ authenticated: false }, { headers: { "set-cookie": clearSessionCookie(), "cache-control": "no-store" } });
}
