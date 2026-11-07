import { DifficultySelector } from "../components/difficulty-selector";
import { Bookmark, Search } from "lucide-react";
import { categories, questions } from "../../../lib/questions";
import type { StudyData } from "../../../lib/study";
import type {
  DifficultyFilter,
  Genre,
  LibraryFilters,
  StartStudy,
} from "../types";
import { GenreSelector } from "../components/genre-selector";
import { PageTitle } from "../components/page-title";
import { LibraryQuestion } from "../components/library-question";
type Props = {
  data: StudyData;
  difficulty: DifficultyFilter;
  setDifficulty: (difficulty: DifficultyFilter) => void;
  kind: Genre;
  setKind: (kind: Genre) => void;
  filters: LibraryFilters;
  onFiltersChange: (filters: LibraryFilters) => void;
  bookmark: (id: string) => void;
  start: StartStudy;
};
export function LibraryScreen({
  data,
  difficulty,
  setDifficulty,
  kind,
  setKind,
  filters,
  onFiltersChange,
  bookmark,
  start,
}: Props) {
  const { category: filter, search, onlyBookmarks, progress } = filters;
  const attemptsByQuestion = new Map<string, { correct: number; total: number }>();
  for (const review of data.reviews) {
    const attempts = attemptsByQuestion.get(review.questionId) ?? { correct: 0, total: 0 };
    attempts.total++;
    attempts.correct += Number(review.correct);
    attemptsByQuestion.set(review.questionId, attempts);
  }
  const normalizedQuery = search.trim().normalize("NFKC").toLowerCase();
  const visibleQuestions = questions.filter(
    (q) =>
      (filter === "all" || q.category === filter) &&
      (kind === "all" || q.kind === kind) &&
      (difficulty === "all" || q.difficulty === difficulty) &&
      (!onlyBookmarks || data.bookmarks.includes(q.id)) &&
      (progress === "all" ||
        attemptsByQuestion.has(q.id) === (progress === "answered")) &&
      (!normalizedQuery ||
        `${q.title}${q.prompt}${q.category}${q.referenceMaterials ? "別資料" + q.referenceMaterials.map((m) => m.title).join("") : ""}`
          .normalize("NFKC")
          .toLowerCase()
          .includes(normalizedQuery)),
  );
  return (
    <>
      <PageTitle
        title="問題ライブラリ"
        description="難易度・ジャンル・分野・回答状況・キーワードで絞り込めます。"
      />
      <DifficultySelector
        value={difficulty}
        onChange={setDifficulty}
        kind={kind}
      />
      <div className="library-genres">
        <GenreSelector
          value={kind}
          onChange={setKind}
          difficulty={difficulty}
        />
        <button
          className={
            onlyBookmarks
              ? "secondary bookmark-filter active"
              : "secondary bookmark-filter"
          }
          aria-pressed={onlyBookmarks}
          onClick={() =>
            onFiltersChange({ ...filters, onlyBookmarks: !onlyBookmarks })
          }
        >
          <Bookmark size={16} />
          保存した問題
        </button>
      </div>
      <div className="library-toolbar">
        <div className="filter-tabs">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => onFiltersChange({ ...filters, category: "all" })}
          >
            すべて
          </button>
          {categories.map((c) => (
            <button
              className={filter === c ? "active" : ""}
              key={c}
              onClick={() => onFiltersChange({ ...filters, category: c })}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="search">
          <Search size={17} />
          <input
            aria-label="問題を検索"
            placeholder="問題を検索"
            value={search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
          />
        </label>
      </div>
      <div className="library-toolbar">
        <div className="filter-tabs" role="group" aria-label="回答状況">
          {([
            ["all", "回答状況すべて"],
            ["unanswered", "未回答"],
            ["answered", "回答済み"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              className={progress === value ? "active" : ""}
              aria-pressed={progress === value}
              onClick={() => onFiltersChange({ ...filters, progress: value })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="library-list card">
        {visibleQuestions.map((q) => (
          <LibraryQuestion
            key={q.id}
            question={q}
            card={data.cards[q.id]}
            attempts={attemptsByQuestion.get(q.id)}
            bookmarked={data.bookmarks.includes(q.id)}
            onBookmark={() => bookmark(q.id)}
            onStart={() => start(undefined, q.id)}
          />
        ))}
        {visibleQuestions.length === 0 && (
          <p className="empty-message">一致する問題がありません。</p>
        )}
      </div>
      <p className="content-note">
        2026年度版のオリジナル問題{questions.length}
        問。法令基準日：2026年9月1日。各問の解説で根拠と計算条件を確認できます。
      </p>
    </>
  );
}
