import data from "../database/studies.json";

export type Study = {
  id: number;
  type: string;
  date: string;
  topic: string;
  speaker: string;
  detail: string;
  status: string;
};

const records = (data.records ?? []) as Study[];
let studies: Study[] = records.map((study) => ({ ...study }));

function statusFor(date: string) {
  return new Date(date) < new Date() ? "진행 완료" : "예정";
}

export function listStudies() {
  return [...studies].sort((left, right) => left.date.localeCompare(right.date) || left.id - right.id);
}

export function createStudy(input: Omit<Study, "id" | "status">) {
  const nextId = studies.reduce((max, study) => Math.max(max, study.id), 0) + 1;
  const study = { ...input, id: nextId, status: statusFor(input.date) };
  studies = [...studies, study];
  return study;
}

export function updateStudy(id: number, input: Omit<Study, "id" | "status">) {
  const study = { ...input, id, status: statusFor(input.date) };
  studies = studies.map((item) => (item.id === id ? study : item));
  return study;
}

export function deleteStudy(id: number) {
  const before = studies.length;
  studies = studies.filter((study) => study.id !== id);
  return studies.length !== before;
}

export function normalizeStudy(body: Record<string, unknown>) {
  const date = String(body.date ?? "");
  const topic = String(body.topic ?? "").trim();
  const speaker = String(body.speaker ?? "").trim();
  const detail = String(body.detail ?? "").trim();
  const type = String(body.type ?? "오프라인");

  if (!date || !topic || !speaker || !detail) return null;

  return {
    type: type === "온라인" ? "온라인" : "오프라인",
    date,
    topic,
    speaker,
    detail,
  };
}
