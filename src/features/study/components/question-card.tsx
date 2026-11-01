import { ArrowRight, Bookmark, Check, X } from "lucide-react";
import type { Question } from "../../../lib/questions";
import type { StudySession } from "../hooks/use-study-session";
import { Calculator } from "./calculator";
import { AnswerExplanation } from "./answer-explanation";
export function QuestionCard({
  question: q,
  session,
  bookmarked,
  onBookmark,
}: {
  question: Question;
  session: StudySession;
  bookmarked: boolean;
  onBookmark: () => void;
}) {
  const {
    position,
    queue,
    selected,
    revealed,
    correct,
    busy,
    options,
    select,
    reveal,
    grade,
  } = session;
  return (
    <section className="question-card card">
      <div className="question-meta">
        <span className="badge">
          {q.kind === "calculation" ? "計算問題" : "知識問題"}
        </span>
        <span className="question-category">{q.category}</span>
        <span>
          {position + 1} / {queue.length} 問
        </span>
        <button
          aria-label={bookmarked ? "ブックマークを解除" : "ブックマークに追加"}
          className={bookmarked ? "icon-button bookmarked" : "icon-button"}
          onClick={() => onBookmark()}
        >
          <Bookmark size={19} />
        </button>
      </div>
      <div className="session-progress">
        <span style={{ width: `${(position / queue.length) * 100}%` }} />
      </div>
      <span className="question-number">
        QUESTION {String(position + 1).padStart(2, "0")}
      </span>
      <h2>{q.title}</h2>
      <p className="question-prompt">{q.prompt}</p>
      {q.materials && (
        <table className="question-materials">
          <caption>この問題で使う資料</caption>
          <tbody>
            {q.materials.map((m) => (
              <tr key={m.label}>
                <th scope="row">{m.label}</th>
                <td>{m.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="question-tools">
        <div className="question-edition">
          2級 · 2026年度版 · 法令基準 2026.09.01
        </div>
        <Calculator />
      </div>
      <div className="answers">
        {q.choices.map((choice, i) => (
          <button
            disabled={revealed}
            key={i}
            onClick={() => select(i)}
            className={`answer ${selected === i ? "selected" : ""} ${revealed && i === q.answer ? "correct" : ""} ${revealed && selected === i && !correct ? "incorrect" : ""}`}
          >
            <span className="answer-letter">{"ABCD"[i]}</span>
            {choice}
            <span className="answer-status">
              {revealed && i === q.answer ? (
                <Check size={19} />
              ) : revealed && selected === i ? (
                <X size={19} />
              ) : null}
            </span>
          </button>
        ))}
      </div>
      {!revealed ? (
        <button
          className="primary check-answer"
          disabled={selected === null || busy}
          onClick={() => void reveal()}
        >
          答えを確認する <ArrowRight size={17} />
        </button>
      ) : (
        <AnswerExplanation
          question={q}
          correct={correct}
          options={options}
          busy={busy}
          onGrade={grade}
        />
      )}
    </section>
  );
}
