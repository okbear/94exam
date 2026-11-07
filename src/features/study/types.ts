import type { Category, QuestionKind, Difficulty } from "../../lib/questions";
export type View = "home" | "library" | "stats" | "settings" | "study";
export type Genre = QuestionKind | "all";
export type StartStudy = (category?: Category, questionId?: string) => void;
export type LibraryFilters = {
  category: Category | "all";
  search: string;
  onlyBookmarks: boolean;
  progress: "all" | "answered" | "unanswered";
};

export type DifficultyFilter = Difficulty | "all";
