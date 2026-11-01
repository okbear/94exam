import { useState } from "react";
import {
  questions,
  type Category,
  type Difficulty,
} from "../../../lib/questions";
import {
  makeQueue,
  previews,
  recordReview,
  type Grade,
  type SavedCard,
  type StudyData,
} from "../../../lib/study";
import type { Genre } from "../types";
export const sessionSize = 10;
export type SelectedAnswer = number | "unknown";
type SessionState = {
  queue: string[];
  position: number;
  selected: SelectedAnswer | null;
  revealed: boolean;
  options: { grade: Grade; card: SavedCard }[];
  busy: boolean;
  sessionCorrect: number;
};
const initialSession = (): SessionState => ({
  queue: [],
  position: 0,
  selected: null,
  revealed: false,
  options: [],
  busy: false,
  sessionCorrect: 0,
});
export function useStudySession(
  data: StudyData,
  onUpdate: (data: StudyData) => void,
  onError: (message: string) => void,
) {
  const [state, setState] = useState(initialSession);
  const question = questions.find((q) => q.id === state.queue[state.position]);
  const correct = !!question && state.selected === question.answer;
  function start(
    genre: Genre,
    category?: Category,
    questionId?: string,
    difficulty?: Difficulty,
  ) {
    const queue = questionId
      ? [questionId]
      : makeQueue(
          data,
          category,
          new Date(),
          genre === "all" ? undefined : genre,
          difficulty,
        ).slice(0, sessionSize);
    setState({ ...initialSession(), queue });
  }
  async function select(selected: SelectedAnswer) {
    if (!question || state.revealed || state.busy) return;
    setState((s) => ({ ...s, selected, busy: true }));
    try {
      const options = await previews(data, question.id);
      setState((s) => ({ ...s, options, revealed: true }));
    } catch {
      setState((s) => ({ ...s, selected: null }));
      onError("復習時期の計算に失敗しました。もう一度お試しください。");
    } finally {
      setState((s) => ({ ...s, busy: false }));
    }
  }
  async function grade(grade: Grade) {
    if (!question || state.busy || !state.revealed) return;
    setState((s) => ({ ...s, busy: true }));
    try {
      onUpdate(await recordReview(data, question.id, correct, grade));
      setState((s) => ({
        ...s,
        sessionCorrect: s.sessionCorrect + Number(correct),
        position: s.position + 1,
        selected: null,
        revealed: false,
        options: [],
      }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "回答の記録に失敗しました。もう一度お試しください。",
      );
    } finally {
      setState((s) => ({ ...s, busy: false }));
    }
  }
  return { ...state, question, correct, start, select, grade };
}
export type StudySession = ReturnType<typeof useStudySession>;
