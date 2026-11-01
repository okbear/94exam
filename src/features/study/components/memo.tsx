import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  Eraser,
  GripHorizontal,
  NotebookPen,
  SquareArrowOutUpRight,
  X,
} from "lucide-react";
import { useCalculatorPosition } from "../hooks/use-calculator-position";

export function Memo({ resetKey }: { resetKey?: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [prevKey, setPrevKey] = useState(resetKey);
  if (prevKey !== resetKey) {
    setPrevKey(resetKey);
    setText("");
  }
  const panelId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const { style, dragHandlers } = useCalculatorPosition(panel);

  useEffect(() => {
    if (open) textarea.current?.focus({ preventScroll: true });
  }, [open]);

  function close() {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  return (
    <div className="memo">
      <button
        type="button"
        ref={trigger}
        className="memo-toggle"
        aria-label={open ? "メモを閉じる" : "メモを開く"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <NotebookPen size={16} />
        <span>メモ</span>
        <SquareArrowOutUpRight size={13} aria-hidden="true" />
      </button>
      {open &&
        createPortal(
          <section
            ref={panel}
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-label="途中計算・メモ"
            className="calculator-popup memo-popup"
            style={style}
            onKeyDown={handleKeyDown}
          >
            <header className="calculator-popup-header" {...dragHandlers}>
              <NotebookPen size={16} />
              <strong>メモ</strong>
              <span className="calculator-drag-hint">
                <GripHorizontal size={17} />
                移動
              </span>
              <button
                type="button"
                aria-label="メモを閉じる"
                onClick={close}
              >
                <X size={20} />
              </button>
            </header>
            <div className="memo-panel">
              <textarea
                ref={textarea}
                aria-label="途中計算・メモ"
                placeholder="途中計算やメモを自由に入力できます"
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="memo-tools">
                <button
                  type="button"
                  className="question-memo-clear"
                  disabled={!text}
                  onClick={() => {
                    setText("");
                    textarea.current?.focus({ preventScroll: true });
                  }}
                >
                  <Eraser size={14} />
                  クリア
                </button>
              </div>
            </div>
          </section>,
          document.body,
        )}
    </div>
  );
}
