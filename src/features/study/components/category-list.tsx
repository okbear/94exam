import {
  ArrowUpRight,
  BookOpen,
  Clock3,
  ShieldCheck,
  Gift,
  Scale,
} from "lucide-react";
import { categories, questions } from "../../../lib/questions";
import type { StudyData } from "../../../lib/study";
import type { Genre, StartStudy } from "../types";
export function CategoryList({
  data,
  kind,
  start,
  onLibrary,
}: {
  data: StudyData;
  kind: Genre;
  start: StartStudy;
  onLibrary: () => void;
}) {
  return (
    <section className="category-panel">
      <div className="section-heading">
        <div>
          <h3>分野別演習</h3>
          <p>分野を選ぶと、選択中のジャンルで出題します。</p>
        </div>
        <button className="text-link" onClick={() => onLibrary()}>
          すべての問題 <ArrowUpRight size={15} />
        </button>
      </div>
      <div className="category-grid">
        {categories.map((c, i) => {
          const qs = questions.filter(
              (q) => q.category === c && (kind === "all" || q.kind === kind),
            ),
            done = qs.filter((q) => data.cards[q.id]).length;
          return (
            <button
              className={`category-card category-${i}`}
              key={c}
              onClick={() => start(c)}
            >
              <div className="category-top">
                <span className="category-icon">
                  {
                    [
                      <BookOpen size={21} />,
                      <Clock3 size={21} />,
                      <ShieldCheck size={21} />,
                      <span className="yen">¥</span>,
                      <Gift size={21} />,
                      <Scale size={21} />,
                    ][i]
                  }
                </span>
                <ArrowUpRight size={17} />
              </div>
              <h4>{c}</h4>
              <p>
                {
                  [
                    "給与明細・賃金支払いの基本",
                    "労働時間と割増賃金の計算",
                    "保険料・標準報酬月額",
                    "源泉徴収・課税と非課税",
                    "社会保険料と賞与の源泉徴収",
                    "勤怠・年休・労働者保護",
                  ][i]
                }
              </p>
              <div className="category-progress">
                <span>
                  学習済み <b>{done}</b> / {qs.length}問
                </span>
                <span>
                  {Math.round((done / Math.max(1, qs.length)) * 100)}%
                </span>
              </div>
              <div className="progress-track">
                <span
                  style={{
                    width: `${(done / Math.max(1, qs.length)) * 100}%`,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
