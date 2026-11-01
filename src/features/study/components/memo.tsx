import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Eraser, NotebookPen, SquareArrowOutUpRight } from "lucide-react";
import { CalculatorPopup } from "./calculator-popup";

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
  const textarea = useRef<HTMLTextAreaElement>(null);
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
      {open && (
        <CalculatorPopup
          id={panelId}
          title="メモ"
          ariaLabel="途中計算・メモ"
          closeLabel="メモを閉じる"
          icon={<NotebookPen size={16} />}
          className="memo-popup"
          panelClassName="memo-panel"
          onClose={close}
          onKeyDown={handleKeyDown}
        >
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
              className="memo-clear question-memo-clear"
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
        </CalculatorPopup>
      )}
    </div>
  );
}
