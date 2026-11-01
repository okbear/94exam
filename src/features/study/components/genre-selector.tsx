import { BookOpen, Calculator, Sparkles } from "lucide-react";
import { questions } from "../../../lib/questions";
import type { DifficultyFilter, Genre } from "../types";
const genres = [
  { id: "all", label: "すべて", icon: Sparkles },
  { id: "knowledge", label: "知識問題", icon: BookOpen },
  { id: "calculation", label: "計算問題", icon: Calculator },
] as const;
export function GenreSelector({
  value,
  onChange,
  showUnit = false,
  difficulty = "all",
}: {
  value: Genre;
  onChange: (value: Genre) => void;
  showUnit?: boolean;
  difficulty?: DifficultyFilter;
}) {
  return (
    <div className="genre-options">
      {genres.map((genre) => (
        <button
          key={genre.id}
          aria-pressed={value === genre.id}
          className={value === genre.id ? "active" : ""}
          onClick={() => onChange(genre.id)}
        >
          <genre.icon size={17} />
          {genre.label}
          <small>
            {
              questions.filter(
                (q) =>
                  (genre.id === "all" || q.kind === genre.id) &&
                  (difficulty === "all" || q.difficulty === difficulty),
              ).length
            }
            {showUnit ? "問" : ""}
          </small>
        </button>
      ))}
    </div>
  );
}
