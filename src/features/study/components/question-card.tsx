import { useEffect, useId, useState } from "react";
import { Bookmark, Check, Eraser, NotebookPen, X } from "lucide-react";
import {
  difficultyInfo,
  formatCalculationAnswer,
  parseNumericAnswer,
  type Question,
} from "../../../lib/questions";
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
    grade,
  } = session;
  const [input, setInput] = useState("");
  const [memoOpen, setMemoOpen] = useState(false);
  const [memo, setMemo] = useState("");
  const memoPanelId = useId();
  const resetKey = `${position}-${q.id}`;
  useEffect(() => {
    setInput("");
    setMemo("");
  }, [resetKey]);
  const parsedInput = parseNumericAnswer(input);
  return (
    <section className="question-card card">
      <div className="question-meta">
        <span className="badge">
          {q.knowledgeRequired
            ? "知識＋計算"
            : q.kind === "calculation"
              ? "計算問題"
              : "知識問題"}
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
          {difficultyInfo[q.difficulty].label} · 2026年度版 · 法令基準
          2026.09.01
        </div>
        <div className="question-tool-buttons">
          <button
            type="button"
            className="memo-toggle"
            aria-label={memoOpen ? "メモを閉じる" : "メモを開く"}
            aria-expanded={memoOpen}
            aria-controls={memoPanelId}
            onClick={() => setMemoOpen((v) => !v)}
          >
            <NotebookPen size={16} />
            <span>メモ</span>
          </button>
          <Calculator resetKey={resetKey} />
        </div>
      </div>
      {memoOpen && (
        <div id={memoPanelId} className="question-memo">
          <div className="question-memo-header">
            <span>途中計算・メモ</span>
            <button
              type="button"
              className="question-memo-clear"
              disabled={!memo}
              onClick={() => setMemo("")}
            >
              <Eraser size={14} />
              クリア
            </button>
          </div>
          <textarea
            aria-label="途中計算・メモ"
            placeholder="途中計算やメモを自由に入力できます（次の問題へ進むと自動でクリアされます）"
            rows={3}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
      )}
      <div className="answers">
        {q.kind === "knowledge" ? (
          q.choices.map((choice, i) => (
            <button
              type="button"
              disabled={revealed || busy}
              key={i}
              onClick={() => void select(i)}
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
          ))
        ) : (
          <form
            className="calculation-answer"
            onSubmit={(e) => {
              e.preventDefault();
              if (parsedInput !== null) void select(parsedInput);
            }}
          >
            <div className="calculation-input-row">
              <div
                className={`calculation-input-wrap ${revealed ? (correct ? "correct" : selected !== "unknown" ? "incorrect" : "") : ""}`}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  aria-label="解答の数値"
                  placeholder="数値を入力"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={revealed || busy}
                />
                <span className="calculation-unit">{q.unit}</span>
                {revealed && selected !== "unknown" && (
                  <span className="answer-status">
                    {correct ? <Check size={19} /> : <X size={19} />}
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="primary calculation-submit"
                disabled={parsedInput === null || revealed || busy}
              >
                回答する
              </button>
            </div>
            {revealed && !correct && (
              <div className="answer correct calculation-correct-answer">
                <span className="answer-letter">
                  <Check size={16} />
                </span>
                正解: {formatCalculationAnswer(q)}
              </div>
            )}
          </form>
        )}
        <button
          type="button"
          disabled={revealed || busy}
          onClick={() => void select("unknown")}
          className={`answer answer-unknown ${selected === "unknown" ? "selected" : ""} ${revealed && selected === "unknown" ? "incorrect" : ""}`}
        >
          <span className="answer-letter">?</span>
          わからない
          <span className="answer-status">
            {revealed && selected === "unknown" ? <X size={19} /> : null}
          </span>
        </button>
      </div>
      {revealed && (
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
