import { questions } from "./questions";
import { isTargetDate } from "./target-schedule";
import type { Review, SavedCard, StudyData } from "./study";

export const maxBackupBytes = 8 * 1024 * 1024;
export const maxReviews = 50_000;
const defaultQuestionIds = new Set(questions.map((q) => q.id));
const invalid = () => new Error("学習データの形式が正しくありません。");
function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function number(
  value: unknown,
  max = Number.MAX_SAFE_INTEGER,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= max
  );
}
function integer(value: unknown): value is number {
  return number(value) && Number.isSafeInteger(value);
}
function timestamp(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString() === value
  );
}
function questionId(value: unknown, validIds: ReadonlySet<string>): value is string {
  return typeof value === "string" && validIds.has(value);
}
function card(
  id: string,
  value: unknown,
  validIds: ReadonlySet<string>,
): SavedCard {
  if (
    !object(value) ||
    !questionId(id, validIds) ||
    value.cardId !== id ||
    !timestamp(value.dueAt) ||
    !(value.lastReviewAt === null || timestamp(value.lastReviewAt)) ||
    ![0, 1, 2, 3].includes(value.state as number) ||
    !["new", "learning", "review"].includes(value.scheduleStatus as string) ||
    !number(value.stability) ||
    !number(value.stabilityFast) ||
    !number(value.difficulty, 10) ||
    !integer(value.reps) ||
    !integer(value.lapses) ||
    value.lapses > value.reps ||
    !number(value.scheduledDays, 36_500) ||
    !integer(value.learningStep) ||
    value.learningStep > 2
  )
    throw new Error("復習カードが破損しています。");
  return {
    cardId: id,
    dueAt: value.dueAt,
    lastReviewAt: value.lastReviewAt,
    state: value.state as SavedCard["state"],
    scheduleStatus: value.scheduleStatus as SavedCard["scheduleStatus"],
    stability: value.stability,
    stabilityFast: value.stabilityFast,
    difficulty: value.difficulty,
    reps: value.reps,
    lapses: value.lapses,
    scheduledDays: value.scheduledDays,
    learningStep: value.learningStep,
  };
}
function review(value: unknown, validIds: ReadonlySet<string>): Review {
  if (
    !object(value) ||
    !questionId(value.questionId, validIds) ||
    !timestamp(value.at) ||
    typeof value.correct !== "boolean" ||
    ![1, 2, 3, 4].includes(value.grade as number)
  )
    throw new Error("学習履歴が破損しています。");
  return {
    questionId: value.questionId,
    at: value.at,
    correct: value.correct,
    grade: value.grade as Review["grade"],
  };
}
export function restoreData(
  raw: string,
  validIds: ReadonlySet<string> = defaultQuestionIds,
): StudyData {
  // Check length before allocating an encoded copy or parsing attacker-controlled JSON.
  if (
    raw.length > maxBackupBytes ||
    new TextEncoder().encode(raw).byteLength > maxBackupBytes
  )
    throw new Error("バックアップは8MB以下のファイルを選んでください。");
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw invalid();
  }
  if (
    !object(value) ||
    value.version !== 2 ||
    !(value.targetDate === null || isTargetDate(value.targetDate)) ||
    !object(value.cards) ||
    Object.keys(value.cards).length > validIds.size ||
    !Array.isArray(value.reviews) ||
    value.reviews.length > maxReviews ||
    !Array.isArray(value.bookmarks) ||
    value.bookmarks.length > validIds.size ||
    !integer(value.goal) ||
    value.goal < 1 ||
    value.goal > 100
  )
    throw invalid();
  const bookmarks = value.bookmarks.map((id: unknown) => {
    if (!questionId(id, validIds)) throw invalid();
    return id;
  });
  if (new Set(bookmarks).size !== bookmarks.length) throw invalid();
  // Reconstruct the allowed schema rather than retaining unknown imported properties.
  return {
    version: 2,
    targetDate: value.targetDate,
    cards: Object.fromEntries(
      Object.entries(value.cards).map(([id, value]) => [
        id,
        card(id, value, validIds),
      ]),
    ),
    reviews: value.reviews.map((item) => review(item, validIds)),
    bookmarks,
    goal: value.goal,
  };
}
export async function readBackupFile(
  file: File,
  validIds: ReadonlySet<string> = defaultQuestionIds,
): Promise<StudyData> {
  if (file.size > maxBackupBytes)
    throw new Error("バックアップは8MB以下のファイルを選んでください。");
  return restoreData(await file.text(), validIds);
}
