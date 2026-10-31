import { Bookmark, Search } from "lucide-react";
import { categories, questions } from "../../../lib/questions";
import type { StudyData } from "../../../lib/study";
import type { Genre, LibraryFilters, StartStudy } from "../types";
import { GenreSelector } from "../components/genre-selector";
import { PageTitle } from "../components/page-title";
import { LibraryQuestion } from "../components/library-question";
type Props = {
  data: StudyData;
  kind: Genre;
  setKind: (kind: Genre) => void;
  filters: LibraryFilters;
  onFiltersChange: (filters: LibraryFilters) => void;
  bookmark: (id: string) => void;
  start: StartStudy;
};
export function LibraryScreen({
  data,
  kind,
  setKind,
  filters,
  onFiltersChange,
  bookmark,
  start,
}: Props) {
  const { category: filter, search, onlyBookmarks } = filters;
  const visibleQuestions = questions.filter(
    (q) =>
      (filter === "all" || q.category === filter) &&
      (kind === "all" || q.kind === kind) &&
      (!onlyBookmarks || data.bookmarks.includes(q.id)) &&
      `${q.title}${q.prompt}${q.category}`.includes(search),
  );
  return (
    <>
      <PageTitle
        title="問題ライブラリ"
        description="ジャンル・分野・キーワードで絞り込めます。"
      />
      <div className="library-genres">
        <GenreSelector value={kind} onChange={setKind} />
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
      <div className="library-list card">
        {visibleQuestions.map((q) => (
          <LibraryQuestion
            key={q.id}
            question={q}
            card={data.cards[q.id]}
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
        2026年度版・2級向けオリジナル問題{questions.length}
        問。法令基準日：2026年9月1日。各問の解説で根拠と計算条件を確認できます。
      </p>
    </>
  );
}
