import { maxReviews } from "./study-backup";
import { limitReviewToTarget } from "./target-schedule";
import { DefaultScheduler, Rating } from "ts-fsrs";
import {
  questions,
  type Category,
  type QuestionKind,
  type Difficulty,
} from "./questions";
export { Rating };
export type Grade = 1 | 2 | 3 | 4;
const schedulerPromise = DefaultScheduler({
  version: "FSRS-7",
  desiredRetention: 0.9,
  enableShortTerm: true,
  learningSteps: ["12h", "20h"],
  relearningSteps: ["12h"],
  enableFuzz: false,
});
type Scheduler = Awaited<typeof schedulerPromise>;
type Card = ReturnType<Scheduler["newCard"]>;
export type SavedCard = Omit<Card, "dueAt" | "lastReviewAt"> & {
  dueAt: string;
  lastReviewAt: string | null;
};
export type Review = {
  questionId: string;
  at: string;
  correct: boolean;
  grade: Grade;
};
export type StudyData = {
  version: 2;
  targetDate: string | null;
  cards: Record<string, SavedCard>;
  reviews: Review[];
  bookmarks: string[];
  goal: number;
};
export const emptyData = (): StudyData => ({
  version: 2,
  targetDate: null,
  cards: {},
  reviews: [],
  bookmarks: [],
  goal: 10,
});
export const storageKey = "kyuyo-study-v2";
export function dayKey(date = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(
    date,
  );
}
export { restoreData } from "./study-backup";
const hydrate = (c: SavedCard): Card => ({
  ...c,
  dueAt: new Date(c.dueAt),
  lastReviewAt: c.lastReviewAt ? new Date(c.lastReviewAt) : null,
});
export async function previews(data: StudyData, id: string, now = new Date()) {
  const s = await schedulerPromise;
  const card = data.cards[id]
    ? hydrate(data.cards[id])
    : s.newCard({ cardId: id, now });
  return [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy].map((grade) => {
    const result = s.review({ card, grade: grade as Grade, now });
    return {
      grade: grade as Grade,
      card: limitReviewToTarget(
        JSON.parse(JSON.stringify(result.card)) as SavedCard,
        data.targetDate,
        grade as Grade,
        now,
      ),
    };
  });
}
export async function recordReview(
  data: StudyData,
  id: string,
  correct: boolean,
  grade: Grade,
  now = new Date(),
): Promise<StudyData> {
  if (data.reviews.length >= maxReviews)
    throw new Error(
      "回答履歴が上限（50,000件）に達しました。バックアップを書き出し、設定から履歴をリセットしてください。",
    );
  const effectiveGrade = correct ? grade : Rating.Again;
  const next = (await previews(data, id, now)).find(
    (p) => p.grade === effectiveGrade,
  )!;
  return {
    ...data,
    cards: { ...data.cards, [id]: next.card },
    reviews: [
      ...data.reviews,
      { questionId: id, at: now.toISOString(), correct, grade: effectiveGrade },
    ],
  };
}
export function makeQueue(
  data: StudyData,
  category?: Category,
  now = new Date(),
  kind?: QuestionKind,
  difficulty?: Difficulty,
) {
  return questions
    .filter(
      (q) =>
        (!category || q.category === category) &&
        (!kind || q.kind === kind) &&
        (!difficulty || q.difficulty === difficulty) &&
        (!data.cards[q.id] || new Date(data.cards[q.id].dueAt) <= now),
    )
    .sort((a, b) => {
      const ca = data.cards[a.id],
        cb = data.cards[b.id];
      if (!ca && !cb) return 0;
      if (!ca) return 1;
      if (!cb) return -1;
      return Date.parse(ca.dueAt) - Date.parse(cb.dueAt);
    })
    .map((q) => q.id);
}
export function intervalLabel(due: string, now = new Date()) {
  const seconds = Math.max(
    1,
    Math.round((Date.parse(due) - now.getTime()) / 1000),
  );
  if (seconds < 60) return `${seconds}秒後`;
  const mins = Math.max(
    1,
    Math.round((Date.parse(due) - now.getTime()) / 60000),
  );
  return mins < 60
    ? `${mins}分後`
    : mins < 1440
      ? `${Math.round(mins / 60)}時間後`
      : `${Math.round(mins / 1440)}日後`;
}
