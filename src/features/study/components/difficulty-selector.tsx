import {
  difficulties,
  difficultyInfo,
  questions,
} from "../../../lib/questions";
import type { DifficultyFilter, Genre } from "../types";
export function DifficultySelector({
  value,
  onChange,
  kind,
}: {
  value: DifficultyFilter;
  onChange: (value: DifficultyFilter) => void;
  kind: Genre;
}) {
  const available = questions.filter((q) => kind === "all" || q.kind === kind);
  return (
    <section className="difficulty-selector" aria-label="難易度選択">
      <div className="difficulty-heading">
        <strong>難易度</strong>
        <span>
          {value === "all"
            ? "すべての難易度から出題"
            : difficultyInfo[value].description}
        </span>
      </div>
      <div className="difficulty-options" role="group" aria-label="難易度">
        {(["all", ...difficulties] as const).map((difficulty) => (
          <button
            type="button"
            key={difficulty}
            aria-pressed={value === difficulty}
            className={value === difficulty ? "active" : ""}
            onClick={() => onChange(difficulty)}
          >
            <span>
              {difficulty === "all"
                ? "すべて"
                : difficultyInfo[difficulty].label}
            </span>
            <small>
              {
                available.filter(
                  (q) => difficulty === "all" || q.difficulty === difficulty,
                ).length
              }
              問
            </small>
          </button>
        ))}
      </div>
    </section>
  );
}
