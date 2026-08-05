import { createStudy, deleteStudy, listStudies, normalizeStudy, updateStudy } from "@/lib/apps-script-client";
import { requireAdmin } from "../admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const studies = await listStudies();
  return Response.json({ studies }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const input = normalizeStudy(body);
    if (!input) return Response.json({ error: "필수 항목을 확인해주세요." }, { status: 400 });
    const study = await createStudy(input);
    return Response.json({ study }, { status: 201 });
  } catch {
    return Response.json({ error: "일정을 저장하지 못했습니다." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = Number(body.id);
    const input = normalizeStudy(body);
    if (!Number.isInteger(id) || !input) return Response.json({ error: "입력 내용을 확인해주세요." }, { status: 400 });
    const study = await updateStudy(id, input);
    return Response.json({ study });
  } catch {
    return Response.json({ error: "일정을 수정하지 못했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id)) return Response.json({ error: "잘못된 일정입니다." }, { status: 400 });
    const deleted = await deleteStudy(id);
    return Response.json({ deleted });
  } catch {
    return Response.json({ error: "일정을 삭제하지 못했습니다." }, { status: 500 });
  }
}
